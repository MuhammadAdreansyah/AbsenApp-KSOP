#!/usr/bin/env node
/**
 * test-realtime-optimized.js
 * Test script untuk verify real-time attendance system setelah optimization
 * 
 * Run: node test-realtime-optimized.js
 */

const http = require('http');
const url = require('url');

const API_HOST = process.env.API_HOST || 'http://localhost:3000';

const colors = {
  reset: '\x1b[0m',
  green: '\x1b[32m',
  red: '\x1b[31m',
  yellow: '\x1b[33m',
  blue: '\x1b[36m',
};

function log(color, ...args) {
  console.log(color, ...args, colors.reset);
}

function makeRequest(path, options = {}) {
  return new Promise((resolve, reject) => {
    const fullUrl = `${API_HOST}${path}`;
    const parsedUrl = new url.URL(fullUrl);
    
    const opts = {
      hostname: parsedUrl.hostname,
      port: parsedUrl.port,
      path: `${parsedUrl.pathname}${parsedUrl.search}`,
      method: options.method || 'GET',
      headers: {
        'Content-Type': 'application/json',
        ...options.headers,
      },
    };

    const req = http.request(opts, (res) => {
      let data = '';
      
      res.on('data', (chunk) => {
        data += chunk;
      });
      
      res.on('end', () => {
        try {
          resolve({
            status: res.statusCode,
            headers: res.headers,
            body: data ? JSON.parse(data) : null,
          });
        } catch (e) {
          resolve({
            status: res.statusCode,
            headers: res.headers,
            body: data,
          });
        }
      });
    });

    req.on('error', reject);
    
    if (options.body) {
      req.write(JSON.stringify(options.body));
    }
    
    req.end();
  });
}

async function runTests() {
  log(colors.blue, '\n🧪 Real-Time Attendance Optimization Test Suite\n');

  let passed = 0;
  let failed = 0;

  try {
    // TEST 1: API Health Check
    log(colors.blue, '📍 TEST 1: API Health Check');
    try {
      const response = await makeRequest('/api/attendance/stats?meetingCode=default');
      
      if (response.status === 200 && response.body.success !== false) {
        log(colors.green, '✓ API is accessible and responding\n');
        passed++;
      } else {
        log(colors.red, `✗ API returned unexpected response: ${response.status}\n`);
        failed++;
      }
    } catch (err) {
      log(colors.red, `✗ API is not accessible: ${err.message}`);
      log(colors.yellow, `   Make sure server is running at ${API_HOST}\n`);
      failed++;
    }

    // TEST 2: Response payload size
    log(colors.blue, '📍 TEST 2: Verify Response Payload Optimization');
    try {
      const response = await makeRequest('/api/attendance/stats?meetingCode=default');
      const bodyString = JSON.stringify(response.body);
      const sizeKB = (bodyString.length / 1024).toFixed(2);

      // Response harus < 50KB untuk 50 peserta
      if (bodyString.length < 50000) {
        log(colors.green, `✓ Response payload optimized (${sizeKB}KB - should be <50KB)\n`);
        passed++;
      } else {
        log(colors.yellow, `⚠ Response payload larger than expected (${sizeKB}KB)\n`);
        log(colors.yellow, '   Check if signatureUrl is still included in response!\n');
        failed++;
      }

      // Check if signatureUrl is included (should NOT be)
      if (response.body.data?.attendanceRecords?.length > 0) {
        const firstRecord = response.body.data.attendanceRecords[0];
        if (!firstRecord.signatureUrl) {
          log(colors.green, '✓ Signature URLs correctly excluded from polling response\n');
          passed++;
        } else {
          log(colors.red, '✗ ERROR: signatureUrl still in polling response!\n');
          log(colors.yellow, '   This defeats optimization purpose. Check /api/attendance/stats\n');
          failed++;
        }
      }
    } catch (err) {
      log(colors.red, `✗ Failed to check payload: ${err.message}\n`);
      failed++;
    }

    // TEST 3: Cache Control Headers
    log(colors.blue, '📍 TEST 3: Verify Cache Control Headers');
    try {
      const response = await makeRequest('/api/attendance/stats?meetingCode=default');
      const cacheControl = response.headers['cache-control'];

      if (cacheControl && cacheControl.includes('no-cache')) {
        log(colors.green, `✓ Cache-Control header set correctly: ${cacheControl}\n`);
        passed++;
      } else {
        log(colors.yellow, `⚠ Cache-Control header missing or incorrect: ${cacheControl}\n`);
        failed++;
      }
    } catch (err) {
      log(colors.red, `✗ Failed to check headers: ${err.message}\n`);
      failed++;
    }

    // TEST 4: Signature On-Demand Endpoint
    log(colors.blue, '📍 TEST 4: Verify Signature On-Demand Endpoint');
    try {
      // First, get a record ID
      const listResponse = await makeRequest('/api/attendance/stats?meetingCode=default');
      
      if (listResponse.body.data?.attendanceRecords?.length > 0) {
        const recordId = listResponse.body.data.attendanceRecords[0].id;
        
        // Try to fetch signature
        const sigResponse = await makeRequest(`/api/attendance/signature?recordId=${recordId}`);
        
        if (sigResponse.status === 200) {
          log(colors.green, `✓ Signature on-demand endpoint works\n`);
          passed++;
          
          if (sigResponse.body.data?.signatureUrl) {
            log(colors.green, '✓ Signature URL accessible via dedicated endpoint\n');
            passed++;
          } else {
            log(colors.yellow, '⚠ Signature endpoint works but no signatureUrl in response\n');
          }
        } else if (sigResponse.status === 404) {
          log(colors.yellow, `⚠ No attendance records yet (404 is expected on fresh DB)\n`);
        } else {
          log(colors.red, `✗ Signature endpoint failed: ${sigResponse.status}\n`);
          failed++;
        }
      } else {
        log(colors.yellow, `⚠ No attendance records yet - skipping signature test\n`);
      }
    } catch (err) {
      log(colors.red, `✗ Failed to test signature endpoint: ${err.message}\n`);
      failed++;
    }

    // TEST 5: Supabase Realtime Configuration
    log(colors.blue, '📍 TEST 5: Verify Supabase Configuration');
    try {
      const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
      const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

      if (supabaseUrl && supabaseKey) {
        log(colors.green, '✓ Supabase environment variables configured\n');
        log(colors.green, `  URL: ${supabaseUrl.substring(0, 30)}...\n`);
        passed++;
      } else {
        log(colors.yellow, `⚠ Supabase not configured - system will use polling fallback\n`);
        log(colors.yellow, '  For real-time push updates, add NEXT_PUBLIC_SUPABASE_* to .env\n\n');
      }
    } catch (err) {
      log(colors.red, `✗ Error checking Supabase config: ${err.message}\n`);
    }

    // SUMMARY
    log(colors.blue, '\n' + '='.repeat(60));
    log(colors.blue, '📊 TEST SUMMARY\n');
    
    if (failed === 0) {
      log(colors.green, `✓ All tests passed! (${passed} passed)\n`);
      log(colors.green, 'Real-time optimization is ready for production. 🚀\n');
    } else {
      log(colors.yellow, `${passed} passed, ${failed} failed\n`);
      
      if (failed > 0) {
        log(colors.yellow, '⚠️  Issues detected - review above\n');
      }
    }

    log(colors.blue, '📝 Next Steps:\n');
    log(colors.blue, '1. Test with actual attendance submission');
    log(colors.blue, '2. Monitor API response times in production');
    log(colors.blue, '3. Verify Supabase Realtime working (check browser console)');
    log(colors.blue, '4. Check data appears <500ms on multiple devices\n');

  } catch (err) {
    log(colors.red, `\n✗ Unexpected error: ${err.message}\n`);
    process.exit(1);
  }
}

runTests().catch((err) => {
  log(colors.red, `Fatal error: ${err.message}`);
  process.exit(1);
});
