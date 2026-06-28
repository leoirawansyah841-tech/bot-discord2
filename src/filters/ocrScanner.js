const Tesseract = require('tesseract.js');
const { badWords, scamWords } = require('./bannedWords');
const { normalizeAll } = require('./normalize');

let workerPromise = null;

async function getWorker() {
    if (!workerPromise) {
        workerPromise = (async () => {
            const worker = await Tesseract.createWorker('ind');
            return worker;
        })();
    }
    return workerPromise;
}

/**
 * Memindai gambar menggunakan OCR (Optical Character Recognition) secara diam-diam.
 * Jika menemukan teks judi/scam, pesan aslinya akan dihapus.
 */
async function scanImageForScam(message) {
    if (!message.attachments || message.attachments.size === 0) return;

    // Ambil gambar pertama saja untuk menghindari spam pemindaian
    const imageAttachment = message.attachments.find(att => 
        att.contentType && att.contentType.startsWith('image/')
    );

    if (!imageAttachment) return;

    try {
        const worker = await getWorker();
        const { data: { text } } = await worker.recognize(imageAttachment.url);
        
        if (!text || text.trim().length === 0) return;

        const normalizedContent = normalizeAll(text).replace(/\s+/g, '');
        
        // Cek apakah ada scam/judi di dalam gambar
        const isScam = scamWords.some(phrase => {
            const normalizedPhrase = normalizeAll(phrase).replace(/\s+/g, '');
            return normalizedContent.includes(normalizedPhrase);
        });

        // Cek kata kasar dalam gambar
        const isBadWord = badWords.some(word => {
            const normalizedWord = normalizeAll(word).replace(/\s+/g, '');
            // Karena OCR kadang spasi acak, pengecekan tanpa spasi lebih aman
            return normalizedContent.includes(normalizedWord);
        });

        if (isScam || isBadWord) {
            message.delete().catch(() => {});
            message.channel.send(`🤖 **[AI Moderator]** 🛡️ Gambar dari ${message.author} telah diblokir otomatis karena terdeteksi mengandung konten penipuan/judi (Scam) atau kata-kata terlarang.`)
                .then(msg => setTimeout(() => msg.delete().catch(() => {}), 8000));
            console.log(`[OCR Filter] Menghapus gambar scam/badword dari ${message.author.username}`);
        }
    } catch (err) {
        console.error('[OCR Filter] Error saat memindai gambar:', err);
    }
}

module.exports = { scanImageForScam };
