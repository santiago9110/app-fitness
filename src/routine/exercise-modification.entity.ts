import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  ManyToOne,
  CreateDateColumn,
} from 'typeorm';
import { Exercise } from './exercise.entity';
import { Microcycle } from './microcycle.entity';

@Entity('exercise_modifications')
export class ExerciseModification {
  @PrimaryGeneratedColumn()
  id: number;

  @ManyToOne(() => Exercise, { onDelete: 'CASCADE' })
  exercise: Exercise;

  @Column()
  exerciseId: number;

  @ManyToOne(() => Microcycle, { onDelete: 'CASCADE' })
  microcycle: Microcycle;

  @Column()
  microcycleId: number;

  @Column()
  fieldName: string; // 'series', 'repeticiones', 'descanso', 'rirEsperado'

  @Column()
  oldValue: string;

  @Column()
  newValue: string;

  @Column({
    type: 'enum',
    enum: ['solo-dia', 'desde-dia'],
  })
  scope: 'solo-dia' | 'desde-dia'; // Alcance del cambio

  @Column({ nullable: true })
  razon?: string; // Razón del cambio

  @Column()
  createdBy: number; // ID del usuario que hizo el cambio

  @CreateDateColumn()
  createdAt: Date;
}
