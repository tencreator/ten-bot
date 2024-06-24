import { SlashCommandBuilder, Collection } from "discord.js"
import ping from './ping'
import help from './help'

module.exports = {
    data: new SlashCommandBuilder()
        .setName('general')
        .setDescription('General commands!')
        .addSubcommand(subcommand =>
            subcommand
                .setName('ping')
                .setDescription('Replies with Pong!')
        )
        .addSubcommand(subcommand =>
            subcommand
                .setName('help')
                .setDescription('Replies with Help!')
        ),

    async execute(interaction: any, commands: Collection<string, any>) {
        switch (interaction.options.getSubcommand()) {
            case 'ping':
                await ping(interaction)
                break
            case 'help':
                await help(interaction, commands)
                break
            default:
                interaction.reply('Unknown subcommand')
                break
        }
    }
}