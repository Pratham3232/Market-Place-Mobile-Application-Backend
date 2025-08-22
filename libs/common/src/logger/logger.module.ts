import { Module } from '@nestjs/common';
import { LoggerModule as PinoLoggerModule } from 'nestjs-pino';

@Module({
    imports: [
        PinoLoggerModule.forRoot({
            pinoHttp: {
                transport: {
                    target: 'pino-pretty',
                    options: {
                        level: true,
                        timestamp: true,
                        prettyPrint: true,
                        colorize: true,
                        singleLine: true,
                    }
                }
            }
        })
    ]
})
export class LoggerModule { }