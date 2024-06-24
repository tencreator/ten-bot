import { EmbedBuilder } from 'discord.js'

export default async function ping(interaction: any) {
    const embed = new EmbedBuilder()
        .setTitle('Pong!')
        .setDescription(`🏓 Latency is ${Date.now() - interaction.createdTimestamp}ms.`)

    await interaction.reply({ embeds: [embed] })
}