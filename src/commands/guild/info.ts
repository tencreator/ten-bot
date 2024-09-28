import { EmbedBuilder, Collection, Guild } from 'discord.js'
import log from '../../utils/log'

export default async function info(interaction: any, logger: log) {
    // Make a embed that shows the guild members, channels, roles, and emojis
    const members = interaction.guild.members.cache
    const channels = interaction.guild.channels.cache
    const roles = interaction.guild.roles.cache
    const emojis = interaction.guild.emojis.cache

    const embed = createEmbed(interaction.guild, members, channels, roles, emojis)

    interaction.reply({ embeds: [embed], ephemeral: true })
}

function createEmbed(guild: Guild, members: any, channels: any, roles: any, emojis: any) {
    const fields: { name: string, value: string, inline?: boolean }[] = []

    fields.push({ name: 'Members', value: members.size.toString(), inline: true })
    fields.push({ name: 'Channels', value: channels.size.toString(), inline: true })
    fields.push({ name: 'Roles', value: roles.size.toString(), inline: true })
    fields.push({ name: 'Emojis', value: emojis.size.toString(), inline: true })

    const embed = new EmbedBuilder()
        .setTitle(`Guild Info for ${guild.name}`)
        .setThumbnail(guild.iconURL())
        .addFields(fields)
        .setColor('Blue')
        .setTimestamp()
        .setFooter({ text: "Bot maintained and developed by TenCreator"})
    
    return embed
}