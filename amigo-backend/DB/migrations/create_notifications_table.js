/**
 * Knex migration — creates the notifications table.
 * Run: npx knex migrate:latest
 *
 * NOTE: If you use Sequelize's sequelize.sync({ alter: true }) in server.js
 * (which this project does) you do NOT need to run this migration manually —
 * Sequelize will create/alter the table automatically on next server start.
 * This file is kept as documentation and for teams using Knex migrations.
 */
exports.up = (knex) =>
  knex.schema.createTable('notifications', (t) => {
    t.increments('id').primary();
    t.integer('userId').notNullable().references('id').inTable('users').onDelete('CASCADE');
    t.string('type').notNullable().defaultTo('info');  // invitation | reminder | meeting | info
    t.string('title').notNullable();
    t.text('message').notNullable();
    t.boolean('isRead').notNullable().defaultTo(false);
    t.text('meta').nullable();                         // JSON string: { roomId, ... }
    t.timestamps(true, true);
  });

exports.down = (knex) => knex.schema.dropTableIfExists('notifications');
