/* ========================================================
   WEB CRYPTO API (AES-256-GCM) FOR ENCRYPTION & DECRYPTION
======================================================== */
const SECRET_PASSPHRASE = "HNUE_TRACNGHIEM_SECURE_KEY_2026";
let cryptoKeyCache = null;

async function getCryptoKey() {
    if (cryptoKeyCache) return cryptoKeyCache;
    const enc = new TextEncoder();
    const keyData = enc.encode(SECRET_PASSPHRASE);
    const hash = await window.crypto.subtle.digest('SHA-256', keyData);
    cryptoKeyCache = await window.crypto.subtle.importKey(
        'raw',
        hash,
        { name: 'AES-GCM' },
        false,
        ['encrypt', 'decrypt']
    );
    return cryptoKeyCache;
}

async function encryptData(plainText) {
    try {
        const key = await getCryptoKey();
        const iv = window.crypto.getRandomValues(new Uint8Array(12));
        const enc = new TextEncoder();
        const encoded = enc.encode(plainText);
        const ciphertextBuffer = await window.crypto.subtle.encrypt(
            { name: 'AES-GCM', iv: iv },
            key,
            encoded
        );
        const combined = new Uint8Array(iv.length + ciphertextBuffer.byteLength);
        combined.set(iv, 0);
        combined.set(new Uint8Array(ciphertextBuffer), iv.length);

        let binary = '';
        const len = combined.byteLength;
        for (let i = 0; i < len; i++) {
            binary += String.fromCharCode(combined[i]);
        }
        return 'enc_v1:' + window.btoa(binary);
    } catch(e) {
        console.error("Encrypt error:", e);
        return plainText;
    }
}

async function decryptData(cipherText) {
    if (!cipherText || typeof cipherText !== 'string' || !cipherText.startsWith('enc_v1:')) {
        return cipherText; // Fallback for legacy unencrypted data
    }
    try {
        const base64 = cipherText.substring(7);
        const binary = window.atob(base64);
        const bytes = new Uint8Array(binary.length);
        for (let i = 0; i < binary.length; i++) {
            bytes[i] = binary.charCodeAt(i);
        }
        const iv = bytes.subarray(0, 12);
        const ciphertext = bytes.subarray(12);

        const key = await getCryptoKey();
        const decryptedBuffer = await window.crypto.subtle.decrypt(
            { name: 'AES-GCM', iv: iv },
            key,
            ciphertext
        );
        const dec = new TextDecoder();
        return dec.decode(decryptedBuffer);
    } catch(e) {
        console.error("Decrypt error:", e);
        return cipherText;
    }
}

async function decryptQuizArrayBuffer(arrayBuffer) {
    const bytes = new Uint8Array(arrayBuffer);
    const iv = bytes.subarray(0, 12);
    const ciphertext = bytes.subarray(12);

    const key = await getCryptoKey();
    const decryptedBuffer = await window.crypto.subtle.decrypt(
        { name: 'AES-GCM', iv: iv },
        key,
        ciphertext
    );
    const dec = new TextDecoder();
    return dec.decode(decryptedBuffer);
}
