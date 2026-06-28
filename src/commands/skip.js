const { SlashCommandBuilder } = require('discord.js');
const { useQueue } = require('discord-player');

module.exports = {
    data: new SlashCommandBuilder()
        .setName('skip')
        .setDescription('Skip lagu yang sedang diputar'),
    async execute(interaction) {
        const queue = useQueue(interaction.guild.id);

        if (!queue || !queue.isPlaying()) {
            return interaction.reply({ content: '❌ Tidak ada musik yang sedang diputar!', ephemeral: true });
        }

        const channel = interaction.member.voice.channel;
        if (!channel || channel.id !== queue.channel.id) {
            return interaction.reply({ content: '❌ Kamu harus berada di voice channel yang sama dengan bot!', ephemeral: true });
        }

        queue.node.skip();
        return interaction.reply('⏩ Lagu di-skip!');
    },
};
