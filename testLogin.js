require('dotenv').config();
const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');
const Admin = require('./src/models/Admin');

async function test() {
  await mongoose.connect(process.env.MONGO_URI);
  
  const admin = await Admin.findOne({ email: 'admin@workline.ge' });
  console.log('ადმინი ნაპოვნია:', admin ? 'დიახ' : 'არა');
  console.log('isActive:', admin?.isActive);
  console.log('passwordHash:', admin?.passwordHash);
  
  const isMatch = await bcrypt.compare('Admin123', admin.passwordHash);
  console.log('პაროლი სწორია:', isMatch);
  
  process.exit(0);
}

test();