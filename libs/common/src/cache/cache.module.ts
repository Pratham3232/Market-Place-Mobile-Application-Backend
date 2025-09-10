import { createKeyv, Keyv } from '@keyv/redis';
import { CacheModule as NestCacheModule } from '@nestjs/cache-manager';
import { Module, Logger } from '@nestjs/common';
import { CacheableMemory } from 'cacheable';
import Redis from 'ioredis';

@Module({
    imports: [
        NestCacheModule.registerAsync({
            useFactory: async () => {
                const logger = new Logger('CacheModule');
                const redisUrl = process.env.REDIS_HOST as string;
                try {
                    const redis = new Redis(redisUrl);
                    await redis.ping();
                    logger.log('Successfully connected to Redis');
                    redis.disconnect();

                    return {
                        stores: [
                            new Keyv({
                                store: new CacheableMemory({ ttl: 60000, lruSize: 5000 }),
                            }),
                            createKeyv(redisUrl),
                        ],
                    };
                } catch (error) {
                    logger.error(`Failed to connect to Redis: ${error.message}`);
                    logger.warn('Falling back to in-memory cache only');

                    return {
                        stores: [
                            new Keyv({
                                store: new CacheableMemory({ ttl: 60000, lruSize: 5000 }),
                            }),
                        ],
                    };
                }
            },
        }),
    ],
    exports: [NestCacheModule]
})
export class CacheModule { }