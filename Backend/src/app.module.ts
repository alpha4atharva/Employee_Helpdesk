import { Module } from '@nestjs/common';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { AuthModule } from './auth/auth.module';
import { UsersModule } from './users/users.module';
import { TicketsModule } from './tickets/tickets.module';
import { MessagesModule } from './messages/messages.module';
import { SlaModule } from './sla/sla.module';
import { TypeOrmModule } from '@nestjs/typeorm';
import { ScheduleModule } from '@nestjs/schedule';
import { AssetsModule } from './assets/assets.module';
@Module({
  imports: [AuthModule, UsersModule, TicketsModule, MessagesModule, SlaModule, TypeOrmModule.forRoot({
      type: 'sqlite',
      database: 'db.sqlite',
      autoLoadEntities: true,
      synchronize: true, 
    }),
  ScheduleModule.forRoot(),
  AssetsModule,
],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule {}
