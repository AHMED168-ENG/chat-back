const jwt = require('jsonwebtoken');
const SECRET_KEY = 'a1b2c3d4e5f6g7h8i9j0'; // نفس اللي في .env

// توكن لعميل
const clientToken = jwt.sign(
  { user_id: '123', role: 'client', name: 'أحمد محمد' },
  SECRET_KEY,
  { expiresIn: '24h' }
);
console.log('Cli:', clientToken);

// توكن لوكيل
const agentToken = jwt.sign(
  { user_id: '456', role: 'agent', name: 'محمد علي' },
  SECRET_KEY,
  { expiresIn: '24h' }
);
console.log('Age:', agentToken);