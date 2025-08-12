import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  ManyToOne,
  OneToMany,
  CreateDateColumn,
  UpdateDateColumn,
} from 'typeorm';
import { Microcycle } from './microcycle.entity';
import { Exercise } from './exercise.entity';

@Entity()
export class Day {
  @PrimaryGeneratedColumn()
  id: number;

  @Column()
  dia: number; // Número del día (1-7)

  @Column()
  nombre: string; // Nombre del día ("Pecho y Tríceps", etc)

  @Column({ default: false })
  esDescanso: boolean; // Si es día de descanso

  @Column({ type: 'date', nullable: true })
  fecha?: string; // Fecha específica (cuando se asigna el microciclo)

  @ManyToOne(() => Microcycle, (micro) => micro.days, { onDelete: 'CASCADE' })
  microcycle: Microcycle;

  @OneToMany(() => Exercise, (exercise) => exercise.day, { cascade: true })
  exercises: Exercise[];

  @CreateDateColumn()
  createdAt: Date;

  @UpdateDateColumn()
  updatedAt: Date;
}
