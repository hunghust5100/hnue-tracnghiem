const fs = require('fs');
const path = require('path');
const crypto = require('crypto');

// Secret Passphrase used for AES-256-GCM
const SECRET_PASSPHRASE = "HNUE_TRACNGHIEM_SECURE_KEY_2026";

// Derive 256-bit (32 bytes) key using SHA-256
function getDerivedKey() {
    return crypto.createHash('sha256').update(SECRET_PASSPHRASE).digest();
}

/**
 * Encrypts a string into Buffer format:
 * [IV (12 bytes)] + [Ciphertext] + [AuthTag (16 bytes)]
 */
function encryptText(text) {
    const key = getDerivedKey();
    const iv = crypto.randomBytes(12);
    const cipher = crypto.createCipheriv('aes-256-gcm', key, iv);

    const encrypted = Buffer.concat([cipher.update(text, 'utf8'), cipher.final()]);
    const tag = cipher.getAuthTag();

    return Buffer.concat([iv, encrypted, tag]);
}

/**
 * Decrypts binary Buffer back to UTF-8 text (for verification)
 */
function decryptBuffer(buffer) {
    const key = getDerivedKey();
    const iv = buffer.subarray(0, 12);
    const tag = buffer.subarray(buffer.length - 16);
    const ciphertext = buffer.subarray(12, buffer.length - 16);

    const decipher = crypto.createDecipheriv('aes-256-gcm', key, iv);
    decipher.setAuthTag(tag);

    let decrypted = decipher.update(ciphertext, null, 'utf8');
    decrypted += decipher.final('utf8');
    return decrypted;
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
        } else if (entry.isFile() && entry.name.endsWith('.txt')) {
            const encPath = fullPath.substring(0, fullPath.length - 4) + '.enc';
            const rawContent = fs.readFileSync(fullPath, 'utf8');
            const encryptedBuffer = encryptText(rawContent);

            fs.writeFileSync(encPath, encryptedBuffer);
            
            const relativeEncPath = path.relative(rootDir, encPath);
            embeddedMap[relativeEncPath] = encryptedBuffer.toString('base64');

            console.log(`Encrypted: ${path.relative(rootDir, fullPath)} -> ${relativeEncPath}`);

            // Verification check
            const decryptedCheck = decryptBuffer(encryptedBuffer);
            if (decryptedCheck !== rawContent) {
                throw new Error(`Verification failed for file: ${fullPath}`);
            }
        }
    }
}

console.log('--- START ENCRYPTING QUIZ FILES ---');
processDirectory(path.join(rootDir, 'CNXH'));
processDirectory(path.join(rootDir, 'Giáo dục học'));

// Update quizzes.json to point to .enc files
const quizzesJsonPath = path.join(rootDir, 'quizzes.json');
if (fs.existsSync(quizzesJsonPath)) {
    const rawJson = fs.readFileSync(quizzesJsonPath, 'utf8');
    const updatedJson = rawJson.replace(/\.txt"/g, '.enc"');
    fs.writeFileSync(quizzesJsonPath, updatedJson, 'utf8');
    console.log('Updated quizzes.json to reference .enc files.');
}

// Write js/quizzes-data.js for offline / file:// CORS fallback
const jsDataPath = path.join(rootDir, 'js/quizzes-data.js');
const jsContent = `/* AUTO-GENERATED EMBEDDED QUIZ DATA BUNDLE FOR FILE:// CORS FALLBACK */\nwindow.EMBEDDED_QUIZZES = ${JSON.stringify(embeddedMap, null, 2)};\n`;
fs.writeFileSync(jsDataPath, jsContent, 'utf8');
console.log('Generated js/quizzes-data.js successfully!');

console.log('--- ALL QUIZ FILES ENCRYPTED & BUNDLED SUCCESSFULLY ---');
