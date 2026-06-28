const { SlashCommandBuilder } = require('discord.js');
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

            return interaction.editReply(`🎵 Berhasil menambahkan **${track.title}** oleh **${track.author}** ke antrian!`);
        } catch (e) {
            console.error(e);
            return interaction.editReply('❌ Lagu tidak ditemukan. Coba:\n• Tulis nama lagu lebih lengkap\n• Paste link SoundCloud atau Spotify langsung');
        }
    },
};
