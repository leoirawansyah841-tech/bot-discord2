const { loadVoice, saveVoice, voiceSessions } = require('../utils/database');
const { formatDuration } = require('../utils/formatting');

module.exports = {
    name: 'voiceStateUpdate',
    execute(oldState, newState) {
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
    }
};
