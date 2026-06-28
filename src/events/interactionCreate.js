const { buildVoiceData, buildVoiceEmbed, buildNavRow } = require('../commands/leaderboard');

module.exports = {
    name: 'interactionCreate',
    async execute(interaction, client) {
        try {
            // ── Button: voice leaderboard pagination & Music Controls ──
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
                    return;
                }

                if (interaction.customId.startsWith('music_')) {
                    const { useMainPlayer } = require('discord-player');
                    const player = useMainPlayer();
                    const queue = player.nodes.get(interaction.guild);

                    if (!queue) {
                        return interaction.reply({ content: '❌ Tidak ada antrian musik di server ini!', flags: 64 });
                    }

                    if (interaction.customId === 'music_pause') {
                        const isPaused = queue.node.isPaused();
                        queue.node.setPaused(!isPaused);
                        return interaction.reply({ content: isPaused ? '▶️ Lagu dilanjutkan.' : '⏸️ Lagu dijeda.', flags: 64 });
                    }

                    if (interaction.customId === 'music_skip') {
                        queue.node.skip();
                        return interaction.reply({ content: '⏭️ Melewati lagu saat ini...', flags: 64 });
                    }

                    if (interaction.customId === 'music_back') {
                        if (!queue.history.previousTrack) {
                            return interaction.reply({ content: '❌ Tidak ada lagu sebelumnya!', flags: 64 });
                        }
                        await queue.history.previous();
                        return interaction.reply({ content: '⏮️ Memutar ulang lagu sebelumnya...', flags: 64 });
                    }

                    if (interaction.customId === 'music_bass') {
                        // Toggle bassboost (using FFmpeg filter)
                        await interaction.deferReply({ flags: 64 });
                        const isEnabled = queue.filters.ffmpeg.getFiltersEnabled().includes('bassboost');
                        if (isEnabled) {
                            await queue.filters.ffmpeg.toggle(['bassboost']);
                            return interaction.editReply({ content: '🔉 Bass Boost dimatikan.' });
                        } else {
                            await queue.filters.ffmpeg.toggle(['bassboost']);
                            return interaction.editReply({ content: '🔊 Bass Boost diaktifkan! (Mungkin ada sedikit jeda saat memuat)' });
                        }
                    }

                    if (interaction.customId === 'music_leave') {
                        queue.delete();
                        return interaction.reply({ content: '🚪 Berhenti memutar musik dan keluar dari voice channel.', flags: 64 });
                    }
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
