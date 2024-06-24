import { GuildMember, EmbedBuilder, Guild, PermissionsBitField } from "discord.js"
import { loggingChannels } from "../../utils/config"
import log from "../../utils/log"

export default async function kick(interaction: any, logger: log) {
    const user = interaction.options.getUser('user')
    const reason = interaction.options.getString('reason') || 'No reason provided'
    const response: string[] = []
    
    const member: GuildMember = interaction.guild.members.cache.get(user.id) as GuildMember
    const memberHighestRole = member?.roles?.highest

    const staff: GuildMember = interaction.member as GuildMember
    const staffHighestRole = staff?.roles?.highest

    if (!staff.permissions.has(PermissionsBitField.Flags.KickMembers || PermissionsBitField.Flags.Administrator)) response.push('You do not have the required permissions to ban members');
    if (!member) response.push('Member not found');
    if (member.id === interaction.user.id) response.push('You cannot kick yourself');
    if (member.id === interaction.guild.ownerId) response.push('You cannot kick the server owner');
    if (member.id === interaction.client.user.id) response.push('You cannot kick me');
    if (staffHighestRole.comparePositionTo(memberHighestRole) <= 0) response.push('You cannot kick a member with a higher or equal role');

    const logChannel = interaction.guild.channels.cache.get(loggingChannels.moderation)
    if (!logChannel) response.push('No logging channel found');

    if (response.length) {
        const embed = await createErrorEmbed(response)
        return staff.send({ embeds: [embed] })
    }

    const logEmbed = await createLogEmbed(staff, member, reason, interaction.guild)
    const memberEmbed = await createMemberEmbed(staff, member, reason, interaction.guild)

    await member.send({ embeds: [memberEmbed] })
    await member.kick(reason + ' - Kicked by ' + staff.user.displayName)

    await logChannel.send({ embeds: [logEmbed] })
    await interaction.reply({ content: 'User has been kicked', ephemeral: true, embeds: [logEmbed] })
}

async function createLogEmbed(staff: GuildMember, member: GuildMember, reason: string, guild: Guild): Promise<EmbedBuilder> {
    const fields: { name: string, value: string, inline?: boolean }[] = []

    const title = '{{KICK_BOOT}} **{{KICKED_NAME}}** has been kicked from **{{GUILD_NAME}}** by **{{STAFF_NAME}}** {{KICK_BOOT}}'
        .replaceAll('{{KICKED_NAME}}', member.displayName)
        .replaceAll('{{GUILD_NAME}}', guild.name)
        .replaceAll('{{STAFF_NAME}}', staff.displayName)
        .replaceAll('{{KICK_BOOT}}', '👢')
    
    fields.push({ name: 'Kicked Member', value: `<@${member.id}>`, inline: true })
    fields.push({ name: 'Display Name', value: member.displayName, inline: true })
    fields.push({ name: 'ID', value: member.id, inline: true })
    fields.push({ name: 'Kicked By', value: `<@${staff.id}>`, inline: true })
    fields.push({ name: 'Display Name', value: staff.displayName, inline: true })
    fields.push({ name: 'ID', value: staff.id, inline: true })
    fields.push({ name: 'Reason', value: reason, inline: false })

    const embed = new EmbedBuilder()
        .setColor('Orange')
        .setTitle(title)
        .setThumbnail(member.user.displayAvatarURL())
        .addFields(fields)
        .setTimestamp()
        .setFooter({ text: 'Bot maintainted and developed by TenCreator' })

    return embed
}

async function createMemberEmbed(staff: GuildMember, member: GuildMember, reason: string, guild: Guild): Promise<EmbedBuilder> {
    const title = 'You have been kicked from **{{GUILD_NAME}}** by **{{STAFF_NAME}}** {{KICKED_BOOT}}'
        .replaceAll('{{GUILD_NAME}}', guild.name)
        .replaceAll('{{STAFF_NAME}}', staff.displayName)
        .replaceAll('{{KICKED_BOOT}}', '👢')

    const fields: { name: string, value: string, inline?: boolean }[] = []

    fields.push({ name: 'Kicked By', value: `<@${staff.id}>`, inline: true })
    fields.push({ name: 'Display Name', value: staff.displayName, inline: true })
    fields.push({ name: 'ID', value: staff.id, inline: true })
    fields.push({ name: 'Reason', value: reason, inline: false })
    
    const embed = new EmbedBuilder()
        .setColor('Red')
        .setTitle(title)
        .setThumbnail(staff.user.displayAvatarURL())
        .addFields(fields)
        .setTimestamp()
        .setFooter({ text: 'Bot maintainted and developed by TenCreator' })

    return embed
}

async function createErrorEmbed(issues: string[]): Promise<EmbedBuilder> {
    const embed = new EmbedBuilder()
        .setColor('Red')
        .setTitle('Error performing command.')
        .setDescription('There was an error processing your request')
        .addFields(issues.map((issue, index) => ({ name: 'Issue #'+(index+1), value: issue })))
        .setTimestamp()
        .setFooter({ text: 'Bot maintainted and developed by TenCreator' })

    return embed
}