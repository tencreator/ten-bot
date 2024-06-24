import chalk from 'chalk'
import fs from 'node:fs'
import { debug as debugCfg } from './config'

class log extends Error {
    private module: string
    private date: string
    private data: string[]
    private readonly chalkRegex: RegExp = /\x1b\[[0-9;]*m/g;
    private readonly template: string = [
        chalk.gray('['),
        '{{DATE}}',
        chalk.grey('] '),
        chalk.gray('['),
        chalk.magenta('{{MODULE}}'),
        chalk.grey('] '),
        chalk.gray('['),
        '{{KIND}}',
        chalk.grey(']: '),
        '{{MESSAGE}}'
    ].join('')

    constructor(module: string) {
        super()
        this.module = module
        this.date = new Date().toISOString().split('T')[0]
        this.data = []

        if (!fs.existsSync('./files')) fs.mkdirSync('./files')
        if (!fs.existsSync('./files/logs')) fs.mkdirSync('./files/logs')
        if (!fs.existsSync('./files/logs/'+this.date)) fs.mkdirSync('./files/logs/'+this.date)
        
        if (!fs.existsSync('./files/logs/'+this.date+'/'+this.module+'.log')) {
            this.data = []
        } else {
            this.data = fs.readFileSync('./files/logs/'+this.date+'/'+this.module+'.log').toString().split('\n')
            this.data = [
                ...this.data,
                '',
                '----------------------------------------',
                '- New log instance started at '+new Date().toISOString().split('T')[1].split('.')[0]+' -',
                '----------------------------------------',
                ''
            ]
        }


        fs.writeFileSync('./files/logs/'+this.date+'/'+this.module+'.log', this.data.join('\n'))
    }

    public async writeLog(rawMsg: string, kind: string, debug?: boolean) {
        const date = chalk.yellow(this.date)

        const msg = this.template
            .replace('{{DATE}}', date)
            .replace('{{MODULE}}', this.module)
            .replace('{{KIND}}', kind)
            .replace('{{MESSAGE}}', rawMsg)

        this.data.push(msg.replace(this.chalkRegex, ''))

        fs.writeFileSync('./files/logs/'+this.date+'/'+this.module+'.log', this.data.join('\n'))

        if (kind == chalk.blue('DEBUG') && !debug) return
        else return console.log(msg)
    }

    public async info(msg: string) {
        this.writeLog(msg, chalk.blue('INFO'))
    }

    public async warn(msg: string) {
        this.writeLog(msg, chalk.yellow('WARN'))
    }

    public async error(msg: string) {
        this.writeLog(msg, chalk.red('ERROR'))
    }

    public async debug(msg: string, debug?: boolean) {
        this.writeLog(msg, chalk.cyan('DEBUG'), debug ?? debugCfg)
    }

    public async fatal(msg: string) {
        this.writeLog(msg, chalk.bgRed.cyan('FATAL'))
    }
}

export default log
export { log }