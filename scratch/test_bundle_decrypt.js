const fs = require('fs');
const path = require('path');

global.window = global;

const quizzesDataContent = fs.readFileSync(path.join(__dirname, '../js/quizzes-data.js'), 'utf8');
eval(quizzesDataContent);

const cryptoContent = fs.readFileSync(path.join(__dirname, '../js/crypto.js'), 'utf8');
eval(cryptoContent);

(async () => {
    const key = "data/CNXH/Câu hỏi trắc nghiệm (mới)/Chương 1. Nhập môn CNXH Khoa học.enc";
    console.log('Testing key:', key);
    const base64Str = window.EMBEDDED_QUIZZES[key];
    console.log('Base64 length:', base64Str ? base64Str.length : 0);

    const binary = Buffer.from(base64Str, 'base64');
    const bytes = new Uint8Array(binary);

    const rawText = await decryptQuizArrayBuffer(bytes.buffer);
    console.log('Decrypted snippet (first 250 chars):');
    console.log(rawText.substring(0, 250));
})();
