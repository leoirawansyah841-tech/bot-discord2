const { badWords, scamWords } = require('./bannedWords.js');

const { normalizeAll } = require('./normalize.js');

// Fungsi utama filter
// Mengembalikan { isValid: boolean, shouldCount: boolean }
function runAllFilters(message) {
    // 0. Cek Font Aneh / LingoJam (Font Generator)
    const fancyFontRegex = /[\u{1D400}-\u{1D7FF}\u{2460}-\u{24FF}\u{FF00}-\u{FFEF}\u{2100}-\u{214F}\u{0400}-\u{04FF}]/u;
    if (fancyFontRegex.test(message.content)) {
        message.delete().catch(() => {});
        message.channel.send(`Pesan dari ${message.author} dihapus karena menggunakan font aneh/simbol (LingoJam/Homoglyph). Gunakan teks biasa!`)
            .then(msg => setTimeout(() => msg.delete().catch(() => {}), 8000));
        return { isValid: false, shouldCount: false };
    }

    // 1. Cek Scam / Phishing
    const normalizedContentForScam = normalizeAll(message.content).replace(/\s+/g, '');
    
    // 1.a Cek Domain Judi Langsung dari Teks URL (Cepat)
    const urlRegex = /(https?:\/\/[^\s]+)/gi;
    const urls = message.content.match(urlRegex);
    let isScamDomain = false;
    if (urls) {
        const suspiciousKeywords = ['slot', 'hoki', 'cuan', 'gacor', 'toto', 'judi', 'betting', 'maxwin', 'zeus'];
        for (const url of urls) {
            const lowerUrl = url.toLowerCase();
            if (suspiciousKeywords.some(keyword => lowerUrl.includes(keyword))) {
                // Kecualikan situs terpercaya yang mungkin punya kata tersebut (sangat jarang)
                if (!lowerUrl.includes('youtube.com') && !lowerUrl.includes('google.com')) {
                    isScamDomain = true;
                    break;
                }
            }
        }
    }

    // 1.b Cek dari Kamus Banned Words
    const isScam = isScamDomain || scamWords.some(phrase => {
        const normalizedPhrase = normalizeAll(phrase).replace(/\s+/g, '');
        return normalizedContentForScam.includes(normalizedPhrase);
    });

    if (isScam) {
        message.delete().catch(() => {});
        message.channel.send(`Pesan terindikasi penipuan (Scam/Phishing) dari ${message.author} telah diblokir otomatis demi keamanan server.`)
            .then(msg => setTimeout(() => msg.delete().catch(() => {}), 8000));
        return { isValid: false, shouldCount: false };
    }

    // 2. Cek Kata Kasar
    const content = normalizeAll(message.content);
    const hasBadWord = badWords.some(word => {
        const normalizedWord = normalizeAll(word);
        
        // Buat Regex cerdas yang otomatis mendeteksi karakter berulang (kooontol) 
        // dan spasi berlebih (k o n t o l)
        const escapedWord = normalizedWord.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
        
        // Pisahkan karakter, lalu tambahkan '+' agar mengizinkan karakter berulang
        // (contoh: k+ o+ n+ t+ o+ l+)
        const spacedWord = escapedWord.split('').map(char => char === ' ' ? ' +' : char + '+').join('\\s*');
        
        // Cari kecocokan kata kasar, memastikan batas kata utuh agar tidak terdeteksi
        // di dalam kata normal (misal: 'masuk' tidak akan terbaca 'asu')
        const regex = new RegExp(`(^|\\s|[^a-z])${spacedWord}($|\\s|[^a-z])`, 'i');
        return regex.test(content);
    });

    if (hasBadWord) {
        message.delete().catch(() => {});
        message.channel.send(`Peringatan untuk ${message.author}: Pesan Anda dihapus secara otomatis karena terdeteksi mengandung kata kasar. Tolong jaga bahasa Anda di server ini!`)
            .then(msg => setTimeout(() => msg.delete().catch(() => {}), 5000));
        return { isValid: false, shouldCount: false };
    }



    // Lolos semua filter
    return { isValid: true, shouldCount: true };
}

module.exports = {
    runAllFilters
};
