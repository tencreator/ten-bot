import { BotHandler } from './handlers/bot'
import { log } from './utils/log';
import { discordBotToken, discordClientId } from './utils/config';

const bot: BotHandler = new BotHandler(new log('BOT-Handler'));

(async () => {
    await bot.initalizeEvents()
    await bot.initalizeCmds()
    await bot.refreshCmds(discordBotToken, discordClientId)
    await bot.login(discordBotToken)
})()