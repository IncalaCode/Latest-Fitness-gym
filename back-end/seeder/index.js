const crypto = require('crypto');
const { Admin } = require('../models'); // adjust path as needed

async function seedAdmins() {
  try {
    const password = 'admin123';
    const salt = process.env.SALT
    const hashedPassword = crypto
      .pbkdf2Sync(password, salt, 1000, 64, 'sha512')
      .toString('hex'); 

    const admins = [
      {
        firstName: 'Super',
        lastName: 'Admin',
        email: 'admin@example.com',
        password: hashedPassword,
        role: 'Admin',
        photoUrl: null,
        salt: salt, 
      },
    ];

    await Admin.bulkCreate(admins);
    console.log('✅ Admin seed completed.');
    process.exit(0);
  } catch (err) {
    console.error('❌ Failed to seed admins:', err);
    process.exit(1);
  }
}

seedAdmins();
