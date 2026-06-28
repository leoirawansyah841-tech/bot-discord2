const { runAllFilters } = require('../filters/messageFilter');

module.exports = {
    name: 'messageUpdate',
    execute(oldMessage, newMessage) {
        if (newMessage.author && newMessage.author.bot) return;

        // Discord sering kali menambahkan "Embeds" (link preview) beberapa detik
        // setelah pesan teks terkirim. Event ini menangkap momen tersebut.
        
        // Kumpulkan teks dari semua embed (title dan description)
        let embedText = '';
        if (newMessage.embeds && newMessage.embeds.length > 0) {
            for (const embed of newMessage.embeds) {
                if (embed.title) embedText += embed.title + ' ';
                if (embed.description) embedText += embed.description + ' ';
            }
        }

        // Jika ada teks di embed, buat pesan buatan (mock) untuk diperiksa filter
        if (embedText.trim().length > 0) {
            const mockMessage = {
                content: embedText,
                author: newMessage.author,
                channel: newMessage.channel,
                delete: () => newMessage.delete().catch(() => {}),
            };

            const filterResult = runAllFilters(mockMessage);
            if (!filterResult.isValid) {
                console.log(`[Embed Filter] Scam/Badword terdeteksi pada Link Preview dari ${newMessage.author.username}`);
            }
        }
    }
};
