const fs = require('fs');
const path = require('path');

const SECRET_PASSPHRASE = "HNUE_TRACNGHIEM_SECURE_KEY_2026";

function sha256(array) {
    var chksum = [
        0x6a09e667, 0xbb67ae85, 0x3c6ef372, 0xa54ff53a,
        0x510e527f, 0x9b05688c, 0x1f83d9ab, 0x5be0cd19
    ];
    var K = [
        0x428a2f98, 0x71374491, 0xb5c0fbcf, 0xe9b5dba5, 0x3956c25b, 0x59f111f1, 0x923f82a4, 0xab1c5ed5,
        0xd807aa98, 0x12835b01, 0x243185be, 0x550c7dc3, 0x72be5d74, 0x80deb1fe, 0x9bdc06a7, 0xc19bf174,
        0xe49b69c1, 0xefbe4786, 0x0fc19dc6, 0x240ca1cc, 0x2de92c6f, 0x4a7484aa, 0x5cb0a9dc, 0x76f988da,
        0x983e5152, 0xa831c66d, 0xb00327c8, 0xbf597fc7, 0xc6e00bf3, 0xd5a79147, 0x06ca6351, 0x14292967,
        0x27b70a85, 0x2e1b2138, 0x4d2c6dfc, 0x53380d13, 0x650a7354, 0x766a0abb, 0x81c2c92e, 0x92722c85,
        0xa2bfe8a1, 0xa81a664b, 0xc24b8b70, 0xc76c51a3, 0xd192e819, 0xd6990624, 0xf40e3585, 0x106aa070,
        0x19a4c116, 0x1e376c08, 0x2748774c, 0x34b0bcb5, 0x391c0cb3, 0x4ed8aa4a, 0x5b9cca4f, 0x682e6ff3,
        0x748f82ee, 0x78a5636f, 0x84c87814, 0x8cc70208, 0x90befffa, 0xa4506ceb, 0xbef9a3f7, 0xc67178f2
    ];

    var l = array.length;
    var blocks = [];
    for (var i = 0; i < l; i++) {
        blocks[i >> 2] |= (array[i] & 0xff) << (24 - (i % 4) * 8);
    }
    blocks[l >> 2] |= 0x80 << (24 - (l % 4) * 8);
    blocks[(((l + 8) >> 6) + 1) * 16 - 1] = l * 8;

    for (var i = 0; i < blocks.length; i += 16) {
        var w = blocks.slice(i, i + 16);
        for (var t = 16; t < 64; t++) {
            var s0 = (w[t - 15] >>> 7 | w[t - 15] << 25) ^ (w[t - 15] >>> 18 | w[t - 15] << 14) ^ (w[t - 15] >>> 3);
            var s1 = (w[t - 2] >>> 17 | w[t - 2] << 15) ^ (w[t - 2] >>> 19 | w[t - 2] << 13) ^ (w[t - 2] >>> 10);
            w[t] = (w[t - 16] + s0 + w[t - 7] + s1) & 0xffffffff;
        }

        var a = chksum[0], b = chksum[1], c = chksum[2], d = chksum[3];
        var e = chksum[4], f = chksum[5], g = chksum[6], h = chksum[7];

        for (var t = 0; t < 64; t++) {
            var S1 = (e >>> 6 | e << 26) ^ (e >>> 11 | e << 21) ^ (e >>> 25 | e << 7);
            var ch = (e & f) ^ (~e & g);
            var temp1 = (h + S1 + ch + K[t] + w[t]) & 0xffffffff;
            var S0 = (a >>> 2 | a << 30) ^ (a >>> 13 | a << 19) ^ (a >>> 22 | a << 10);
            var maj = (a & b) ^ (a & c) ^ (b & c);
            var temp2 = (S0 + maj) & 0xffffffff;

            h = g; g = f; f = e; e = (d + temp1) & 0xffffffff;
            d = c; c = b; b = a; a = (temp1 + temp2) & 0xffffffff;
        }

        chksum[0] = (chksum[0] + a) & 0xffffffff;
        chksum[1] = (chksum[1] + b) & 0xffffffff;
        chksum[2] = (chksum[2] + c) & 0xffffffff;
        chksum[3] = (chksum[3] + d) & 0xffffffff;
        chksum[4] = (chksum[4] + e) & 0xffffffff;
        chksum[5] = (chksum[5] + f) & 0xffffffff;
        chksum[6] = (chksum[6] + g) & 0xffffffff;
        chksum[7] = (chksum[7] + h) & 0xffffffff;
    }

    var res = new Uint8Array(32);
    for (var i = 0; i < 8; i++) {
        res[i * 4] = (chksum[i] >>> 24) & 0xff;
        res[i * 4 + 1] = (chksum[i] >>> 16) & 0xff;
        res[i * 4 + 2] = (chksum[i] >>> 8) & 0xff;
        res[i * 4 + 3] = chksum[i] & 0xff;
    }
    return res;
}

function encryptText(text) {
    const plainBytes = Buffer.from(text, 'utf8');
    const keyBytes = Buffer.from(SECRET_PASSPHRASE, 'utf8');
    const iv = Buffer.alloc(12);
    for (let i = 0; i < 12; i++) iv[i] = Math.floor(Math.random() * 256);

    const out = Buffer.alloc(1 + 12 + plainBytes.length);
    out[0] = 0x48; // Magic 'H'
    iv.copy(out, 1);

    let counter = 0;
    while (counter * 32 < plainBytes.length) {
        const blockInput = Buffer.concat([keyBytes, iv, Buffer.from([
            (counter >>> 24) & 0xff,
            (counter >>> 16) & 0xff,
            (counter >>> 8) & 0xff,
            counter & 0xff
        ])]);

        const ks = sha256(blockInput);
        const offset = counter * 32;
        const count = Math.min(32, plainBytes.length - offset);
        for (let i = 0; i < count; i++) {
            out[13 + offset + i] = plainBytes[offset + i] ^ ks[i];
        }
        counter++;
    }
    return out;
}

// Root directory
const rootDir = path.resolve(__dirname, '..');
const embeddedMap = {};

function processDirectory(dirPath) {
    const entries = fs.readdirSync(dirPath, { withFileTypes: true });

    for (const entry of entries) {
        const fullPath = path.join(dirPath, entry.name);
        if (entry.isDirectory()) {
            processDirectory(fullPath);
        } else if (entry.isFile() && (entry.name.endsWith('.txt') || entry.name.endsWith('.md'))) {
            const extLen = entry.name.endsWith('.txt') ? 4 : 3;
            const encPath = fullPath.substring(0, fullPath.length - extLen) + '.enc';
            const rawContent = fs.readFileSync(fullPath, 'utf8');
            const encryptedBuffer = encryptText(rawContent);
            fs.writeFileSync(encPath, encryptedBuffer);

            const relPath = path.relative(rootDir, encPath).replace(/\\/g, '/');
            embeddedMap[relPath] = encryptedBuffer.toString('base64');
            console.log(`Encrypted: ${path.relative(rootDir, fullPath)} -> ${relPath}`);
        }
    }
}

console.log('--- START ENCRYPTING QUIZ FILES (PURE JS SAFE STREAM CIPHER) ---');
const dataDir = path.join(rootDir, 'data');
if (fs.existsSync(dataDir)) {
    processDirectory(dataDir);
}

// Update quizzes.json references from .txt to .enc if needed
const jsonPath = path.join(rootDir, 'data/quizzes.json');
if (fs.existsSync(jsonPath)) {
    let jsonStr = fs.readFileSync(jsonPath, 'utf8');
    jsonStr = jsonStr.replace(/\.txt"/g, '.enc"');
    fs.writeFileSync(jsonPath, jsonStr, 'utf8');
    console.log('Updated data/quizzes.json to reference .enc files.');
}

// Write embedded bundle js file
const bundleJsPath = path.join(rootDir, 'js/quizzes-data.js');
const bundleContent = `/* AUTO-GENERATED EMBEDDED QUIZ DATA BUNDLE FOR FILE:// & NON-SECURE HTTP ORIGINS */\nwindow.EMBEDDED_QUIZZES = ${JSON.stringify(embeddedMap, null, 2)};\n`;
fs.writeFileSync(bundleJsPath, bundleContent, 'utf8');
console.log('Generated js/quizzes-data.js successfully!');
console.log('--- ALL QUIZ FILES ENCRYPTED & BUNDLED SUCCESSFULLY ---');
