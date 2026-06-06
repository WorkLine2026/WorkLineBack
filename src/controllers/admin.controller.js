const jwt = require('jsonwebtoken');
const bcrypt = require('bcryptjs');
const Person = require('../models/person');
const Company = require('../models/company');
const Admin = require('../models/admin');
const Worker = require('../models/worker');
const JobRequest = require('../models/Jobrequest');

exports.adminLogin = async (req, res) => {
  try {
    const { email, password } = req.body;
    if (!email || !password) {
      return res.status(400).json({ message: 'ელ-ფოსტა და პაროლი სავალდებულოა' });
    }
    const admin = await Admin.findOne({ email: email.toLowerCase().trim() });
    if (!admin) return res.status(401).json({ message: 'მონაცემები არასწორია' });
    if (!admin.isActive) return res.status(403).json({ message: 'ანგარიში დეაქტივირებულია' });
    const isMatch = await bcrypt.compare(password, admin.passwordHash);
    if (!isMatch) return res.status(401).json({ message: 'მონაცემები არასწორია' });
    const token = jwt.sign(
      { id: admin._id, email: admin.email, role: admin.role },
      process.env.JWT_SECRET,
      { expiresIn: '1d' }
    );
    res.json({
      token,
      admin: { id: admin._id, name: admin.name, email: admin.email, role: admin.role }
    });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'სერვერის შეცდომა' });
  }
};

exports.getAdminProfile = async (req, res) => {
  try {
    res.json(req.admin);
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'სერვერის შეცდომა' });
  }
};

exports.getStats = async (req, res) => {
  try {
    const totalUsers     = await Person.countDocuments();
    const totalCompanies = await Company.countDocuments();
    const totalWorkers   = await Worker.countDocuments();
    
    // ✅ უმჯობესებული: აქტიური ვაკანსიები
    const activeJobs = await JobRequest.countDocuments({ 
      status: { $in: ['pending', 'processing', 'contacted'] } 
    });

    const pendingVerifications = await Company.countDocuments({
      isVerified: false,
      status: 'pending'
    });

    const weekAgo = new Date();
    weekAgo.setDate(weekAgo.getDate() - 7);

    const newUsersThisWeek     = await Person.countDocuments({ createdAt: { $gte: weekAgo } });
    const newCompaniesThisWeek = await Company.countDocuments({ createdAt: { $gte: weekAgo } });

    res.json({
      totalUsers,
      totalCompanies,
      totalWorkers,
      activeJobs,
      pendingVerifications,
      newUsersThisWeek,
      newCompaniesThisWeek,
    });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'სერვერის შეცდომა' });
  }
};

exports.getUsers = async (req, res) => {
  try {
    const users = await Person.find({}, '-password');
    res.json(users);
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'სერვერის შეცდომა' });
  }
};

exports.getCompanies = async (req, res) => {
  try {
    const companies = await Company.find();
    res.json(companies);
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'სერვერის შეცდომა' });
  }
};

exports.getWorkers = async (req, res) => {
  try {
    const workers = await Worker.find().sort({ createdAt: -1 });
    res.json(workers);
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'სერვერის შეცდომა' });
  }
};

exports.deleteWorker = async (req, res) => {
  try {
    const worker = await Worker.findByIdAndDelete(req.params.id);
    if (!worker) return res.status(404).json({ message: 'ვერ მოიძებნა' });
    res.json({ message: 'წაიშალა' });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'სერვერის შეცდომა' });
  }
};

exports.getActivityFeed = async (req, res) => {
  try {
    res.json([]);
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'სერვერის შეცდომა' });
  }
};

exports.verifyUser = async (req, res) => {
  try {
    const user = await Person.findByIdAndUpdate(
      req.params.id, { isVerified: true, status: 'active' }, { new: true }
    );
    if (!user) return res.status(404).json({ message: 'მომხმარებელი ვერ მოიძებნა' });
    res.json({ message: 'მომხმარებელი ვერიფიცირდა' });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'სერვერის შეცდომა' });
  }
};

exports.toggleUserStatus = async (req, res) => {
  try {
    const user = await Person.findById(req.params.id);
    if (!user) return res.status(404).json({ message: 'მომხმარებელი ვერ მოიძებნა' });
    user.status = user.status === 'active' ? 'suspended' : 'active';
    await user.save();
    res.json({ message: 'სტატუსი განახლდა' });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'სერვერის შეცდომა' });
  }
};

exports.deleteUser = async (req, res) => {
  try {
    const user = await Person.findByIdAndDelete(req.params.id);
    if (!user) return res.status(404).json({ message: 'მომხმარებელი ვერ მოიძებნა' });
    res.json({ message: 'მომხმარებელი წაიშალა' });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'სერვერის შეცდომა' });
  }
};

exports.verifyCompany = async (req, res) => {
  try {
    const company = await Company.findByIdAndUpdate(
      req.params.id, { isVerified: true, status: 'active' }, { new: true }
    );
    if (!company) return res.status(404).json({ message: 'კომპანია ვერ მოიძებნა' });
    res.json({ message: 'კომპანია ვერიფიცირდა' });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'სერვერის შეცდომა' });
  }
};

exports.toggleCompanyStatus = async (req, res) => {
  try {
    const company = await Company.findById(req.params.id);
    if (!company) return res.status(404).json({ message: 'კომპანია ვერ მოიძებნა' });
    company.status = company.status === 'active' ? 'suspended' : 'active';
    await company.save();
    res.json({ message: 'სტატუსი განახლდა' });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'სერვერის შეცდომა' });
  }
};

exports.deleteCompany = async (req, res) => {
  try {
    const company = await Company.findByIdAndDelete(req.params.id);
    if (!company) return res.status(404).json({ message: 'კომპანია ვერ მოიძებნა' });
    res.json({ message: 'კომპანია წაიშალა' });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'სერვერის შეცდომა' });
  }
};

// ═══════════════════════════════════════════════════════════════
// ✨ ახალი მეთოდები: VACANCIES / JOB REQUESTS
// ═══════════════════════════════════════════════════════════════

exports.getVacancies = async (req, res) => {
  try {
    const vacancies = await JobRequest.find()
      .sort({ submittedAt: -1 });
    
    // ფორმატირება ფრონტენდის მოთხოვნის მიხედვით
    const formatted = vacancies.map(v => ({
      _id: v._id,
      id: v._id,
      companyName: v.companyName,
      sector: v.sector,
      positions: v.positions,
      headcount: v.headcount,
      expRequired: v.expRequired,
      langs: v.langs,
      certsRequired: v.certsRequired,
      requirements: v.requirements,
      duration: v.duration,
      schedule: v.schedule,
      salaryFrom: v.salaryFrom,
      salaryTo: v.salaryTo,
      payType: v.payType,
      benefits: v.benefits,
      city: v.city,
      district: v.district,
      address: v.address,
      startDate: v.startDate,
      specificDate: v.specificDate,
      workEnv: v.workEnv,
      notes: v.notes,
      contactName: v.contactName,
      phone: v.phone,
      email: v.email,
      createdAt: v.submittedAt,
      status: v.status === 'archived' ? 'closed' : 'active'
    }));
    
    res.json(formatted);
  } catch (err) {
    console.error('getVacancies error:', err);
    res.status(500).json({ message: 'სერვერის შეცდომა' });
  }
};

exports.closeVacancy = async (req, res) => {
  try {
    const vacancy = await JobRequest.findByIdAndUpdate(
      req.params.id,
      { status: 'archived' },
      { new: true }
    );
    if (!vacancy) return res.status(404).json({ message: 'ვაკანსია ვერ მოიძებნა' });
    res.json({ message: 'ვაკანსია დაიხურა' });
  } catch (err) {
    console.error('closeVacancy error:', err);
    res.status(500).json({ message: 'სერვერის შეცდომა' });
  }
};

exports.deleteVacancy = async (req, res) => {
  try {
    const vacancy = await JobRequest.findByIdAndDelete(req.params.id);
    if (!vacancy) return res.status(404).json({ message: 'ვაკანსია ვერ მოიძებნა' });
    res.json({ message: 'ვაკანსია წაიშალა' });
  } catch (err) {
    console.error('deleteVacancy error:', err);
    res.status(500).json({ message: 'სერვერის შეცდომა' });
  }
};

exports.logout = async (req, res) => {
  res.json({ message: 'გამოსვლა წარმატებულია' });
};