require('dotenv').config();
const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');
const Admin = require('./src/models/Admin');

async function createAdmin() {
  await mongoose.connect(process.env.MONGO_URI);
  
  const passwordHash = await bcrypt.hash('Admin123', 12);
  console.log('hash:', passwordHash);
  
  await Admin.create({
    name: 'Super Admin',
    email: 'admin@workline.ge',
    passwordHash,
    role: 'superadmin',
    isActive: true
  });

  console.log('✅ ადმინი შეიქმნა!');
  process.exit(0);
}

createAdmin();