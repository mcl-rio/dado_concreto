// Query models from the running server API
import http from 'http';

const options = {
  hostname: 'localhost',
  port: 3000,
  path: '/api/trpc/admin.getLlmPricing?input={}',
  method: 'GET',
  headers: {
    'Content-Type': 'application/json'
  }
};

const req = http.request(options, (res) => {
  let data = '';
  res.on('data', chunk => data += chunk);
  res.on('end', () => {
    try {
      const result = JSON.parse(data);
      if (result.result?.data) {
        console.log('Models found:', result.result.data.length);
        result.result.data.forEach(m => {
          console.log(`${m.provider} | ${m.modelName} | ${m.displayName || 'N/A'}`);
        });
      } else {
        console.log('Response:', JSON.stringify(result, null, 2));
      }
    } catch (e) {
      console.log('Raw response:', data);
    }
  });
});

req.on('error', (e) => console.error('Error:', e.message));
req.end();
