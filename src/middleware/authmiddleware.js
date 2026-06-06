const jwt = require('jsonwebtoken');

exports.authenticateAdmin = (req, res, next) => {
  const authHeader = req.headers.authorization;
  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    return res.status(401).json({ message: 'ვალიდური ტოკენი არ არის' });
  }

  const token = authHeader.split(' ')[1];

  try {
    const payload = jwt.verify(token, process.env.JWT_SECRET);
    if (payload.role !== 'admin' && payload.role !== 'superadmin') {
      return res.status(403).json({ message: 'ადმინის წვadia არ არის' });
    }
    req.admin = payload; // { id, email, role }
    next();
  } catch (err) {
    return res.status(401).json({ message: 'invalid token' });
  }
};