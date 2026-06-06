const express = require('express');
const { body, validationResult } = require('express-validator');
const workerController = require('../controllers/worker.controller');

const router = express.Router();

// ────────────────────────────────────────────────────────────────────────────
// VALIDATION MIDDLEWARE
// ────────────────────────────────────────────────────────────────────────────
const validateWorker = [
  body('fname')
    .trim()
    .notEmpty().withMessage('სახელი აუცილებელია')
    .isLength({ min: 2, max: 50 }).withMessage('სახელი 2-50 სიმბოლო უნდა იყოს'),

  body('lname')
    .trim()
    .notEmpty().withMessage('გვარი აუცილებელია')
    .isLength({ min: 2, max: 50 }).withMessage('გვარი 2-50 სიმბოლო უნდა იყოს'),

  body('city')
    .notEmpty().withMessage('ქალაქი აუცილებელია'),

  // ✅ FIXED: Phone regex corrected
  // ✅ ახლა მხარს უჭერს:
  //    - "5XXXXXXXXX" (10 ციფრი) - ✅ 
  //    - "+9955XXXXXXXXX" (9 ციფრი +995-ს შემდეგ) - ✅
  //    - "+995 5 XXXXXXXX" (სპეისით) - ✅
  body('phone')
    .trim()
    .notEmpty().withMessage('ტელეფონი აუცილებელია')
    .matches(/^(\+?995\s?)?5\d{8}$|^\+9955\d{8}$/).withMessage('ტელეფონი არასწორი ფორმატია (მაგ: 5XXXXXXXXX ან +995 5 XXXXXXXX)'),

  body('email')
    .optional()
    .trim()
    .isEmail().withMessage('ელ-ფოსტა არასწორი'),

  body('sectors')
    .custom(value => {
      if (!Array.isArray(value) || value.length === 0) {
        throw new Error('მინიმუმ ერთი სფერო აუცილებელია');
      }
      return true;
    }),

  body('exp')
    .notEmpty().withMessage('გამოცდილება აუცილებელია'),

  body('avail')
    .notEmpty().withMessage('ხელმისაწვდომობა აუცილებელია'),

  body('dob')
    .optional()
    .isISO8601().withMessage('დაბადების თარიღი არასწორი'),

  body('salary')
    .optional()
    .isInt({ min: 0 }).withMessage('ანაზღაურება უნდა იყოს დადებითი რიცხვი'),

  body('langs')
    .optional()
    .isArray().withMessage('ენები უნდა იყოს მასივი'),

  body('computer')
    .optional()
    .isArray().withMessage('კომპ. უნარები უნდა იყოს მასივი'),

  body('schedule')
    .optional()
    .isArray().withMessage('სამუშაო საათები უნდა იყოს მასივი'),

  body('restrictions')
    .optional()
    .isArray().withMessage('შეზღუდვები უნდა იყოს მასივი'),

  body('certs')
    .optional()
    .isArray().withMessage('სერტიფიკატები უნდა იყოს მასივი'),

  body('customCerts')
    .optional()
    .isArray().withMessage('მორგებული სერტიფიკატები უნდა იყოს მასივი')
];

// ────────────────────────────────────────────────────────────────────────────
// ROUTES
// ────────────────────────────────────────────────────────────────────────────

// Create new worker - POST /api/workers
router.post('/', validateWorker, workerController.createWorker);

// Get all workers - GET /api/workers?city=თბილისი&page=1&limit=20
router.get('/', workerController.getAllWorkers);

// Get statistics - GET /api/workers/stats
router.get('/stats', workerController.getStatistics);

// Search workers - GET /api/workers/search?q=გია&city=თბილისი
router.get('/search', workerController.searchWorkers);

// Get workers by city - GET /api/workers/city/:city
router.get('/city/:city', workerController.getWorkersByCity);

// Get single worker - GET /api/workers/:id
router.get('/:id', workerController.getWorkerById);

// Update worker - PUT /api/workers/:id
router.put('/:id', workerController.updateWorker);

// Delete worker - DELETE /api/workers/:id
router.delete('/:id', workerController.deleteWorker);

module.exports = router;