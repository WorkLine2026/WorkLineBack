const axios = require('axios');
const qs = require('qs');

if (!process.env.SMSOFFICE_API_KEY) {
  console.log('⚠️  გაფრთხილება: smsoffice.ge API Key არ არის გაწერილი .env ფაილში!');
  console.log('   დაგჭირდებათ: SMSOFFICE_API_KEY');
}

const SMS_CONFIG = {
  API_KEY: process.env.SMSOFFICE_API_KEY,
  BASE_URL: 'https://smsoffice.ge/api/v2/send/',
  // 💡 შეცვლილია 'smsoffice'-ზე (ყველა პატარა ასოთი), როგორც დოკუმენტაციაშია!
  // ამით Render-ის ძველ ცვლადსაც გადავაწერთ თავზე.
  SENDER: 'smsoffice' 
};

/**
 * ტელეფონის ფორმატირება საერთაშორისო ფორმატში (995577123456) + და 00-ის გარეშე
 * @param {string} phoneNumber - ტელეფონი ნებისმიერ ფორმატში
 * @returns {string} - ფორმატირებული ნომერი (მხოლოდ ციფრები)
 */
function formatPhoneNumber(phoneNumber) {
  let cleaned = phoneNumber.replace(/\D/g, ''); // ტოვებს მხოლოდ ციფრებს
  
  if (cleaned.startsWith('00995')) {
    cleaned = cleaned.substring(2);
  }
  if (cleaned.startsWith('995')) {
    return cleaned; // უკვე სწორია
  }
  if (cleaned.startsWith('0')) {
    cleaned = cleaned.substring(1); // 0555123456 → 555123456
  }
  return `995${cleaned}`;
}

/**
 * 6-ციფრა ვერიფიკაციის კოდის გაგზავნა SMS-ით (smsoffice.ge)
 * @param {string} phoneNumber - მიმღების ტელეფონი
 * @param {string} code - 6-ციფრა კოდი
 */
async function sendVerificationSMS(phoneNumber, code) {
  try {
    if (!phoneNumber) {
      throw new Error('არასწორი ტელეფონის ნომერი');
    }

    const formattedPhone = formatPhoneNumber(phoneNumber);
    const ttl = process.env.VERIFY_CODE_TTL_MINUTES || 10;
    const message = `WorkLine: თქვენი ვერიფიკაციის კოდი: ${code}. ის მოქმედია ${ttl} წუთის განმავლობაში.`;

    // ✅ Request body ფორმატირება application/x-www-form-urlencoded-ისთვის
    const data = qs.stringify({
      key: SMS_CONFIG.API_KEY,
      destination: formattedPhone,
      sender: SMS_CONFIG.SENDER, // გაიგზავნება მყარად "smsoffice"
      content: message,
      urgent: 'true' // დოკუმენტაციის თანახმად, გამჭოლი მესიჯებისთვის
    });

    console.log(`📤 SMS გაგზავნა: ${formattedPhone} (Sender: ${SMS_CONFIG.SENDER})`);

    // ✅ SMS გაგზავნა POST მეთოდით დახრილი ხაზით ბოლოში (send/)
    const response = await axios.post(SMS_CONFIG.BASE_URL, data, {
      headers: {
        'Content-Type': 'application/x-www-form-urlencoded'
      }
    });

    // ✅ რესპონსის შემოწმება (დოკუმენტაციის მიხედვით: Success ან ErrorCode)
    if (response.data && (response.data.Success === true || response.data.ErrorCode === 0)) {
      console.log(`✅ SMS გაგზავნა წარმატებულია: ${formattedPhone}`);
      return {
        success: true,
        messageId: response.data.Output?.MessageID || 'unknown',
        phone: formattedPhone,
        status: response.data.Message
      };
    } else {
      throw new Error(`smsoffice კოდი ${response.data?.ErrorCode}: ${response.data?.Message}`);
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
      `http://smsoffice.ge/api/getBalance?key=${SMS_CONFIG.API_KEY}`
    );
    console.log(`💰 SMS ბალანსი: ${response.data} SMS`);
    return response.data;
  } catch (err) {
    console.error('❌ ბალანსის შემოწმება ვერ მოხერხდა:', err.message);
    throw err;
  }
}

module.exports = { sendVerificationSMS, checkSmsBalance };