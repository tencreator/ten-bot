import { SlashCommandBuilder, Collection } from "discord.js"
import { log } from "../../utils/log"

const Log = new log('Bot CMDS')

import info from './info'

module.exports = {
    data: new SlashCommandBuilder()
        .setName('guild')
        .setDescription('Guild commands!')
        .addSubcommand(subcommand =>
            subcommand
                .setName('info')
                .setDescription('Replies with info about the guild!')
        )
    ,
    async execute(interaction: any, commands: Collection<string, any>) {
        switch (interaction.options.getSubcommand()) {
            case 'info':
                info(interaction, Log)
                break
            default:
                interaction.reply('Unknown subcommand')
                break
        }
    }
}