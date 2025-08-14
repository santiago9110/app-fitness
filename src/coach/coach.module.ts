import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { CoachService } from './coach.service';
import { CoachController } from './coach.controller';
import { Coach } from './entities/coach.entity';
import { User } from '../auth/entities/user.entity';
import { Sport } from '../sport/entities/sport.entity';
import { Role } from '../roles/entities/rol.entity';
import { AuthModule } from '../auth/auth.module';

@Module({
  imports: [TypeOrmModule.forFeature([Coach, User, Sport, Role]), AuthModule],
  controllers: [CoachController],
  providers: [CoachService],
  exports: [CoachService, TypeOrmModule],
})
export class CoachModule {}
