const app = require('./app');
const http = require('http');

const PORT = 3001; // Use a different port to avoid conflicts
const server = http.createServer(app);

server.listen(PORT, async () => {
    console.log(`Test server running at http://localhost:${PORT}`);

    try {
        const response = await fetch(`http://localhost:${PORT}/sa`);
        const text = await response.text();
        console.log('--- Response Start ---');
        console.log(text.substring(0, 500));
        console.log('--- Response End ---');

        if (text.includes('ركن الكوبونات') && text.includes('<html lang="ar"')) {
            console.log('✅ TEST PASSED: Server returned valid HTML with expected content');
        } else {
            console.log('❌ TEST FAILED: Content mismatch');
        }
    } catch (error) {
        console.error('❌ TEST FAILED:', error.message);
    } finally {
        server.close();
        process.exit(0);
    }
});
