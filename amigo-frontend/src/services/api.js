const API = import.meta.env.VITE_API_URL || 'http://localhost:5000';

const apiFetch = async (path, options = {}) => {
  const res = await fetch(`${API}${path}`, {
    credentials: 'include',
    headers: { 'Content-Type': 'application/json', ...options.headers },
    ...options,
  });
  const data = await res.json().catch(() => ({}));
  if (!res.ok) throw new Error(data.message || `HTTP ${res.status}`);
  return data;
};

// ── Auth ──────────────────────────────────────────────────────────────────
export const authAPI = {
  login:    (body)  => apiFetch('/api/auth/login',    { method: 'POST', body: JSON.stringify(body) }),
  register: (body)  => apiFetch('/api/auth/register', { method: 'POST', body: JSON.stringify(body) }),
  logout:   ()      => apiFetch('/api/auth/logout',   { method: 'POST' }),
  getMe:    ()      => apiFetch('/api/auth/me'),
  updateProfile: (body) => apiFetch('/api/auth/profile', { method: 'PUT', body: JSON.stringify(body) }),
};

// ── Meetings ──────────────────────────────────────────────────────────────
export const meetingAPI = {
  create:     (body)   => apiFetch('/api/meetings',              { method: 'POST', body: JSON.stringify(body) }),
  getMy:      ()       => apiFetch('/api/meetings/my'),
  getHistory: ()       => apiFetch('/api/meetings/history'),
  getStats:   ()       => apiFetch('/api/meetings/stats'),
  getByRoomId:(roomId) => apiFetch(`/api/meetings/${roomId}`),
  start:      (roomId) => apiFetch(`/api/meetings/${roomId}/start`, { method: 'PUT' }),
  end:        (roomId) => apiFetch(`/api/meetings/${roomId}/end`,   { method: 'PUT' }),
  update:     (roomId, body) => apiFetch(`/api/meetings/${roomId}`, { method: 'PUT', body: JSON.stringify(body) }),
  delete:     (roomId) => apiFetch(`/api/meetings/${roomId}`,      { method: 'DELETE' }),
  join:       (roomId, passcode) => apiFetch(`/api/meetings/${roomId}/join`, {
    method: 'POST', body: JSON.stringify({ passcode }),
  }),
};

// ── Recordings ────────────────────────────────────────────────────────────
export const recordingAPI = {
  getMy: () => apiFetch('/api/recordings/my'),
  save:  (body) => apiFetch('/api/recordings', { method: 'POST', body: JSON.stringify(body) }),
};

// ── Teams ─────────────────────────────────────────────────────────────────
export const teamAPI = {
  getMyTeams:    ()           => apiFetch('/api/teams/my'),
  create:        (body)       => apiFetch('/api/teams',            { method: 'POST', body: JSON.stringify(body) }),
  invite:        (id, body)   => apiFetch(`/api/teams/${id}/invite`,{ method: 'POST', body: JSON.stringify(body) }),
  removeMember:  (id, userId) => apiFetch(`/api/teams/${id}/members/${userId}`, { method: 'DELETE' }),
};

// ── Notifications ─────────────────────────────────────────────────────────
export const notificationAPI = {
  getAll:      ()     => apiFetch('/api/notifications'),
  markRead:    (id)   => apiFetch(`/api/notifications/${id}/read`,  { method: 'PATCH' }),
  markAllRead: ()     => apiFetch('/api/notifications/read-all',    { method: 'PATCH' }),
  invitePeople:(body) => apiFetch('/api/notifications/invite',      { method: 'POST', body: JSON.stringify(body) }),
};
