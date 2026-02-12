import fetch from 'node-fetch';

async function check(url, method = 'GET', body = null) {
    console.log(`\nChecking ${url} [${method}]...`);
    try {
        const options = {
            method,
            headers: { 'Content-Type': 'application/json' }
        };
        if (body) options.body = JSON.stringify(body);

        const res = await fetch(url, options);
        console.log(`Status: ${res.status} ${res.statusText}`);
        const contentType = res.headers.get('content-type');
        console.log(`Content-Type: ${contentType}`);

        if (contentType && contentType.includes('json')) {
            const json = await res.json();
            console.log('Body (JSON):', JSON.stringify(json, null, 2));
        } else {
            const text = await res.text();
            console.log(`Body (Text/HTML): ${text.substring(0, 500)}`);
        }
    } catch (e) {
        console.error(`Error fetching ${url}:`, e.message);
    }
}

async function run() {
    console.log('--- START DEBUG ---');
    // Ping check
    await check('http://localhost:3001/auth/ping');

    // Update Profile check (expect 404 User not found JSON, or 200)
    await check('http://localhost:3001/auth/update-profile', 'POST', {
        userId: 'test-id',
        name: 'Test User'
    });
    console.log('--- END DEBUG ---');
}

run();
