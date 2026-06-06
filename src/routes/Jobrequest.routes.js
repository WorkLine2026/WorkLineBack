const express = require('express');
const router = express.Router();
const jobRequestController = require('../controllers/Jobrequest.controller');

// ═══════════════════════════════════════════════════════════════
// ⚠️ ᲠᲣᲢᲔᲑᲘᲡ რიგი მნიშვნელოვანია!
// ═══════════════════════════════════════════════════════════════
// 1. SPECIFIC routes (სტატიკური paths)
// 2. DYNAMIC routes (:id patterns)
// 3. GENERIC routes (/:id)
// ═══════════════════════════════════════════════════════════════

// ═══════════════════════════════════════════════════════════════
// 📊 სტატისტიკა (უნდა იყოს ერთი რიგი!)
// ═══════════════════════════════════════════════════════════════
router.get('/stats/overview', jobRequestController.getJobRequestStats);

// ═══════════════════════════════════════════════════════════════
// 🔍 ერთი Job Request (დეტალი, აპდეიტი, წაშლა)
// ═══════════════════════════════════════════════════════════════
router.get('/:id', jobRequestController.getJobRequestById);
router.put('/:id', jobRequestController.updateJobRequest);
router.delete('/:id', jobRequestController.deleteJobRequest);

// ═══════════════════════════════════════════════════════════════
// 📝 ყველა Job Request-ი (GET) და ახალი Job Request (POST)
// ═══════════════════════════════════════════════════════════════
router.post('/', jobRequestController.createJobRequest);
router.get('/', jobRequestController.getAllJobRequests);

// ═══════════════════════════════════════════════════════════════
// Export
// ═══════════════════════════════════════════════════════════════
module.exports = router;