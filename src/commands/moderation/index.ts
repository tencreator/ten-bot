import { SlashCommandBuilder, Collection } from "discord.js"

import ban from './ban'
import kick from './kick'

module.exports = {
    data: new SlashCommandBuilder()
        .setName('moderation')
        .setDescription('General commands!')
        .addSubcommand(subcommand =>
            subcommand
                .setName('ban')
                .setDescription('Bans a user!')
                .addUserOption(option =>
                    option.setName('user')
                        .setDescription('The user to ban')
                        .setRequired(true)
                )
                .addStringOption(option =>
                    option.setName('reason')
                        .setDescription('The reason for banning the user')
                        .setRequired(false)
                )
        )
        .addSubcommand(subcommand =>
            subcommand
                .setName('kick')
                .setDescription('Replies with Help!')
                .addUserOption(option =>
                    option.setName('user')
                        .setDescription('The user to kick')
                        .setRequired(true)
                )
                .addStringOption(option =>
                    option.setName('reason')
                        .setDescription('The reason for kicking the user')
                        .setRequired(false)
                )
        )
        ,

    async execute(interaction: any, commands: Collection<string, any>) {
        switch (interaction.options.getSubcommand()) {
            case 'ban':
                await ban(interaction)
                break
            case 'kick':
                await kick(interaction)
                break
            default:
                interaction.reply('Unknown subcommand')
                break
        }
    }
}