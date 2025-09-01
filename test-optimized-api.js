const axios = require('axios');

async function testOptimizedAPI() {
  try {
    console.log('Testing optimized /api/users/with-dues endpoint...');
    console.time('API Response Time');

    const response = await axios.get('http://localhost:3000/api/users/with-dues', {
      timeout: 15000, // 15 second timeout to test if it resolves faster
      validateStatus: function (status) {
        return status < 500; // Don't throw error on 4xx status codes
      }
    });

    console.timeEnd('API Response Time');
    console.log(`📊 Status Code: ${response.status}`);
    
    if (response.status === 401) {
      console.log('🔒 Authentication required - this is expected in production');
      console.log('✅ API is responding (not timing out)');
      return;
    }
    
    if (response.data.success) {
      console.log('✅ API call successful!');
      console.log(`📊 Users returned: ${response.data.users.length}`);
      console.log(`📈 Summary:`, response.data.summary);
      console.log(`🗓️ Target Month: ${response.data.targetMonthName} ${response.data.targetYear}`);
    } else {
      console.log('❌ API call failed:', response.data.message);
    }
    
  } catch (error) {
    console.error('❌ Error testing API:', error.message);
    
    if (error.code === 'ECONNREFUSED') {
      console.log('💡 Make sure the development server is running on port 3000');
    } else if (error.code === 'ENOTFOUND') {
      console.log('💡 Check if localhost is accessible');
    } else if (error.code === 'TIMEOUT') {
      console.log('⏱️ API timed out - the optimization may not be working');
    }
  }
}

// Test the API
testOptimizedAPI();
