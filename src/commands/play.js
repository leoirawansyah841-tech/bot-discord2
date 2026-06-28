const { SlashCommandBuilder, EmbedBuilder } = require('discord.js');
const { useMainPlayer, QueryType } = require('discord-player');

module.exports = {
    data: new SlashCommandBuilder()
        .setName('play')
        .setDescription('Putar musik dari YouTube/Spotify/SoundCloud')
        .addStringOption(option => 
            option.setName('query')
                .setDescription('Judul lagu atau URL (Spotify/SoundCloud/YouTube)')
                .setRequired(true)
        ),
    async execute(interaction) {
        const player = useMainPlayer();
        const query = interaction.options.getString('query');
        const channel = interaction.member.voice.channel;

        if (!channel) {
            return interaction.reply({ content: '❌ Kamu harus berada di voice channel terlebih dahulu!', flags: 64 });
        }

        // Tampilkan status "Berpikir..." sementara bot mencari lagu
        await interaction.deferReply();

        try {
            const { track } = await player.play(channel, query, {
                searchEngine: QueryType.AUTO,
                nodeOptions: {
                    metadata: {
                        channel: interaction.channel,
                        client: interaction.guild.members.me,
                        requestedBy: interaction.user
                    },
                    leaveOnEmpty: true,
                    leaveOnEmptyCooldown: 5000,
                    leaveOnEnd: true,
                    leaveOnEndCooldown: 10000,
                    selfDeaf: true
                }
            });

            // Perbaiki thumbnail Spotify yang sering kali hanya logo generik (twitter_card-default)
            if (!track.thumbnail || track.thumbnail.includes('twitter_card-default')) {
                try {
                    const play = require('play-dl');
                    const searchRes = await play.search(`${track.title} ${track.author}`, { limit: 1 });
                    if (searchRes && searchRes.length > 0 && searchRes[0].thumbnails) {
                        const bestThumb = searchRes[0].thumbnails.sort((a, b) => b.width - a.width)[0];
                        if (bestThumb) track.thumbnail = bestThumb.url;
                    }
                } catch (err) {
                    console.error('[Thumbnail Fetch] Gagal mengambil thumbnail alternatif:', err.message);
                }
            }

            const embed = new EmbedBuilder()
                .setColor('#2B2D31')
                .setAuthor({ name: 'Lagu ditambahkan ke antrian', iconURL: interaction.user.displayAvatarURL() })
                .setDescription(`**[${track.title}](${track.url})**\nOleh: **${track.author}**`)
                .setThumbnail(track.thumbnail || null);

            return interaction.editReply({ content: '', embeds: [embed] });
        } catch (e) {
            console.error(e);
            return interaction.editReply({ content: '❌ Lagu tidak ditemukan. Coba:\n• Tulis nama lagu lebih lengkap\n• Paste link SoundCloud atau Spotify langsung', flags: 64 });
        }
    },
};
