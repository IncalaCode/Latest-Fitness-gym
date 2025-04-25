// seeders/adminSeed.js
const bcrypt = require('bcryptjs');
const { Admin } = require('../models'); 
const db = require('../config/InitDatabase');

async function seedAdmins() {
  try {
    await db.initialize();
    
    const hashedPassword = await bcrypt.hash('admin123', 10);
    

    const admins = [
      {
        firstName: 'Super',
        lastName: 'Admin',
        email: 'admin@example.com',
        password: hashedPassword,
        role: 'Admin',
        photoUrl: null
      },
    ];

    await Admin.bulkCreate(admins, { ignoreDuplicates: true });
    console.log('✅ Admin seed completed.');
    process.exit(0);
  } catch (err) {
    console.error('❌ Failed to seed admins:', err);
    process.exit(1);
  }
}

seedAdmins();
