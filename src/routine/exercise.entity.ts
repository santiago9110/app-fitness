import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  ManyToOne,
  OneToMany,
  CreateDateColumn,
  UpdateDateColumn,
} from 'typeorm';
import { Day } from './day.entity';
import { SetEntity } from './set.entity';

@Entity()
export class Exercise {
  @PrimaryGeneratedColumn()
  id: number;

  // Campo para mantener el orden de los ejercicios en el día
  @Column({ default: 1 })
  orden: number;

  // Campos del wizard (nombres exactos)
  @Column()
  nombre: string;

  @Column()
  grupoMuscular: string;

  @Column()
  series: string;

  @Column()
  repeticiones: string;

  @Column()
  descanso: string;

  @Column()
  rirEsperado: string;

  // Campos de override (modificaciones puntuales)
  @Column('json', { nullable: true })
  overrides?: {
    [microcycleId: string]: {
      series?: string;
      repeticiones?: string;
      descanso?: string;
      rirEsperado?: string;
      fechaModificacion: Date;
      razon?: string;
    };
  };

  @ManyToOne(() => Day, (day) => day.exercises, { onDelete: 'CASCADE' })
  day: Day;

  @OneToMany(() => SetEntity, (set) => set.exercise, { cascade: true })
  sets: SetEntity[];

  @CreateDateColumn()
  createdAt: Date;

  @UpdateDateColumn()
  updatedAt: Date;
}
