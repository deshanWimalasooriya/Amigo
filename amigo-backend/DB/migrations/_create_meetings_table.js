/**
 * @param { import("knex").Knex } knex
 * @returns { Promise<void> }
 */
exports.up = function(knex) {
  return knex.schema.createTable('meetings', function(table) {
    // 1. Primary Key
    table.increments('id').primary();
    
    // 2. Foreign Key (Who created the meeting?)
    // This links to the 'users' table
    table.integer('userId').unsigned().notNullable();
    table.foreign('userId').references('users.id').onDelete('CASCADE');

    // 3. Meeting Details
    table.string('topic').notNullable();
    table.date('date').notNullable();
    table.string('time').notNullable(); // e.g., "14:30"
    table.string('duration').defaultTo('30'); // in minutes
    
    // 4. The Unique Join Code
    table.string('meetingCode').notNullable().unique();
    
    // 5. Security & Settings
    table.string('passcode').defaultTo('');
    table.boolean('hostVideo').defaultTo(true);
    table.boolean('participantVideo').defaultTo(false);
    
    // 6. Timestamps (created_at, updated_at)
    table.timestamps(true, true);
  });
};

/**
 * @param { import("knex").Knex } knex
 * @returns { Promise<void> }
 */
exports.down = function(knex) {
  return knex.schema.dropTable('meetings');
};