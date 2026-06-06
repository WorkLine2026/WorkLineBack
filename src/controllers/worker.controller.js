const { validationResult } = require('express-validator');
const Worker = require('../models/worker');
const { sendWorkerWelcomeEmail, sendAdminNotification } = require('../services/worker.service');

// ────────────────────────────────────────────────────────────────────────────
// POST - Create new worker profile
// ────────────────────────────────────────────────────────────────────────────
exports.createWorker = async (req, res) => {
  try {
    console.log('\n🚀 ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
    console.log('🚀 NEW WORKER REGISTRATION REQUEST');
    console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');

    // Validate request
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      console.error('❌ Validation errors:', errors.array());
      return res.status(400).json({
        success: false,
        errors: errors.array()
      });
    }

    const {
      fname, lname, dob, gender, pid, city, phone, email, wa, fb,
      sectors, exp, edu, langs, computer, bio,
      certs, customCerts, certFiles,
      restrictions, medbook, healthNote,
      avail, schedule, salary, cvNames
    } = req.body;

    const phoneToCheck = phone.trim();
    console.log('📞 Phone:', phoneToCheck);
    console.log('📧 Email:', email);

    // Check if phone already exists
    const existingWorker = await Worker.findOne({ phone: phoneToCheck });
    
    if (existingWorker) {
      console.log('⚠️  Duplicate phone found!');
      return res.status(400).json({
        success: false,
        error: 'ამ ტელეფონ ნომრით უკვე არის რეგისტრირებული პროფილი'
      });
    }
    
    // Create new worker
    const worker = new Worker({
      fname: fname.trim(),
      lname: lname.trim(),
      dob: dob || '',
      gender: gender || '',
      pid: pid || '',
      city,
      phone: phoneToCheck,
      email: email ? email.trim() : '',
      wa: wa || '',
      fb: fb || '',
      sectors,
      exp,
      edu: edu || '',
      langs: langs && langs.length > 0 ? langs : ['ქართული'],
      computer: computer || [],
      bio: bio || '',
      certs: certs || [],
      customCerts: customCerts || [],
      certFiles: certFiles ? [certFiles] : [],
      restrictions: restrictions || [],
      medbook: medbook || '',
      healthNote: healthNote || '',
      avail,
      schedule: schedule || [],
      salary: salary ? parseInt(salary) : null,
      cvFiles: cvNames ? [cvNames] : [],
      status: 'active'
    });

    // Save to database
    console.log('💾 Saving worker to database...');
    const savedWorker = await worker.save();
    console.log('✅ Worker saved! ID:', savedWorker._id);

    // ── Send Welcome Email ──
    let emailSent = false;
    if (savedWorker.email) {
      emailSent = await sendWorkerWelcomeEmail(savedWorker);
    } else {
      console.warn('⚠️  Worker has no email - skipping welcome email');
    }

    // ── Send Admin Notification ──
    let adminNotified = false;
    adminNotified = await sendAdminNotification(savedWorker);

    console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
    console.log('✅ WORKER REGISTRATION COMPLETE');
    console.log('✅ Worker ID:', savedWorker._id);
    console.log('✅ Welcome Email Sent:', emailSent);
    console.log('✅ Admin Notified:', adminNotified);
    console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n');

    res.status(201).json({
      success: true,
      message: 'პროფილი წარმატებით შენახულია',
      workerId: savedWorker._id,
      emailSent: emailSent,
      adminNotified: adminNotified,
      data: savedWorker
    });

  } catch (error) {
    console.error('❌ ERROR creating worker:', error.message);
    res.status(500).json({
      success: false,
      error: 'პროფილის შენახვისას შეცდომა',
      details: error.message
    });
  }
};

// ────────────────────────────────────────────────────────────────────────────
// GET - Get all workers (with filters and pagination)
// ────────────────────────────────────────────────────────────────────────────
exports.getAllWorkers = async (req, res) => {
  try {
    const { city, sector, exp, page = 1, limit = 20 } = req.query;

    // Build filter
    const filter = { status: 'active' };
    if (city) filter.city = city;
    if (sector) filter.sectors = sector;
    if (exp) filter.exp = exp;

    const skip = (page - 1) * limit;

    const workers = await Worker.find(filter)
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(parseInt(limit));

    const total = await Worker.countDocuments(filter);

    res.json({
      success: true,
      total,
      page: parseInt(page),
      limit: parseInt(limit),
      pages: Math.ceil(total / limit),
      data: workers
    });

  } catch (error) {
    console.error('Error fetching workers:', error);
    res.status(500).json({
      success: false,
      error: 'მონაცემების ამოღებისას შეცდომა',
      details: error.message
    });
  }
};

// ────────────────────────────────────────────────────────────────────────────
// GET - Get single worker by ID
// ────────────────────────────────────────────────────────────────────────────
exports.getWorkerById = async (req, res) => {
  try {
    const { id } = req.params;

    if (!id.match(/^[0-9a-fA-F]{24}$/)) {
      return res.status(400).json({
        success: false,
        error: 'არასწორი ID ფორმატი'
      });
    }

    const worker = await Worker.findById(id);
    if (!worker) {
      return res.status(404).json({
        success: false,
        error: 'პროფილი ვერ მოიძებნა'
      });
    }

    res.json({
      success: true,
      data: worker
    });

  } catch (error) {
    res.status(500).json({
      success: false,
      error: 'მონაცემების ამოღებისას შეცდომა',
      details: error.message
    });
  }
};

// ────────────────────────────────────────────────────────────────────────────
// PUT - Update worker profile
// ────────────────────────────────────────────────────────────────────────────
exports.updateWorker = async (req, res) => {
  try {
    const { id } = req.params;

    if (!id.match(/^[0-9a-fA-F]{24}$/)) {
      return res.status(400).json({
        success: false,
        error: 'არასწორი ID ფორმატი'
      });
    }

    const worker = await Worker.findByIdAndUpdate(
      id,
      { $set: req.body },
      { new: true, runValidators: true }
    );

    if (!worker) {
      return res.status(404).json({
        success: false,
        error: 'პროფილი ვერ მოიძებნა'
      });
    }

    res.json({
      success: true,
      message: 'პროფილი განახლდა',
      data: worker
    });

  } catch (error) {
    res.status(500).json({
      success: false,
      error: 'განახლების დროს შეცდომა',
      details: error.message
    });
  }
};

// ────────────────────────────────────────────────────────────────────────────
// DELETE - Delete (deactivate) worker profile
// ────────────────────────────────────────────────────────────────────────────
exports.deleteWorker = async (req, res) => {
  try {
    const { id } = req.params;

    if (!id.match(/^[0-9a-fA-F]{24}$/)) {
      return res.status(400).json({
        success: false,
        error: 'არასწორი ID ფორმატი'
      });
    }

    const worker = await Worker.findByIdAndUpdate(
      id,
      { $set: { status: 'inactive' } },
      { new: true }
    );

    if (!worker) {
      return res.status(404).json({
        success: false,
        error: 'პროფილი ვერ მოიძებნა'
      });
    }

    res.json({
      success: true,
      message: 'პროფილი წაშლილია'
    });

  } catch (error) {
    res.status(500).json({
      success: false,
      error: 'წაშლის დროს შეცდომა',
      details: error.message
    });
  }
};

// ────────────────────────────────────────────────────────────────────────────
// GET - Search workers by criteria
// ────────────────────────────────────────────────────────────────────────────
exports.searchWorkers = async (req, res) => {
  try {
    const { q, city, sectors, langs, exp } = req.query;

    let query = Worker.find({ status: 'active' });

    // Text search
    if (q) {
      query = query.or([
        { fname: new RegExp(q, 'i') },
        { lname: new RegExp(q, 'i') },
        { phone: new RegExp(q, 'i') }
      ]);
    }

    if (city) query = query.where('city').equals(city);

    if (sectors) {
      const sectorArray = Array.isArray(sectors) ? sectors : [sectors];
      query = query.where('sectors').in(sectorArray);
    }

    if (langs) {
      const langArray = Array.isArray(langs) ? langs : [langs];
      query = query.where('langs').in(langArray);
    }

    if (exp) query = query.where('exp').equals(exp);

    const workers = await query.limit(50);

    res.json({
      success: true,
      count: workers.length,
      data: workers
    });

  } catch (error) {
    res.status(500).json({
      success: false,
      error: 'ძიების დროს შეცდომა',
      details: error.message
    });
  }
};

// ────────────────────────────────────────────────────────────────────────────
// GET - Get workers by city
// ────────────────────────────────────────────────────────────────────────────
exports.getWorkersByCity = async (req, res) => {
  try {
    const { city } = req.params;

    const workers = await Worker.find({ city, status: 'active' }).limit(100);

    res.json({
      success: true,
      city,
      count: workers.length,
      data: workers
    });

  } catch (error) {
    res.status(500).json({
      success: false,
      error: 'მონაცემების ამოღებისას შეცდომა'
    });
  }
};

// ────────────────────────────────────────────────────────────────────────────
// GET - Get statistics
// ────────────────────────────────────────────────────────────────────────────
exports.getStatistics = async (req, res) => {
  try {
    const totalWorkers = await Worker.countDocuments({ status: 'active' });
    const totalPending = await Worker.countDocuments({ status: 'pending' });
    const totalInactive = await Worker.countDocuments({ status: 'inactive' });

    const workersByCity = await Worker.aggregate([
      { $match: { status: 'active' } },
      { $group: { _id: '$city', count: { $sum: 1 } } },
      { $sort: { count: -1 } }
    ]);

    const workersByExp = await Worker.aggregate([
      { $match: { status: 'active' } },
      { $group: { _id: '$exp', count: { $sum: 1 } } },
      { $sort: { count: -1 } }
    ]);

    res.json({
      success: true,
      stats: {
        totalWorkers,
        totalPending,
        totalInactive,
        workersByCity,
        workersByExp
      }
    });

  } catch (error) {
    res.status(500).json({
      success: false,
      error: 'სტატისტიკის ამოღებისას შეცდომა'
    });
  }
};