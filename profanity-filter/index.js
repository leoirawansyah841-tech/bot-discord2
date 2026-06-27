/**
 * index.js
 * Entry point profanity-filter module.
 * Export semua fungsi yang dibutuhkan untuk digunakan dari luar.
 */

const { filterText, filterTextStrict, isBadword } = require('./src/filter');
const { normalizeAll, normalizeUnicode, normalizeLeet, stripInserts, removeDuplicates, normalizeSoundalike } = require('./src/normalize');
const badwords = require('./src/badwords');

module.exports = {
    // Fungsi utama
    filterText,
    filterTextStrict,
    isBadword,

    // Fungsi normalisasi (bisa dipakai sendiri-sendiri jika perlu)
    normalizeAll,
    normalizeUnicode,
    normalizeLeet,
    stripInserts,
    removeDuplicates,
    normalizeSoundalike,

    // Daftar kata kasar (Set)
    badwords,
};
