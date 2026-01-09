/**
 * @param { import("knex").Knex } knex
 * @returns { Promise<void> }
 */
exports.up = function(knex) {
  // Drop table if exists to ensure a clean start with new columns
  return knex.schema
    .dropTableIfExists('users') 
    .then(() => {
      return knex.schema.createTable('users', function(table) {
        // --- Core Auth Fields ---
        table.increments('id').primary();
        table.string('fullName').notNullable();
        table.string('email').notNullable().unique();
        table.string('password').notNullable();
        table.string('pmi').notNullable().unique();
        table.string('avatar').defaultTo('');
        
        // --- NEW: Profile Fields ---
        table.string('company').defaultTo('');
        table.string('jobTitle').defaultTo('');
        table.text('bio'); // 'text' allows longer descriptions
        table.string('phone').defaultTo('');
        table.string('location').defaultTo('');
        table.string('timezone').defaultTo('');

        // --- Timestamps ---
        table.timestamps(true, true);
      });
    });
};

/**
 * @param { import("knex").Knex } knex
 * @returns { Promise<void> }
 */
exports.down = function(knex) {
  return knex.schema.dropTableIfExists('users');
};