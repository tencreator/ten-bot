import { Events, Collection } from 'discord.js'

module.exports = {
    name: Events.InteractionCreate,
    async execute(interaction: { isChatInputCommand: () => any; client: { commands: { get: (arg0: any) => any } }; commandName: any }, commands: Collection<string, any>) {
        if (!interaction.isChatInputCommand()) return

        const command = commands.get(interaction.commandName)

        if (!command) {
            console.log(`No command matching ${interaction.commandName} was found.`)
            return
        }

        try {
            await command.execute(interaction, commands)
        } catch (error) {
            console.error(`Error executing ${interaction.commandName}`)
            console.error(error)
        }
    }
}