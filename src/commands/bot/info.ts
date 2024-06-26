import { EmbedBuilder, Collection } from 'discord.js'
import log from '../../utils/log';

interface BotInfo {
    name: string,
    version: string,
    id: number,
    tag: string,
    uptime: string,
    createdAt: string
}

interface SystemInfo {
    apiSpeed: number,
    guilds: number,
    users: number,
    commands: number,
    subCommands: number,
    nodeVersion: string,
    platform: string,
    memoryUsage: string
}

export default async function info(interaction: any, commands: Collection<string, any>, logger: log) {
    const bot: BotInfo = {
        name: interaction.client.user.username,
        tag: interaction.client.user.tag,
        version: '0.0.1 DEVELOPMENT',
        id: interaction.client.user.id,
        uptime: convertUptime(interaction.client.uptime),
        createdAt: `<t:${Math.floor(interaction.client.user.createdTimestamp / 1000)}>`
    }

    const system: SystemInfo = {
        apiSpeed: interaction.client.ws.ping,
        guilds: interaction.client.guilds.cache.size,
        users: interaction.client.users.cache.size,
        commands: commands.size,
        subCommands: commands.filter(cmd => cmd.data.type === 'SUB_COMMAND').size,
        nodeVersion: process.version,
        platform: process.platform,
        memoryUsage: `${Math.round(process.memoryUsage().heapUsed / 1024 / 1024)}MB`
    }

    const embed = createEmbed(bot, system)

    interaction.reply({ embeds: [embed], ephemeral: true })
}

function convertUptime(uptime: number) {
    const string: string[] = []

    let seconds = Math.floor(uptime / 1000)
    let minutes = Math.floor(seconds / 60)
    let hours = Math.floor(minutes / 60)
    let days = Math.floor(hours / 24)

    seconds %= 60
    minutes %= 60
    hours %= 24

    if (days) string.push(`${days}d`);
    if (hours) string.push(`${hours}h`);
    if (minutes) string.push(`${minutes}m`);
    if (seconds) string.push(`${seconds}s`);

    return string.join(' ') || '0s'
}

function createEmbed(bot: BotInfo, system: SystemInfo) {
    const fields: { name: string, value: string, inline?: boolean }[] = []
    
    fields.push({ name: '**Bot Information**', value: '\u200b', inline: false })
    fields.push({ name: 'Bot Name', value: bot.name, inline: true })
    fields.push({ name: 'Bot Tag', value: bot.tag, inline: true })
    fields.push({ name: 'Bot Uptime', value: bot.uptime, inline: true })
    fields.push({ name: 'Bot Version', value: bot.version, inline: true })
    fields.push({ name: 'Bot ID', value: bot.id.toString(), inline: true })
    fields.push({ name: 'Bot Created At', value: bot.createdAt, inline: true })
    fields.push({ name: '\u200b\n**System Information**', value: '\u200b', inline: false })
    fields.push({ name: 'API Speed', value: `${system.apiSpeed}ms`, inline: true })
    fields.push({ name: 'Guilds', value: system.guilds.toString(), inline: true })
    fields.push({ name: 'Users', value: system.users.toString(), inline: true })
    fields.push({ name: 'Commands', value: system.commands.toString(), inline: true })
    fields.push({ name: 'Sub Commands', value: system.subCommands.toString(), inline: true })
    fields.push({ name: 'Node Version', value: system.nodeVersion, inline: true })
    fields.push({ name: 'Platform', value: system.platform, inline: true })
    fields.push({ name: 'Memory Usage', value: system.memoryUsage, inline: true })
    fields.push({ name: '\u200b', value: '\u200b', inline: true })
    fields.push({ name: 'Links', value: `[Invite Me](https://discord.com/oauth2/authorize?client_id=${bot.id}&permissions=8&scope=applications.commands%20bot) | [Support Server](https://discord.gg/9SRJhAGqbZ) | [GitHub](https://github.com/tencreator/ten-bot)`})

    return new EmbedBuilder()
        .setTitle('ⓘ・Bot information')
        .setColor('Blue')
        .addFields(fields)
        .setFooter({ text: 'Bot maintainted and developed by TenCreator' })
        .setTimestamp()
}