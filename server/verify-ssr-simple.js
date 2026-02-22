const http = require('http');

const URL = 'http://localhost:3000/sa';

http.get(URL, (res) => {
    let data = '';
    res.on('data', (chunk) => { data += chunk; });
    res.on('end', () => {
        console.log('Status Code:', res.statusCode);
        if (res.statusCode === 200) {
            if (data.includes('ركن الكوبونات') && data.includes('<html lang="ar"')) {
                console.log('✅ Success: Homepage returned valid Arabic HTML');
            } else {
                console.log('❌ Failure: Content mismatch or missing');
                console.log('Snippet:', data.substring(0, 500));
            }
        } else {
            console.log('❌ Failure: Status code', res.statusCode);
            console.log('Snippet:', data.substring(0, 500));
        }
    });
}).on('error', (err) => {
    console.error('❌ Error:', err.message);
});
