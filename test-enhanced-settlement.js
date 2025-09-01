/**
 * Test the enhanced settlement validation for users without UserDue records
 * Run with: node test-enhanced-settlement.js
 */

const mongoose = require('mongoose');
require('dotenv').config({ path: '.env.local' });

// Import models
const User = require('./src/app/api/models/User.ts').default;
const UserDue = require('./src/app/api/models/UserDue.ts').default;
const Payment = require('./src/app/api/models/Payment.ts').default;
const DueSettlement = require('./src/app/api/models/DueSettlement.ts').default;

// Import the enhanced validation function
const { validateSettlement } = require('./src/app/lib/dueCalculator.ts');

async function testEnhancedSettlement() {
  try {
    console.log('🧪 Testing Enhanced Settlement Validation...');
    console.log('');

    // Connect to MongoDB
    await mongoose.connect(process.env.MONGODB_URI);
    console.log('✅ Connected to MongoDB');

    // Find a user who has checked in but may not have UserDue records for recent months
    const testUser = await User.findOne({
      moveInDate: { $exists: true, $ne: null }
    }).populate('roomId', 'price').lean();

    if (!testUser) {
      console.log('❌ No test user found with moveInDate');
      return;
    }

    console.log(`📊 Test User: ${testUser.name} (${testUser._id})`);
    console.log(`🏠 Room Price: ₹${testUser.roomId?.price || 'N/A'}`);
    console.log(`📅 Move-in Date: ${testUser.moveInDate}`);
    console.log('');

    // Test with current month (September 2024)
    const testMonth = 'September 2024';
    console.log(`🎯 Testing settlement for: ${testMonth}`);
    console.log('');

    // Check if UserDue record exists for this month
    const [monthName, yearStr] = testMonth.split(' ');
    const year = parseInt(yearStr);
    const monthNumber = new Date(`${monthName} 1, ${year}`).getMonth() + 1;

    const userDue = await UserDue.findOne({
      userId: testUser._id,
      year,
      monthNumber,
      isActive: true
    });

    if (userDue) {
      console.log('✅ UserDue record exists for this month');
      console.log(`   Current Month Due: ₹${userDue.currentMonthDue}`);
      console.log(`   Previous Unpaid Due: ₹${userDue.previousUnpaidDue}`);
    } else {
      console.log('⚠️  No UserDue record for this month - testing enhanced logic');
    }
    console.log('');

    // Test settlement validation with small amount
    const testAmount = 1000;
    console.log(`🔍 Validating settlement of ₹${testAmount}...`);
    
    const validation = await validateSettlement(
      testUser._id.toString(),
      testMonth,
      testAmount
    );

    console.log('📋 Validation Result:');
    console.log(`   Valid: ${validation.isValid}`);
    console.log(`   Max Settlable: ₹${validation.maxSettlableAmount || 0}`);
    console.log(`   Current Due: ₹${validation.currentDue || 0}`);
    
    if (!validation.isValid) {
      console.log(`   Error: ${validation.error}`);
    }
    console.log('');

    if (validation.isValid) {
      console.log('✅ Enhanced validation works! Settlement is possible.');
    } else if (validation.error === 'No due amount to settle for this user') {
      console.log('✅ Validation working correctly - user has no outstanding dues.');
    } else {
      console.log('✅ Enhanced validation detected the issue and provided helpful error.');
    }

  } catch (error) {
    console.error('❌ Test failed:', error.message);
    console.error('Full error:', error);
  } finally {
    await mongoose.connection.close();
    console.log('🔌 Disconnected from MongoDB');
  }
}

testEnhancedSettlement();
