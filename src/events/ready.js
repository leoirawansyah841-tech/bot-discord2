const { ActivityType, REST, Routes } = require('discord.js');
const { joinVoiceChannel, entersState, VoiceConnectionStatus } = require('@discordjs/voice');
const { voiceSessions } = require('../utils/database');

let connection;

function connectVC(client) {
    const guild = client.guilds.cache.get(process.env.GUILD_ID);
    if (!guild) return console.log('Guild tidak ditemukan');

    const channel = guild.channels.cache.get(process.env.VOICE_CHANNEL_ID);
    if (!channel) return console.log('Voice channel tidak ditemukan');

    connection = joinVoiceChannel({
        channelId: channel.id,
        guildId: guild.id,
        adapterCreator: guild.voiceAdapterCreator,
        selfDeaf: false,
        selfMute: false
    });

    console.log('Bot masuk VC');

    connection.on('stateChange', async (_, newState) => {
        if (newState.status === VoiceConnectionStatus.Disconnected) {
            console.log('Bot disconnect, reconnecting...');
            try {
                await entersState(connection, VoiceConnectionStatus.Signalling, 5_000);
            } catch {
                connection.destroy();
                setTimeout(() => connectVC(client), 3000);
            }
        }
    });
}

async function registerCommands(client) {
    const rest = new REST({ version: '10' }).setToken(process.env.TOKEN);
    const commandsData = client.commands.map(c => c.data.toJSON());
    try {
        await rest.put(Routes.applicationGuildCommands(client.user.id, process.env.GUILD_ID), { body: commandsData });
        console.log('Slash commands berhasil didaftarkan');
    } catch (err) {
        console.error('Gagal daftarkan commands:', err);
    }
}

module.exports = {
    name: 'ready',
    once: true,
    async execute(client) {
        console.log(`${client.user.tag} online`);

        client.user.setPresence({
            activities: [{ name: '24/7 Voice', type: ActivityType.Watching }],
            status: 'online'
        });

        await registerCommands(client);
        connectVC(client);

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

        setInterval(() => {
            if (!connection) connectVC(client);
        }, 30000);
    }
};
