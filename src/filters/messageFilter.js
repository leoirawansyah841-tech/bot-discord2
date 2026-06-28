const { badWords, scamWords } = require('./bannedWords.js');

const { normalizeAll } = require('./normalize.js');

// Fungsi utama filter
// Mengembalikan { isValid: boolean, shouldCount: boolean }
function runAllFilters(message) {
    // 0. Cek Font Aneh / LingoJam (Font Generator)
    const fancyFontRegex = /[\u{1D400}-\u{1D7FF}\u{2460}-\u{24FF}\u{FF00}-\u{FFEF}\u{2100}-\u{214F}\u{0400}-\u{04FF}]/u;
    if (fancyFontRegex.test(message.content)) {
        message.delete().catch(() => {});
        message.channel.send(`🤖 **[AI Moderator]** ⚠️ Pesan dari ${message.author} dihapus karena menggunakan font aneh/simbol (LingoJam/Homoglyph). Gunakan teks biasa!`)
            .then(msg => setTimeout(() => msg.delete().catch(() => {}), 8000));
        return { isValid: false, shouldCount: false };
    }

    // 1. Cek Scam / Phishing
    const normalizedContentForScam = normalizeAll(message.content).replace(/\s+/g, '');
    const isScam = scamWords.some(phrase => {
        const normalizedPhrase = normalizeAll(phrase).replace(/\s+/g, '');
        return normalizedContentForScam.includes(normalizedPhrase);
    });

    if (isScam) {
        message.delete().catch(() => {});
        message.channel.send(`🤖 **[AI Moderator]** 🛡️ Pesan terindikasi penipuan (Scam/Phishing) dari ${message.author} telah diblokir otomatis demi keamanan server.`)
            .then(msg => setTimeout(() => msg.delete().catch(() => {}), 8000));
        return { isValid: false, shouldCount: false };
    }

    // 2. Cek Kata Kasar
    const content = normalizeAll(message.content);
    const hasBadWord = badWords.some(word => {
        const normalizedWord = normalizeAll(word);
        if (normalizedWord.includes(' ')) {
            return content.includes(normalizedWord);
        }
        const escapedWord = normalizedWord.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
        const spacedWord = escapedWord.split('').join('\\s*');
        const regex = new RegExp(`(^|\\s|[^a-z])${spacedWord}($|\\s|[^a-z])`, 'i');
        return regex.test(content);
    });

    if (hasBadWord) {
        message.delete().catch(() => {});
        message.channel.send(`🤖 **[AI Moderator]** ⚠️ Peringatan untuk ${message.author}: Pesan Anda dihapus secara otomatis karena terdeteksi mengandung kata kasar. Tolong jaga bahasa Anda di server ini!`)
            .then(msg => setTimeout(() => msg.delete().catch(() => {}), 5000));
        return { isValid: false, shouldCount: false };
    }



    // Lolos semua filter
    return { isValid: true, shouldCount: true };
}

module.exports = {
    runAllFilters
};
