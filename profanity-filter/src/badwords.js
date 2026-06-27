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
    'babi', 'celeng', 'babik',
    'asu', 'asyu', 'asuuu',
    'monyet', 'mnyt', 'kunyuk', 'monyong',
    'bajing',
    'dancuk', 'dancok', 'jancok', 'jancuk', 'jnck',
    'cuki', 'cukimai', 'cukimay',
    'bangkai', 'bangke',
    'kadal', 'kecoa', 'tikus', 'buaya', // hinaan

    // =========================================================================
    // BAHASA INDONESIA - Kotoran / Jorok
    // =========================================================================
    'tai', 'taik', 'tokai', 'eeq', 'taimu',
    'tai kucing', 'taikucing',
    'pantek', 'kampret', 'ngehe',
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
    'laknat', 'terkutuk', 'durjana',
    'biadab',
    'mampus', 'mampos',
    'mati kau', 'matikau',
    'oon', 'ooon',
    'najis', 'jorok',

    // =========================================================================
    // BAHASA INDONESIA - Alat Kelamin / Seksual
    // =========================================================================
    'kontol', 'kntl', 'ntol', 'kontl',
    'peler', 'pler', 'biji', 'titit', 'tiit',
    'puki', 'pukimak', 'kimak',
    'memek', 'mmk', 'mek', 'pepek', 'ppk', 'itil',
    'jembut', 'jmbt', 'jembot',
    'tetek', 'toket', 'ttk',
    'ngaceng', 'ngacer',
    'susu',
    'bokong', 'pantat', 'bokep', 'porno',
    'dubur', 'anus',
    'mesum', 'bugil', 'telanjang',
    'vagina', 'vulva', 'klitoris', 'kemaluan',

    // =========================================================================
    // BAHASA INDONESIA - Aktivitas Seksual
    // =========================================================================
    'ngentot', 'ngntot', 'ngentd', 'ngntd', 'ngtd',
    'ngewe', 'ngwe', 'ngw', 'ewean', 'kenthu',
    'colmek', 'coli', 'sange', 'sangean',
    'githok', 'entot',
    'ranjang',
    'perkosa', 'memperkosa', 'pemerkosaan',
    'cabul', 'pencabulan',
    'onani', 'masturbasi',
    'ml', 'ewe', 'ewein', 'diewe',
    'ngocok', 'bokep',
    'blowjob', 'handjob', 'oral',
    'sexting',

    // =========================================================================
    // BAHASA INDONESIA - Profesi Kasar / Hinaan Umum
    // =========================================================================
    'perek', 'prk', 'lonte', 'lont',
    'sundel', 'sundal', 'jablay', 'jbly',
    'pelacur', 'openbo', 'psk',
    'bangsat', 'bgst', 'bgsat', 'bngst',
    'tolol', 'tll',
    'goblok', 'gblk', 'goblog',
    'bego', 'dungu',
    'idiot', 'bodoh', 'geblek', 'pekok',
    'gila', 'gilak', 'edan',
    'kafir',
    'mampus', 'mampos',
    'gajelas', 'ga jelas', 'gajls',
    'kadrun', 'cebong', // hinaan politik
    'bloon', 'dongo', 'dodol', 'dongok',
    'kampungan', 'norak', 'barbar', 'primitif',
    'pengecut', 'pengkhianat', 'munafik', 'penipu',
    'bajingan', 'preman', 'berandal', 'brandal', 'garong',
    'bejat', 'terlaknat', 'pecundang',
    'kutu kupret',
    'dasar anjing', 'dasar babi', 'dasar goblok',
    'dasar tolol', 'dasar bangsat', 'dasar brengsek',
    'dasar hewan', 'dasar binatang', 'dasar pecundang',
    'gapunya otak', 'ga punya otak',
    'otakmu dimana', 'otak lo kemana',
    'gabisa mikir', 'ga bisa mikir',
    'goblog banget', 'goblok banget', 'bego banget',
    'tolol banget', 'bodoh banget',

    // =========================================================================
    // BAHASA INDONESIA - Hinaan SARA (Ras / Suku / Agama)
    // =========================================================================
    'kafir laknat', 'kafir bangsat',
    'china babi', 'cina babi',
    'pribumi babi', 'jawa babi', 'batak babi',
    'sunda babi', 'melayu babi', 'ambon babi', 'papua babi',
    'anjing cina', 'anjing china', 'anjing kafir',

    // =========================================================================
    // BAHASA JAWA / DAERAH - Kata Kasar
    // =========================================================================
    'asem', 'cuk', 'cok',
    'matamu', 'mbahmu',
    'ndasmu', 'ndas', 'matane', 'ndhasmu',
    'pukimon',
    'nggapleki', 'kejet',
    'kirik', 'reang', 'jebret',
    'gendheng', 'edan tenan',
    'setan alas', 'gableg',
    'gemblung', 'geblung', 'kenthir', 'kluthuk',
    'goblog tenan', 'bejad',
    'semprul', 'dhiancuk',
    'wedhus', // kambing (hinaan)
    'pejwan', // slang jawa seksual

    // =========================================================================
    // BAHASA SUNDA - Kata Kasar
    // =========================================================================
    'belegug', 'beleguguh',
    'sia', 'maneh', 'maneh goblog',
    'kepret', 'belang',

    // =========================================================================
    // BAHASA INGGRIS - Umum
    // =========================================================================
    'fuck', 'fck', 'fucker', 'fucking', 'motherfucker',
    'mf', 'mfs', 'fuk', 'fvck', 'phuck', 'effing',
    'shit', 'bullshit', 'shitty', 'sht', 'shyt',
    'shithole', 'shithead', 'dipshit', 'shitfaced',
    'bitch', 'bitches', 'sonofabitch', 'btch', 'biatch',
    'ass', 'asshole', 'dumbass', 'jackass', 'smartass',
    'asshat', 'assclown', 'ass licker', 'asslicker', 'ass kisser', 'asskisser',
    'dick', 'dickhead', 'dik',
    'cock', 'cocksucker', 'kock', 'cockwomble',
    'penis', 'vagina', 'vag',
    'pussy', 'pvssy',
    'cunt', 'kunt', 'cvnt',
    'slut', 'slvt',
    'whore', 'hooker', 'prostitute',
    'bastard', 'bstrd',
    'damn', 'dammit', 'goddamn', 'goddammit',
    'crap', 'crappy', 'bullcrap',
    'piss', 'pissed', 'pissoff', 'pisser',
    'hell',
    'wtf', 'stfu', 'gtfo', 'kys', 'kms',
    'moron', 'dumb', 'stupid',
    'loser', 'luser',
    'jerk', 'jackass',
    'scumbag', 'douchebag', 'douche',
    'fuckhead', 'fuckface', 'fuckwit', 'fuckboy', 'fuckboi', 'fucknugget',
    'butthead', 'butt', 'turd',
    'twit', 'git', 'numpty', 'muppet',
    'prick', 'prik', 'schmuck',
    'weirdo', 'creep', 'perv', 'pervert',
    'suck', 'sucks',
    'blow me', 'kiss my ass', 'eat shit',
    'go to hell', 'get fucked', 'drop dead',
    'die bitch', 'kill you',
    'dumbfuck', 'dumb fuck',
    'jackoff', 'wank', 'wanking',
    'cum', 'cumshot', 'cumming', 'jizz', 'sperm', 'semen',
    'horny', 'horndog',
    'sex', 'sexy', 'sexting',
    'rape', 'rapist', 'molest', 'molester',
    'pedophile', 'pedo',
    'porn', 'porno', 'pornography',
    'nude', 'nudes', 'naked',
    'tits', 'boobs', 'boob', 'boobies',
    'nipple', 'nipples',
    'balls', 'testicle', 'testicles',
    'boner', 'erection',
    'dildo', 'vibrator',
    'orgasm', 'fetish', 'kinky',
    'intercourse', 'fornicate', 'fornication',
    'sodomy', 'incest', 'bestiality',
    'handjob', 'blowjob', 'rimjob',
    'threesome', 'gangbang',
    'masturbate', 'masturbation',
    'nsfw',
    'twatwaffle', 'shitgibbon', 'assmonger', 'bellend',

    // =========================================================================
    // BAHASA INGGRIS - Slur Diskriminatif
    // =========================================================================
    'nigger', 'nigga', 'nig',
    'faggot', 'fag',
    'retard', 'retarded',
    'chink', 'spic',
    'twat', 'wanker',
    'kike', 'wetback', 'cracker', 'honky',
    'gook', 'slope', 'beaner',
    'tranny', 'trannie', 'dyke', 'lesbo',
    'homo',
    'nazi',
    'kkk',
    'raghead', 'towelhead', 'camel jockey',
    'zipperhead', 'jungle bunny', 'porch monkey',
    'sand nigger', 'coon', 'darkie',
    'guido', 'wop', 'mick', 'kraut',

    // =========================================================================
    // Gabungan / Slang Internet
    // =========================================================================
    'wtaf', 'omfg', 'gtfoh',
    'stfuu', 'kyss',
    'trash', 'garbage',
    'noob', 'n00b', 'nub',
    'toxic', 'troll', 'hater',
    'simp', 'simping', 'incel',
    'neckbeard',
    'cope', 'mald', 'malding',
    'ratio',
    'thot', 'hoe', 'skank', 'tramp',
    'jezebel', 'strumpet',
    'attention whore', 'clout chaser',

    // =========================================================================
    // CAMPURAN BAHASA GAUL / SLANG INDONESIA MODERN
    // =========================================================================
    'goblok lo', 'tolol lo', 'bodoh lo', 'bego lo',
    'anjing lo', 'bangsat lo', 'brengsek lo', 'keparat lo', 'sialan lo',
    'lu goblok', 'lu tolol', 'lu bodoh', 'lu anjing', 'lu babi',
    'lo brengsek', 'lo bangsat',
    'brengsek kau', 'goblok kau', 'tolol kau', 'anjing kau',
    'binatang lo', 'hewan lo',
    'tukang bohong', 'pembohong',
    'maling', 'koruptor', 'calonkoruptor',
    'bajingan ternak',
    'oon berat',

    // =========================================================================
    // KATA ANCAMAN / KEKERASAN
    // =========================================================================
    'bunuh lo', 'bunuhlo',
    'aku bunuh lo', 'gue bunuh lo',
    'mau gue bunuh', 'bakalan mati lo',
    'matiin lo', 'hajar lo',
    'tonjok lo', 'tonjokin lo',
    'pukul lo', 'pukulin lo',
    'tampar lo', 'habisin lo',
    'musnahin lo', 'gebuk lo', 'gebukin lo',
    'aku sikat lo', 'gue sikat lo', 'gue habisi lo',
    'kill you', 'kill myself', 'killyourself', 'kill yourself',
    'go die', 'godie', 'die bitch',
    'i will kill you',
]);

module.exports = badwords;
