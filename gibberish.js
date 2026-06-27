/**
 * gibberish.js
 * Fitur cerdas pendeteksi kata acak / spam ketikan / keyboard mashing.
 * Menggunakan pendekatan heuristik (rasio vokal, bigram mustahil, pola keyboard).
 */

function isGibberish(text) {
    const trimmed = text.trim();
    if (trimmed.length <= 2) return true; // Teks terlalu pendek

    const normalized = trimmed.toLowerCase().replace(/[^a-z]/g, ''); // Ambil huruf saja
    const cleanFromLaughs = normalized.replace(/(wk|ha|he|hi|hu|ck|xi)+/g, ''); // Abaikan suara tawa
    
    if (cleanFromLaughs.length === 0) return false;
    if (cleanFromLaughs.length <= 2) return false;

    let gibberishScore = 0;

    // 1. Kombinasi huruf yang mustahil (Impossible Bigrams)
    // Kombinasi ini sangat jarang ada di kata-kata bahasa Indonesia/Inggris normal
    const impossibleBigrams = [
        'bx','cj','cv','cx','dx','fq','fx','gq','gx','hx','jc','jf','jg','jq','js','jv','jw','jx','jz',
        'kq','kx','mx','px','pz','qb','qc','qd','qf','qg','qh','qj','qk','ql','qm','qn','qp','qs','qt','qv','qw','qx','qy','qz',
        'sx','vb','vf','vh','vj','vm','vp','vq','vt','vw','vx','wx','xj','xx','zj','zq','zx'
    ];

    let hasImpossibleBigram = false;
    for (const bigram of impossibleBigrams) {
        if (cleanFromLaughs.includes(bigram)) {
            hasImpossibleBigram = true;
            gibberishScore += 3; // Pelanggaran berat
            break;
        }
    }

    // 2. Pola usapan keyboard (Keyboard Row Mashing)
    // Cek pola umum yang sering dipakai spammer
    const keyboardPatterns = ['asdf', 'qwer', 'zxcv', 'tyui', 'ghjk', 'vbnm', 'hjkl', 'uiop', 'nmkl', 'asd', 'qwe', 'zxc', 'jkl'];
    for (const pattern of keyboardPatterns) {
        if (cleanFromLaughs.includes(pattern)) {
            gibberishScore += 2;
        }
    }

    // 2.5 Karakter Berulang Ekstrem (Variasi Huruf Sedikit)
    if (cleanFromLaughs.length > 7) {
        const uniqueChars = new Set(cleanFromLaughs.split(''));
        if (uniqueChars.size <= 4) {
            gibberishScore += 3; // Misal "asdasdasd" (panjang 9, cuma 3 huruf: a, s, d)
        }
    }

    // 3. Rasio Vokal vs Konsonan
    const vowelsCount = (cleanFromLaughs.match(/[aeiou]/g) || []).length;
    const consonantsCount = cleanFromLaughs.length - vowelsCount;
    
    if (cleanFromLaughs.length > 5) {
        if (vowelsCount === 0) {
            gibberishScore += 3; // Kata panjang tanpa huruf vokal pasti ngawur
        } else {
            const ratio = consonantsCount / vowelsCount;
            if (ratio > 3) {
                gibberishScore += 2; // Terlalu banyak konsonan
            } else if (ratio < 0.2) {
                gibberishScore += 2; // Terlalu banyak vokal (aaaaeeeee)
            }
        }
    }

    // 4. Konsonan berderet (walau lebih longgar dari sebelumnya)
    if (/[bcdfghjklmnpqrstvwxyz]{4,}/.test(cleanFromLaughs)) {
        gibberishScore += 2;
    }

    // Jika skor mencapai batas tertentu, kita tebak ini adalah gibberish
    return gibberishScore >= 3;
}

module.exports = isGibberish;
