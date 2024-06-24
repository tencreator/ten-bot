import { BotHandler } from './handlers/bot'

const bot: BotHandler = new BotHandler();

(async () => {
    await bot.initalizeEvents()
    await bot.initalizeCmds()
    await bot.refreshCmds()
    await bot.login()
})()