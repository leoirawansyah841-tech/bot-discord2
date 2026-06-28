const { SlashCommandBuilder, EmbedBuilder, ActionRowBuilder, ButtonBuilder, ButtonStyle } = require('discord.js');

module.exports = {
    data: new SlashCommandBuilder()
        .setName('about')
        .setDescription('Menampilkan informasi tentang bot ini'),
    async execute(interaction) {
        // Kalkulasi uptime
        let totalSeconds = (interaction.client.uptime / 1000);
        let days = Math.floor(totalSeconds / 86400);
        totalSeconds %= 86400;
        let hours = Math.floor(totalSeconds / 3600);
        totalSeconds %= 3600;
        let minutes = Math.floor(totalSeconds / 60);
        let seconds = Math.floor(totalSeconds % 60);
        const uptimeString = `${days}d ${hours}h ${minutes}m ${seconds}s`;

        // Ambil data user Developer secara dinamis agar namanya selalu rapi
        const devAzka = interaction.client.users.cache.get('909788964020445194');
        const devLeo = interaction.client.users.cache.get('976853679174983730');
        const azkaName = devAzka ? `@${devAzka.username}` : '@azka';
        const leoName = devLeo ? `@${devLeo.username}` : '@leo';

        const embed = new EmbedBuilder()
            .setColor(0xFEE75C) // Warna kuning pastel cozy
            .setTitle('Village Bot 🏡')
            .setDescription([
                'Bot serbaguna untuk menemani hari-harimu di **Cozy Village** dengan musik berkualitas tinggi, sistem statistik interaktif, dan moderasi pintar. ',
                '',
                '**✦ Informasi System**',
                `<:nodejs:1520832150696493067> **Runtime** : Node.js \`${process.version}\``,
                '<:djs:1520828773702959256> **Library** : discord.js `v14.15.3`',
                `<a:clock:1520831275081007315> **Uptime** : \`${uptimeString}\``,
                '',
                '**✦ Tim Pengembang**',
                `</> **Developer** : **${azkaName}** & **${leoName}**`
            ].join('\n'))
            .setThumbnail(interaction.client.user.displayAvatarURL());

        await interaction.reply({ embeds: [embed] });
    }
};
