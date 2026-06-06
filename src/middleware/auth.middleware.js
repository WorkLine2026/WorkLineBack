const jwt = require('jsonwebtoken');
const Company = require('../models/Company');

async function protect(req, res, next) {
  try {
    const authHeader = req.headers.authorization;

    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return res.status(401).json({ message: 'ავტორიზაცია საჭიროა' });
    }

    const token = authHeader.split(' ')[1];
    const decoded = jwt.verify(token, process.env.JWT_SECRET);

    const company = await Company.findById(decoded.id);
    if (!company) {
      return res.status(401).json({ message: 'ტოკენი არავალიდურია' });
    }

    if (!company.isVerified) {
      return res.status(403).json({ message: 'ანგარიში არ არის დადასტურებული' });
    }

    req.company = company;
    next();
  } catch (err) {
    return res.status(401).json({ message: 'ტოკენი არავალიდურია ან ვადაგასულია' });
  }
}

module.exports = { protect };