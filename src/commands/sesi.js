const { SlashCommandBuilder, EmbedBuilder } = require('discord.js');
const { loadVoice, voiceSessions } = require('../utils/database');
const { formatDuration, progressBar } = require('../utils/formatting');

module.exports = {
    data: new SlashCommandBuilder()
        .setName('sesi')
        .setDescription('Lihat durasi sesi voice kamu saat ini (reset kalau keluar VC)')
        .addUserOption(opt =>
            opt.setName('member')
                .setDescription('Member yang ingin dicek (default: kamu sendiri)')
                .setRequired(false)
        ),
    async execute(interaction) {
        const target = interaction.options.getUser('member') || interaction.user;

        if (target.bot) {
            return interaction.reply({ content: 'Bot tidak punya sesi voice 😅', ephemeral: true });
        }

        const startTime = voiceSessions.get(target.id);

        if (!startTime) {
            const isSelf = target.id === interaction.user.id;
            return interaction.reply({
                content: isSelf
                    ? '❌ Kamu tidak sedang di voice channel. Durasi sesi di-reset saat keluar VC.'
                    : `❌ **${target.username}** tidak sedang di voice channel.`,
                ephemeral: true
            });
        }

        const elapsed = Math.floor((Date.now() - startTime) / 1000);
        const savedSeconds = loadVoice()[target.id]?.totalSeconds || 0;
        const totalSeconds = savedSeconds + elapsed;

        const bar = progressBar(elapsed, elapsed + savedSeconds || 1, 12);

        const embed = new EmbedBuilder()
            .setColor(0xFEE75C)
            .setTitle('⚡  Sesi Voice Aktif')
            .setDescription(
                `**${target.username}** sedang di voice!\n\u200b`
            )
            .addFields(
                {
                    name: '⏱️ Sesi Sekarang',
                    value: `\`\`\`${formatDuration(elapsed)}\`\`\``,
                    inline: true
                },
                {
                    name: '📊 Total Semua Waktu',
                    value: `\`\`\`${formatDuration(totalSeconds)}\`\`\``,
                    inline: true
                },
                {
                    name: `Sesi ini`,
                    value: `\`${bar}\``,
                    inline: false
                }
            )
            .setThumbnail(target.displayAvatarURL())
            .setFooter({ text: 'Sesi di-reset otomatis saat keluar VC' })
            .setTimestamp();

        await interaction.reply({ embeds: [embed] });
    }
};
