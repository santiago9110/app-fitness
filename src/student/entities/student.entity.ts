import { MaxLength, MinLength } from 'class-validator';
import { SportName } from '../../common/types/sport.enum';
import { Fee } from '../../fee/entities/fee.entity';
import { Payment } from '../../payment/entities/payment.entity';
import { Sport } from '../../sport/entities/sport.entity';
import { SportPlan } from '../../sport/entities/sport-plan.entity';
import { User } from '../../auth/entities/user.entity';
import { Coach } from '../../coach/entities/coach.entity';
import {
  Column,
  Entity,
  JoinColumn,
  ManyToOne,
  OneToMany,
  OneToOne,
  PrimaryGeneratedColumn,
} from 'typeorm';

@Entity({ name: 'students' })
export class Student {
  @PrimaryGeneratedColumn()
  id: number;

  @Column('varchar')
  @MinLength(4)
  firstName: string;

  @Column('varchar')
  @MinLength(4)
  lastName: string;

  @Column('date')
  birthDate: Date;

  @Column('varchar')
  @MinLength(4)
  phone: string;

  @Column('date')
  startDate: Date;

  @Column('varchar', { unique: true })
  @MinLength(7)
  @MaxLength(9)
  document: string;

  @Column('bool', { default: true })
  isActive: boolean;

  @OneToMany(() => Fee, (fee) => fee.student)
  fees: Fee[];

  @OneToMany(() => Payment, (payment) => payment.student, { eager: false })
  payments: Payment[];

  // Mantener la relación con Sport por compatibilidad
  @ManyToOne(() => Sport, (sport) => sport.students, { eager: true })
  @JoinColumn({ name: 'sportId' })
  sport: Sport;

  // Nueva relación con SportPlan (la modalidad específica que eligió el estudiante)
  @ManyToOne(() => SportPlan, (sportPlan) => sportPlan.students, {
    nullable: true,
    eager: true,
  })
  @JoinColumn({ name: 'sportPlanId' })
  sportPlan: SportPlan;

  @Column({ nullable: true })
  sportPlanId: number;

  @OneToOne(() => User, { eager: true })
  @JoinColumn({ name: 'userId' })
  user: User;

  @ManyToOne(() => Coach, (coach) => coach.students, {
    nullable: true,
    eager: false,
  })
  @JoinColumn({ name: 'coachId' })
  coach: Coach;
}
