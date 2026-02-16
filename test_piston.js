import https from 'https';

const data = JSON.stringify({
    code: '#include <stdio.h>\nint main() { printf("Hello Wandbox"); return 0; }',
    compiler: 'gcc-head',
    save: false
});

const options = {
    hostname: 'wandbox.org',
    path: '/api/compile.json',
    method: 'POST',
    headers: {
        'Content-Type': 'application/json',
        'Content-Length': data.length
    }
};

const req = https.request(options, (res) => {
    console.log(`STATUS: ${res.statusCode}`);
    res.setEncoding('utf8');
    res.on('data', (chunk) => {
        console.log(`BODY: ${chunk}`);
    });
});

req.on('error', (e) => {
    console.error(`problem with request: ${e.message}`);
});

req.write(data);
req.end();
