require('dotenv').config();

fetch('http://localhost:3000/api/admin/login', {
  method: 'POST',
  headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify({ email: 'admin@workline.ge', password: 'Admin123' })
})
.then(r => r.json())
.then(data => console.log(data));