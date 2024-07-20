import * as json from '../../config.json'

require('dotenv').config()

export const discordBotToken: string = process.env.DC_BT_TOKEN || ''
export const discordClientId: string = process.env.DC_CL_ID || ''
export const discordClientSecret: string = process.env.DC_CL_SECRET || ''

export const discordDevMode: boolean = process.env.DC_BT_DEV_MODE === 'true' || false
export const discordDevDiscord: string = process.env.DC_BT_DEV_DISCORD || ''

export const debug: boolean = process.env.DEBUG === 'true' || false

export const db_host: string = process.env.DB_HOST || 'localhost'
export const db_user: string = process.env.DB_USER || 'root'
export const db_pass: string = process.env.DB_PASS || ''
export const db_name: string = process.env.DB_NAME || 'ten_bot'

export const loggingChannels: { [key: string]: string } = json.channels.logs