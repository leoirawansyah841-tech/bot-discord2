const { ActivityType, REST, Routes } = require('discord.js');
const { voiceSessions } = require('../utils/database');

async function registerCommands(client) {
    const rest = new REST({ version: '10' }).setToken(process.env.TOKEN);
    const commandsData = client.commands.map(c => c.data.toJSON());
    try {
        // Daftarkan sebagai Guild Commands agar sinkronisasi instan (langsung muncul)
        await rest.put(Routes.applicationGuildCommands(client.user.id, process.env.GUILD_ID), { body: commandsData });
        
        // Daftarkan juga sebagai Global Commands (butuh hingga 1 jam untuk muncul di DM/server lain)
        await rest.put(Routes.applicationCommands(client.user.id), { body: commandsData });
        console.log('Slash commands berhasil didaftarkan (Guild & Global)');
    } catch (err) {
        console.error('Gagal daftarkan commands:', err);
    }
}

module.exports = {
    name: 'ready',
    once: true,
    async execute(client) {
        console.log(`${client.user.tag} online`);

        // Animasi status bot (Rotating Status)
        const activities = [
            { name: 'Music di Cozy Village 🎵', type: ActivityType.Listening },
            { name: 'Member ngobrol 🏡', type: ActivityType.Watching },
            { name: '/play untuk musik ✨', type: ActivityType.Playing }
        ];
        
        let i = 0;
        setInterval(() => {
            client.user.setPresence({
                activities: [activities[i % activities.length]],
                status: 'online'
            });
            i++;
        }, 10000); // Ganti status setiap 10 detik

        await registerCommands(client);

        // Scan semua voice channel — catat member yang sudah ada di VC sebelum bot nyala
        const guild = client.guilds.cache.get(process.env.GUILD_ID);
        if (guild) {
            guild.channels.cache
                .filter(ch => ch.isVoiceBased())
                .forEach(ch => {
                    ch.members.forEach(member => {
                        if (member.user.bot) return;
                        voiceSessions.set(member.id, Date.now());
                        console.log(`[Voice] Scan startup: ${member.user.username} sudah di VC`);
                    });
                });
        }
    }
};
