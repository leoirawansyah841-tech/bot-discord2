const { EmbedBuilder, ActionRowBuilder, ButtonBuilder, ButtonStyle } = require('discord.js');

module.exports = (player) => {
    player.events.on('playerStart', async (queue, track) => {
        // Hapus pesan "Now Playing" sebelumnya jika ada, agar chat tidak spam
        if (queue.metadata.nowPlayingMessage) {
            queue.metadata.nowPlayingMessage.delete().catch(() => {});
        }

        const embed = new EmbedBuilder()
            .setColor('#2B2D31')
            .setAuthor({ name: 'Now Playing 🎵' })
            .setTitle(track.title)
            .setURL(track.url)
            .setDescription(`Oleh **${track.author}** | Diminta oleh <@${queue.metadata.requestedBy?.id}>`)
            .setImage(track.thumbnail || null)
            .setFooter({ text: 'Music Player System' });

        const row = new ActionRowBuilder().addComponents(
            new ButtonBuilder()
                .setCustomId('music_back')
                .setEmoji('⏮️')
                .setLabel('Back')
                .setStyle(ButtonStyle.Secondary),
            new ButtonBuilder()
                .setCustomId('music_pause')
                .setEmoji('⏸️')
                .setLabel('Pause')
                .setStyle(ButtonStyle.Secondary),
            new ButtonBuilder()
                .setCustomId('music_skip')
                .setEmoji('⏭️')
                .setLabel('Skip')
                .setStyle(ButtonStyle.Secondary),
            new ButtonBuilder()
                .setCustomId('music_bass')
                .setEmoji('🔊')
                .setLabel('Bass')
                .setStyle(ButtonStyle.Primary),
            new ButtonBuilder()
                .setCustomId('music_leave')
                .setEmoji('🚪')
                .setLabel('Leave')
                .setStyle(ButtonStyle.Danger)
        );

        const msg = await queue.metadata.channel.send({ embeds: [embed], components: [row] });
        queue.metadata.nowPlayingMessage = msg;
    });

    player.events.on('audioTrackAdd', (queue, track) => {
        // Karena command /play sudah mengirimkan balasan "Berhasil menambahkan",
        // kita tidak perlu mengirim pesan lagi di sini untuk menghindari spam (kecuali playlist).
        // Biarkan kosong atau hanya log ke console.
        console.log(`[Queue] Added: ${track.title}`);
    });

    player.events.on('disconnect', (queue) => {
        queue.metadata.channel.send({ content: '🔌 Bot keluar dari voice channel karena diputuskan.' });
    });

    player.events.on('emptyChannel', (queue) => {
        queue.metadata.channel.send({ content: '🔇 Voice channel kosong, bot keluar.' });
    });

    player.events.on('emptyQueue', (queue) => {
        const embed = new EmbedBuilder()
            .setColor('#2B2D31')
            .setTitle('Tidak ada lagu yang sedang diputar')
            .setDescription('Antrian habis. Gunakan command `/play` untuk menambahkan lagu baru!');
        
        queue.metadata.channel.send({ embeds: [embed] });
    });

    player.events.on('error', (queue, error) => {
        console.error(`[Player Error] ${error.message}`);
        queue.metadata.channel.send(`⚠️ Terjadi kesalahan: ${error.message}`);
    });

    player.events.on('playerError', (queue, error) => {
        console.error(`[Player PlayerError] ${error.message}`);
        queue.metadata.channel.send(`⚠️ Gagal memutar lagu: ${error.message}`);
    });
};
