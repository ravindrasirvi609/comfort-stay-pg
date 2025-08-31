const { MongoClient } = require('mongodb');

async function fixUserDue() {
  const uri = "mongodb+srv://ravisirvi609:w6o8ibK73GHKVJ5y@comfort-stay-pg.0p2g3ic.mongodb.net/?retryWrites=true&w=majority&appName=comfort-stay-pg";
  const client = new MongoClient(uri);
  
  try {
    await client.connect();
    console.log("🔗 Connected to MongoDB");
    
    const db = client.db();
    
    // Get the specific user
    const user = await db.collection('users').findOne({
      pgId: 'PG-BD2794'
    });
    
    if (!user) {
      console.log('❌ User not found');
      return;
    }
    
    console.log(`👤 Found user: ${user.name}`);
    console.log(`📅 Check-in date: ${new Date(user.moveInDate).toDateString()}`);
    
    // Check if UserDue should be created for August 2025
    const checkInDate = new Date(user.moveInDate);
    const isAugustCheckIn = checkInDate.getMonth() === 7 && checkInDate.getFullYear() === 2025; // August = month 7
    
    if (isAugustCheckIn) {
      console.log('✅ This user should have an August 2025 UserDue record');
      
      // Get room details
      const room = await db.collection('rooms').findOne({ _id: user.roomId });
      const roomPrice = room ? room.price : 0;
      
      console.log(`🏠 Room price: ₹${roomPrice}`);
      
      // Calculate prorated rent for August
      const daysInAugust = 31;
      const checkInDay = checkInDate.getDate();
      const daysCovered = daysInAugust - checkInDay + 1; // Including the check-in day
      const proratedRent = Math.round((roomPrice / daysInAugust) * daysCovered * 100) / 100;
      
      console.log(`📊 Calculation:`);
      console.log(`   Days in August: ${daysInAugust}`);
      console.log(`   Check-in day: ${checkInDay}`);
      console.log(`   Days covered: ${daysCovered}`);
      console.log(`   Prorated rent: ₹${proratedRent}`);
      
      // Check if there are any August payments
      const augustPayments = await db.collection('payments').find({
        userId: user._id,
        isActive: true,
        paymentStatus: 'Paid',
        months: { $regex: 'August 2025' }
      }).toArray();
      
      const totalAugustPaid = augustPayments.reduce((sum, payment) => sum + payment.amount, 0);
      console.log(`💸 August payments: ₹${totalAugustPaid}`);
      
      const remainingDue = Math.max(0, proratedRent - totalAugustPaid);
      const dueStatus = remainingDue === 0 ? 'Paid' : 'Unpaid';
      
      console.log(`📋 Final calculation:`);
      console.log(`   Prorated rent: ₹${proratedRent}`);
      console.log(`   Paid: ₹${totalAugustPaid}`);
      console.log(`   Remaining due: ₹${remainingDue}`);
      console.log(`   Status: ${dueStatus}`);
      
      // Check if UserDue record already exists
      const existingDue = await db.collection('userdues').findOne({
        userId: user._id,
        year: 2025,
        monthNumber: 8
      });
      
      if (!existingDue) {
        console.log('🔧 Creating missing UserDue record...');
        
        const userDueData = {
          userId: user._id,
          month: 'August 2025',
          year: 2025,
          monthNumber: 8,
          fullMonthRent: roomPrice,
          proratedRent: proratedRent,
          daysCovered: daysCovered,
          totalDaysInMonth: daysInAugust,
          totalDue: proratedRent,
          currentMonthDue: proratedRent,
          previousUnpaidDue: 0,
          totalPaid: totalAugustPaid,
          remainingDue: remainingDue,
          creditBalance: 0,
          creditUsed: 0,
          netDue: remainingDue,
          dueStatus: dueStatus,
          dueDate: new Date(2025, 7, 31), // August 31, 2025
          checkInDate: checkInDate,
          isProrated: true,
          isActive: true,
          createdAt: new Date(),
          updatedAt: new Date()
        };
        
        const result = await db.collection('userdues').insertOne(userDueData);
        console.log(`✅ UserDue record created with ID: ${result.insertedId}`);
        
        console.log(`\n🎯 SOLUTION APPLIED:`);
        console.log(`   - Created August 2025 UserDue record`);
        console.log(`   - Prorated rent: ₹${proratedRent} for ${daysCovered} days`);
        console.log(`   - Due amount will now show: ₹${remainingDue}`);
        console.log(`   - September payment (₹9,500) is correctly for September`);
        
      } else {
        console.log('ℹ️  UserDue record already exists');
      }
    }
    
  } catch (error) {
    console.error('❌ Error:', error);
  } finally {
    await client.close();
    console.log("\n🔐 Connection closed");
  }
}

fixUserDue();
