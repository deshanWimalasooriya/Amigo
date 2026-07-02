/**
 * @param { import("knex").Knex } knex
 * @returns { Promise<void> }
 */
exports.up = function(knex) {
<<<<<<< HEAD
  // Drop table if exists to ensure a clean start with new columns
=======
  // FIX: Drop the table if it exists before creating it
>>>>>>> ravindu/master
  return knex.schema
    .dropTableIfExists('users') 
    .then(() => {
      return knex.schema.createTable('users', function(table) {
<<<<<<< HEAD
        // --- Core Auth Fields ---
=======
>>>>>>> ravindu/master
        table.increments('id').primary();
        table.string('fullName').notNullable();
        table.string('email').notNullable().unique();
        table.string('password').notNullable();
        table.string('pmi').notNullable().unique();
        table.string('avatar').defaultTo('');
<<<<<<< HEAD
        
        // --- NEW: Profile Fields ---
        table.string('company').defaultTo('');
        table.string('jobTitle').defaultTo('');
        table.text('bio'); // 'text' allows longer descriptions
        table.string('phone').defaultTo('');
        table.string('location').defaultTo('');
        table.string('timezone').defaultTo('');

        // --- Timestamps ---
=======
>>>>>>> ravindu/master
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