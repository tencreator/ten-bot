import { EmbedBuilder, Collection } from 'discord.js'

export default async function help(interaction: any, commands: Collection<string, any>) {
    const fields: {name: string, value: string, inline?: boolean | false}[] = []

    commands.forEach((cmd: any) => {
        cmd.data.options.forEach((option: any) => {
            const args: string[] = option.options.map((arg: any) => {return `[${arg.name}]`})

            fields.push({
                name: `/${cmd.data.name} ${option.name} ${args.join(' ')}`,
                value: option.description,
                inline: false
            })
        })
    })

    const embed = new EmbedBuilder()
        .setTitle('Commands')
        .setDescription('**A list of all available commands. Total commands: ' + fields.length + '**')
        .addFields(fields)
        .setTimestamp()
        .setFooter({ text: 'Bot maintainted and developed by TenCreator' })

    await interaction.reply({ embeds: [embed] })
}