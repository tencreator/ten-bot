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

    public async setupDatabase(): Promise<[boolean, any]> {
        try {
            await this.db.query(
                'START TRANSACTION',
                []
            )

            await this.db.query(
                'CREATE TABLE `users` (\
                    `id` int NOT NULL,\
                    `name` varchar(64) NOT NULL,\
                    `pfp` varchar(255) CHARACTER SET utf8mb4 COLLATE utf8mb4_0900_ai_ci DEFAULT NULL,\
                    `xp` int NOT NULL,\
                    `lvls` int NOT NULL\
                ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;',
                []
            )
            
            await this.db.query(
                'ALTER TABLE `users`\
                    ADD PRIMARY KEY (id),\
                    ADD KEY (id)',
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