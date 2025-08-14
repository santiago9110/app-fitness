import { Module } from '@nestjs/common';
import { SportService } from './sport.service';
import { SportController } from './sport.controller';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Sport } from './entities/sport.entity';
import { SportPlan } from './entities/sport-plan.entity';

@Module({
  controllers: [SportController],
  providers: [SportService],
  imports: [TypeOrmModule.forFeature([Sport, SportPlan])],
  exports: [SportService], // Exportar para que otros módulos puedan usar el servicio
})
export class SportModule {}
