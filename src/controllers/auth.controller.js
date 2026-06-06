const jwt = require('jsonwebtoken');
const Company = require('../models/company');
const { sendVerificationEmail } = require('../services/email.service');
const Person = require('../models/person');

// ── helpers ────────────────────────────────────────────────────────────────────

function generateCode() {
  return String(Math.floor(100000 + Math.random() * 900000));
}

function generateToken(companyId) {
  return jwt.sign(
    { id: companyId },
    process.env.JWT_SECRET,
    { expiresIn: process.env.JWT_EXPIRES_IN || '7d' }
  );
}

function codeExpiresAt() {
  const ttl = Number(process.env.VERIFY_CODE_TTL_MINUTES) || 10;
  return new Date(Date.now() + ttl * 60 * 1000);
}

// ── POST /api/auth/register ────────────────────────────────────────────────────
async function register(req, res) {
  try {
    const { company, contact, password } = req.body;

    if (
      !company?.name || !company?.identificationCode ||
      !company?.sector || !company?.city ||
      !contact?.phone || !contact?.email || !password
    ) {
      return res.status(400).json({ message: 'ყველა ველი სავალდებულოა' });
    }

    const email = contact.email.toLowerCase().trim();

    const existingVerified = await Company.findOne({ email, isVerified: true });
    if (existingVerified) {
      return res.status(409).json({ message: 'ეს ელ-ფოსტა უკვე რეგისტრირებულია' });
    }

    const existingCode = await Company.findOne({
      identificationCode: company.identificationCode.trim(),
      isVerified: true
    });
    if (existingCode) {
      return res.status(409).json({ message: 'ეს საიდენტიფიკაციო კოდი უკვე რეგისტრირებულია' });
    }

    const verificationCode = generateCode();
    const verificationCodeExpires = codeExpiresAt();

    let companyDoc = await Company.findOne({ email, isVerified: false });

    if (companyDoc) {
      companyDoc.name               = company.name.trim();
      companyDoc.identificationCode = company.identificationCode.trim();
      companyDoc.sector             = company.sector;
      companyDoc.city               = company.city;
      companyDoc.phone              = contact.phone.trim();
      companyDoc.password           = password;
      companyDoc.verificationCode        = verificationCode;
      companyDoc.verificationCodeExpires = verificationCodeExpires;
      await companyDoc.save();
    } else {
      companyDoc = await Company.create({
        name:               company.name.trim(),
        identificationCode: company.identificationCode.trim(),
        sector:             company.sector,
        city:               company.city,
        phone:              contact.phone.trim(),
        email,
        password,
        verificationCode,
        verificationCodeExpires,
      });
    }

    await sendVerificationEmail(email, verificationCode);

    if (process.env.NODE_ENV !== 'production') {
      console.log(`[DEV] verification code for ${email}: ${verificationCode}`);
    }

    return res.status(200).json({ message: 'კოდი გაიგზავნა', email });

  } catch (err) {
    console.error('register error:', err);
    if (err.code === 11000) {
      const field = Object.keys(err.keyValue)[0];
      const msg = field === 'email'
        ? 'ეს ელ-ფოსტა უკვე რეგისტრირებულია'
        : 'ეს საიდენტიფიკაციო კოდი უკვე რეგისტრირებულია';
      return res.status(409).json({ message: msg });
    }
    return res.status(500).json({ message: 'სერვერის შეცდომა' });
  }
}

// ── POST /api/auth/verify ──────────────────────────────────────────────────────
async function verify(req, res) {
  try {
    const { email, code } = req.body;

    if (!email || !code) {
      return res.status(400).json({ message: 'email და კოდი სავალდებულოა' });
    }

    const company = await Company
      .findOne({ email: email.toLowerCase().trim() })
      .select('+verificationCode +verificationCodeExpires');

    if (!company) {
      return res.status(404).json({ message: 'რეგისტრაცია ვერ მოიძებნა. სცადეთ თავიდან' });
    }

    if (company.isVerified) {
      return res.status(400).json({ message: 'ანგარიში უკვე დადასტურებულია' });
    }

    if (!company.verificationCode || Date.now() > company.verificationCodeExpires) {
      return res.status(410).json({ message: 'კოდის ვადა გავიდა. გაიმეორეთ რეგისტრაცია' });
    }

    if (company.verificationCode !== String(code).trim()) {
      return res.status(422).json({ message: 'კოდი არასწორია' });
    }

    company.isVerified              = true;
    company.verificationCode        = undefined;
    company.verificationCodeExpires = undefined;
    await company.save();

    const token = generateToken(company._id);

    return res.status(201).json({
      message: 'რეგისტრაცია წარმატებით დასრულდა',
      token,
      company: {
        id:                 company._id,
        name:               company.name,
        identificationCode: company.identificationCode,
        sector:             company.sector,
        city:               company.city,
        email:              company.email,
        phone:              company.phone,
      },
    });

  } catch (err) {
    console.error('verify error:', err);
    return res.status(500).json({ message: 'სერვერის შეცდომა' });
  }
}

// ── POST /api/auth/resend ──────────────────────────────────────────────────────
async function resend(req, res) {
  try {
    const { email } = req.body;
    if (!email) return res.status(400).json({ message: 'email სავალდებულოა' });

    const company = await Company
      .findOne({ email: email.toLowerCase().trim(), isVerified: false })
      .select('+verificationCode +verificationCodeExpires');

    if (!company) {
      return res.status(404).json({ message: 'რეგისტრაცია ვერ მოიძებნა' });
    }

    const verificationCode = generateCode();
    company.verificationCode        = verificationCode;
    company.verificationCodeExpires = codeExpiresAt();
    await company.save();

    await sendVerificationEmail(company.email, verificationCode);

    if (process.env.NODE_ENV !== 'production') {
      console.log(`[DEV] resent code for ${company.email}: ${verificationCode}`);
    }

    return res.status(200).json({ message: 'კოდი თავიდან გაიგზავნა' });

  } catch (err) {
    console.error('resend error:', err);
    return res.status(500).json({ message: 'სერვერის შეცდომა' });
  }
}

// ── POST /api/auth/login ───────────────────────────────────────────────────────
async function login(req, res) {
  try {
    const { email, password, identificationCode } = req.body;

    if (!email || !password) {
      return res.status(400).json({ message: 'ელ-ფოსტა და პაროლი სავალდებულოა' });
    }

    const company = await Company
      .findOne({ email: email.toLowerCase().trim() })
      .select('+password');

    if (!company) {
      return res.status(401).json({ message: 'მონაცემები არასწორია' });
    }

    if (!company.isVerified) {
      return res.status(403).json({ message: 'ანგარიში არ არის დადასტურებული' });
    }

    if (identificationCode && company.identificationCode !== identificationCode.trim()) {
      return res.status(401).json({ message: 'მონაცემები არასწორია' });
    }

    const isMatch = await company.comparePassword(password);
    if (!isMatch) {
      return res.status(401).json({ message: 'მონაცემები არასწორია' });
    }

    const token = generateToken(company._id);

    return res.status(200).json({
      message: 'წარმატებული ავტორიზაცია',
      token,
      company: {
        id:                 company._id,
        name:               company.name,
        identificationCode: company.identificationCode,
        sector:             company.sector,
        city:               company.city,
        email:              company.email,
        phone:              company.phone,
      },
    });

  } catch (err) {
    console.error('login error:', err);
    return res.status(500).json({ message: 'სერვერის შეცდომა' });
  }
}
// ════════════════════════════════════════════════════════════
//  PERSON AUTH
// ════════════════════════════════════════════════════════════


function generatePersonToken(personId) {
  return jwt.sign(
    { id: personId, type: 'person' },
    process.env.JWT_SECRET,
    { expiresIn: process.env.JWT_EXPIRES_IN || '7d' }
  );
}

// POST /api/auth/person/register
async function registerPerson(req, res) {
  try {
    const {
      firstName, lastName, birthDate, gender, idNumber, city,
      sector, experience, availability, schedules,
      phone, email, password,
    } = req.body;

    if (!firstName || !lastName || !birthDate || !gender || !idNumber ||
        !city || !sector || !experience || !availability || !phone || !email || !password) {
      return res.status(400).json({ message: 'ყველა ველი სავალდებულოა' });
    }
    if (!/^\d{11}$/.test(idNumber))
      return res.status(400).json({ message: 'პირადი ნომერი უნდა შეიცავდეს ზუსტად 11 ციფრს.' });
    if (password.length < 8)
      return res.status(400).json({ message: 'პაროლი მინიმუმ 8 სიმბოლოს უნდა შეიცავდეს.' });

    const normalizedEmail = email.toLowerCase().trim();

    const existing = await Person.findOne({ email: normalizedEmail });
    if (existing) {
      if (!existing.isVerified) {
        const code = generateCode();
        existing.verificationCode        = code;
        existing.verificationCodeExpires = codeExpiresAt();
        await existing.save();
        await sendVerificationEmail(normalizedEmail, code);
        return res.status(200).json({ message: 'კოდი ხელახლა გამოგზავნილია.' });
      }
      return res.status(409).json({ message: 'ეს ელ-ფოსტა უკვე რეგისტრირებულია.' });
    }

    const idExists = await Person.findOne({ idNumber });
    if (idExists)
      return res.status(409).json({ message: 'ეს პირადი ნომერი უკვე რეგისტრირებულია.' });

    const code = generateCode();
    await Person.create({
      firstName, lastName, birthDate, gender, idNumber, city,
      sector, experience, availability, schedules: schedules || [],
      phone, email: normalizedEmail, password,
      verificationCode:        code,
      verificationCodeExpires: codeExpiresAt(),
    });

    await sendVerificationEmail(normalizedEmail, code);

    if (process.env.NODE_ENV !== 'production')
      console.log(`[DEV] person code for ${normalizedEmail}: ${code}`);

    return res.status(201).json({ message: 'კოდი გამოგზავნილია თქვენს ელ-ფოსტაზე.' });

  } catch (err) {
    console.error('registerPerson error:', err);
    if (err.code === 11000)
      return res.status(409).json({ message: 'ეს მონაცემები უკვე რეგისტრირებულია.' });
    return res.status(500).json({ message: 'სერვერის შეცდომა.' });
  }
}

// POST /api/auth/person/verify-email
async function verifyPersonEmail(req, res) {
  try {
    const { email, code } = req.body;
    if (!email || !code)
      return res.status(400).json({ message: 'ელ-ფოსტა და კოდი სავალდებულოა.' });

    const person = await Person
      .findOne({ email: email.toLowerCase().trim() })
      .select('+verificationCode +verificationCodeExpires');

    if (!person)
      return res.status(404).json({ message: 'მომხმარებელი ვერ მოიძებნა.' });
    if (person.isVerified)
      return res.status(400).json({ message: 'ანგარიში უკვე ვერიფიცირებულია.' });
    if (!person.verificationCode || Date.now() > person.verificationCodeExpires)
      return res.status(410).json({ message: 'კოდის ვადა გავიდა. სცადეთ ხელახლა გაგზავნა.' });
    if (person.verificationCode !== String(code).trim())
      return res.status(422).json({ message: 'კოდი არასწორია.' });

    person.isVerified              = true;
    person.verificationCode        = undefined;
    person.verificationCodeExpires = undefined;
    await person.save();

    const token = generatePersonToken(person._id);

    return res.status(200).json({
      message: 'ვერიფიკაცია წარმატებით დასრულდა!',
      token,
      user: {
        id:        person._id,
        firstName: person.firstName,
        lastName:  person.lastName,
        email:     person.email,
      },
    });

  } catch (err) {
    console.error('verifyPersonEmail error:', err);
    return res.status(500).json({ message: 'სერვერის შეცდომა.' });
  }
}

// POST /api/auth/person/resend-code
async function resendPersonCode(req, res) {
  try {
    const { email } = req.body;
    if (!email) return res.status(400).json({ message: 'ელ-ფოსტა სავალდებულოა.' });

    const person = await Person
      .findOne({ email: email.toLowerCase().trim(), isVerified: false })
      .select('+verificationCode +verificationCodeExpires');

    if (!person)
      return res.status(404).json({ message: 'მომხმარებელი ვერ მოიძებნა.' });

    const code = generateCode();
    person.verificationCode        = code;
    person.verificationCodeExpires = codeExpiresAt();
    await person.save();
    await sendVerificationEmail(person.email, code);

    if (process.env.NODE_ENV !== 'production')
      console.log(`[DEV] resent person code for ${person.email}: ${code}`);

    return res.status(200).json({ message: 'კოდი ხელახლა გამოგზავნილია.' });

  } catch (err) {
    console.error('resendPersonCode error:', err);
    return res.status(500).json({ message: 'სერვერის შეცდომა.' });
  }
}

// POST /api/auth/person/login
async function loginPerson(req, res) {
  try {
    const { email, password } = req.body;
    if (!email || !password)
      return res.status(400).json({ message: 'ელ-ფოსტა და პაროლი სავალდებულოა.' });

    const person = await Person
      .findOne({ email: email.toLowerCase().trim() })
      .select('+password');

    if (!person)
      return res.status(401).json({ message: 'მონაცემები არასწორია.' });
    if (!person.isVerified)
      return res.status(403).json({ message: 'ანგარიში არ არის დადასტურებული.' });

    const isMatch = await person.comparePassword(password);
    if (!isMatch)
      return res.status(401).json({ message: 'მონაცემები არასწორია.' });

    const token = generatePersonToken(person._id);

    return res.status(200).json({
      message: 'წარმატებული ავტორიზაცია',
      token,
      user: {
        id:        person._id,
        firstName: person.firstName,
        lastName:  person.lastName,
        email:     person.email,
      },
    });

  } catch (err) {
    console.error('loginPerson error:', err);
    return res.status(500).json({ message: 'სერვერის შეცდომა.' });
  }
}
module.exports = { register, verify, resend, login, registerPerson, verifyPersonEmail, resendPersonCode, loginPerson };