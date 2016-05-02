var winston = require('winston');

// Requiring `winston-gae` will expose
// `winston.transports.GoogleAppEngine`
// and
// `winston.config.GoogleAppEngine.levels`
require('winston-gae');

var isDev = false;
if (process.env.DEV == 'true') {
    isDev = true;
    global.isDev = isDev;
}


//console.log(process.env.DEV);
//console.log(isDev);

logger = new winston.Logger({
    levels: winston.config.GoogleAppEngine.levels,
    transports: [
        new (winston.transports.Console)(
            {
                level: (isDev == true ? 'debug' : 'emergency'),
                //handleExceptions: true,
                //json: true,
                colorize: true
            }),
        new winston.transports.GoogleAppEngine({
            // capture logs at emergency level and above (all levels)
            level: 'emergency'
        })
    ],
    exitOnError: true
});



global.logger = logger;