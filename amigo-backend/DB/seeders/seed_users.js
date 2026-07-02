const bcrypt = require('bcryptjs');

/**
 * @param { import("knex").Knex } knex
 * @returns { Promise<void> } 
 */
exports.seed = async function(knex) {
<<<<<<< HEAD
  // 1. Deletes ALL existing entries first
  await knex('users').del();
  
  // 2. Create a hashed password (using '123456')
  const salt = await bcrypt.genSalt(10);
  const hashedPassword = await bcrypt.hash('123456', salt);

  // 3. Insert the dummy user with NEW PROFILE FIELDS
=======
  // 1. Deletes ALL existing entries first so we don't have duplicates
  await knex('users').del();
  
  // 2. Create a hashed password for the dummy user (using '123456')
  const salt = await bcrypt.genSalt(10);
  const hashedPassword = await bcrypt.hash('123456', salt);

  // 3. Insert the dummy user
>>>>>>> ravindu/master
  await knex('users').insert([
    {
      fullName: 'Demo User',
      email: 'demo@amigo.com',
<<<<<<< HEAD
      password: hashedPassword, 
      pmi: '394-201-992',
      avatar: '',
      // New Fields we just added to the DB:
      company: 'Amigo Tech',
      jobTitle: 'Lead Developer',
      bio: 'This is a generated demo account for testing purposes.',
      phone: '+1 (555) 000-0000',
      location: 'New York, USA',
      timezone: '(GMT-05:00) Eastern Time'
=======
      password: hashedPassword, // We insert the hashed version
      pmi: '394-201-992',
      avatar: ''
>>>>>>> ravindu/master
    }
  ]);
};