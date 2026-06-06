const express = require('express');
const router = express.Router();
const adminController = require('../controllers/admin.controller');
const { authenticateAdmin } = require('../middleware/authmiddleware');

// PUBLIC
router.post('/login', adminController.adminLogin);

// PROTECTED (ყველა ქვემოთ მოითხოვს ავტორიზაციას)
router.use(authenticateAdmin);

// ═══════════════════════════════════════════════════════════════
// ℹ️ ADMIN PROFILE & STATS
// ═══════════════════════════════════════════════════════════════
router.get('/profile',                              adminController.getAdminProfile);
router.get('/stats',                                adminController.getStats);
router.get('/activity',                             adminController.getActivityFeed);

// ═══════════════════════════════════════════════════════════════
// 👥 USERS MANAGEMENT
// ═══════════════════════════════════════════════════════════════
router.get('/users',                                adminController.getUsers);
router.post('/users/:id/verify',                    adminController.verifyUser);
router.post('/users/:id/toggle-status',             adminController.toggleUserStatus);
router.delete('/users/:id',                         adminController.deleteUser);

// ═══════════════════════════════════════════════════════════════
// 🏢 COMPANIES MANAGEMENT
// ═══════════════════════════════════════════════════════════════
router.get('/companies',                            adminController.getCompanies);
router.post('/companies/:id/verify',                adminController.verifyCompany);
router.post('/companies/:id/toggle-status',         adminController.toggleCompanyStatus);
router.delete('/companies/:id',                     adminController.deleteCompany);

// ═══════════════════════════════════════════════════════════════
// 👔 WORKERS MANAGEMENT
// ═══════════════════════════════════════════════════════════════
router.get('/workers',                              adminController.getWorkers);
router.delete('/workers/:id',                       adminController.deleteWorker);

// ═══════════════════════════════════════════════════════════════
// ✨ VACANCIES MANAGEMENT (ახალი!)
// ═══════════════════════════════════════════════════════════════
router.get('/vacancies',                            adminController.getVacancies);
router.put('/vacancies/:id/close',                  adminController.closeVacancy);
router.delete('/vacancies/:id',                     adminController.deleteVacancy);

// ═══════════════════════════════════════════════════════════════
// 🚪 LOGOUT
// ═══════════════════════════════════════════════════════════════
router.post('/logout',                              adminController.logout);

module.exports = router;