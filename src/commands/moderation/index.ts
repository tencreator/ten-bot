import { SlashCommandBuilder, Collection } from "discord.js"

module.exports = {
    data: new SlashCommandBuilder()
        .setName('moderation')
        .setDescription('General commands!')
        // .addSubcommand(subcommand =>
        //     subcommand
        //         .setName('ping')
        //         .setDescription('Replies with Pong!')
        // )
        // .addSubcommand(subcommand =>
        //     subcommand
        //         .setName('help')
        //         .setDescription('Replies with Help!')
        // )
        ,

    async execute(interaction: any, commands: Collection<string, any>) {
        switch (interaction.options.getSubcommand()) {
            default:
                interaction.reply('Unknown subcommand')
                break
        }
    }
}