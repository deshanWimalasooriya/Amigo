/**
 * api.js — Centralised API service layer for Amigo
 *
 * Every component/page should import from here instead of
 * writing raw fetch() calls. This ensures:
 *   - Consistent base URL from VITE_API_URL env var
 *   - credentials: 'include' on every request (JWT cookie)
 *   - Uniform error handling (throws Error with backend message)
 *
 * Usage:
 *   import { meetingAPI } from '../services/api';
 *   const meeting = await meetingAPI.create({ title: 'Jam Session' });
 */

const BASE = import.meta.env.VITE_API_URL || 'http://localhost:5000';

// ---------------------------------------------------------------------------
// Core request helper
// ---------------------------------------------------------------------------
const request = async (method, path, body = null) => {
  const options = {
    method,
    credentials: 'include',          // always send the httpOnly JWT cookie
    headers: { 'Content-Type': 'application/json' },
  };

  if (body !== null) {
    options.body = JSON.stringify(body);
  }

  const res = await fetch(`${BASE}${path}`, options);

  // Parse JSON regardless of status so we can read the error message
  let data;
  try {
    data = await res.json();
  } catch {
    data = { message: res.statusText };
  }

  if (!res.ok) {
    throw new Error(data.message || `Request failed with status ${res.status}`);
  }

  return data;
};

// ---------------------------------------------------------------------------
// Auth API  →  /api/auth/*
// ---------------------------------------------------------------------------
export const authAPI = {
  /**
   * Register a new user.
   * @param {{ fullName: string, email: string, password: string }} body
   * @returns {{ id, fullName, email, pmi }}
   */
  register: (body) => request('POST', '/api/auth/register', body),

  /**
   * Login with email + password. Sets the JWT httpOnly cookie.
   * @param {{ email: string, password: string }} body
   * @returns {{ id, fullName, email, pmi, avatar }}
   */
  login: (body) => request('POST', '/api/auth/login', body),

  /**
   * Logout — clears the JWT cookie on the server.
   * @returns {{ message: string }}
   */
  logout: () => request('POST', '/api/auth/logout'),

  /**
   * Get the currently logged-in user (session rehydration).
   * @returns {{ id, fullName, email, pmi, avatar, phone, location, ... }}
   */
  getMe: () => request('GET', '/api/auth/me'),

  /**
   * Update the current user's profile fields.
   * @param {{ fullName?, phone?, location?, timezone?, company?, jobTitle?, bio? }} body
   * @returns updated user object
   */
  updateProfile: (body) => request('PUT', '/api/auth/profile', body),
};

// ---------------------------------------------------------------------------
// Meeting API  →  /api/meetings/*
// ---------------------------------------------------------------------------
export const meetingAPI = {
  /**
   * Create an instant or scheduled meeting.
   * @param {{
   *   title?: string,
   *   passcode?: string,
   *   scheduledAt?: string,   // ISO 8601 — omit for instant meeting
   *   duration?: number,      // minutes, default 60
   *   hostVideoOn?: boolean,
   *   participantVideoOn?: boolean,
   *   usePMI?: boolean
   * }} body
   * @returns meeting object with roomId
   */
  create: (body) => request('POST', '/api/meetings', body),

  /**
   * Get the logged-in user's upcoming / ongoing meetings.
   * @returns Meeting[]
   */
  getMy: () => request('GET', '/api/meetings/my'),

  /**
   * Get the logged-in user's ended meetings (history).
   * @returns Meeting[]
   */
  getHistory: () => request('GET', '/api/meetings/history'),

  /**
   * Get dashboard stats: totalHosted, upcoming, ended, recentMeetings.
   * @returns {{ totalHosted: number, upcoming: number, ended: number, recentMeetings: Meeting[] }}
   */
  getStats: () => request('GET', '/api/meetings/stats'),

  /**
   * Look up a meeting by its roomId (e.g. "844-922-101").
   * Used by JoinMeeting to validate the room before entering.
   * @param {string} roomId
   * @returns meeting object or 404 error
   */
  getByRoomId: (roomId) => request('GET', `/api/meetings/${roomId}`),

  /**
   * Update a meeting's details (title, passcode, schedule, etc.)
   * Only the host can call this.
   * @param {string} roomId
   * @param {{ title?, passcode?, scheduledAt?, duration?, hostVideoOn?, participantVideoOn? }} body
   * @returns updated meeting object
   */
  update: (roomId, body) => request('PUT', `/api/meetings/${roomId}`, body),

  /**
   * Mark a scheduled meeting as "ongoing" and set startedAt.
   * Only the host can call this.
   * @param {string} roomId
   * @returns updated meeting object
   */
  start: (roomId) => request('PUT', `/api/meetings/${roomId}/start`),

  /**
   * Mark a meeting as "ended" and set endedAt.
   * Only the host can call this. Call this when the host leaves the room.
   * @param {string} roomId
   * @returns updated meeting object
   */
  end: (roomId) => request('PUT', `/api/meetings/${roomId}/end`),

  /**
   * Permanently delete a meeting record.
   * Only the host can call this.
   * @param {string} roomId
   * @returns {{ message: string }}
   */
  delete: (roomId) => request('DELETE', `/api/meetings/${roomId}`),
};

// ---------------------------------------------------------------------------
// Recording API  →  /api/recordings/*
// ---------------------------------------------------------------------------
export const recordingAPI = {
  /**
   * Get all recordings owned by the logged-in user.
   * @returns Recording[]
   */
  getMy: () => request('GET', '/api/recordings'),

  /**
   * Save a new recording entry.
   * @param {{
   *   meetingId: number,
   *   title: string,
   *   fileUrl?: string,
   *   duration?: number,   // seconds
   *   fileSize?: number    // bytes
   * }} body
   * @returns created Recording object
   */
  create: (body) => request('POST', '/api/recordings', body),

  /**
   * Delete a recording by its numeric id.
   * @param {number} id
   * @returns {{ message: string }}
   */
  delete: (id) => request('DELETE', `/api/recordings/${id}`),
};

// ---------------------------------------------------------------------------
// Team API  →  /api/teams/*
// ---------------------------------------------------------------------------
export const teamAPI = {
  /**
   * Get all teams the logged-in user belongs to (as member or admin).
   * @returns Team[] with nested members[]
   */
  getMy: () => request('GET', '/api/teams'),

  /**
   * Create a new team. The creator is auto-added as admin.
   * @param {{ name: string, description?: string, avatarColor?: string }} body
   * @returns created Team object with members[]
   */
  create: (body) => request('POST', '/api/teams', body),

  /**
   * Update a team's name, description, or avatar colour.
   * Only the creator can call this.
   * @param {number} teamId
   * @param {{ name?, description?, avatarColor? }} body
   * @returns updated Team object
   */
  update: (teamId, body) => request('PUT', `/api/teams/${teamId}`, body),

  /**
   * Delete a team and all its members.
   * Only the creator can call this.
   * @param {number} teamId
   * @returns {{ message: string }}
   */
  delete: (teamId) => request('DELETE', `/api/teams/${teamId}`),

  /**
   * Add a user to a team by their email address.
   * Only the team creator can call this.
   * @param {number} teamId
   * @param {{ email: string }} body
   * @returns created TeamMember object
   */
  addMember: (teamId, body) => request('POST', `/api/teams/${teamId}/members`, body),

  /**
   * Remove a user from a team.
   * Only the team creator can call this.
   * @param {number} teamId
   * @param {number} userId
   * @returns {{ message: string }}
   */
  removeMember: (teamId, userId) =>
    request('DELETE', `/api/teams/${teamId}/members/${userId}`),
};
