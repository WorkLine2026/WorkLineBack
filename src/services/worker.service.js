const transporter = require('../config/email-config');

// ═══════════════════════════════════════════════════════════════
// ✓ Send Welcome Email to Worker
// ═══════════════════════════════════════════════════════════════
async function sendWorkerWelcomeEmail(worker, bccEmails = []) {
  try {
    const fromEmail = process.env.SENDER_EMAIL || process.env.EMAIL_USER;
    
    if (!worker.email) {
      console.warn('⚠️  Worker has no email - skipping welcome email');
      return false;
    }

    console.log('\n📧 ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
    console.log('📧 SENDING WELCOME EMAIL');
    console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
    console.log('📧 To:', worker.email);
    console.log('📧 Name:', worker.fname, worker.lname);

    const medbookLabel = {
      yes: 'გაქვს',
      expired: 'ვადაგასული',
      no: 'არ გაქვს',
    };

    const restrictionLabel = {
      'h-back':    'ზურგის პრობლემები',
      'h-stand':   'დგომა 8+ საათი',
      'h-lift':    'მძიმე ტვირთი (20+ კგ)',
      'h-screen':  'ეკრანთან მუშაობა 8+ სთ',
      'h-outdoor': 'გარე სამუშაო',
    };

    const availLabel = {
      asap:      'ახლავე მზად',
      week:      'ამ კვირაში',
      twoweeks:  '2 კვირაში',
      month:     '1 თვეში',
    };

    const htmlContent = `
    <!DOCTYPE html>
    <html dir="ltr" lang="ka">
    <head>
      <meta charset="UTF-8">
      <style>
        * { margin: 0; padding: 0; box-sizing: border-box; }
        body { font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Arial, sans-serif; background: #f5f5f5; padding: 20px; }
        .container { max-width: 600px; background: white; border-radius: 8px; margin: 0 auto; overflow: hidden; box-shadow: 0 2px 8px rgba(0,0,0,0.1); }
        .header { background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); color: white; padding: 40px 20px; text-align: center; }
        .header h1 { font-size: 28px; margin-bottom: 5px; }
        .header p { font-size: 14px; opacity: 0.9; }
        .content { padding: 30px; }
        .section { margin: 25px 0; }
        .section-title { font-size: 16px; font-weight: bold; color: #333; margin-bottom: 12px; padding-bottom: 8px; border-bottom: 2px solid #f0f0f0; }
        .detail-row { display: flex; justify-content: space-between; padding: 10px 0; border-bottom: 1px solid #f5f5f5; }
        .detail-key { font-weight: 600; color: #666; }
        .detail-val { color: #333; text-align: right; }
        .badge { display: inline-block; background: #e8f4f8; color: #0066cc; padding: 4px 12px; border-radius: 12px; font-size: 13px; margin: 4px 4px 4px 0; }
        .alert { background: #fff3cd; border-left: 4px solid #ffc107; padding: 15px; margin: 15px 0; border-radius: 4px; color: #856404; font-size: 14px; }
        .footer { background: #f9f9f9; padding: 20px; border-top: 1px solid #f0f0f0; text-align: center; font-size: 12px; color: #999; }
        ul { margin: 10px 0 10px 20px; }
        li { margin: 6px 0; color: #555; font-size: 14px; }
      </style>
    </head>
    <body>
      <div class="container">

        <div class="header">
          <h1>🎉 კეთილი იყოს თქვენი მობრძანება!</h1>
          <p>Personali — სამუშაოს პოვნის პლატფორმა</p>
        </div>

        <div class="content">
          <p style="font-size: 15px; color: #333; margin-bottom: 20px;">
            <strong>${worker.fname} ${worker.lname}</strong>, გემსახურებით!<br>
            თქვენი პროფილი წარმატებით შენახულია ჩვენ სისტემაში.
          </p>

          <div class="section">
            <div class="section-title">👤 თქვენი პროფილი</div>
            <div class="detail-row">
              <span class="detail-key">სახელი:</span>
              <span class="detail-val">${worker.fname} ${worker.lname}</span>
            </div>
            <div class="detail-row">
              <span class="detail-key">ელ-ფოსტა:</span>
              <span class="detail-val">${worker.email || '—'}</span>
            </div>
            <div class="detail-row">
              <span class="detail-key">ტელეფონი:</span>
              <span class="detail-val">${worker.phone || '—'}</span>
            </div>
            <div class="detail-row">
              <span class="detail-key">ქალაქი:</span>
              <span class="detail-val">${worker.city || '—'}</span>
            </div>
            ${worker.dob ? `<div class="detail-row">
              <span class="detail-key">დაბადების თარიღი:</span>
              <span class="detail-val">${worker.dob}</span>
            </div>` : ''}
            ${worker.gender ? `<div class="detail-row">
              <span class="detail-key">სქესი:</span>
              <span class="detail-val">${worker.gender}</span>
            </div>` : ''}
          </div>

          <div class="section">
            <div class="section-title">💼 პროფესიული ინფორმაცია</div>
            <div class="detail-row">
              <span class="detail-key">სფეროები:</span>
              <span class="detail-val">${worker.sectors ? worker.sectors.join(', ') : '—'}</span>
            </div>
            <div class="detail-row">
              <span class="detail-key">გამოცდილება:</span>
              <span class="detail-val">${worker.exp || '—'}</span>
            </div>
            ${worker.edu ? `<div class="detail-row">
              <span class="detail-key">განათლება:</span>
              <span class="detail-val">${worker.edu}</span>
            </div>` : ''}
            ${worker.langs && worker.langs.length > 0 ? `<div class="detail-row">
              <span class="detail-key">ენები:</span>
              <span class="detail-val">${worker.langs.join(', ')}</span>
            </div>` : ''}
          </div>

          ${(worker.certs && worker.certs.length > 0) || (worker.customCerts && worker.customCerts.length > 0) ? `
          <div class="section">
            <div class="section-title">🎓 სერტიფიკატები</div>
            <div>
              ${(worker.certs || []).map(cert => `<span class="badge">${cert}</span>`).join('')}
              ${(worker.customCerts || []).map(cert => `<span class="badge">${cert}</span>`).join('')}
            </div>
          </div>` : ''}

          <div class="section">
            <div class="section-title">🏥 ჯანმრთელობა</div>
            <div class="detail-row">
              <span class="detail-key">სამედიცინო წიგნი:</span>
              <span class="detail-val">${medbookLabel[worker.medbook] || '—'}</span>
            </div>
            ${worker.restrictions && worker.restrictions.length > 0 ? `
            <div style="margin-top: 10px;">
              <strong style="color: #666; display: block; margin-bottom: 6px;">შეზღუდვები:</strong>
              ${worker.restrictions.map(r => `<span class="badge">${restrictionLabel[r] || r}</span>`).join('')}
            </div>` : ''}
          </div>

          <div class="section">
            <div class="section-title">📅 ხელმისაწვდომობა & ანაზღაურება</div>
            <div class="detail-row">
              <span class="detail-key">ხელმისაწვდომობა:</span>
              <span class="detail-val">${availLabel[worker.avail] || worker.avail || '—'}</span>
            </div>
            ${worker.schedule && worker.schedule.length > 0 ? `<div class="detail-row">
              <span class="detail-key">სამუშაო საათები:</span>
              <span class="detail-val">${worker.schedule.join(', ')}</span>
            </div>` : ''}
            <div class="detail-row">
              <span class="detail-key">სასურველი ანაზღაურება:</span>
              <span class="detail-val">${worker.salary ? worker.salary + ' ₾' : 'მოლაპარაკება'}</span>
            </div>
          </div>

          <div class="alert">
            ⏳ თქვენი პროფილი განხილვის მოლოდინში რჩება. Personali-ის გუნდი მალე დაგიკავშირდებათ შესაფერისი შეთავაზებით.
          </div>

          <div class="section">
            <div class="section-title">📌 რა მოხდება შემდეგ?</div>
            <ul>
              <li>✅ Personali გუნდი განიხილავს თქვენს პროფილს</li>
              <li>📞 თუ სჭირდება, დაგიკავშირდებათ ტელეფონით</li>
              <li>💼 შესაფერი ჯობების შეთავაზება პირად კაბინეტში</li>
            </ul>
          </div>

          <div class="section">
            <div class="section-title">💬 დაგვიკავშირდით</div>
            <p style="color: #555; font-size: 14px; line-height: 1.6;">
              📧 support@personali.ge<br>
              📞 +995 555 12 34 56<br>
              🌐 www.personali.ge
            </p>
          </div>

        </div>

        <div class="footer">
          <p>© 2026 Personali. ყველა უფლება დაცულია.</p>
          <p style="margin-top: 8px; color: #bbb;">თქვენი კონფიდენციალურობა ჩვენთვის მნიშვნელოვანია</p>
        </div>

      </div>
    </body>
    </html>
    `;

    const mailOptions = {
      from: `"Personali" <${fromEmail}>`,
      to: worker.email,
      subject: `🎉 გემსახურებით Personali-ში, ${worker.fname}!`,
      html: htmlContent,
    };

    const info = await transporter.sendMail(mailOptions);
    
    console.log('✅ Welcome email sent successfully!');
    console.log('✅ Message ID:', info.messageId);
    console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n');
    
    return true;

  } catch (err) {
    console.error('\n❌ ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
    console.error('❌ WELCOME EMAIL SEND ERROR');
    console.error('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
    console.error('❌ Error:', err.message);
    console.error('❌ To:', worker.email);
    console.error('❌ Code:', err.code);
    console.error('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n');
    
    return false;
  }
}

// ═══════════════════════════════════════════════════════════════
// ✓ Send Admin Notification Email
// ═══════════════════════════════════════════════════════════════
async function sendAdminNotification(worker, bccEmails = []) {
  try {
    const adminEmails = (process.env.ADMIN_EMAILS || '')
      .split(',')
      .map(e => e.trim())
      .filter(e => e);

    if (!adminEmails.length) {
      console.warn('⚠️  ADMIN_EMAILS not configured in .env');
      return false;
    }

    const fromEmail = process.env.SENDER_EMAIL || process.env.EMAIL_USER;

    console.log('\n📧 ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
    console.log('📧 SENDING ADMIN NOTIFICATION');
    console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
    console.log('📧 To:', adminEmails.join(', '));

    const htmlContent = `
    <!DOCTYPE html>
    <html dir="ltr" lang="ka">
    <head>
      <meta charset="UTF-8">
      <style>
        body { font-family: Arial, sans-serif; background: #f5f5f5; padding: 20px; }
        .container { max-width: 600px; background: white; border-radius: 8px; margin: 0 auto; overflow: hidden; box-shadow: 0 2px 8px rgba(0,0,0,0.1); }
        .header { background: #FF6B35; color: white; padding: 20px; text-align: center; }
        .content { padding: 20px; }
        .detail-row { display: flex; justify-content: space-between; padding: 8px 0; border-bottom: 1px solid #f0f0f0; }
        .detail-key { font-weight: bold; color: #666; }
        .detail-val { color: #333; }
        .btn { display: inline-block; background: #667eea; color: white; padding: 10px 20px; border-radius: 4px; text-decoration: none; margin-top: 15px; }
      </style>
    </head>
    <body>
      <div class="container">
        <div class="header">
          <h2 style="margin: 0;">🔔 ახალი დარეგისტრირებული ვორკერი</h2>
        </div>
        <div class="content">
          <p style="margin-bottom: 15px;">
            <strong>${worker.fname} ${worker.lname}</strong> ახლახან დარეგისტრირდა Personali-ში.
          </p>

          <div class="detail-row">
            <span class="detail-key">სახელი / გვარი:</span>
            <span class="detail-val">${worker.fname} ${worker.lname}</span>
          </div>
          <div class="detail-row">
            <span class="detail-key">ელ-ფოსტა:</span>
            <span class="detail-val">${worker.email || '—'}</span>
          </div>
          <div class="detail-row">
            <span class="detail-key">ტელეფონი:</span>
            <span class="detail-val">${worker.phone || '—'}</span>
          </div>
          <div class="detail-row">
            <span class="detail-key">WhatsApp:</span>
            <span class="detail-val">${worker.wa || '—'}</span>
          </div>
          <div class="detail-row">
            <span class="detail-key">ქალაქი:</span>
            <span class="detail-val">${worker.city || '—'}</span>
          </div>
          <div class="detail-row">
            <span class="detail-key">სფეროები:</span>
            <span class="detail-val">${worker.sectors ? worker.sectors.join(', ') : '—'}</span>
          </div>
          <div class="detail-row">
            <span class="detail-key">გამოცდილება:</span>
            <span class="detail-val">${worker.exp || '—'}</span>
          </div>
          <div class="detail-row">
            <span class="detail-key">განათლება:</span>
            <span class="detail-val">${worker.edu || '—'}</span>
          </div>
          <div class="detail-row">
            <span class="detail-key">ენები:</span>
            <span class="detail-val">${worker.langs ? worker.langs.join(', ') : '—'}</span>
          </div>
          <div class="detail-row">
            <span class="detail-key">ხელმისაწვდომობა:</span>
            <span class="detail-val">${worker.avail || '—'}</span>
          </div>
          <div class="detail-row">
            <span class="detail-key">ანაზღაურება:</span>
            <span class="detail-val">${worker.salary ? worker.salary + ' ₾' : 'მოლაპარაკება'}</span>
          </div>

          <a href="${process.env.ADMIN_PANEL_URL || 'https://work-line-six.vercel.app/admin'}/workers" class="btn">
            ადმინ პანელში ნახვა
          </a>
        </div>
      </div>
    </body>
    </html>
    `;

    const info = await transporter.sendMail({
      from: `"Personali ნოტიფიკაცია" <${fromEmail}>`,
      to: adminEmails.join(', '),
      subject: `🔔 ახალი ვორკერი: ${worker.fname} ${worker.lname}`,
      html: htmlContent,
    });

    console.log('✅ Admin notification sent successfully!');
    console.log('✅ Message ID:', info.messageId);
    console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n');
    
    return true;

  } catch (err) {
    console.error('\n❌ ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
    console.error('❌ ADMIN NOTIFICATION ERROR');
    console.error('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
    console.error('❌ Error:', err.message);
    console.error('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n');
    
    return false;
  }
}

module.exports = {
  sendWorkerWelcomeEmail,
  sendAdminNotification,
  transporter,
};