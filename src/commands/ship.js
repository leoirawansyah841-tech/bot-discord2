const { SlashCommandBuilder, EmbedBuilder } = require('discord.js');

module.exports = {
    data: new SlashCommandBuilder()
        .setName('ship')
        .setDescription('Cek seberapa cocok kamu dengan seseorang! 💖')
        // Mendukung command muncul di profil dan bisa dipakai di mana saja (User App)
        .setIntegrationTypes([0, 1]) // 0: Guild, 1: User
        .setContexts([0, 1, 2]) // 0: Guild, 1: Bot DM, 2: Private Channel
        .addUserOption(option => 
            option.setName('target1')
                .setDescription('Orang pertama yang ingin dijodohkan')
                .setRequired(true))
        .addUserOption(option => 
            option.setName('target2')
                .setDescription('Orang kedua (opsional, jika dikosongkan = kamu yang dijodohkan)')
                .setRequired(false)),
    async execute(interaction) {
        const target1 = interaction.options.getUser('target1');
        const target2 = interaction.options.getUser('target2');

        // Jika target2 kosong, ship antara pemanggil (interaction.user) dan target1
        const user1 = target2 ? target1 : interaction.user;
        const user2 = target2 ? target2 : target1;

        if (user1.id === user2.id) {
            return interaction.reply({ content: '❌ Masa kamu nge-ship diri sendiri? Cari orang lain dong! 😅', flags: 64 });
        }

        // Generate persentase yang konsisten berdasarkan ID Discord
        // Jadi hasilnya tidak akan berubah-ubah jika orang yang di-ship sama
        const combinedIds = [user1.id, user2.id].sort().join('');
        let hash = 0;
        for (let i = 0; i < combinedIds.length; i++) {
            hash = (hash << 5) - hash + combinedIds.charCodeAt(i);
            hash = hash & hash;
        }
        
        const percentage = Math.abs(hash) % 101; // Angka 0 sampai 100
        
        // Buat Bar Hati
        let heartStr = '';
        const filled = Math.round(percentage / 10);
        for(let i = 0; i < 10; i++) {
            heartStr += (i < filled) ? '🟥' : '⬛';
        }

        let title = '';
        let color = '';
        if (percentage >= 90) { title = '💖 MATCH SEMPURNA! 💖'; color = '#FF0000'; }
        else if (percentage >= 70) { title = '💘 Sangat Cocok! 💘'; color = '#FF1493'; }
        else if (percentage >= 50) { title = '💗 Lumayan Cocok 💗'; color = '#FF69B4'; }
        else if (percentage >= 25) { title = '💔 Kurang Cocok 💔'; color = '#808080'; }
        else { title = '🖤 Sebaiknya Berteman Saja 🖤'; color = '#000000'; }

        const embed = new EmbedBuilder()
            .setColor(color)
            .setTitle(title)
            .setDescription(`**${user1.username}** 💞 **${user2.username}**\n\n**${percentage}%** \n${heartStr}`)
            .setFooter({ text: 'Kalkulator Cinta Guard Cozy' });
            
        await interaction.reply({ embeds: [embed] });
    },
};
