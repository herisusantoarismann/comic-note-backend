import { MiddlewareConsumer, Module, NestModule } from '@nestjs/common';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { ConfigModule } from '@nestjs/config';
import { AuthModule } from './modules/auth/auth.module';
import { ComicModule } from './modules/comic/comic.module';
import { AuthMiddleware } from './shared/middlewares/auth.middleware';

@Module({
  imports: [ConfigModule.forRoot(), AuthModule, ComicModule],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule implements NestModule {
  configure(consumer: MiddlewareConsumer) {
    consumer.apply(AuthMiddleware).exclude('auth');
  }
}
