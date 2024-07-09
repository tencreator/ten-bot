import { SlashCommandBuilder, Collection } from "discord.js"
import ping from './ping'

module.exports = {
    data: new SlashCommandBuilder()
        .setName('general')
        .setDescription('General commands!')
        .addSubcommand(subcommand =>
            subcommand
                .setName('ping')
                .setDescription('Replies with Pong!')
        ),

    async execute(interaction: any, commands: Collection<string, any>) {
        switch (interaction.options.getSubcommand()) {
            case 'ping':
                await ping(interaction)
                break
            default:
                interaction.reply('Unknown subcommand')
                break
        }
    }
}