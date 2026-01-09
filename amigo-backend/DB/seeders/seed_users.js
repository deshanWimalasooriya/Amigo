const bcrypt = require('bcryptjs');

/**
 * @param { import("knex").Knex } knex
 * @returns { Promise<void> } 
 */
exports.seed = async function(knex) {
  // 1. Deletes ALL existing entries first so we don't have duplicates
  await knex('users').del();
  
  // 2. Create a hashed password for the dummy user (using '123456')
  const salt = await bcrypt.genSalt(10);
  const hashedPassword = await bcrypt.hash('123456', salt);

  // 3. Insert the dummy user
  await knex('users').insert([
    {
      fullName: 'Demo User',
      email: 'demo@amigo.com',
      password: hashedPassword, // We insert the hashed version
      pmi: '394-201-992',
      avatar: ''
    }
  ]);
};