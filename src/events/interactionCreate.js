const { buildVoiceData, buildVoiceEmbed, buildNavRow } = require('../commands/leaderboard');

module.exports = {
    name: 'interactionCreate',
    async execute(interaction, client) {
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

            // ── Slash Commands ──
            if (!interaction.isChatInputCommand()) return;

            const command = client.commands.get(interaction.commandName);
            if (!command) {
                console.error(`Tidak ada command yang cocok untuk ${interaction.commandName}.`);
                return;
            }

            await command.execute(interaction);

        } catch (error) {
            console.error('Error saat menangani interaksi:', error);
            if (interaction.replied || interaction.deferred) {
                await interaction.followUp({ content: 'Ada error saat menjalankan command ini!', ephemeral: true }).catch(() => {});
            } else {
                await interaction.reply({ content: 'Ada error saat menjalankan command ini!', ephemeral: true }).catch(() => {});
            }
        }
    }
};
