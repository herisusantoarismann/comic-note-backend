import { MiddlewareConsumer, Module, NestModule } from '@nestjs/common';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { AuthModule } from './modules/auth/auth.module';
import { ComicModule } from './modules/comic/comic.module';
import { AuthMiddleware } from './shared/middlewares/auth.middleware';
import { NotificationModule } from './modules/notification/notification.module';
import { CacheModule } from '@nestjs/cache-manager';
import { redisStore } from 'cache-manager-redis-yet';
import { LogModule } from './modules/log/log.module';
import { UserModule } from './modules/user/user.module';
import { GenreModule } from './modules/genre/genre.module';
import { ServeStaticModule } from '@nestjs/serve-static';
import { join } from 'path';
import { FavoriteModule } from './modules/favorite/favorite.module';

@Module({
  imports: [
    ConfigModule.forRoot(),
    AuthModule,
    ComicModule,
    NotificationModule,
    CacheModule.registerAsync({
      imports: [ConfigModule],
      inject: [ConfigService],
      isGlobal: true,
      useFactory: async (configService: ConfigService) => {
        const store = await redisStore({
          socket: {
            host: configService.get('REDIS_HOST'),
            port: configService.get('REDIS_PORT'),
          },
          ttl: 30 * 1000,
        });

        return { store };
      },
    }),
    LogModule,
    UserModule,
    GenreModule,
    ServeStaticModule.forRoot({
      rootPath: join(__dirname, '..', 'uploads'),
      serveRoot: '/uploads/',
    }),
    FavoriteModule,
  ],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule implements NestModule {
  configure(consumer: MiddlewareConsumer) {
    consumer
      .apply(AuthMiddleware)
      .exclude('auth/(.*)', 'uploads/(.*)')
      .forRoutes('*');
  }
}
