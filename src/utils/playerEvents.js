module.exports = (player) => {
    player.events.on('playerStart', (queue, track) => {
        queue.metadata.channel.send(`🎶 Sedang memutar: **${track.title}**`);
    });

    player.events.on('audioTrackAdd', (queue, track) => {
        queue.metadata.channel.send(`✅ **${track.title}** ditambahkan ke antrian!`);
    });

    player.events.on('disconnect', (queue) => {
        queue.metadata.channel.send('🔌 Bot keluar dari voice channel karena diputuskan.');
    });

    player.events.on('emptyChannel', (queue) => {
        queue.metadata.channel.send('🔇 Voice channel kosong, bot keluar.');
    });

    player.events.on('emptyQueue', (queue) => {
        queue.metadata.channel.send('✅ Antrian habis, menunggu lagu baru...');
    });

    player.events.on('error', (queue, error) => {
        console.error(`[Player Error] ${error.message}`);
        queue.metadata.channel.send(`⚠️ Terjadi kesalahan (error): ${error.message}`);
    });

    player.events.on('playerError', (queue, error) => {
        console.error(`[Player PlayerError] ${error.message}`);
        queue.metadata.channel.send(`⚠️ Gagal memutar lagu (PlayerError): ${error.message}`);
    });
};
