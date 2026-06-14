const axios = require('axios');
const qs = require('qs');

// ═══════════════════════════════════════════════════════════════
// SMSOFFICE.GE SMS SERVICE
// https://smsoffice.ge/api/v2/
// ═══════════════════════════════════════════════════════════════

if (!process.env.SMSOFFICE_API_KEY) {
  console.log('⚠️  გაფრთხილება: smsoffice.ge API Key არ არის გაწერილი .env ფაილში!');
  console.log('   დაგჭირდებათ: SMSOFFICE_API_KEY');
}

const SMS_CONFIG = {
  API_KEY: process.env.SMSOFFICE_API_KEY,
  BASE_URL: 'https://smsoffice.ge/api/v2/send/',
  SENDER: process.env.SMSOFFICE_SENDER || 'WorkLine'
};

/**
 * ტელეფონის ფორმატირება international ფორმატში (995577123456)
 * @param {string} phoneNumber - ტელეფონი ნებისმიერი ფორმატში
 * @returns {string} - ფორმატირებული ნომერი
 */
function formatPhoneNumber(phoneNumber) {
  let cleaned = phoneNumber.replace(/\D/g, ''); // მხოლოდ ციფრები
  
  if (cleaned.startsWith('995')) {
    return cleaned; // უკვე სწორი
  }
  if (cleaned.startsWith('0')) {
    cleaned = cleaned.substring(1); // 0555123456 → 555123456
  }
  return `995${cleaned}`;
}

/**
 * 6-ციფრა ვერიფიკაციის კოდის გაგზავნა SMS-ით (smsoffice.ge)
 * @param {string} phoneNumber - მიმღების ტელეფონი (მაგ: +995591234567 ან 0591234567)
 * @param {string} code - 6-ციფრა კოდი
 */
async function sendVerificationSMS(phoneNumber, code) {
  try {
    // ✅ ტელეფონის ფორმატის შემოწმება
    if (!phoneNumber || !/^\+?[0-9]{10,}$/.test(phoneNumber.replace(/\s/g, ''))) {
      throw new Error('არასწორი ტელეფონის ნომერი');
    }

    const formattedPhone = formatPhoneNumber(phoneNumber);
    const ttl = process.env.VERIFY_CODE_TTL_MINUTES || 10;
    const message = `WorkLine: თქვენი ვერიფიკაციის კოდი: ${code}. ის მოქმედია ${ttl} წუთის განმავლობაში.`;

    // ✅ Request body (form-encoded)
    const data = qs.stringify({
      key: SMS_CONFIG.API_KEY,
      destination: formattedPhone,
      sender: SMS_CONFIG.SENDER,
      content: message,
      urgent: 'true'
    });

    console.log(`📤 SMS გაგზავნა: ${formattedPhone}`);

    // ✅ SMS გაგზავნა smsoffice.ge-ს მეშვეობით
    const response = await axios.post(SMS_CONFIG.BASE_URL, data, {
      headers: {
        'Content-Type': 'application/x-www-form-urlencoded'
      }
    });

    // ✅ რেპონსის შემოწმება
    if (response.data.ErrorCode === 0) {
      console.log(`✅ SMS გაგზავნა წარმატებული: ${formattedPhone}`);
      return {
        success: true,
        messageId: response.data.Output?.MessageID || 'unknown',
        phone: formattedPhone,
        status: response.data.Message
      };
    } else {
      throw new Error(`smsoffice კოდი ${response.data.ErrorCode}: ${response.data.Message}`);
    }

  } catch (err) {
    console.error('❌ SMS error:', err.message);
    throw err;
  }
}

/**
 * ბალანსის შემოწმება
 */
async function checkSmsBalance() {
  try {
    const response = await axios.get(
      `https://smsoffice.ge/api/getBalance?key=${SMS_CONFIG.API_KEY}`
    );
    console.log(`💰 SMS ბალანსი: ${response.data}`);
    return response.data;
  } catch (err) {
    console.error('❌ ბალანსის შემოწმება ვერ მოხერხდა:', err.message);
    throw err;
  }
}

module.exports = { sendVerificationSMS, checkSmsBalance };