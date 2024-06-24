import { SlashCommandBuilder, Collection } from "discord.js"
import log from "../../utils/log"

const logger = new log('Bot CMDS')

import info from "./info"

module.exports = {
    data: new SlashCommandBuilder()
        .setName('bot')
        .setDescription('Bot commands!')
        .addSubcommand(subcommand =>
            subcommand
                .setName('info')
                .setDescription('Replies with info about the bot!')
        )
    ,

    async execute(interaction: any, commands: Collection<string, any>) {
        switch (interaction.options.getSubcommand()) {
            case 'info':
                info(interaction, commands, logger)
                break
            case 'help':
                break
            default:
                interaction.reply('Unknown subcommand')
                break
        }
    }
}