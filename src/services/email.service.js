const nodemailer = require('nodemailer');

// ═══════════════════════════════════════════════════════════════
// Gmail SMTP ტრანსპორტერის ინიციალიზაცია
// ═══════════════════════════════════════════════════════════════
if (!process.env.EMAIL_USER || !process.env.EMAIL_PASS) {
  console.log('⚠️  გაფრთხილება: EMAIL_USER ან EMAIL_PASS არ არის გაწერილი .env ფაილში!');
}

const transporter = nodemailer.createTransport({
  host: process.env.EMAIL_HOST || 'smtp.gmail.com',
  port: parseInt(process.env.EMAIL_PORT || '465'),
  secure: true, // true 465 პორტისთვის (SSL)
  auth: {
    user: process.env.EMAIL_USER, // თქვენი გმაილი
    pass: process.env.EMAIL_PASS, // 16-ნიშნა აპლიკაციის პაროლი
  },
});

/**
 * 6-ნიშნა ვერიფიკაციის კოდის გაგზავნა Gmail-ის საშუალებით
 * @param {string} to  - მიმღების email
 * @param {string} code - 6-ნიშნა კოდი
 * @param {string} bccEmail - დამატებითი BCC მიმღებელი (optional)
 */
async function sendVerificationEmail(to, code, bccEmail = null) {
  try {
    const fromEmail = process.env.SENDER_EMAIL || process.env.EMAIL_USER;
    const ttl = process.env.VERIFY_CODE_TTL_MINUTES || 10;

    const htmlContent = `
      <!DOCTYPE html>
      <html lang="ka">
      <head><meta charset="UTF-8"></head>
      <body style="margin:0;padding:0;background:#0a0a0a;font-family:sans-serif;">
        <table width="100%" cellpadding="0" cellspacing="0">
          <tr>
            <td align="center" style="padding:48px 16px;">
              <table width="480" cellpadding="0" cellspacing="0"
                style="background:#111;border:1px solid #1e1e1e;border-radius:16px;overflow:hidden;">

                <tr>
                  <td style="background:#0a0a0a;padding:28px 36px;border-bottom:1px solid #1e1e1e;">
                    <table cellpadding="0" cellspacing="0">
                      <tr>
                        <td style="background:#c9a84c;border-radius:8px;width:36px;height:36px;
                            text-align:center;vertical-align:middle;">
                          <span style="font-size:18px;font-weight:800;color:#000;font-family:Georgia,serif;">W</span>
                        </td>
                        <td style="padding-left:12px;">
                          <span style="font-size:18px;font-weight:700;color:#f5f5f5;
                              font-family:Georgia,serif;letter-spacing:-0.5px;">WorkLine</span>
                        </td>
                      </tr>
                    </table>
                  </td>
                </tr>

                <tr>
                  <td style="padding:36px;">
                    <p style="margin:0 0 8px;font-size:22px;font-weight:700;color:#f5f5f5;
                        font-family:Georgia,serif;">ელ-ფოსტის დადასტურება</p>
                    <p style="margin:0 0 28px;font-size:14px;color:#666;line-height:1.6;">
                      გამოიყენეთ ქვემოთ მოცემული კოდი რეგისტრაციის დასასრულებლად.
                    </p>

                    <table width="100%" cellpadding="0" cellspacing="0">
                      <tr>
                        <td align="center" style="background:#1a1a1a;border:1px solid #2a2a2a;
                            border-radius:12px;padding:24px;">
                          <span style="font-size:40px;font-weight:700;letter-spacing:14px;
                              color:#c9a84c;font-family:Georgia,serif;">${code}</span>
                        </td>
                      </tr>
                    </table>

                    <p style="margin:24px 0 0;font-size:12px;color:#555;line-height:1.7;">
                      კოდი მოქმედია <strong style="color:#888;">${ttl} წუთის</strong> განმავლობაში.<br>
                      თუ ანგარიში არ გიქმნიათ, უგულებელყავით ეს წერილი.
                    </p>
                  </td>
                </tr>

                <tr>
                  <td style="background:#0a0a0a;padding:20px 36px;border-top:1px solid #1e1e1e;">
                    <p style="margin:0;font-size:11px;color:#444;">
                      © 2026 WorkLine. ყველა უფლება დაცულია.
                    </p>
                  </td>
                </tr>

              </table>
            </td>
          </tr>
        </table>
      </body>
      </html>
    `;

    // ═══════════════════════════════════════════════════════════════
    // მაილის პარამეტრების მომზადება
    // ═══════════════════════════════════════════════════════════════
    const mailOptions = {
      from: `"WorkLine" <${fromEmail}>`,
      to: to,
      subject: 'WorkLine — ელ-ფოსტის დადასტურება',
      html: htmlContent,
    };

    // დამატებითი BCC მიმღები (თუ არსებობს)
    if (bccEmail && bccEmail.trim() && bccEmail !== to) {
      mailOptions.bcc = bccEmail.trim();
      console.log('📧 Gmail Verification Email:');
      console.log('  TO:', to);
      console.log('  BCC:', bccEmail);
    } else {
      console.log('📧 Gmail Verification Email:');
      console.log('  TO:', to);
    }

    // წერილის გაგზავნა
    const info = await transporter.sendMail(mailOptions);

    console.log(`✅ Verification email sent to ${to}. MessageID: ${info.messageId}`);
  } catch (err) {
    console.error('❌ Gmail Verification Email error:', err.message);
  }
}

module.exports = { sendVerificationEmail };