const fs = require('fs');
const path = require('path');

// Gunakan path absolute dari letak file utils/database.js ini
const rootDir = path.join(__dirname, '..', '..');
const VOICE_FILE = path.join(rootDir, 'data_voice.json');
const CHAT_FILE = path.join(rootDir, 'data_chat.json');

// In-memory: track saat user join voice (untuk sesi aktif)
// voiceSessions[userId] = Date.now()
const voiceSessions = new Map();

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

module.exports = {
    loadVoice,
    saveVoice,
    loadChat,
    saveChat,
    voiceSessions
};
