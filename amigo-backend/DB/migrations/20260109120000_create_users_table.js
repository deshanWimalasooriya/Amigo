/**
 * @param { import("knex").Knex } knex
 * @returns { Promise<void> }
 */
exports.up = function(knex) {
  // FIX: Drop the table if it exists before creating it
  return knex.schema
    .dropTableIfExists('users') 
    .then(() => {
      return knex.schema.createTable('users', function(table) {
        table.increments('id').primary();
        table.string('fullName').notNullable();
        table.string('email').notNullable().unique();
        table.string('password').notNullable();
        table.string('pmi').notNullable().unique();
        table.string('avatar').defaultTo('');
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