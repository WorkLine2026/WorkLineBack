const nodemailer = require('nodemailer');
const JobRequest = require('../models/Jobrequest');

// ═══════════════════════════════════════════════════════════════
// Gmail SMTP ტრანსპორტერის ინიციალიზაცია (IPv4 კავშირი)
// ═══════════════════════════════════════════════════════════════
console.log('\n🚀 ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
console.log('🚀 Gmail SMTP Route Setup Active');
console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
console.log('EMAIL_USER:', process.env.EMAIL_USER || 'work.1999line@gmail.com');
console.log('SENDER_EMAIL:', process.env.SENDER_EMAIL || process.env.EMAIL_USER);
console.log('ADMIN_EMAIL:', process.env.ADMIN_EMAIL || 'work.1999line@gmail.com');
console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n');

if (!process.env.EMAIL_USER || !process.env.EMAIL_PASS) {
  console.log('⚠️  გაფრთხილება: EMAIL_USER ან EMAIL_PASS არ არის გაწერილი .env ფაილში!');
}

const transporter = nodemailer.createTransport({
  host: process.env.EMAIL_HOST || 'smtp.gmail.com',
  port: parseInt(process.env.EMAIL_PORT || '465'),
  secure: true, // true 465 პორტისთვის (SSL)
  family: 4, // ✅ IPv4-ს ეძლევა უპირატესობა (Render-ის IPv6 ნაკლებობის გამო)
  auth: {
    user: process.env.EMAIL_USER,
    pass: process.env.EMAIL_PASS, // თქვენი 16-ნიშნა აპლიკაციის პაროლი
  },
});

// ═══════════════════════════════════════════════════════════════
// ✓ Job Request Email გაგზავნა (Gmail SMTP)
// ═══════════════════════════════════════════════════════════════
const sendJobRequestEmail = async (jobRequest) => {
  try {
    const {
      _id,
      companyName,
      sector,
      contactName,
      contactRole,
      phone,
      email,
      positions,
      headcount,
      duration,
      salaryFrom,
      salaryTo,
      city,
      startDate,
      specificDate,
      notes,
      submittedAt,
    } = jobRequest;

    const durationLabels = {
      week: '1 კვირა',
      twoweeks: '2 კვირა',
      month: '1 თვე',
      longer: '1+ თვე',
    };

    const startDateLabels = {
      asap: 'ახლავე',
      week: 'ამ კვირაში',
      twoweeks: '2 კვირაში',
      specific: specificDate ? new Date(specificDate).toLocaleDateString('ka-GE') : 'კონკ. თარიღი',
    };

    const salaryDisplay = salaryFrom
      ? salaryTo
        ? `${salaryFrom} – ${salaryTo} ₾`
        : `${salaryFrom} ₾`
      : 'მოლაპარაკება';

    const htmlContent = `
<!DOCTYPE html>
<html lang="ka">
<head>
  <meta charset="UTF-8">
  <style>
    * { margin: 0; padding: 0; box-sizing: border-box; }
    body { font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Arial, sans-serif; color: #333; line-height: 1.6; background: #f5f5f5; }
    .container { max-width: 700px; margin: 20px auto; background: #fff; border-radius: 8px; box-shadow: 0 2px 8px rgba(0,0,0,0.1); overflow: hidden; }
    .header { background: linear-gradient(135deg, #1a7a4a 0%, #145a38 100%); color: white; padding: 30px 20px; text-align: center; }
    .header h1 { font-size: 24px; margin-bottom: 5px; }
    .content { padding: 30px 20px; }
    .section { margin: 20px 0; }
    .section-title { font-size: 16px; font-weight: 600; color: #1a7a4a; border-bottom: 2px solid #1a7a4a; padding-bottom: 10px; margin-bottom: 15px; }
    .field-row { display: flex; margin: 12px 0; }
    .field-label { font-weight: 600; color: #333; min-width: 140px; }
    .field-value { color: #666; flex: 1; }
    .chip { display: inline-block; background: #e6f4ed; color: #1a7a4a; padding: 4px 10px; margin: 2px; border-radius: 12px; font-size: 12px; }
    .divider { height: 1px; background: #eee; margin: 20px 0; }
    .footer { background: #f9f9f9; padding: 20px; border-top: 1px solid #eee; font-size: 12px; color: #999; }
    .recipients { background: #f0f8f5; padding: 10px; border-radius: 6px; font-size: 12px; color: #555; margin-bottom: 10px; }
  </style>
</head>
<body>
  <div class="container">
    <div class="header">
      <h1>🎯 ახალი სამსახურეო მოთხოვნა</h1>
      <p>Job Request ID: ${_id}</p>
    </div>
    <div class="content">
      <div class="recipients">
        📬 <strong>მიმღებლები:</strong> ადმინი + ${email ? 'კომპანია' : 'განახლებული'}
      </div>
      <div class="section">
        <div class="section-title">📦 კომპანია</div>
        <div class="field-row">
          <div class="field-label">კომპანია:</div>
          <div class="field-value"><strong>${companyName}</strong></div>
        </div>
        <div class="field-row">
          <div class="field-label">სექტორი:</div>
          <div class="field-value">${sector}</div>
        </div>
      </div>
      <div class="divider"></div>
      <div class="section">
        <div class="section-title">👤 საკონტაქტო</div>
        <div class="field-row">
          <div class="field-label">სახელი:</div>
          <div class="field-value"><strong>${contactName}</strong></div>
        </div>
        <div class="field-row">
          <div class="field-label">ტელეფონი:</div>
          <div class="field-value"><a href="tel:${phone}" style="color: #1a7a4a;">${phone}</a></div>
        </div>
        <div class="field-row">
          <div class="field-label">ელ-ფოსტა:</div>
          <div class="field-value"><a href="mailto:${email}" style="color: #1a7a4a;">${email}</a></div>
        </div>
      </div>
      <div class="divider"></div>
      <div class="section">
        <div class="section-title">💼 პოზიცია</div>
        <div class="field-row">
          <div class="field-label">პოზიციები:</div>
          <div class="field-value">${positions.map(p => `<span class="chip">${p}</span>`).join('')}</div>
        </div>
        <div class="field-row">
          <div class="field-label">კადრი:</div>
          <div class="field-value"><strong>${headcount}</strong></div>
        </div>
      </div>
      <div class="divider"></div>
      <div class="section">
        <div class="section-title">⏱️ პირობები</div>
        <div class="field-row">
          <div class="field-label">ხანგრძლივობა:</div>
          <div class="field-value">${durationLabels[duration] || duration}</div>
        </div>
        <div class="field-row">
          <div class="field-label">ანაზღაურება:</div>
          <div class="field-value"><strong>${salaryDisplay}</strong></div>
        </div>
      </div>
      <div class="divider"></div>
      <div class="section">
        <div class="section-title">📍 ადგილმდებარეობა</div>
        <div class="field-row">
          <div class="field-label">ქალაქი:</div>
          <div class="field-value"><strong>${city}</strong></div>
        </div>
        <div class="field-row">
          <div class="field-label">დაწყება:</div>
          <div class="field-value">${startDateLabels[startDate] || startDate}</div>
        </div>
      </div>
      ${notes ? `<div class="divider"></div>
      <div class="section">
        <div class="section-title">📝 შენიშვნები</div>
        <div class="field-value">${notes}</div>
      </div>` : ''}
    </div>
    <div class="footer">
      <p><strong>ID:</strong> ${_id}</p>
      <p><strong>დრო:</strong> ${new Date(submittedAt).toLocaleString('ka-GE')}</p>
      <p>Personali © 2026</p>
    </div>
  </div>
</body>
</html>
    `;

    const textContent = `ახალი Job Request\n================\nკომპანია: ${companyName}\nსექტორი: ${sector}\nკონტაქტი: ${contactName} (${phone})\nელ-ფოსტა: ${email}\nპოზიციები: ${positions.join(', ')}\nკადრი: ${headcount}\nხანგრძლივობა: ${durationLabels[duration] || duration}\nქალაქი: ${city}\nანაზღაურება: ${salaryDisplay}\n${notes ? `\nშენიშვნები: ${notes}` : ''}`;

    const fromEmail = process.env.SENDER_EMAIL || process.env.EMAIL_USER;
    const adminEmail = process.env.ADMIN_EMAIL || 'work.1999line@gmail.com';

    const bccEmails = [];
    if (email && email.trim()) {
      bccEmails.push(email.trim());
    }

    if (process.env.JOB_REQUEST_CC_EMAIL && 
        process.env.JOB_REQUEST_CC_EMAIL.trim() &&
        process.env.JOB_REQUEST_CC_EMAIL !== adminEmail &&
        !bccEmails.includes(process.env.JOB_REQUEST_CC_EMAIL)) {
      bccEmails.push(process.env.JOB_REQUEST_CC_EMAIL.trim());
    }

    const mailOptions = {
      from: `"Personali" <${fromEmail}>`,
      to: adminEmail, 
      subject: `📋 ახალი Job Request - ${companyName}`,
      html: htmlContent,
      text: textContent,
    };

    if (bccEmails.length > 0) {
      mailOptions.bcc = bccEmails.join(', '); // Nodemailer-ისთვის სთრინგად გადაბმა ჯობია
    }

    console.log('✉️ გაგზავნა Gmail SMTP-ით...');

    const info = await transporter.sendMail(mailOptions);

    console.log('✅ Email წარმატებით გაიგზავნა! ID:', info.messageId);
    return { success: true, messageId: info.messageId };
  } catch (error) {
    console.error('❌ Gmail SMTP შეცდომა:', error.message);
    throw new Error(error.message);
  }
};

// ═══════════════════════════════════════════════════════════════
// ✓ ტესტ Email
// ═══════════════════════════════════════════════════════════════
const sendTestEmail = async (email) => {
  try {
    const fromEmail = process.env.SENDER_EMAIL || process.env.EMAIL_USER;
    
    const info = await transporter.sendMail({
      from: `"Personali ტესტი" <${fromEmail}>`,
      to: email,
      subject: 'Personali - Email ტესტი',
      html: '<h1>Hello! 🎉</h1><p>Personali Gmail SMTP ტესტი წარმატებულია!</p>',
      text: 'Personali test email',
    });

    console.log('✅ ტესტ Email წარმატებით გაიგზავნა! ID:', info.messageId);
    return { success: true, messageId: info.messageId };
  } catch (error) {
    console.error('❌ ტესტ email შეცდომა:', error.message);
    throw new Error(error.message);
  }
};

module.exports = {
  sendJobRequestEmail,
  sendTestEmail,
};