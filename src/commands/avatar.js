const { SlashCommandBuilder, EmbedBuilder } = require('discord.js');

module.exports = {
    data: new SlashCommandBuilder()
        .setName('avatar')
        .setDescription('Lihat foto profil (avatar) kamu atau pengguna lain secara detail')
        // Mendukung command muncul di profil dan bisa dipakai di mana saja (User App)
        .setIntegrationTypes([0, 1]) // 0: Guild, 1: User
        .setContexts([0, 1, 2]) // 0: Guild, 1: Bot DM, 2: Private Channel
        .addUserOption(option => 
            option.setName('target')
                .setDescription('Pengguna yang ingin kamu lihat avatarnya')
                .setRequired(false)),
    async execute(interaction) {
        // Jika tidak ada target yang dipilih, gunakan user yang memanggil command
        const target = interaction.options.getUser('target') || interaction.user;
        
        const embed = new EmbedBuilder()
            .setColor('#2B2D31')
            .setTitle(`🖼️ Avatar ${target.username}`)
            .setImage(target.displayAvatarURL({ size: 1024, extension: 'png', forceStatic: false }))
            .setFooter({ text: `Diminta oleh ${interaction.user.username}`, iconURL: interaction.user.displayAvatarURL() });

        await interaction.reply({ embeds: [embed] });
    },
};
