// seeders/trainerSeed.js
const { Trainer } = require('../models'); 
const db = require('../config/InitDatabase');

async function seedTrainers() {
  try {
    await db.initialize();
    
    const trainers = [
      {
        name: 'John Smith',
        email: 'john.smith@gym.com',
        phone: '+1234567890'
      },
      {
        name: 'Sarah Johnson',
        email: 'sarah.johnson@gym.com',
        phone: '+1234567891'
      },
      {
        name: 'Mike Davis',
        email: 'mike.davis@gym.com',
        phone: '+1234567892'
      },
      {
        name: 'Lisa Wilson',
        email: 'lisa.wilson@gym.com',
        phone: '+1234567893'
      }
    ];

    await Trainer.bulkCreate(trainers, { ignoreDuplicates: true });
    console.log('✅ Trainer seed completed.');
    process.exit(0);
  } catch (err) {
    console.error('❌ Failed to seed trainers:', err);
    process.exit(1);
  }
}

seedTrainers(); 