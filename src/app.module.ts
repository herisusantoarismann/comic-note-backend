import { Module, ValidationPipe } from '@nestjs/common';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { UserController } from './user/user.controller';
import { UserService } from './user/user.service';
import { PrismaService } from './prisma.service';
import { APP_PIPE } from '@nestjs/core';
import { DocumentBuilder, SwaggerModule } from '@nestjs/swagger';

@Module({
  imports: [],
  controllers: [AppController, UserController],
  providers: [
    AppService,
    UserService,
    PrismaService,
    {
      provide: APP_PIPE,
      useClass: ValidationPipe,
    },
  ],
})
export class AppModule {}
