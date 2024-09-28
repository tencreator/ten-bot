import { Events, Collection, Message, EmbedBuilder } from 'discord.js'
import Actions from '../handlers/db';
import log from '../utils/log';
import Filter from '../handlers/filter';

module.exports = {
    name: Events.MessageCreate,
    async execute(message: Message, log: log, Commands: Collection<string, any>, db: Actions) {
        if (message.author.bot) return
        const guildId: string = message.guildId || 'dm'
        if (guildId === 'dm') return // Can do smth later

        if (!await db.doesGuildExist(guildId)) {
            await db.createGuild(guildId)
        }

        if (await db.doesGuildHaveFilter(guildId)) {
            const blacklist = await db.getGuildBlackList(guildId)
            const whitelist = await db.getGuildWhiteList(guildId)
            const suffixes = await db.getGuildFilterSuffixes(guildId)
            const threshold = await db.getGuildFilterThreshold(guildId)

            const filter = new Filter()
            const result = filter.filter(message.content, '*', JSON.parse(blacklist), JSON.parse(whitelist), threshold, JSON.parse(suffixes))

            if (result.filtered !== message.content) {
                message.delete()

                const user = await message.author.fetch()
                const fields = []
                fields.push({ name: 'User', value: user.tag, inline: true })
                fields.push({ name: 'User ID', value: user.id, inline: true })
                fields.push({ name: 'Filtered Message', value: result.filtered })
                fields.push({ name: 'Unfiltered Message', value: result.input })
                
                const embed = new EmbedBuilder()
                    .setTitle('Message Filtered')
                    .addFields(fields)
                    .setColor('Red')
                    .setTimestamp()
                    .setFooter({ text: 'Bot maintained and developed by TenCreator' })

                user.send({ embeds: [embed] })

                fields.push({ name: 'Channel', value: `<#${message.channel.id}>`, inline: true })
                fields.push({ name: 'Channel ID', value: message.channel.id, inline: true })
                fields.push({ name: 'Matched with', value: Object.keys(result.words).filter((word) => result.words[word].bad).join('\n') })

                const modEmbed = new EmbedBuilder()
                    .setTitle('Message Filtered')
                    .addFields(fields)
                    .setColor('Red')
                    .setTimestamp()
                    .setFooter({ text: 'Bot maintained and developed by TenCreator' })

                if (await db.getGuildLogChannel(guildId) && message.guild) {
                    const modChannel = await message.guild.channels.fetch(await db.getGuildLogChannel(guildId))
                    if (modChannel && modChannel.isTextBased()) {
                        modChannel.send({ embeds: [modEmbed] })
                    } else {
                        log.warn('Log channel set for guild ' + guildId + ' is not a text channel')
                    }
                } else {
                    log.warn('No log channel set for guild ' + guildId)
                }
            }
        }
    }
}