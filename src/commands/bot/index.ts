import { SlashCommandBuilder, Collection } from "discord.js"
import log from "../../utils/log"

const logger = new log('Bot CMDS')

import info from "./info"
import help from "./help"

module.exports = {
    data: new SlashCommandBuilder()
        .setName('bot')
        .setDescription('Bot commands!')
        .addSubcommand(subcommand =>
            subcommand
                .setName('info')
                .setDescription('Replies with info about the bot!')
        )
        .addSubcommand(subcommand =>
            subcommand
                .setName('help')
                .setDescription('Replies with help about the bot!')
        )
    ,

    async execute(interaction: any, commands: Collection<string, any>) {
        switch (interaction.options.getSubcommand()) {
            case 'info':
                info(interaction, commands, logger)
                break
            case 'help':
                help(interaction, commands)
                break
            default:
                interaction.reply('Unknown subcommand')
                break
        }
    }
}