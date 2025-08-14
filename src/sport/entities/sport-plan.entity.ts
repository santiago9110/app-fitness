import {
  Column,
  Entity,
  ManyToOne,
  OneToMany,
  PrimaryGeneratedColumn,
} from 'typeorm';
import { Sport } from './sport.entity';
import { Fee } from '../../fee/entities/fee.entity';
import { Student } from '../../student/entities/student.entity';

@Entity('sport_plans')
export class SportPlan {
  @PrimaryGeneratedColumn()
  id: number;

  @Column()
  name: string; // Ej: "2 veces por semana", "3 veces por semana", "Todos los días"

  @Column()
  weeklyFrequency: number; // Cantidad de días por semana (2, 3, 7, etc.)

  @Column('decimal', { precision: 10, scale: 2 })
  monthlyFee: number; // Precio específico para este plan

  @Column({
    nullable: true,
  })
  description: string; // Descripción adicional del plan

  @Column({ default: true })
  isActive: boolean; // Para poder activar/desactivar planes

  // Relación con el deporte
  @ManyToOne(() => Sport, (sport) => sport.sportPlans)
  sport: Sport;

  @Column()
  sportId: number;

  // Relaciones que antes estaban en Sport
  @OneToMany(() => Fee, (fee) => fee.sportPlan)
  fees: Fee[];

  @OneToMany(() => Student, (student) => student.sportPlan)
  students: Student[];
}
