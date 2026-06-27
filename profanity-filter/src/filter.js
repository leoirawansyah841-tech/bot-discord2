/**
 * filter.js
 * Logika utama profanity filter.
 * Fungsi utama: filterText(text) — menerima teks dan mengembalikan teks
 * dengan kata kasar dibungkus **double asterisks** (format Markdown bold).
 */

const { normalizeAll } = require('./normalize');
const badwords = require('./badwords');

// =============================================================================
// Fungsi Pembantu: apakah sebuah kata (sudah dinormalisasi) termasuk badword?
// =============================================================================
/**
 * Mengecek apakah sebuah token (kata) yang sudah dinormalisasi termasuk
 * dalam daftar kata kasar.
 *
 * @param {string} normalizedToken - Kata yang sudah dinormalisasi
 * @returns {boolean} true jika kata termasuk badword
 */
function isBadword(normalizedToken) {
    return badwords.has(normalizedToken);
}

// =============================================================================
// Fungsi Pembantu: normalisasi satu token (hapus tanda baca di ujung kata)
// =============================================================================
/**
 * Membersihkan tanda baca di awal dan akhir token agar tidak mengganggu deteksi.
 * Mendukung karakter unicode multi-codepoint (seperti font matematis).
 * Contoh: "anjing!" → core="anjing", prefix="", suffix="!"
 *
 * @param {string} token - Token asli dari teks
 * @returns {{ prefix: string, core: string, suffix: string }}
 */
function splitToken(token) {
    // Regex yang mendukung karakter ASCII, latin extended, DAN unicode supplementary (emoji/font)
    // \p{L} = huruf unicode (Letter), \p{N} = angka unicode (Number)
    // Flag 'u' wajib untuk \p{} property escapes
    const match = token.match(/^([^\p{L}\p{N}]*)(.*?[\p{L}\p{N}].*?)([^\p{L}\p{N}]*)$/u);
    if (!match) return { prefix: '', core: token, suffix: '' };
    return { prefix: match[1], core: match[2], suffix: match[3] };
}

// =============================================================================
// Fungsi Utama: filterText
// =============================================================================
/**
 * Menerima teks input dan mengembalikan teks yang sama dengan kata kasar
 * dibungkus dengan **double asterisks**.
 *
 * Cara kerja:
 * 1. Pisahkan teks menjadi token (kata) berdasarkan spasi
 * 2. Untuk setiap token, pisahkan tanda baca di ujung (mendukung unicode)
 * 3. Normalisasi core token menggunakan pipeline normalize.js
 * 4. Cek apakah hasil normalisasi ada di daftar badwords
 * 5. Jika ya, bungkus token ASLI dengan **bold**
 * 6. Gabungkan kembali semua token
 *
 * @param {string} text - Teks input yang akan difilter
 * @returns {string} Teks dengan kata kasar dibold
 */
function filterText(text) {
    if (typeof text !== 'string') return '';

    // Pisahkan teks menjadi token, pertahankan spasi di antara token
    const tokens = text.split(/(\s+)/);

    const filtered = tokens.map(token => {
        // Jika token adalah whitespace, kembalikan apa adanya
        if (/^\s+$/.test(token)) return token;

        // Pisahkan tanda baca di ujung token (mendukung unicode supplementary)
        const { prefix, core, suffix } = splitToken(token);

        if (!core) return token;

        // Normalisasi core token untuk pengecekan
        // normalizeUnicode() menangani karakter seperti 𝙠𝙤𝙣𝙩𝙤𝙡, ｋｏｎｔｏｌ, ⓚⓞⓝⓣⓞⓛ
        const normalized = normalizeAll(core);

        // Cek apakah normalized version ada di badwords
        if (isBadword(normalized)) {
            // Bungkus token ASLI dengan bold (bukan yang sudah dinormalisasi)
            return `${prefix}**${core}**${suffix}`;
        }

        return token;
    });

    return filtered.join('');
}

// =============================================================================
// Fungsi Tambahan: filterTextStrict
// =============================================================================
/**
 * Versi lebih ketat dari filterText yang juga mengecek substring di dalam kata.
 * Berguna untuk mendeteksi kata kasar yang disambung dengan kata lain.
 * Contoh: "sianjing" → "si**anjing**" (belum sempurna, ini versi dasar)
 *
 * @param {string} text - Teks input
 * @returns {string} Teks dengan kata kasar dibold
 */
function filterTextStrict(text) {
    if (typeof text !== 'string') return '';

    const tokens = text.split(/(\s+)/);

    const filtered = tokens.map(token => {
        if (/^\s+$/.test(token)) return token;

        const { prefix, core, suffix } = splitToken(token);
        if (!core) return token;

        const normalized = normalizeAll(core);

        // Cek exact match terlebih dahulu
        if (isBadword(normalized)) {
            return `${prefix}**${core}**${suffix}`;
        }

        // Cek apakah normalized mengandung badword di dalamnya (substring check)
        for (const badword of badwords) {
            if (normalized.includes(badword) && badword.length >= 3) {
                return `${prefix}**${core}**${suffix}`;
            }
        }

        return token;
    });

    return filtered.join('');
}

module.exports = { filterText, filterTextStrict, isBadword };
