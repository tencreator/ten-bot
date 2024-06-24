import { Events, ActivityType } from "discord.js"
import { log } from "../utils/log"

module.exports = {
    name: Events.ClientReady,
    once: true,

    execute: async (client: any, _: unknown, log: log) => {
        log.info(`Logged in as ${client.user.tag}`)

        client.user.setActivity({
            name: 'with discord.js',
            type: ActivityType.Playing
        })
    }
}