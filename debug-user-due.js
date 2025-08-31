const { MongoClient } = require('mongodb');

async function debugUserDue() {
  const uri = "mongodb+srv://ravisirvi609:w6o8ibK73GHKVJ5y@comfort-stay-pg.0p2g3ic.mongodb.net/?retryWrites=true&w=majority&appName=comfort-stay-pg";
  const client = new MongoClient(uri);
  
  try {
    await client.connect();
    console.log("🔗 Connected to MongoDB");
    
    const db = client.db();
    
    // Find user who checked in on August 22, 2025
    const checkInDate = new Date('2025-08-22');
    console.log(`🔍 Looking for users who checked in on: ${checkInDate.toDateString()}`);
    
    const users = await db.collection('users').find({
      isActive: true,
      moveInDate: {
        $gte: new Date('2025-08-22T00:00:00.000Z'),
        $lte: new Date('2025-08-22T23:59:59.999Z')
      }
    }).toArray();
    
    console.log(`👥 Found ${users.length} users who checked in on Aug 22, 2025`);
    
    for (const user of users) {
      console.log(`\n📋 USER: ${user.name} (${user.pgId})`);
      console.log(`   Check-in Date: ${new Date(user.moveInDate).toDateString()}`);
      console.log(`   Room: ${user.roomId ? 'Assigned' : 'Not assigned'}`);
      
      // Get room details
      if (user.roomId) {
        const room = await db.collection('rooms').findOne({ _id: user.roomId });
        if (room) {
          console.log(`   Room Price: ₹${room.price}`);
        }
      }
      
      // Check UserDue records for this user
      const userDues = await db.collection('userdues').find({ 
        userId: user._id,
        isActive: true 
      }).sort({ year: -1, monthNumber: -1 }).toArray();
      
      console.log(`   📊 UserDue records: ${userDues.length}`);
      userDues.forEach(due => {
        console.log(`     - ${due.month} ${due.year}: Due=₹${due.remainingDue}, Status=${due.dueStatus}`);
      });
      
      // Check payments for this user
      const payments = await db.collection('payments').find({
        userId: user._id,
        isActive: true,
        paymentStatus: 'Paid'
      }).sort({ paymentDate: -1 }).toArray();
      
      console.log(`   💸 Payments: ${payments.length}`);
      payments.forEach(payment => {
        const paymentDate = new Date(payment.paymentDate).toDateString();
        console.log(`     - ${paymentDate}: ₹${payment.amount} for ${payment.months.join(', ')}`);
      });
      
      // Check what the API would return for this user
      console.log(`   🔍 API Analysis:`);
      
      // Current month (August 2025)
      const augustDue = userDues.find(due => due.year === 2025 && due.monthNumber === 8);
      if (augustDue) {
        console.log(`     August 2025 Due: ₹${augustDue.remainingDue} (${augustDue.dueStatus})`);
      } else {
        console.log(`     No August 2025 UserDue record found`);
      }
      
      // Check if there are September payments
      const septemberPayments = payments.filter(p => 
        p.months.some(month => month.includes('September 2025'))
      );
      
      if (septemberPayments.length > 0) {
        console.log(`   ⚠️  ISSUE FOUND:`);
        console.log(`     - User has September 2025 payments: ₹${septemberPayments.reduce((sum, p) => sum + p.amount, 0)}`);
        console.log(`     - But API is checking August 2025 dues only`);
        console.log(`     - This causes the system to show August due as unpaid`);
      }
    }
    
  } catch (error) {
    console.error('❌ Error:', error);
  } finally {
    await client.close();
    console.log("\n🔐 Connection closed");
  }
}

debugUserDue();
