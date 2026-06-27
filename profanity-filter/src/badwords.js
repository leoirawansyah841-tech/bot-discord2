/**
 * badwords.js
 * Daftar kata kasar dalam Bahasa Indonesia dan Bahasa Inggris.
 * 
 * CATATAN PENTING:
 * - Daftar ini hanya berisi kata dalam bentuk DASAR/NORMAL (sudah dinormalisasi).
 * - Variasi leetspeak, unicode, dan sisipan TIDAK perlu dicantumkan di sini
 *   karena sudah ditangani oleh pipeline normalize.js.
 * - Namun beberapa variasi ejaan/plesetan umum tetap disertakan untuk keamanan ekstra.
 */

const badwords = new Set([

    // =========================================================================
    // BAHASA INDONESIA - Kata Hewan (sebagai hinaan)
    // =========================================================================
    'anjing', 'anj', 'njing', 'anjg', 'ajg', 'njg',
    'anying', 'anjeng', 'anjir', 'anjrit', 'anjay',
    'babi', 'celeng',
    'asu', 'asyu',
    'monyet', 'mnyt', 'kunyuk',
    'bajing',
    'dancuk', 'dancok', 'jancok', 'jancuk', 'jnck',
    'cuki', 'cukimai', 'cukimay',

    // =========================================================================
    // BAHASA INDONESIA - Kotoran / Jorok
    // =========================================================================
    'tai', 'taik', 'tokai', 'eeq',
    'pantek', 'kampret', 'ngehe',
    'bangke', 'bangkai',
    'setan', 'syetan', 'iblis',
    'keparat', 'kprt',
    'sialan', 'sial',
    'bajingan', 'bjngn',
    'brengsek',
    'kurang ajar', 'kurangajar',
    'bedebah',
    'bajigur',
    'kampang',
    'sontoloyo',
    'sempak',

    // =========================================================================
    // BAHASA INDONESIA - Alat Kelamin / Seksual
    // =========================================================================
    'kontol', 'kntl', 'ntol',
    'peler', 'pler', 'biji', 'titit',
    'puki', 'pukimak', 'kimak',
    'memek', 'mmk', 'pepek', 'ppk', 'itil',
    'jembut', 'jmbt', 'jembot',
    'tetek', 'toket', 'ttk',
    'ngaceng',
    'susu',

    // =========================================================================
    // BAHASA INDONESIA - Aktivitas Seksual
    // =========================================================================
    'ngentot', 'ngntot', 'ngentd', 'ngntd', 'ngtd',
    'ngewe', 'ngwe', 'ngw', 'ewean', 'kenthu',
    'colmek', 'coli', 'sange', 'sangean',
    'githok', 'entot',
    'ranjang',

    // =========================================================================
    // BAHASA INDONESIA - Profesi Kasar / Hinaan Umum
    // =========================================================================
    'perek', 'prk', 'lonte', 'lont',
    'sundel', 'sundal', 'jablay', 'jbly',
    'pelacur', 'openbo',
    'bangsat', 'bgst', 'bgsat', 'bngst',
    'tolol', 'tll',
    'goblok', 'gblk', 'goblog',
    'bego', 'dungu',
    'idiot', 'bodoh', 'geblek', 'pekok',
    'gila', 'gilak', 'edan',
    'kafir',
    'mampus', 'mampos',
    'gajelas',
    'kadrun', 'cebong', // hinaan politik
    'bangsat',
    'keparat',
    'sialan',

    // =========================================================================
    // BAHASA INGGRIS - Umum
    // =========================================================================
    'fuck', 'fck', 'fucker', 'fucking', 'motherfucker',
    'mf', 'mfs', 'fuk', 'fvck', 'phuck', 'effing',
    'shit', 'bullshit', 'shitty', 'sht', 'shyt',
    'bitch', 'bitches', 'sonofabitch', 'btch', 'biatch',
    'ass', 'asshole', 'dumbass', 'jackass', 'smartass',
    'dick', 'dickhead', 'dik',
    'cock', 'cocksucker', 'kock',
    'penis', 'vagina', 'vag',
    'pussy', 'pvssy',
    'cunt', 'kunt', 'cvnt',
    'slut', 'slvt',
    'whore', 'hooker',
    'bastard', 'bstrd',
    'damn', 'dammit', 'goddamn',
    'crap',
    'piss', 'pissed',
    'hell',
    'wtf', 'stfu', 'gtfo', 'kys',
    'moron', 'dumb', 'stupid',
    'loser', 'luser',
    'jerk', 'jackass',

    // =========================================================================
    // BAHASA INGGRIS - Slur Diskriminatif
    // =========================================================================
    'nigger', 'nigga', 'nig',
    'faggot', 'fag',
    'retard', 'retarded',
    'chink', 'spic',
    'twat', 'wanker',
    'kike', 'wetback', 'cracker', 'honky',

    // =========================================================================
    // Gabungan / Slang Internet
    // =========================================================================
    'wtaf', 'omfg', 'gtfoh',
]);

module.exports = badwords;
