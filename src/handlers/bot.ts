import { Client, Collection, Events, GatewayIntentBits, Partials } from "discord.js"
import fs from 'node:fs'
import path from 'node:path'

import { discordBotToken, discordClientId } from "../utils/config"
import { log } from "../utils/log"

class BotHandler {
    private client: Client
    private commands: Collection<string, any>
    private logger: log = new log('BotHandler')
    private readonly eventsPath = path.join(__dirname, '../events')
    private readonly commandsPath = path.join(__dirname, '../commands')

    constructor() {
        this.client = new Client({
            allowedMentions: {
                parse: [
                    'users',
                    'roles'
                ],
                repliedUser: true
            },
            partials: [
                Partials.Channel,
                Partials.GuildMember,
                Partials.Message,
                Partials.Reaction,
                Partials.GuildScheduledEvent
            ],
            intents: [
                GatewayIntentBits.Guilds,
                GatewayIntentBits.GuildMembers,
                GatewayIntentBits.GuildEmojisAndStickers,
                GatewayIntentBits.GuildIntegrations,
                GatewayIntentBits.GuildWebhooks,
                GatewayIntentBits.GuildInvites,
                GatewayIntentBits.GuildVoiceStates,
                GatewayIntentBits.GuildMessages,
                GatewayIntentBits.GuildMessageReactions,
                GatewayIntentBits.GuildMessageTyping,
                GatewayIntentBits.DirectMessages,
                GatewayIntentBits.DirectMessageReactions,
                GatewayIntentBits.DirectMessageTyping,
                GatewayIntentBits.GuildScheduledEvents,
                GatewayIntentBits.MessageContent
            ],
        })

        this.commands = new Collection()
    
        this.client.on('error', console.error)
    }

    public async initalizeCmds() {
        this.logger.info('Initalizing commands')

        const folders = fs.readdirSync(this.commandsPath).filter(folder => fs.lstatSync(path.join(this.commandsPath, folder)).isDirectory())
        for (const folder of folders) {
            const cmdPath = path.join(this.commandsPath, folder, 'index.ts')
            if (!fs.existsSync(cmdPath)) continue
            const cmd = require(cmdPath)
            
            if ('data' in cmd && 'execute' in cmd) {
                this.logger.debug(`Loading commands from ${folder}`)
                this.commands.set(cmd.data.name, cmd)
            } else {
                this.logger.error(`Error loading command ${folder}`)
            }
        }
    }

    public async initalizeEvents() {
        this.logger.info('Initalizing events')
        const events = fs.readdirSync(this.eventsPath).filter(file => file.endsWith('.ts'))

        for (const event of events) {
            const eventPath = path.join(this.eventsPath, event)
            const evt = require(eventPath)
            
            if ('name' in evt && 'execute' in evt){
                this.logger.debug(`Loading event ${evt.name || event}`)

                if (evt.once) this.client.once(evt.name, (...args) => evt.execute(...args, this.commands, this.logger))
                else this.client.on(evt.name, (...args) => evt.execute(...args, this.commands, this.logger))
            } else {
                this.logger.error(`Error loading event ${event}`)
            }

        }
    }

    public async reloadCmds() {
        this.commands.clear()
        await this.initalizeCmds()
    }

    public async reloadEvents() {
        this.client.removeAllListeners()
        await this.initalizeEvents()
    }

    public async refreshCmds(){
        const { REST, Routes } = await import('discord.js')
        const rest = new REST({ version: '10' }).setToken(discordBotToken)
        if (this.commands.size === 0) await this.initalizeCmds()
        const commands = this.commands.map(cmd => cmd.data.toJSON())

        try {
            this.logger.info(`Started refreshing ${commands.length} application (/) commands.`)

            const data: any = await rest.put(
                Routes.applicationGuildCommands(discordClientId, '1254178290915213332'),
                { body: commands },
            )

            this.logger.info(`Successfully reloaded application (/) commands. ${data.length}`)
        } catch (err: any) {
            this.logger.error(err.toString())
        }
    }

    public async login() {
        await this.client.login(discordBotToken)
    }
}

export default BotHandler
export { BotHandler }