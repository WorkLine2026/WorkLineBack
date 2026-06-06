require('dotenv').config(); // ტვირთავს თქვენს .env ფაილს
const { sendJobRequestEmail } = require('./services/jobRequestEmailService'); 
// 💡 ყურადღება: თუ თქვენს სერვისს სხვა ფოლდერში უწერია სახელი, ზუსტი გზა მიუთითეთ (მაგ. ./emailService)

// სატესტო მონაცემები, ზუსტად ისეთი, როგორსაც ბაზა აბრუნებს
const mockJobRequest = {
  _id: 'MOCK_ID_123456',
  companyName: 'ტესტ კომპანია',
  sector: 'IT / დეველოპმენტი',
  contactName: 'გიორგი დეველოპერი',
  contactRole: 'HR მენეჯერი',
  phone: '+995555123456',
  email: 'chochiamishiko4@gmail.com', // 👈 აქ ჩაწერეთ ის მეილი, სადაც გინდათ რომ მივიდეს (BCC-ში ჩაჯდება)
  positions: ['Full-Stack Developer', 'Node.js Developer'],
  headcount: 2,
  duration: 'month',
  salaryFrom: 1500,
  salaryTo: 2500,
  city: 'თბილისი',
  startDate: 'asap',
  notes: 'ეს არის პირდაპირი ბექენდის ტესტი რეზენდზე.',
  submittedAt: new Date()
};

async function runTest() {
  console.log('⏳ იწყება პირდაპირი ელ-ფოსტის გაგზავნის ტესტირება...');
  try {
    const result = await sendJobRequestEmail(mockJobRequest);
    console.log('🚀 ტესტი წარმატებით დასრულდა!', result);
  } catch (error) {
    console.error('💥 ტესტი ჩავარდა! შეცდომა:', error.message);
  }
}

runTest();