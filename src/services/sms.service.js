const { SNSClient, PublishCommand } = require('@aws-sdk/client-sns');

if (!process.env.AWS_ACCESS_KEY_ID || !process.env.AWS_SECRET_ACCESS_KEY) {
  console.log('⚠️  გაფრთხილება: AWS კრედენციალები არ არის გაწერილი .env ფაილში!');
}

const snsClient = new SNSClient({
  region: process.env.AWS_REGION || 'eu-central-1',
  credentials: {
    accessKeyId: process.env.AWS_ACCESS_KEY_ID,
    secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY,
  },
});

/**
 * ტელეფონის ფორმატირება AWS SNS ფორმატში (+995XXXXXXXXX)
 */
function formatPhoneNumber(phoneNumber) {
  let cleaned = phoneNumber.replace(/\D/g, '');

  if (cleaned.startsWith('00995')) {
    cleaned = cleaned.substring(2);
  }
  if (cleaned.startsWith('995')) {
    return `+${cleaned}`;
  }
  if (cleaned.startsWith('0')) {
    cleaned = cleaned.substring(1);
  }
  return `+995${cleaned}`;
}

/**
 * ვერიფიკაციის კოდის გაგზავნა SMS-ით (AWS SNS)
 */
async function sendVerificationSMS(phoneNumber, code) {
  try {
    if (!phoneNumber) {
      throw new Error('არასწორი ტელეფონის ნომერი');
    }

    const formattedPhone = formatPhoneNumber(phoneNumber);
    const ttl = process.env.VERIFY_CODE_TTL_MINUTES || 10;
    const message = `Personali: თქვენი ვერიფიკაციის კოდი: ${code}. ის მოქმედია ${ttl} წუთის განმავლობაში.`;

    console.log(`📤 SMS გაგზავნა AWS SNS-ით: ${formattedPhone}`);

    const params = {
      Message: message,
      PhoneNumber: formattedPhone,
      MessageAttributes: {
        'AWS.SNS.SMS.SenderID': {
          DataType: 'String',
          StringValue: 'Personali',
        },
        'AWS.SNS.SMS.SMSType': {
          DataType: 'String',
          StringValue: 'Transactional',
        },
      },
    };

    const command = new PublishCommand(params);
    const response = await snsClient.send(command);

    console.log(`✅ SMS გაგზავნა წარმატებულია: ${formattedPhone} (MessageId: ${response.MessageId})`);

    return {
      success: true,
      messageId: response.MessageId,
      phone: formattedPhone,
      status: 'Message sent successfully',
    };
  } catch (err) {
    console.error('❌ SMS error:', err.message);
    throw err;
  }
}

async function checkSmsBalance() {
  console.log('💰 AWS SNS მუშაობს Pay-as-you-go სისტემით. მონიტორინგი შეგიძლიათ CloudWatch-დან.');
  return { info: 'AWS SNS Pay-as-you-go' };
}

module.exports = { sendVerificationSMS, checkSmsBalance };