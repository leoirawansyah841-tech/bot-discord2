require('dotenv').config();
process.env.FFMPEG_PATH = require('ffmpeg-static');
const { Client, GatewayIntentBits, Collection } = require('discord.js');
const fs = require('fs');
const path = require('path');

(async () => {
    const client = new Client({
        intents: [
            GatewayIntentBits.Guilds,
            GatewayIntentBits.GuildVoiceStates,
            GatewayIntentBits.GuildMessages,
            GatewayIntentBits.MessageContent
        ]
    });

    // Setup Discord Player
    const { Player, onBeforeCreateStream } = require('discord-player');
    const { YoutubeiExtractor } = require('discord-player-youtubei');
    const { SoundCloudExtractor, SpotifyExtractor, AppleMusicExtractor, AttachmentExtractor } = require('@discord-player/extractor');

    const player = new Player(client, {
        skipFFmpeg: false,
        useLegacyFFmpeg: false,
    });

    // Global bypass hook untuk YouTube (menggunakan yt-dlp / youtube-dl-exec)
    onBeforeCreateStream(async (track, queryType, queue) => {
        if (track.url.includes('youtube.com') || track.url.includes('youtu.be')) {
            console.log(`[Bypass] Memproses stream YouTube via yt-dlp untuk lagu: ${track.title}`);
            const yt = require('youtube-dl-exec');
            try {
                const output = await yt(track.url, {
                    dumpJson: true,
                    noCheckCertificates: true,
                    noWarnings: true,
                    preferFreeFormats: true,
                    addHeader: ['referer:youtube.com', 'user-agent:Mozilla/5.0']
                });
                console.log(`[Bypass] Sukses mengambil stream URL!`);
                return output.url;
            } catch (e) {
                console.error('[Bypass] Error mengambil stream:', e.message);
                return null;
            }
        }
        return null;
    });

    // Daftarkan semua extractor.
    await player.extractors.register(YoutubeiExtractor, {});
    await player.extractors.register(AttachmentExtractor, {});
    await player.extractors.register(SoundCloudExtractor, {});
    await player.extractors.register(SpotifyExtractor, {});
    await player.extractors.register(AppleMusicExtractor, {});

    // Register player events
    require('./utils/playerEvents')(player);

    client.commands = new Collection();

    // Load Commands
    const commandsPath = path.join(__dirname, 'commands');
    const commandFiles = fs.readdirSync(commandsPath).filter(file => file.endsWith('.js'));
    for (const file of commandFiles) {
        const filePath = path.join(commandsPath, file);
        const command = require(filePath);
        if ('data' in command && 'execute' in command) {
            client.commands.set(command.data.name, command);
        } else {
            console.log(`[WARNING] The command at ${filePath} is missing a required "data" or "execute" property.`);
        }
    }

    // Load Events
    const eventsPath = path.join(__dirname, 'events');
    const eventFiles = fs.readdirSync(eventsPath).filter(file => file.endsWith('.js'));
    for (const file of eventFiles) {
        const filePath = path.join(eventsPath, file);
        const event = require(filePath);
        if (event.once) {
            client.once(event.name, (...args) => event.execute(...args, client));
        } else {
            client.on(event.name, (...args) => event.execute(...args, client));
        }
    }

    // Tangkap unhandled promise rejections global
    process.on('unhandledRejection', (reason, promise) => {
        console.error('Unhandled Rejection at:', promise, 'reason:', reason);
    });

    client.login(process.env.TOKEN);
})();
