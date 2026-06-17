const SibApiV3Sdk = require('sib-api-v3-sdk');

// Setup Brevo client (გასწორებული ავტორიზაცია)
const client = SibApiV3Sdk.ApiClient.instance;
const apiKey = client.authentications['api-key'];
apiKey.apiKey = process.env.BREVO_API_KEY;

// ═══════════════════════════════════════════════════════════════
// ✓ Job Request Email გაგზავნა (Brevo)
// ═══════════════════════════════════════════════════════════════
const sendJobRequestEmail = async (jobRequest) => {
  try {
    const {
      _id,
      companyName,
      sector,
      contactName,
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

    const senderEmail = process.env.SENDER_EMAIL || 'noreply@personali.ge';
    const adminEmail = process.env.ADMIN_EMAIL || 'admin@personali.ge';

    const apiInstance = new SibApiV3Sdk.TransactionalEmailsApi();

    const bccEmails = [];
    if (email && email.trim()) {
      bccEmails.push({ email: email.trim() });
    }

    const msg = {
      sender: {
        name: 'Personali',
        email: senderEmail,
      },
      to: [
        {
          email: adminEmail,
          name: 'Personali Admin',
        },
      ],
      bcc: bccEmails,
      subject: `📋 ახალი Job Request - ${companyName}`,
      htmlContent: htmlContent,
      textContent: textContent,
    };

    console.log('\n📧 ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
    console.log('📧 SENDING JOB REQUEST EMAIL (Brevo)');
    console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
    console.log('📧 To:', adminEmail);
    console.log('📧 Company:', companyName);
    console.log('📧 BCC:', bccEmails.map(b => b.email).join(', ') || 'none');

    await apiInstance.sendTransacEmail(msg);

    console.log('✅ Job Request email წარმატებით გაიგზავნა!');
    console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n');

    return { success: true };
  } catch (error) {
    console.error('\n❌ ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
    console.error('❌ JOB REQUEST EMAIL SEND ERROR (Brevo)');
    console.error('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
    console.error('❌ Error:', error.message);
    console.error('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n');

    throw new Error(error.message);
  }
};

// ═══════════════════════════════════════════════════════════════
// ✓ ტესტ Email (Brevo)
// ═══════════════════════════════════════════════════════════════
const sendTestEmail = async (email) => {
  try {
    const senderEmail = process.env.SENDER_EMAIL || 'noreply@personali.ge';

    const apiInstance = new SibApiV3Sdk.TransactionalEmailsApi();

    const msg = {
      sender: {
        name: 'Personali Test',
        email: senderEmail,
      },
      to: [{ email: email }],
      subject: 'Personali - Email ტესტი',
      htmlContent: '<h1>Hello! 🎉</h1><p>Personali Brevo Email ტესტი წარმატებულია!</p>',
      textContent: 'Personali test email',
    };

    console.log('\n📧 ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
    console.log('📧 SENDING TEST EMAIL (Brevo)');
    console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
    console.log('📧 To:', email);

    await apiInstance.sendTransacEmail(msg);

    console.log('✅ Test email წარმატებით გაიგზავნა!');
    console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n');

    return { success: true };
  } catch (error) {
    console.error('\n❌ ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
    console.error('❌ TEST EMAIL ERROR (Brevo)');
    console.error('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
    console.error('❌ Error:', error.message);
    console.error('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n');

    throw new Error(error.message);
  }
};

module.exports = {
  sendJobRequestEmail,
  sendTestEmail,
};