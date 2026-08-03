const fs = require('fs');
const path = require('path');
const crypto = require('crypto');

// Secret Passphrase used for AES-256-GCM
const SECRET_PASSPHRASE = "HNUE_TRACNGHIEM_SECURE_KEY_2026";

function getDerivedKey() {
    return crypto.createHash('sha256').update(SECRET_PASSPHRASE).digest();
}

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

const quizPath = path.resolve(__dirname, '../data/CNXH/Câu hỏi trắc nghiệm (mới)/Chương 1. Nhập môn CNXH Khoa học.enc');
console.log('Reading file:', quizPath);
const buf = fs.readFileSync(quizPath);
const decrypted = decryptBuffer(buf);
console.log('Decrypted snippet (first 200 chars):');
console.log(decrypted.substring(0, 200));
