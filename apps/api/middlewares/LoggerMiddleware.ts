import log4js = require('log4js');
import {MiddlewareGlobalBefore, MiddlewareInterface} from "routing-controllers";

let env = process.env.NODE_ENV || 'dev';

// ディレクトリなければ作成(初回アクセス時だけ)
let logDir = `${__dirname}/../../../logs/${env}/api`;
// let fs = require('fs-extra');
// fs.mkdirsSync(logDir);

log4js.configure({
    appenders: [
        {
            category: 'access', // アクセスログ
            type: 'dateFile',
            filename: `${logDir}/access.log`,
            pattern: '-yyyy-MM-dd',
        },
        {
            category: 'system', // その他のアプリログ(DEBUG、INFO、ERRORなど)
            type: 'dateFile',
            filename: `${logDir}/system.log`,
            pattern: '-yyyy-MM-dd',
        },
        {
            type: 'console'
        }
    ],
    levels: {
        access: (env === 'dev') ? log4js.levels.ALL.toString() : log4js.levels.OFF.toString(),
        system: (env === 'prod') ? log4js.levels.INFO.toString() : log4js.levels.ALL.toString()
    },
    replaceConsole: (env === 'prod') ? false : true
});

@MiddlewareGlobalBefore()
export class LoggerMiddleware implements MiddlewareInterface {
    use(request: any, response: any, next?: (err?: any) => any): any {
        if (process.env.NODE_ENV === 'dev') return log4js.connectLogger(log4js.getLogger('access'), {})(request, response, next);
        next();
    }
}
