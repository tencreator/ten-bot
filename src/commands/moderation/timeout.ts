import { GuildMember, EmbedBuilder, Guild, PermissionsBitField } from "discord.js"
import { loggingChannels } from "../../utils/config"
import log from "../../utils/log"

export default async function timeout(interaction: any, logger: log) {
    const user = interaction.options.getUser('user')
    const reason = interaction.options.getString('reason') || 'No reason provided'
    const response: string[] = []
    
    const member: GuildMember = interaction.guild.members.cache.get(user.id) as GuildMember
    const memberHighestRole = member?.roles?.highest

    const staff: GuildMember = interaction.member as GuildMember
    const staffHighestRole = staff?.roles?.highest

    if (!staff.permissions.has(PermissionsBitField.Flags.ModerateMembers) && !staff.permissions.has(PermissionsBitField.Flags.Administrator)) response.push('You do not have the required permissions to timeout members');
    if (!member) response.push('Member not found');
    if (member.id === interaction.user.id) response.push('You cannot timeout yourself');
    if (member.id === interaction.guild.ownerId) response.push('You cannot timeout the server owner');
    if (member.id === interaction.client.user.id) response.push('You cannot timeout me');
    if (staffHighestRole.comparePositionTo(memberHighestRole) <= 0) response.push('You cannot timeout a member with a higher or equal role');

    const logChannel = interaction.guild.channels.cache.get(loggingChannels.moderation)
    if (!logChannel) response.push('No logging channel found');

    if (response.length) {
        const embed = await createErrorEmbed(response)
        return staff.send({ embeds: [embed] })
    }

    const logEmbed = await createLogEmbed(staff, member, reason, interaction.guild)
    const memberEmbed = await createMemberEmbed(staff, member, reason, interaction.guild)

    await member.send({ embeds: [memberEmbed] })
    await member.kick(reason + ' - Timed out by ' + staff.user.displayName)

    await logChannel.send({ embeds: [logEmbed] })
    await interaction.reply({ content: 'User has been timed out', ephemeral: true, embeds: [logEmbed] })
}

async function createLogEmbed(staff: GuildMember, member: GuildMember, reason: string, guild: Guild): Promise<EmbedBuilder> {
    const fields: { name: string, value: string, inline?: boolean }[] = []

    const title = '{{TIMED_OUT_CLOCK}} **{{TIMED_OUT_NAME}}** has been timed out on **{{GUILD_NAME}}** by **{{STAFF_NAME}}** {{TIMED_OUT_CLOCK}}'
        .replaceAll('{{TIMED_OUT_NAME}}', member.displayName)
        .replaceAll('{{GUILD_NAME}}', guild.name)
        .replaceAll('{{STAFF_NAME}}', staff.displayName)
        .replaceAll('{{TIMED_OUT_CLOCK}}', '🕒')
    
    fields.push({ name: 'Timed out Member', value: `<@${member.id}>`, inline: true })
    fields.push({ name: 'Display Name', value: member.displayName, inline: true })
    fields.push({ name: 'ID', value: member.id, inline: true })
    fields.push({ name: 'Timeouted By', value: `<@${staff.id}>`, inline: true })
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
    const title = 'You have been timed out on **{{GUILD_NAME}}** by **{{STAFF_NAME}}** {{TIMED_OUT_CLOCK}}'
        .replaceAll('{{GUILD_NAME}}', guild.name)
        .replaceAll('{{STAFF_NAME}}', staff.displayName)
        .replaceAll('{{TIMED_OUT_CLOCK}}', '🕒')

    const fields: { name: string, value: string, inline?: boolean }[] = []

    fields.push({ name: 'Timed out By', value: `<@${staff.id}>`, inline: true })
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