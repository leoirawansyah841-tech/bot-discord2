function formatDuration(seconds) {
    if (seconds < 60) return `${seconds}d`;
    const h = Math.floor(seconds / 3600);
    const m = Math.floor((seconds % 3600) / 60);
    const s = seconds % 60;
    if (h > 0) return `${h}j ${m}m ${s}d`;
    return `${m}m ${s}d`;
}

function progressBar(value, max, length = 10) {
    if (max === 0) return '░'.repeat(length);
    const filled = Math.round((value / max) * length);
    return '█'.repeat(filled) + '░'.repeat(length - filled);
}

module.exports = {
    formatDuration,
    progressBar
};
