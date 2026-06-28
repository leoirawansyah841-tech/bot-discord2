const { runAllFilters } = require('../filters/messageFilter');
const { loadChat, saveChat } = require('../utils/database');

module.exports = {
    name: 'messageCreate',
    execute(message, client) {
        if (message.author.bot) return;

        // Jalankan semua filter (Font, Scam, Kasar, Gibberish)
        const filterResult = runAllFilters(message);

        // Jika terdeteksi spam/scam/kata kasar, fungsi runAllFilters akan otomatis 
        // menghapus pesan dan mengirim peringatan.
        if (!filterResult.isValid) return;

        // Jika pesan lolos filter, tapi dianggap spam acak (gibberish), 
        // kita tidak kasih poin, tapi pesan tidak dihapus
        if (!filterResult.shouldCount) return;

        // Jika semuanya aman, catat poin ke chat leaderboard
        const userId = message.author.id;
        const username = message.author.username;

        const chatData = loadChat();
        if (!chatData[userId]) chatData[userId] = { username, count: 0 };
        chatData[userId].count += 1;
        chatData[userId].username = username;
        saveChat(chatData);
    }
};
