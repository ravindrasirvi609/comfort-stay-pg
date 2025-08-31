const { MongoClient } = require('mongodb');

async function debugAmounts() {
  const uri = "mongodb+srv://ravisirvi609:w6o8ibK73GHKVJ5y@comfort-stay-pg.0p2g3ic.mongodb.net/?retryWrites=true&w=majority&appName=comfort-stay-pg";
  const client = new MongoClient(uri);
  
  try {
    await client.connect();
    console.log("🔗 Connected to MongoDB");
    
    const db = client.db();
    const currentDate = new Date();
    const currentMonth = currentDate.getMonth() + 1;
    const currentYear = currentDate.getFullYear();
    
    console.log(`📅 Current Month: ${currentMonth}, Year: ${currentYear}`);
    console.log("=" * 50);
    
    // 1. Get all users with due amounts (what Users page shows)
    const users = await db.collection('users').find({ isActive: true }).toArray();
    console.log(`👥 Total Active Users: ${users.length}`);
    
    // 2. Get current month UserDue records
    const currentMonthDues = await db.collection('userdues').find({
      year: currentYear,
      monthNumber: currentMonth,
      isActive: true
    }).toArray();
    
    console.log(`📊 UserDue records for current month (${currentMonth}/${currentYear}): ${currentMonthDues.length}`);
    
    // 3. Calculate totals from UserDue collection
    let totalCurrentMonthDue = 0;
    let totalPreviousUnpaidDue = 0;
    let totalTotalDue = 0;
    let totalNetDue = 0;
    let unpaidCount = 0;
    
    currentMonthDues.forEach(due => {
      if (due.dueStatus !== 'Paid' && due.remainingDue > 0) {
        unpaidCount++;
        totalCurrentMonthDue += due.currentMonthDue || 0;
        totalPreviousUnpaidDue += due.previousUnpaidDue || 0;
        totalTotalDue += due.totalDue || 0;
        totalNetDue += due.netDue || due.remainingDue || 0;
      }
    });
    
    console.log("\n📈 FROM USERDUES COLLECTION:");
    console.log(`  Current Month Due Total: ₹${totalCurrentMonthDue.toLocaleString('en-IN')}`);
    console.log(`  Previous Unpaid Due Total: ₹${totalPreviousUnpaidDue.toLocaleString('en-IN')}`);
    console.log(`  Total Due (current + previous): ₹${totalTotalDue.toLocaleString('en-IN')}`);
    console.log(`  Net Due (after credits): ₹${totalNetDue.toLocaleString('en-IN')}`);
    console.log(`  Users with unpaid dues: ${unpaidCount}`);
    
    // 4. Get all due records regardless of month (what might be in manage users)
    const allUnpaidDues = await db.collection('userdues').find({
      isActive: true,
      dueStatus: { $in: ['Unpaid', 'Partial', 'Overdue'] },
      remainingDue: { $gt: 0 }
    }).toArray();
    
    let allUnpaidTotal = 0;
    const userUnpaidMap = new Map();
    
    allUnpaidDues.forEach(due => {
      allUnpaidTotal += due.remainingDue || 0;
      const userId = due.userId.toString();
      const current = userUnpaidMap.get(userId) || 0;
      userUnpaidMap.set(userId, current + (due.remainingDue || 0));
    });
    
    console.log("\n📊 FROM ALL UNPAID DUES (ALL MONTHS):");
    console.log(`  Total Unpaid from all months: ₹${allUnpaidTotal.toLocaleString('en-IN')}`);
    console.log(`  Number of due records: ${allUnpaidDues.length}`);
    console.log(`  Unique users with unpaid dues: ${userUnpaidMap.size}`);
    
    // 5. Show breakdown by month
    const duesByMonth = {};
    allUnpaidDues.forEach(due => {
      const key = `${due.month} ${due.year}`;
      if (!duesByMonth[key]) {
        duesByMonth[key] = { count: 0, total: 0 };
      }
      duesByMonth[key].count++;
      duesByMonth[key].total += due.remainingDue || 0;
    });
    
    console.log("\n📅 BREAKDOWN BY MONTH:");
    Object.entries(duesByMonth).forEach(([monthYear, data]) => {
      console.log(`  ${monthYear}: ${data.count} dues, ₹${data.total.toLocaleString('en-IN')}`);
    });
    
    // 6. Check if there are users without UserDue records
    const userIdsWithDues = new Set(currentMonthDues.map(due => due.userId.toString()));
    const usersWithoutDues = users.filter(user => !userIdsWithDues.has(user._id.toString()));
    
    console.log(`\n⚠️  Users without UserDue records for current month: ${usersWithoutDues.length}`);
    
    if (usersWithoutDues.length > 0) {
      let legacyUnpaidTotal = 0;
      const monthYear = `${new Date(currentYear, currentMonth - 1).toLocaleString('default', { month: 'long' })} ${currentYear}`;
      
      for (const user of usersWithoutDues) {
        if (user.roomId) {
          // Check if they have payment for current month
          const payment = await db.collection('payments').findOne({
            userId: user._id,
            months: monthYear,
            paymentStatus: 'Paid',
            isActive: true
          });
          
          if (!payment && user.roomId) {
            // Get room price
            const room = await db.collection('rooms').findOne({ _id: user.roomId });
            if (room) {
              legacyUnpaidTotal += room.price;
            }
          }
        }
      }
      
      console.log(`  Legacy calculation unpaid total: ₹${legacyUnpaidTotal.toLocaleString('en-IN')}`);
      console.log(`  COMBINED TOTAL: ₹${(totalNetDue + legacyUnpaidTotal).toLocaleString('en-IN')}`);
    }
    
  } catch (error) {
    console.error('❌ Error:', error);
  } finally {
    await client.close();
    console.log("\n🔐 Connection closed");
  }
}

debugAmounts();
