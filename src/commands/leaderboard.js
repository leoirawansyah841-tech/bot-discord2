const { SlashCommandBuilder, EmbedBuilder, ActionRowBuilder, ButtonBuilder, ButtonStyle } = require('discord.js');
const { loadChat, loadVoice, voiceSessions } = require('../utils/database');
const { formatDuration, progressBar } = require('../utils/formatting');

const RANK_BADGE = ['👑', '🥈', '🥉', '4️⃣', '5️⃣', '6️⃣', '7️⃣', '8️⃣', '9️⃣', '🔟'];

function buildVoiceData(guild) {
    const voiceData = loadVoice();
    const combined = {};

    for (const [userId, data] of Object.entries(voiceData)) {
        combined[userId] = { username: data.username, totalSeconds: data.totalSeconds };
    }

    for (const [userId, startTime] of voiceSessions.entries()) {
        const elapsed = Math.floor((Date.now() - startTime) / 1000);
        const member = guild?.members.cache.get(userId);
        const username = member?.user?.username || combined[userId]?.username || 'Unknown';
        if (!combined[userId]) combined[userId] = { username, totalSeconds: 0 };
        combined[userId].totalSeconds += elapsed;
        combined[userId].username = username;
    }

    const sorted = Object.entries(combined)
        .sort((a, b) => b[1].totalSeconds - a[1].totalSeconds);

    const topSeconds = sorted[0]?.[1].totalSeconds || 0;
    const totalDetik = sorted.reduce((s, [, d]) => s + d.totalSeconds, 0);
    const activeCount = [...voiceSessions.keys()].filter(id => combined[id]).length;

    return { sorted, topSeconds, totalDetik, activeCount };
}

function buildVoiceEmbed(sorted, page, totalDetik, activeCount, topSeconds, totalPages) {
    const PER_PAGE = 5;
    const slice = sorted.slice(page * PER_PAGE, page * PER_PAGE + PER_PAGE);

    const lines = slice.map(([userId, data], i) => {
        const globalRank = page * PER_PAGE + i;
        const bar = progressBar(data.totalSeconds, topSeconds, 8);
        const active = voiceSessions.has(userId) ? ' ⚡' : '';
        const badge = RANK_BADGE[globalRank] ?? `\`#${globalRank + 1}\``;
        return `${badge} **${data.username}**${active}\n └─ \`${bar}\` **${formatDuration(data.totalSeconds)}**`;
    });

    return new EmbedBuilder()
        .setColor(0x5865F2)
        .setTitle('🎙️  Voice Leaderboard')
        .setDescription(
            `> 👥 **Total waktu komunitas:** ${formatDuration(totalDetik)}\n` +
            `> 🟢 **Member aktif di VC saat ini:** ${activeCount} member\n` +
            `\u200b\n` +
            lines.join('\n\n')
        )
        .setFooter({ text: `⚡ Sedang di VC  •  Halaman ${page + 1} / ${totalPages}  •  Bar = proporsi vs #1` })
        .setTimestamp();
}

function buildNavRow(page, totalPages, prefix) {
    return new ActionRowBuilder().addComponents(
        new ButtonBuilder()
            .setCustomId(`${prefix}_prev_${page - 1}`)
            .setLabel('◀')
            .setStyle(ButtonStyle.Secondary)
            .setDisabled(page === 0),
        new ButtonBuilder()
            .setCustomId(`${prefix}_page`)
            .setLabel(`Halaman ${page + 1} / ${totalPages}`)
            .setStyle(ButtonStyle.Primary)
            .setDisabled(true),
        new ButtonBuilder()
            .setCustomId(`${prefix}_next_${page + 1}`)
            .setLabel('▶')
            .setStyle(ButtonStyle.Secondary)
            .setDisabled(page >= totalPages - 1),
        new ButtonBuilder()
            .setCustomId(`${prefix}_refresh_${page}`)
            .setLabel('🔄 Refresh')
            .setStyle(ButtonStyle.Success)
    );
}

module.exports = {
    data: new SlashCommandBuilder()
        .setName('leaderboard')
        .setDescription('Tampilkan leaderboard server')
        .addStringOption(opt =>
            opt.setName('tipe')
                .setDescription('Pilih tipe leaderboard')
                .setRequired(true)
                .addChoices(
                    { name: '🎙️ Voice (total durasi)', value: 'voice' },
                    { name: '💬 Chat (total pesan)', value: 'chat' }
                )
        ),
    async execute(interaction) {
        await interaction.deferReply();
        const tipe = interaction.options.getString('tipe');

        if (tipe === 'voice') {
            const { sorted, totalDetik, activeCount, topSeconds } = buildVoiceData(interaction.guild);

            if (sorted.length === 0) {
                return interaction.editReply({ content: '📭 Belum ada data voice sama sekali.' });
            }

            const totalPages = Math.ceil(sorted.length / 5);
            const embed = buildVoiceEmbed(sorted, 0, totalDetik, activeCount, topSeconds, totalPages);
            const row = buildNavRow(0, totalPages, 'vlb');

            await interaction.editReply({ embeds: [embed], components: totalPages > 1 ? [row] : [] });

        } else if (tipe === 'chat') {
            const sorted = Object.entries(loadChat())
                .sort((a, b) => b[1].count - a[1].count)
                .slice(0, 10);

            if (sorted.length === 0) {
                return interaction.editReply({ content: '📭 Belum ada data chat sama sekali.' });
            }

            const topCount = sorted[0][1].count;
            const totalPesan = sorted.reduce((s, [, d]) => s + d.count, 0);

            const lines = sorted.map(([, data], i) => {
                const bar = progressBar(data.count, topCount, 8);
                const badge = RANK_BADGE[i] ?? `\`#${i + 1}\``;
                const pct = ((data.count / totalPesan) * 100).toFixed(1);
                return `${badge} **${data.username}**\n └─ \`${bar}\` **${data.count.toLocaleString()}** pesan *(${pct}%)*`;
            });

            const embed = new EmbedBuilder()
                .setColor(0x57F287)
                .setTitle('💬  Chat Leaderboard')
                .setDescription(
                    `> 💬 **Total pesan server:** ${totalPesan.toLocaleString()} pesan\n` +
                    `\u200b\n` +
                    lines.join('\n\n')
                )
                .setFooter({ text: 'Semua channel dihitung  •  Bar = proporsi dari total pesan' })
                .setTimestamp();

            await interaction.editReply({ embeds: [embed] });
        }
    },
    // Export helper buat pagination button yang ada di interactionCreate.js
    buildVoiceData,
    buildVoiceEmbed,
    buildNavRow
};
