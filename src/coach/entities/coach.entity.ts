import {
  Column,
  Entity,
  JoinColumn,
  JoinTable,
  ManyToMany,
  OneToMany,
  OneToOne,
  PrimaryGeneratedColumn,
} from 'typeorm';
import { User } from '../../auth/entities/user.entity';
import { Student } from '../../student/entities/student.entity';
import { Sport } from '../../sport/entities/sport.entity';

@Entity({ name: 'coaches' })
export class Coach {
  @PrimaryGeneratedColumn()
  id: number;

  @OneToOne(() => User, { eager: true })
  @JoinColumn({ name: 'userId' })
  user: User;

  @Column()
  userId: number;

  @Column({ nullable: true })
  specialization: string; // Especialización principal

  @Column({ nullable: true })
  experience: string; // Años de experiencia o descripción

  @Column({ nullable: true })
  certification: string; // Certificaciones o títulos

  @Column('text', { nullable: true })
  bio: string; // Biografía o descripción personal

  @Column('decimal', { nullable: true })
  salary: number; // Salario (mantener compatibilidad)

  @Column({ default: true })
  isActive: boolean;

  @Column({ type: 'timestamp', default: () => 'CURRENT_TIMESTAMP' })
  createdAt: Date;

  @Column({ type: 'timestamp', default: () => 'CURRENT_TIMESTAMP' })
  updatedAt: Date;

  // Relación Many-to-Many con Sports
  @ManyToMany(() => Sport, (sport) => sport.coaches)
  @JoinTable({
    name: 'coach_sports',
    joinColumn: { name: 'coachId', referencedColumnName: 'id' },
    inverseJoinColumn: { name: 'sportId', referencedColumnName: 'id' },
  })
  sports: Sport[];

  @OneToMany(() => Student, (student) => student.coach)
  students: Student[];
}
