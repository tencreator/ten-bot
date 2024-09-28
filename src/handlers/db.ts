import mysql from 'mysql2/promise';
import { Client } from 'discord.js';
import { db_host, db_pass, db_name, db_user } from '../utils/config'
import { log } from '../utils/log'

class DB {
    private pool: mysql.Pool;

    constructor() {
        this.pool = mysql.createPool({
            host: db_host,
            user: db_user,
            password: db_pass,
            database: db_name
        })
    
        this.pool.on('connection', (connection) => {
            console.log('Connected to MySQL')
        })

        this.pool.on('release', (connection) => {
            console.log('MySQL connection released')
        })

        this.pool.on('enqueue', () => {
            console.log('Waiting for available connection slot')
        })

        this.pool.on('acquire', () => {
            console.log('Connection acquired')
        })
    }

    async connect(): Promise<mysql.PoolConnection> {
        return this.pool.getConnection()
    }

    async query(sql: string, values: any): Promise<[any, any]> {
        const conn = await this.connect()
        try {
            const result = await conn.query(sql, values)
            return [null, result]
        } catch (err) {
            return [err, null]
        }
    }

    async close(): Promise<void> {
        return this.pool.end()
    }
}

class Actions {
    private db: DB;
    private client: Client;
    private logger: log = new log('Actions')

    constructor(client: Client) {
        this.db = new DB()
        this.client = client
    }

    /* User Actions */

    public async getUserData(discordId: string): Promise<[any, any]> {
        return this.db.query('SELECT * FROM users WHERE discord_id = ?', [discordId])
    }

    public async createUserData(discordId: string): Promise<void> {
        try {
            const userProfilePic = this.client.users.cache.get(discordId)?.displayAvatarURL()
            const username = this.client.users.cache.get(discordId)?.username
            await this.db.query('INSERT INTO users (discord_id, pfp, lvls, xp, name) VALUES (?, ?, ?, ?, ?)', [discordId, userProfilePic, 0, 0, username])
        } catch (err) {
            console.error(err)
        }
    }


    public async getUserXP(discordId: string): Promise<number> {
        const [err, result] = await this.db.query('SELECT xp FROM users WHERE discord_id = ?', [discordId])
        if (err) {
            console.error(err)
            return 0
        }

        return result[0][0].xp
    }

    public async setUserXP(discordId: string, xp: number): Promise<void> {
        try {
            await this.db.query('UPDATE users SET xp = ? WHERE discord_id = ?', [xp, discordId])
        } catch (err) {
            console.error(err)
        }
    }

    public async getUserLvl(discordId: string): Promise<number> {
        const [err, result] = await this.db.query('SELECT lvls FROM users WHERE discord_id = ?', [discordId])
        if (err) {
            console.error(err)
            return 0
        }

        return result[0][0].lvls
    }

    public async setUserLvl(discordId: string, lvl: number): Promise<void> {
        try {
            await this.db.query('UPDATE users SET lvls = ? WHERE discord_id = ?', [lvl, discordId])
        } catch (err) {
            console.error(err)
        }
    }

    public async getUserPFP(discordId: string): Promise<string> {
        const [err, result] = await this.db.query('SELECT pfp FROM users WHERE discord_id = ?', [discordId])
        if (err) {
            console.error(err)
            return ''
        }

        return result[0][0].pfp
    }

    public async setUserPFP(discordId: string, pfp: string): Promise<void> {
        try {
            await this.db.query('UPDATE users SET pfp = ? WHERE discord_id = ?', [pfp, discordId])
        } catch (err) {
            console.error(err)
        }
    }

    public async getUserName(discordId: string): Promise<string> {
        const [err, result] = await this.db.query('SELECT name FROM users WHERE discord_id = ?', [discordId])
        if (err) {
            console.error(err)
            return ''
        }

        return result[0][0].name
    }

    public async setUserName(discordId: string, name: string): Promise<void> {
        try {
            await this.db.query('UPDATE users SET name = ? WHERE discord_id = ?', [name, discordId])
        } catch (err) {
            console.error(err)
        }
    }

    public async doesGuildExist(guildId: string): Promise<boolean> {
        const [err, result] = await this.db.query('SELECT * FROM guilds WHERE guildId = ?', [guildId])
        if (err) {
            console.error(err)
            return false
        }

        return result[0].length > 0
    }

    public async createGuild(guildId: string): Promise<void> {
        try {
            await this.db.query('INSERT INTO guilds (guildId, wordFilterEnabled, wordBlackList, wordWhiteList, wordFilterLogChannel) VALUES (?, ?, ?, ?, ?)', [guildId, 0, '', '', ''])
        } catch (err) {
            console.error(err)
        }
    }

    public async doesGuildHaveFilter(guildId: string): Promise<boolean> {
        const [err, result] = await this.db.query('SELECT wordFilterEnabled FROM guilds WHERE guildId = ?', [guildId])
        if (err) {
            console.error(err)
            return false
        }

        return result[0][0].wordFilterEnabled === 1
    }

    public async setGuildFilter(guildId: string, enabled: boolean): Promise<void> {
        try {
            await this.db.query('UPDATE guilds SET wordFilterEnabled = ? WHERE guildId = ?', [enabled ? 1 : 0, guildId])
        } catch (err) {
            console.error(err)
        }
    }

    public async getGuildBlackList(guildId: string): Promise<string> {
        const [err, result] = await this.db.query('SELECT wordBlackList FROM guilds WHERE guildId = ?', [guildId])
        if (err) {
            console.error(err)
            return ''
        }

        return result[0][0].wordBlackList
    }

    public async setGuildBlackList(guildId: string, blackList: string): Promise<void> {
        try {
            await this.db.query('UPDATE guilds SET wordBlackList = ? WHERE guildId = ?', [blackList, guildId])
        } catch (err) {
            console.error(err)
        }
    }

    public async addGuildBlackList(guildId: string, word: string): Promise<void> {
        const blackList = await this.getGuildBlackList(guildId)
        const newBlackList = blackList + ',' + word
        await this.setGuildBlackList(guildId, newBlackList)
    }

    public async removeGuildBlackList(guildId: string, word: string): Promise<void> {
        const blackList = await this.getGuildBlackList(guildId)
        const newBlackList = blackList.replace(word, '')
        await this.setGuildBlackList(guildId, newBlackList)
    }

    public async getGuildWhiteList(guildId: string): Promise<string> {
        const [err, result] = await this.db.query('SELECT wordWhiteList FROM guilds WHERE guildId = ?', [guildId])
        if (err) {
            console.error(err)
            return ''
        }

        return result[0][0].wordWhiteList
    }

    public async setGuildWhiteList(guildId: string, whiteList: string): Promise<void> {
        try {
            await this.db.query('UPDATE guilds SET wordWhiteList = ? WHERE guildId = ?', [whiteList, guildId])
        } catch (err) {
            console.error(err)
        }
    }

    public async addGuildWhiteList(guildId: string, word: string): Promise<void> {
        const whiteList = await this.getGuildWhiteList(guildId)
        const newWhiteList = whiteList + ',' + word
        await this.setGuildWhiteList(guildId, newWhiteList)
    }

    public async removeGuildWhiteList(guildId: string, word: string): Promise<void> {
        const whiteList = await this.getGuildWhiteList(guildId)
        const newWhiteList = whiteList.replace(word, '')
        await this.setGuildWhiteList(guildId, newWhiteList)
    }

    public async getGuildFilterThreshold(guildId: string): Promise<number> {
        const [err, result] = await this.db.query('SELECT wordFilterThreshold FROM guilds WHERE guildId = ?', [guildId])
        if (err) {
            console.error(err)
            return 0
        }

        return result[0][0].wordFilterThreshold
    }

    public async setGuildFilterThreshold(guildId: string, threshold: number): Promise<void> {
        try {
            await this.db.query('UPDATE guilds SET wordFilterThreshold = ? WHERE guildId = ?', [threshold, guildId])
        } catch (err) {
            console.error(err)
        }
    }

    public async getGuildFilterSuffixes(guildId: string): Promise<string> {
        const [err, result] = await this.db.query('SELECT wordFilterSuffixes FROM guilds WHERE guildId = ?', [guildId])
        if (err) {
            console.error(err)
            return ''
        }

        return result[0][0].wordFilterSuffixes
    }

    public async setGuildFilterSuffixes(guildId: string, suffixes: string): Promise<void> {
        try {
            await this.db.query('UPDATE guilds SET wordFilterSuffixes = ? WHERE guildId = ?', [suffixes, guildId])
        } catch (err) {
            console.error(err)
        }
    }

    public async getGuildLogChannel(guildId: string): Promise<string> {
        const [err, result] = await this.db.query('SELECT wordFilterLogChannel FROM guilds WHERE guildId = ?', [guildId])
        if (err) {
            console.error(err)
            return ''
        }

        return result[0][0].wordFilterLogChannel
    }

    public async setGuildLogChannel(guildId: string, channelId: string): Promise<void> {
        try {
            await this.db.query('UPDATE guilds SET wordFilterLogChannel = ? WHERE guildId = ?', [channelId, guildId])
        } catch (err) {
            console.error(err)
        }
    }

    public async setupDatabase(): Promise<[boolean, any]> {
        try {
            await this.db.query(
                'START TRANSACTION',
                []
            )

            await this.db.query(
                'CREATE TABLE IF NOT EXSITS `users` (\
                    `id` int NOT NULL,\
                    `discord_id` varchar(255) CHARACTER SET utf8mb4 COLLATE utf8mb4_0900_ai_ci NOT NULL,\
                    `name` varchar(64) NOT NULL,\
                    `pfp` varchar(255) CHARACTER SET utf8mb4 COLLATE utf8mb4_0900_ai_ci DEFAULT NULL,\
                    `xp` int NOT NULL,\
                    `lvls` int NOT NULL\
                ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;',
                []
            )
            
            await this.db.query(
                'ALTER TABLE `users`\
                    ADD PRIMARY KEY (`id`),\
                    ADD UNIQUE KEY `discord_id` (`discord_id`);',
                []
            )

            await this.db.query(
                'CREATE TABLE IF NOT EXSITS `guilds` (\
                    `id` int NOT NULL,\
                    `guildId` varchar(255) CHARACTER SET utf8mb4 COLLATE utf8mb4_0900_ai_ci NOT NULL,\
                    `wordFilterEnabled` tinyint(1) NOT NULL,\
                    `wordBlackList` text CHARACTER SET utf8mb4 COLLATE utf8mb4_0900_ai_ci,\
                    `wordWhiteList` text CHARACTER SET utf8mb4 COLLATE utf8mb4_0900_ai_ci,\
                    `wordFilterLogChannel` varchar(255) CHARACTER SET utf8mb4 COLLATE utf8mb4_0900_ai_ci,\
                    `wordFilterThreshold` int NOT NULL,\
                    `wordFilterSuffixes` text CHARACTER SET utf8mb4 COLLATE utf8mb4_0900_ai_ci\
                ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;',
                []
            )

            await this.db.query(
                'ALTER TABLE `guilds`\
                    ADD PRIMARY KEY (`id`),\
                    ADD UNIQUE KEY `guildId` (`guildId`);',
                []
            )
            
            await this.db.query(
                'COMMIT',
                []
            )

            return [true, null]
        } catch (err: any) {
            this.logger.error('Error setting up database')
            this.logger.error(JSON.stringify(err))

            return [false, err]
        }
    }
}

export { Actions }
export default Actions