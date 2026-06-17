const JobRequest = require('../models/Jobrequest');
const { sendJobRequestEmail } = require('../services/Jobrequest.service');

// ═══════════════════════════════════════════════════════════════
// Job Request შექმნა (POST)
// ═══════════════════════════════════════════════════════════════
exports.createJobRequest = async (req, res) => {
  try {
    const {
      companyName,
      sector,
      companySize,
      contactName,
      contactRole,
      phone,
      email,
      taxId,
      positions,
      headcount,
      expRequired,
      langs,
      certsRequired,
      requirements,
      duration,
      schedule,
      salaryFrom,
      salaryTo,
      payType,
      benefits,
      city,
      district,
      address,
      startDate,
      specificDate,
      workEnv,
      notes,
      agreed,
    } = req.body;

    // ─────────────────────────────────────────────────────────────
    // ვალიდაცია
    // ─────────────────────────────────────────────────────────────
    if (!companyName) return res.status(400).json({ message: 'კომპანიის სახელი აუცილებელია' });
    if (!sector) return res.status(400).json({ message: 'სექტორი აუცილებელია' });
    if (!contactName) return res.status(400).json({ message: 'საკონტაქტო პირი აუცილებელია' });
    if (!phone) return res.status(400).json({ message: 'ტელეფონი აუცილებელია' });
    if (!email) return res.status(400).json({ message: 'ელ-ფოსტა აუცილებელია' });
    if (!positions || positions.length === 0) return res.status(400).json({ message: 'მინიმუმ ერთი პოზიცია აუცილებელია' });
    if (!headcount) return res.status(400).json({ message: 'კადრების რაოდენობა აუცილებელია' });
    if (!duration) return res.status(400).json({ message: 'სამუშაოს ხანგრძლივობა აუცილებელია' });
    if (!city) return res.status(400).json({ message: 'ქალაქი აუცილებელია' });
    if (!startDate) return res.status(400).json({ message: 'დაწყების თარიღი აუცილებელია' });
    if (!agreed) return res.status(400).json({ message: 'უნდა დაეთანხმოთ პირობებს' });

    // ─────────────────────────────────────────────────────────────
    // IP მისამართი
    // ─────────────────────────────────────────────────────────────
    const ipAddress = req.headers['x-forwarded-for'] || req.socket.remoteAddress || 'unknown';

    // ─────────────────────────────────────────────────────────────
    // Job Request შექმნა ბაზაში
    // ─────────────────────────────────────────────────────────────
    const newJobRequest = new JobRequest({
      companyName: companyName.trim(),
      sector: sector.trim(),
      companySize: companySize || null,
      contactName: contactName.trim(),
      contactRole: contactRole || null,
      phone: phone.trim(),
      email: email.toLowerCase().trim(),
      taxId: taxId || null,
      positions,
      headcount,
      expRequired: expRequired || null,
      langs: langs || ['ქართული'],
      certsRequired: certsRequired || [],
      requirements: requirements || null,
      duration,
      schedule: schedule || [],
      salaryFrom: salaryFrom || null,
      salaryTo: salaryTo || null,
      payType,
      benefits: benefits || [],
      city,
      district: district || null,
      address: address || null,
      startDate,
      specificDate: startDate === 'specific' ? new Date(specificDate) : null,
      workEnv,
      notes: notes || null,
      agreed,
      ipAddress,
      status: 'pending',
      submittedAt: new Date(),
    });

    // ─────────────────────────────────────────────────────────────
    // ბაზაში შენახვა და მეილის გაგზავნა
    // ─────────────────────────────────────────────────────────────
    const savedJobRequest = await newJobRequest.save();
    console.log('✅ Job Request შენახულია:', savedJobRequest._id);

    try {
      console.log('📧 Email გაგზავნის დაწყება...');
      await sendJobRequestEmail(savedJobRequest);
      console.log('✅ Email წარმატებით გაიგზავნა');
    } catch (emailError) {
      console.error('❌ Email გაგზავნის შეცდომა:', emailError);
    }

    return res.status(201).json({
      success: true,
      message: 'თქვენი მოთხოვნა წარმატებით მიღებულია',
      jobRequestId: savedJobRequest._id,
    });
  } catch (error) {
    console.error('❌ Job Request შექმნის შეცდომა:', error);
    return res.status(500).json({
      success: false,
      message: 'სერვერის შეცდომა',
      error: process.env.NODE_ENV === 'development' ? error.message : undefined,
    });
  }
};

// ═══════════════════════════════════════════════════════════════
// ყველა Job Request-ი (GET) - Admin
// ═══════════════════════════════════════════════════════════════
exports.getAllJobRequests = async (req, res) => {
  try {
    const { page = 1, limit = 10, status = null, city = null } = req.query;

    let filter = {};
    if (status) filter.status = status;
    if (city) filter.city = city;

    const skip = (page - 1) * limit;
    const total = await JobRequest.countDocuments(filter);

    const jobRequests = await JobRequest.find(filter)
      .sort({ submittedAt: -1 })
      .skip(skip)
      .limit(parseInt(limit));

    return res.status(200).json({
      success: true,
      data: jobRequests,
      pagination: {
        total,
        page: parseInt(page),
        limit: parseInt(limit),
        pages: Math.ceil(total / limit),
      },
    });
  } catch (error) {
    console.error('❌ Job Requests გამოთხოვნის შეცდომა:', error);
    return res.status(500).json({
      success: false,
      message: 'სერვერის შეცდომა',
    });
  }
};

// ═══════════════════════════════════════════════════════════════
// ერთი Job Request (GET)
// ═══════════════════════════════════════════════════════════════
exports.getJobRequestById = async (req, res) => {
  try {
    const { id } = req.params;
    const jobRequest = await JobRequest.findById(id);

    if (!jobRequest) {
      return res.status(404).json({
        success: false,
        message: 'მოთხოვნა ვერ იპოვა',
      });
    }

    if (!jobRequest.isViewed) {
      jobRequest.isViewed = true;
      jobRequest.viewedAt = new Date();
      await jobRequest.save();
    }

    return res.status(200).json({
      success: true,
      data: jobRequest,
    });
  } catch (error) {
    console.error('❌ Job Request გამოთხოვნის შეცდომა:', error);
    return res.status(500).json({
      success: false,
      message: 'სერვერის შეცდომა',
    });
  }
};

// ═══════════════════════════════════════════════════════════════
// Job Request აპდეიტი (UPDATE)
// ═══════════════════════════════════════════════════════════════
exports.updateJobRequest = async (req, res) => {
  try {
    const { id } = req.params;
    const { status, notes_admin } = req.body;

    const jobRequest = await JobRequest.findByIdAndUpdate(
      id,
      { status, notes_admin, viewedAt: new Date() },
      { new: true, runValidators: true }
    );

    if (!jobRequest) {
      return res.status(404).json({
        success: false,
        message: 'მოთხოვნა ვერ იპოვა',
      });
    }

    return res.status(200).json({
      success: true,
      message: 'მოთხოვნა განახლდა',
      data: jobRequest,
    });
  } catch (error) {
    console.error('❌ Job Request აპდეიტის შეცდომა:', error);
    return res.status(500).json({
      success: false,
      message: 'სერვერის შეცდომა',
    });
  }
};

// ═══════════════════════════════════════════════════════════════
// Job Request წაშლა (DELETE)
// ═══════════════════════════════════════════════════════════════
exports.deleteJobRequest = async (req, res) => {
  try {
    const { id } = req.params;
    const jobRequest = await JobRequest.findByIdAndDelete(id);

    if (!jobRequest) {
      return res.status(404).json({
        success: false,
        message: 'მოთხოვნა ვერ იპოვა',
      });
    }

    return res.status(200).json({
      success: true,
      message: 'მოთხოვნა წაიშალა',
    });
  } catch (error) {
    console.error('❌ Job Request წაშლის შეცდომა:', error);
    return res.status(500).json({
      success: false,
      message: 'სერვერის შეცდომა',
    });
  }
};

// ═══════════════════════════════════════════════════════════════
// სტატისტიკა
// ═══════════════════════════════════════════════════════════════
exports.getJobRequestStats = async (req, res) => {
  try {
    const stats = {
      total: await JobRequest.countDocuments(),
      pending: await JobRequest.countDocuments({ status: 'pending' }),
      processing: await JobRequest.countDocuments({ status: 'processing' }),
      contacted: await JobRequest.countDocuments({ status: 'contacted' }),
      archived: await JobRequest.countDocuments({ status: 'archived' }),
    };

    const byCity = await JobRequest.aggregate([
      { $group: { _id: '$city', count: { $sum: 1 } } },
      { $sort: { count: -1 } },
    ]);

    const bySector = await JobRequest.aggregate([
      { $group: { _id: '$sector', count: { $sum: 1 } } },
      { $sort: { count: -1 } },
    ]);

    return res.status(200).json({
      success: true,
      stats,
      byCity,
      bySector,
    });
  } catch (error) {
    console.error('❌ სტატისტიკის შეცდომა:', error);
    return res.status(500).json({
      success: false,
      message: 'სერვერის შეცდომა',
    });
  }
};