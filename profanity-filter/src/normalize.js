/**
 * normalize.js
 * Pipeline normalisasi teks berlapis untuk mendeteksi kata kasar yang disamarkan.
 * PENTING: Semua fungsi ini hanya digunakan untuk PENGECEKAN — output filter tetap menggunakan teks asli.
 */

// =============================================================================
// Peta karakter Unicode ke ASCII biasa
// Mencakup: bold, italic, fraktur, double-struck, circled, fullwidth, superscript, dll.
// =============================================================================
const UNICODE_MAP = {};

// Helper: isi map dari rentang unicode ke huruf ASCII
function fillMap(start, asciiStart, count) {
    for (let i = 0; i < count; i++) {
        UNICODE_MAP[String.fromCodePoint(start + i)] = String.fromCodePoint(asciiStart + i);
    }
}

// Mathematical Bold (𝐀-𝐙, 𝐚-𝐳)
fillMap(0x1D400, 65, 26); // A-Z
fillMap(0x1D41A, 97, 26); // a-z

// Mathematical Italic (𝐴-𝑍, 𝑎-𝑧)
fillMap(0x1D434, 65, 26);
fillMap(0x1D44E, 97, 26);

// Mathematical Bold Italic (𝑨-𝒁, 𝒂-𝒛)
fillMap(0x1D468, 65, 26);
fillMap(0x1D482, 97, 26);

// Mathematical Script (𝒜-𝒵, 𝒶-𝓏)
fillMap(0x1D49C, 65, 26);
fillMap(0x1D4B6, 97, 26);

// Mathematical Bold Script (𝓐-𝓩, 𝓪-𝔃)
fillMap(0x1D4D0, 65, 26);
fillMap(0x1D4EA, 97, 26);

// Mathematical Fraktur (𝔄-𝔜, 𝔞-𝔷)
fillMap(0x1D504, 65, 26);
fillMap(0x1D51E, 97, 26);

// Mathematical Double-Struck (𝔸-𝕐, 𝕒-𝕫)
fillMap(0x1D538, 65, 26);
fillMap(0x1D552, 97, 26);

// Mathematical Bold Fraktur (𝕬-𝖅, 𝖆-𝖟)
fillMap(0x1D56C, 65, 26);
fillMap(0x1D586, 97, 26);

// Mathematical Sans-Serif (𝖠-𝗓)
fillMap(0x1D5A0, 65, 26);
fillMap(0x1D5BA, 97, 26);

// Mathematical Sans-Serif Bold (𝗔-𝗭, 𝗮-𝘇)
fillMap(0x1D5D4, 65, 26);
fillMap(0x1D5EE, 97, 26);

// Mathematical Sans-Serif Italic (𝘈-𝘡, 𝘢-𝘻)
fillMap(0x1D608, 65, 26);
fillMap(0x1D622, 97, 26);

// Mathematical Sans-Serif Bold Italic (𝘼-𝙕, 𝙖-𝙯)
fillMap(0x1D63C, 65, 26);
fillMap(0x1D656, 97, 26);

// Mathematical Monospace (𝙰-𝚉, 𝚊-𝚣)
fillMap(0x1D670, 65, 26);
fillMap(0x1D68A, 97, 26);

// Fullwidth Latin (Ａ-Ｚ, ａ-ｚ)
fillMap(0xFF21, 65, 26);
fillMap(0xFF41, 97, 26);

// Circled Latin (Ⓐ-Ⓩ, ⓐ-ⓩ)
fillMap(0x24B6, 65, 26);
fillMap(0x24D0, 97, 26);

// Karakter superscript umum
const SUPERSCRIPT_MAP = {
    'ᵃ': 'a', 'ᵇ': 'b', 'ᶜ': 'c', 'ᵈ': 'd', 'ᵉ': 'e',
    'ᶠ': 'f', 'ᵍ': 'g', 'ʰ': 'h', 'ⁱ': 'i', 'ʲ': 'j',
    'ᵏ': 'k', 'ˡ': 'l', 'ᵐ': 'm', 'ⁿ': 'n', 'ᵒ': 'o',
    'ᵖ': 'p', 'ʳ': 'r', 'ˢ': 's', 'ᵗ': 't', 'ᵘ': 'u',
    'ᵛ': 'v', 'ʷ': 'w', 'ˣ': 'x', 'ʸ': 'y', 'ᶻ': 'z',
    'ᴬ': 'A', 'ᴮ': 'B', 'ᴰ': 'D', 'ᴱ': 'E', 'ᴳ': 'G',
    'ᴴ': 'H', 'ᴵ': 'I', 'ᴶ': 'J', 'ᴷ': 'K', 'ᴸ': 'L',
    'ᴹ': 'M', 'ᴺ': 'N', 'ᴼ': 'O', 'ᴾ': 'P', 'ᴿ': 'R',
    'ᵀ': 'T', 'ᵁ': 'U', 'ᵂ': 'W',
};

// Gabung superscript ke dalam map utama
Object.assign(UNICODE_MAP, SUPERSCRIPT_MAP);

// Karakter khusus lain yang sering digunakan untuk menyamarkan
const EXTRA_MAP = {
    'ø': 'o', 'Ø': 'o', 'ö': 'o', 'ó': 'o', 'ò': 'o', 'ô': 'o', 'õ': 'o',
    'à': 'a', 'á': 'a', 'â': 'a', 'ã': 'a', 'ä': 'a', 'å': 'a',
    'è': 'e', 'é': 'e', 'ê': 'e', 'ë': 'e',
    'ì': 'i', 'í': 'i', 'î': 'i', 'ï': 'i',
    'ù': 'u', 'ú': 'u', 'û': 'u', 'ü': 'u',
    'ñ': 'n', 'ç': 'c', 'ß': 'ss',
    '€': 'e', '£': 'l', '¥': 'y',
};

Object.assign(UNICODE_MAP, EXTRA_MAP);

// =============================================================================
// Peta Leetspeak ke huruf normal
// =============================================================================
const LEET_MAP = {
    '0': 'o',
    '1': 'i',
    '3': 'e',
    '4': 'a',
    '5': 's',
    '7': 't',
    '8': 'b',
    '@': 'a',
    '$': 's',
    '!': 'i',
    '+': 't',
    '|': 'i',
    '<': 'c',
    '(': 'c',
    '{': 'c',
    '[': 'c',
    '#': 'h',
    '&': 'and',
    '%': 'x',
};

// =============================================================================
// 1. normalizeUnicode — Konversi karakter unicode font ke ASCII biasa
// =============================================================================
/**
 * Mengkonversi karakter unicode dekoratif (bold, italic, fraktur, fullwidth,
 * circled, superscript, dll) menjadi huruf ASCII standar.
 * Contoh: 𝙠𝙤𝙣𝙩𝙤𝙡 → kontol, ｋｏｎｔｏｌ → kontol, ⓚⓞⓝⓣⓞⓛ → kontol
 *
 * @param {string} text - Teks input
 * @returns {string} Teks dengan karakter unicode dikonversi ke ASCII
 */
function normalizeUnicode(text) {
    return [...text].map(char => UNICODE_MAP[char] || char).join('');
}

// =============================================================================
// 2. normalizeLeet — Konversi leetspeak ke huruf normal
// =============================================================================
/**
 * Mengkonversi karakter leetspeak umum ke huruf biasa.
 * Contoh: g0bl0k → goblok, sh1t → shit, @njing → anjing
 *
 * @param {string} text - Teks input
 * @returns {string} Teks dengan leetspeak dikonversi
 */
function normalizeLeet(text) {
    return [...text].map(char => LEET_MAP[char] !== undefined ? LEET_MAP[char] : char).join('');
}

// =============================================================================
// 3. stripInserts — Hapus karakter sisipan di antara huruf
// =============================================================================
/**
 * Menghapus karakter pemisah yang disisipkan di antara huruf untuk menyamarkan kata.
 * Pola yang ditangani: a.n.j.i.n.g, k-o-n-t-o-l, a_n_j_i_n_g, a n j i n g
 * Cara kerja: jika karakter non-huruf diapit oleh dua huruf (dengan pola 1 huruf - separator - 1 huruf),
 * maka separator dihapus.
 *
 * @param {string} text - Teks input
 * @returns {string} Teks dengan sisipan dihapus
 */
function stripInserts(text) {
    // Hapus pola: satu huruf, diikuti separator, diikuti satu huruf (berulang)
    // Ini menangani: a.n.j.i.n.g → anjing
    let result = text.replace(/([a-z])[.\-_ ](?=[a-z])/gi, '$1');
    // Ulangi sampai tidak ada perubahan (untuk pola bertingkat)
    let prev;
    do {
        prev = result;
        result = result.replace(/([a-z])[.\-_ ](?=[a-z])/gi, '$1');
    } while (result !== prev);
    return result;
}

// =============================================================================
// 4. removeDuplicates — Hapus huruf yang berulang berlebihan
// =============================================================================
/**
 * Mengurangi huruf yang diulang lebih dari dua kali menjadi satu huruf.
 * Contoh: anjinnng → anjing, fuuuuck → fuk → (leet) → fuck
 * Catatan: pengurangan ke 1 huruf agar cocok dengan kata di badwords list.
 *
 * @param {string} text - Teks input
 * @returns {string} Teks dengan huruf berulang dikurangi
 */
function removeDuplicates(text) {
    // Ganti 3+ huruf berulang menjadi 1 huruf
    return text.replace(/([a-z])\1{2,}/gi, '$1');
}

// =============================================================================
// 5. normalizeSoundalike — Konversi bunyi yang mirip
// =============================================================================
/**
 * Mengkonversi kombinasi huruf yang bunyinya mirip ke bentuk standar.
 * Contoh: phuck → fuck, ck → k (sehingga phuck → fuk cocok dengan normalisasi leet)
 *
 * @param {string} text - Teks input
 * @returns {string} Teks dengan bunyi mirip distandarisasi
 */
function normalizeSoundalike(text) {
    return text
        .replace(/ph/gi, 'f')     // phuck → fuck
        .replace(/ck/gi, 'k')     // cock → cok → cok
        .replace(/nk/gi, 'ng')    // nk → ng (bahasa Indonesia)
        .replace(/qu/gi, 'k')     // quontol → kontol
        .replace(/x/gi, 'ks')     // sex → seks
        .replace(/z/gi, 's')      // bangzat → bangsat
        .replace(/v/gi, 'f');     // vuck → fuck
}

// =============================================================================
// Pipeline Utama: normalizeAll
// =============================================================================
/**
 * Menjalankan semua tahap normalisasi secara berurutan pada sebuah kata/teks.
 * Urutan: unicode → leet → strip inserts → remove duplicates → soundalike → lowercase
 *
 * @param {string} text - Teks input
 * @returns {string} Teks yang sudah dinormalisasi sepenuhnya
 */
function normalizeAll(text) {
    let result = text;
    result = normalizeUnicode(result);
    result = normalizeLeet(result);
    result = stripInserts(result);
    result = removeDuplicates(result);
    result = normalizeSoundalike(result);
    result = result.toLowerCase();
    return result;
}

module.exports = {
    normalizeUnicode,
    normalizeLeet,
    stripInserts,
    removeDuplicates,
    normalizeSoundalike,
    normalizeAll,
};
