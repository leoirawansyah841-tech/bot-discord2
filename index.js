require('dotenv').config();

const {
    Client,
    GatewayIntentBits,
    ActivityType,
    REST,
    Routes,
    SlashCommandBuilder,
    EmbedBuilder,
    ActionRowBuilder,
    ButtonBuilder,
    ButtonStyle
} = require('discord.js');

const {
    joinVoiceChannel,
    entersState,
    VoiceConnectionStatus
} = require('@discordjs/voice');

const fs = require('fs');

// ─── Database (dua file JSON terpisah) ──────────────────────────────────────

const VOICE_FILE = './data_voice.json';
const CHAT_FILE  = './data_chat.json';

function loadVoice() {
    if (!fs.existsSync(VOICE_FILE)) {
        fs.writeFileSync(VOICE_FILE, JSON.stringify({}, null, 2));
        return {};
    }
    return JSON.parse(fs.readFileSync(VOICE_FILE, 'utf8'));
}

function saveVoice(data) {
    fs.writeFileSync(VOICE_FILE, JSON.stringify(data, null, 2));
}

function loadChat() {
    if (!fs.existsSync(CHAT_FILE)) {
        fs.writeFileSync(CHAT_FILE, JSON.stringify({}, null, 2));
        return {};
    }
    return JSON.parse(fs.readFileSync(CHAT_FILE, 'utf8'));
}

function saveChat(data) {
    fs.writeFileSync(CHAT_FILE, JSON.stringify(data, null, 2));
}

// voiceTime[userId] = { username, totalSeconds }
// chatCount[userId] = { username, count }

// In-memory: track saat user join voice (untuk sesi aktif)
// voiceSessions[userId] = Date.now()
const voiceSessions = new Map();

// ─── Discord Client ──────────────────────────────────────────────────────────

const client = new Client({
    intents: [
        GatewayIntentBits.Guilds,
        GatewayIntentBits.GuildVoiceStates,
        GatewayIntentBits.GuildMessages,
        GatewayIntentBits.MessageContent
    ]
});

let connection;

function connectVC() {
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
                setTimeout(() => connectVC(), 3000);
            }
        }
    });
}

// ─── Slash Commands ──────────────────────────────────────────────────────────

const commands = [
    new SlashCommandBuilder()
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
    new SlashCommandBuilder()
        .setName('sesi')
        .setDescription('Lihat durasi sesi voice kamu saat ini (reset kalau keluar VC)')
        .addUserOption(opt =>
            opt.setName('member')
                .setDescription('Member yang ingin dicek (default: kamu sendiri)')
                .setRequired(false)
        )
].map(cmd => cmd.toJSON());

async function registerCommands(clientId) {
    const rest = new REST({ version: '10' }).setToken(process.env.TOKEN);
    try {
        await rest.put(Routes.applicationGuildCommands(clientId, process.env.GUILD_ID), { body: commands });
        console.log('Slash commands berhasil didaftarkan');
    } catch (err) {
        console.error('Gagal daftarkan commands:', err);
    }
}

// ─── Helper format durasi ────────────────────────────────────────────────────

function formatDuration(seconds) {
    if (seconds < 60) return `${seconds}d`;
    const h = Math.floor(seconds / 3600);
    const m = Math.floor((seconds % 3600) / 60);
    const s = seconds % 60;
    if (h > 0) return `${h}j ${m}m ${s}d`;
    return `${m}m ${s}d`;
}

// ─── Events ──────────────────────────────────────────────────────────────────

// Tangkap error global dari Discord.js agar bot tidak crash
client.on('error', (error) => {
    console.error('Discord Client Error:', error);
});

// Tangkap unhandled promise rejections
process.on('unhandledRejection', (reason, promise) => {
    console.error('Unhandled Rejection at:', promise, 'reason:', reason);
});

// Track voice state changes
client.on('voiceStateUpdate', (oldState, newState) => {
    const userId = newState.member?.id || oldState.member?.id;
    const username = newState.member?.user?.username || oldState.member?.user?.username || 'Unknown';
    const isBot = newState.member?.user?.bot || oldState.member?.user?.bot;

    if (!userId || isBot) return;

    const wasInVoice = !!oldState.channelId;
    const isInVoice = !!newState.channelId;

    if (!wasInVoice && isInVoice) {
        // User JOIN voice
        voiceSessions.set(userId, Date.now());
        console.log(`[Voice] ${username} join VC`);
    } else if (wasInVoice && !isInVoice) {
        // User LEAVE voice
        const startTime = voiceSessions.get(userId);
        if (startTime) {
            const elapsed = Math.floor((Date.now() - startTime) / 1000);
            voiceSessions.delete(userId);

            const voiceData = loadVoice();
            if (!voiceData[userId]) voiceData[userId] = { username, totalSeconds: 0 };
            voiceData[userId].totalSeconds += elapsed;
            voiceData[userId].username = username;
            saveVoice(voiceData);

            console.log(`[Voice] ${username} leave VC (+${formatDuration(elapsed)})`);
        }
    }
});

// Track pesan dan sensor kata kasar
const badWords = require('./badwords.js');
const scamWords = require('./scamwords.js');
const isGibberish = require('./gibberish.js');

function normalizeForFilter(text) {
    return text.normalize('NFKD') // Ubah font aneh (unicode) jadi huruf biasa
        .replace(/[\u0300-\u036f]/g, '') // Hapus aksen (combining diacritical marks)
        .replace(/[\u200B-\u200D\uFEFF]/g, '') // Hapus zero-width spaces
        .toLowerCase()
        .replace(/4/g, 'a')
        .replace(/1|!/g, 'i')
        .replace(/0/g, 'o')
        .replace(/3/g, 'e')
        .replace(/5/g, 's')
        .replace(/@/g, 'a')
        .replace(/[.,_\-\*\/\|"']/g, ''); // Hapus tanda baca penyela
}

client.on('messageCreate', (message) => {
    if (message.author.bot) return;

    // 1. Cek Scam / Phishing
    const rawContent = message.content.toLowerCase();
    const isScam = scamWords.some(phrase => rawContent.includes(phrase.toLowerCase()));

    if (isScam) {
        message.delete().catch(() => {});
        message.channel.send(`🤖 **[AI Moderator]** 🛡️ Pesan terindikasi penipuan (Scam/Phishing) dari ${message.author} telah diblokir otomatis demi keamanan server.`)
            .then(msg => setTimeout(() => msg.delete().catch(() => {}), 8000));
        return; // Hentikan proses
    }

    // 2. Cek Kata Kasar
    const content = normalizeForFilter(message.content);
    
    // Cek frasa multi-kata dulu (matching langsung di seluruh konten)
    const hasBadWord = badWords.some(word => {
        const normalizedWord = normalizeForFilter(word);
        if (normalizedWord.includes(' ')) {
            // Frasa multi-kata: cek apakah ada di dalam konten
            return content.includes(normalizedWord);
        }
        // Kata tunggal: gunakan word boundary tapi fallback ke includes untuk kata pendek
        const escapedWord = normalizedWord.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
        const spacedWord = escapedWord.split('').join('\\s*');
        const regex = new RegExp(`(^|\\s|[^a-z])${spacedWord}($|\\s|[^a-z])`, 'i');
        return regex.test(content);
    });

    if (hasBadWord) {
        message.delete().catch(() => {});
        message.channel.send(`🤖 **[AI Moderator]** ⚠️ Peringatan untuk ${message.author}: Pesan Anda dihapus secara otomatis karena terdeteksi mengandung kata kasar. Tolong jaga bahasa Anda di server ini!`)
            .then(msg => setTimeout(() => msg.delete().catch(() => {}), 5000));
        return; // Jangan tambahkan ke chat leaderboard
    }

    // 3. Cek Teks Random / Spam untuk Leaderboard (Opsi B: jangan dihapus, tapi jangan dihitung poin)
    if (isGibberish(message.content)) {
        return;
    }

    const userId = message.author.id;
    const username = message.author.username;

    const chatData = loadChat();
    if (!chatData[userId]) chatData[userId] = { username, count: 0 };
    chatData[userId].count += 1;
    chatData[userId].username = username;
    saveChat(chatData);
});

// ─── Helper progress bar ─────────────────────────────────────────────────────

function progressBar(value, max, length = 10) {
    if (max === 0) return '░'.repeat(length);
    const filled = Math.round((value / max) * length);
    return '█'.repeat(filled) + '░'.repeat(length - filled);
}

const RANK_BADGE = ['👑', '🥈', '🥉', '4️⃣', '5️⃣', '6️⃣', '7️⃣', '8️⃣', '9️⃣', '🔟'];

// ─── Voice leaderboard helpers ────────────────────────────────────────────────

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
        const badge = RANK_BADGE[globalRank] ?? `**${globalRank + 1}.**`;
        return `${badge} **${data.username}**${active}\n> \`${bar}\` ${formatDuration(data.totalSeconds)}`;
    });

    return new EmbedBuilder()
        .setColor(0x5865F2)
        .setTitle('🎙️  Voice Leaderboard')
        .setDescription(
            `> Total komunitas: **${formatDuration(totalDetik)}** di voice\n` +
            `> Sedang aktif: **${activeCount} member** ⚡\n` +
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

// ─── Slash Commands Handler ───────────────────────────────────────────────────

client.on('interactionCreate', async (interaction) => {
    try {
        // ── Button: voice leaderboard pagination ──
        if (interaction.isButton()) {
            if (
                interaction.customId.startsWith('vlb_prev_') ||
                interaction.customId.startsWith('vlb_next_') ||
                interaction.customId.startsWith('vlb_refresh_')
            ) {
                await interaction.deferUpdate();
                const page = parseInt(interaction.customId.split('_').pop(), 10);
                const { sorted, totalDetik, activeCount, topSeconds } = buildVoiceData(interaction.guild);
                const totalPages = Math.ceil(sorted.length / 5);
                const safePage = Math.max(0, Math.min(page, totalPages - 1));
                const embed = buildVoiceEmbed(sorted, safePage, totalDetik, activeCount, topSeconds, totalPages);
                const row = buildNavRow(safePage, totalPages, 'vlb');
                await interaction.editReply({ embeds: [embed], components: [row] });
            }
            return;
        }

        if (!interaction.isChatInputCommand()) return;

        if (interaction.commandName === 'leaderboard') {
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
                    const badge = RANK_BADGE[i] ?? `\`${i + 1}\``;
                    const pct = ((data.count / totalPesan) * 100).toFixed(1);
                    return `${badge} **${data.username}**\n> \`${bar}\` ${data.count.toLocaleString()} pesan *(${pct}%)*`;
                });

                const embed = new EmbedBuilder()
                    .setColor(0x57F287)
                    .setTitle('💬  Chat Leaderboard')
                    .setDescription(
                        `> Total pesan server: **${totalPesan.toLocaleString()} pesan**\n` +
                        `\u200b\n` +
                        lines.join('\n\n')
                    )
                    .setFooter({ text: 'Semua channel dihitung  •  Bar = proporsi dari total pesan' })
                    .setTimestamp();

                await interaction.editReply({ embeds: [embed] });
            }
        }

        if (interaction.commandName === 'sesi') {
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
    } catch (error) {
        console.error('Error saat menangani interaksi:', error);
    }
});

// ─── Ready ───────────────────────────────────────────────────────────────────

client.once('clientReady', async () => {
    console.log(`${client.user.tag} online`);

    client.user.setPresence({
        activities: [{ name: '24/7 Voice', type: ActivityType.Watching }],
        status: 'online'
    });

    await registerCommands(client.user.id);
    connectVC();

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
        if (!connection) connectVC();
    }, 30000);
});

client.login(process.env.TOKEN);
