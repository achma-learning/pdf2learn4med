// config.js - Updated with client-side decryption for protected TSV
const ENCRYPTED_FILE = 'data/s-ecn-export.encrypted';  // Path to your encrypted TSV
const PASSWORD = prompt('Entrez le mot de passe pour décrypter les données S-ECN (copyright protected):');  // Or hardcode for testing: const PASSWORD = 'your-strong-password';

if (!PASSWORD) {
    alert('Mot de passe requis pour accéder aux données protégées.');
    throw new Error('Accès refusé');
}

// Decryption function (StatiCrypt-style, using WebCrypto)
async function decryptData(encryptedContent, password) {
    try {
        // Assume encryptedContent is base64 or hex from your encrypted file
        const encoder = new TextEncoder();
        const keyMaterial = await crypto.subtle.importKey(
            'raw', encoder.encode(password), { name: 'PBKDF2' }, false, ['deriveBits', 'deriveKey']
        );
        const salt = new Uint8Array(16);  // Use a fixed salt or from encrypted file
        const key = await crypto.subtle.deriveKey(
            { name: 'PBKDF2', salt, iterations: 100000, hash: 'SHA-256' },
            keyMaterial, { name: 'AES-GCM', length: 256 }, true, ['decrypt']
        );
        // Decrypt (adapt if your encrypted file has IV/nonce)
        const iv = new Uint8Array(12);  // From encrypted file
        const decryptedBuffer = await crypto.subtle.decrypt({ name: 'AES-GCM', iv }, key, encryptedContent);
        return new TextDecoder().decode(decryptedBuffer);
    } catch (e) {
        alert('Mot de passe incorrect ou erreur de décryptage. Les URLs PDF sont protégées par copyright.');
        throw e;
    }
}

// Updated loadData: Fetch encrypted, decrypt, parse
async function loadData() {
    const response = await fetch(ENCRYPTED_FILE);
    if (!response.ok) throw new Error('Fichier protégé non trouvé');
    const encryptedText = await response.text();
    const decryptedText = await decryptData(encryptedText, PASSWORD);  // Decrypt here
    const lines = decryptedText.split('\n').slice(1);  // Skip header
    return lines.map(line => {
        const [module, title, nodeUrl, pdfUrl, date] = line.split('\t').map(s => s.trim());
        return {
            module,
            title,
            nodeUrl,
            pdfUrl: pdfUrl ? pdfUrl : '',  // URLs stay hidden until decrypted
            date: date || 'N/A'
        };
    }).filter(item => item.title);
}
