const { SlashCommandBuilder } = require('discord.js');
const { useQueue } = require('discord-player');

module.exports = {
    data: new SlashCommandBuilder()
        .setName('stop')
        .setDescription('Hentikan musik dan hapus antrian'),
    async execute(interaction) {
        const queue = useQueue(interaction.guild.id);

        if (!queue || !queue.isPlaying()) {
            return interaction.reply({ content: '❌ Tidak ada musik yang sedang diputar!', ephemeral: true });
        }

        const channel = interaction.member.voice.channel;
        if (!channel || channel.id !== queue.channel.id) {
            return interaction.reply({ content: '❌ Kamu harus berada di voice channel yang sama dengan bot!', ephemeral: true });
        }

        queue.delete();
        return interaction.reply('🛑 Musik dihentikan, bot keluar dari voice channel.');
    },
};
