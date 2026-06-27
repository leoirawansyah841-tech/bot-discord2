/**
 * test/test.js
 * Pengujian profanity-filter untuk berbagai kasus.
 * Jalankan dengan: node test/test.js
 */

const { filterText, filterTextStrict, normalizeAll } = require('../index');

// =============================================================================
// Helper: tampilkan hasil test dengan format yang rapi
// =============================================================================
let passed = 0;
let failed = 0;

function runTest(description, input, expectBold) {
    const result = filterText(input);
    const hasBold = result.includes('**');

    // expectBold: true jika kita mengharapkan ada kata yang dibold
    const success = hasBold === expectBold;

    if (success) {
        passed++;
        console.log(`  ✅ PASS: ${description}`);
    } else {
        failed++;
        console.log(`  ❌ FAIL: ${description}`);
        console.log(`     Input  : ${input}`);
        console.log(`     Output : ${result}`);
        console.log(`     Expect : ${expectBold ? 'ada bold' : 'tidak ada bold'}`);
    }
}

function showResult(description, input) {
    const result = filterText(input);
    console.log(`  📝 ${description}`);
    console.log(`     Input  : ${input}`);
    console.log(`     Output : ${result}`);
    console.log(`     Normalize: ${normalizeAll(input)}`);
    console.log('');
}

// =============================================================================
// SECTION 1: Kata Kasar Biasa (tanpa penyamaran)
// =============================================================================
console.log('\n========================================');
console.log('  SECTION 1: Kata Kasar Biasa');
console.log('========================================\n');

showResult('Kata kasar Indonesia', 'Kamu itu anjing banget sih');
showResult('Kata kasar Indonesia 2', 'Dasar goblok, gak bisa mikir');
showResult('Kata kasar Inggris', 'What the fuck is wrong with you');
showResult('Kata kasar campuran', 'Lo tuh brengsek parah, shit banget');
showResult('Kalimat bersih (tidak ada kata kasar)', 'Selamat pagi, apa kabar hari ini?');

runTest('Deteksi "anjing"', 'kamu anjing', true);
runTest('Deteksi "goblok"', 'lo goblok banget', true);
runTest('Deteksi "fuck"', 'what the fuck', true);
runTest('Deteksi "shit"', 'oh shit no', true);
runTest('Kalimat bersih', 'halo apa kabar', false);

// =============================================================================
// SECTION 2: Leetspeak
// =============================================================================
console.log('\n========================================');
console.log('  SECTION 2: Leetspeak');
console.log('========================================\n');

showResult('Leetspeak g0bl0k', 'dasar g0bl0k kamu');
showResult('Leetspeak sh1t', 'oh sh1t man');
showResult('Leetspeak @njing', 'dasar @njing kamu');
showResult('Leetspeak kont0l', 'mana kont0l mu');
showResult('Leetspeak 4njing', 'lo tuh 4njing');

runTest('Deteksi leetspeak "g0bl0k"', 'dasar g0bl0k', true);
runTest('Deteksi leetspeak "sh1t"', 'oh sh1t', true);
runTest('Deteksi leetspeak "@njing"', 'dasar @njing', true);
runTest('Deteksi leetspeak "f4ggot"', 'f4ggot', true);

// =============================================================================
// SECTION 3: Unicode Font
// =============================================================================
console.log('\n========================================');
console.log('  SECTION 3: Unicode Font');
console.log('========================================\n');

showResult('Unicode bold 𝙠𝙤𝙣𝙩𝙤𝙡', 'dasar 𝙠𝙤𝙣𝙩𝙤𝙡 kamu');
showResult('Unicode italic 𝑓𝑢𝑐𝑘', 'oh 𝑓𝑢𝑐𝑘 no');
showResult('Fullwidth ｋｏｎｔｏｌ', 'mana ｋｏｎｔｏｌ mu');
showResult('Circled ⓚⓞⓝⓣⓞⓛ', 'ⓚⓞⓝⓣⓞⓛ banget');
showResult('Fraktur 𝔣𝔲𝔠𝔨', 'wtf is 𝔣𝔲𝔠𝔨 this');

runTest('Deteksi unicode "𝙠𝙤𝙣𝙩𝙤𝙡"', '𝙠𝙤𝙣𝙩𝙤𝙡', true);
runTest('Deteksi unicode "𝑓𝑢𝑐𝑘"', 'oh 𝑓𝑢𝑐𝑘', true);
runTest('Deteksi fullwidth "ｋｏｎｔｏｌ"', 'ｋｏｎｔｏｌ', true);

// =============================================================================
// SECTION 4: Karakter Sisipan
// =============================================================================
console.log('\n========================================');
console.log('  SECTION 4: Karakter Sisipan');
console.log('========================================\n');

showResult('Sisipan titik a.n.j.i.n.g', 'kamu a.n.j.i.n.g');
showResult('Sisipan strip k-o-n-t-o-l', 'mana k-o-n-t-o-l mu');
showResult('Sisipan underscore g_o_b_l_o_k', 'dasar g_o_b_l_o_k');
showResult('Sisipan spasi f u c k', 'wtf is f u c k');
showResult('Sisipan campuran a.n-j_i.n.g', 'a.n-j_i.n.g banget');

runTest('Deteksi sisipan "a.n.j.i.n.g"', 'a.n.j.i.n.g', true);
runTest('Deteksi sisipan "k-o-n-t-o-l"', 'k-o-n-t-o-l', true);

// =============================================================================
// SECTION 5: Huruf Berulang
// =============================================================================
console.log('\n========================================');
console.log('  SECTION 5: Huruf Berulang');
console.log('========================================\n');

showResult('Huruf berulang anjinnng', 'kamu itu anjinnng');
showResult('Huruf berulang goooblooook', 'dasar goooblooook');
showResult('Huruf berulang fuuuuck', 'oh fuuuuck no');
showResult('Huruf berulang shiiiiit', 'shiiiiit that hurts');

runTest('Deteksi berulang "anjinnng"', 'anjinnng', true);
runTest('Deteksi berulang "gooooblok"', 'gooooblok', true);
runTest('Deteksi berulang "fuuuuck"', 'fuuuuck', true);

// =============================================================================
// SECTION 6: Kombinasi Penyamaran
// =============================================================================
console.log('\n========================================');
console.log('  SECTION 6: Kombinasi (Mixed Obfuscation)');
console.log('========================================\n');

showResult('Leet + berulang g0bl00k', 'dasar g0bl00k banget');
showResult('Sisipan + unicode 𝙠.𝙤.𝙣.𝙩.𝙤.𝙡', '𝙠.𝙤.𝙣.𝙩.𝙤.𝙡 kamu');
showResult('Leet + sisipan @.n.j.1.n.g', '@.n.j.1.n.g banget');

// =============================================================================
// SECTION 7: Kalimat Campuran Nyata
// =============================================================================
console.log('\n========================================');
console.log('  SECTION 7: Kalimat Campuran Nyata');
console.log('========================================\n');

showResult('Kalimat campuran 1', 'Hei, kamu itu anjing banget tahu tidak? Gue gak suka sama kamu.');
showResult('Kalimat campuran 2', 'Bisa tolong bantu saya? Saya tidak mengerti cara menggunakan fitur ini.');
showResult('Kalimat campuran 3', 'Dasar g0bl0k! Kalau mau marah bilang yang bener dong, jangan ngentot melulu.');
showResult('Kalimat campuran 4', 'Hai semuanya! Selamat datang di server ini. Tolong jaga kata-kata ya.');

// =============================================================================
// RINGKASAN HASIL TEST
// =============================================================================
console.log('\n========================================');
console.log('  RINGKASAN HASIL TEST');
console.log('========================================');
console.log(`  ✅ Lulus  : ${passed}`);
console.log(`  ❌ Gagal  : ${failed}`);
console.log(`  📊 Total  : ${passed + failed}`);
console.log(`  📈 Skor   : ${Math.round((passed / (passed + failed)) * 100)}%`);
console.log('========================================\n');
