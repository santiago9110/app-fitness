import { Fee } from '../../fee/entities/fee.entity';
import { Student } from '../../student/entities/student.entity';
import { SportPlan } from './sport-plan.entity';
import { Coach } from '../../coach/entities/coach.entity';
import {
  Column,
  Entity,
  OneToMany,
  ManyToMany,
  PrimaryGeneratedColumn,
} from 'typeorm';

@Entity('sports')
export class Sport {
  @PrimaryGeneratedColumn()
  id: number;

  @Column({ unique: true })
  name: string;

  @Column({
    nullable: true,
  })
  description: string;

  // Mantenemos monthlyFee como precio base por compatibilidad
  @Column('decimal', { precision: 10, scale: 2, nullable: true })
  monthlyFee: number;

  // Nueva relación con los planes del deporte
  @OneToMany(() => SportPlan, (sportPlan) => sportPlan.sport)
  sportPlans: SportPlan[];

  // Relación Many-to-Many con Coaches
  @ManyToMany(() => Coach, (coach) => coach.sports)
  coaches: Coach[];

  // Mantener estas relaciones por compatibilidad si hay datos existentes
  @OneToMany(() => Fee, (fee) => fee.sport)
  fees: Fee[];

  @OneToMany(() => Student, (student) => student.sport)
  students: Student[];
}
