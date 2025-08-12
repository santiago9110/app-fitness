import { Injectable, BadRequestException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, DataSource } from 'typeorm';
import { AssignedRoutine } from './assigned-routine.entity';
import { Macrocycle } from './macrocycle.entity';
import { Mesocycle } from './mesocycle.entity';
import { Microcycle } from './microcycle.entity';
import { Day } from './day.entity';
import { Exercise } from './exercise.entity';
import { User } from '../auth/entities/user.entity';
import { CreateCompleteRoutineDto } from './dto/create-complete-routine.dto';

@Injectable()
export class RoutineService {
  constructor(
    @InjectRepository(AssignedRoutine)
    private assignedRoutineRepo: Repository<AssignedRoutine>,
    @InjectRepository(Macrocycle)
    private macrocycleRepo: Repository<Macrocycle>,
    @InjectRepository(Mesocycle)
    private mesocycleRepo: Repository<Mesocycle>,
    @InjectRepository(Microcycle)
    private microcycleRepo: Repository<Microcycle>,
    @InjectRepository(Day)
    private dayRepo: Repository<Day>,
    @InjectRepository(Exercise)
    private exerciseRepo: Repository<Exercise>,
    @InjectRepository(User)
    private userRepo: Repository<User>,
    private dataSource: DataSource,
  ) {}

  // CRUD básico para AssignedRoutine (asignar rutina a usuario)
  async assignRoutine(userId: number, macrocycleId: number) {
    const user = await this.userRepo.findOneBy({ id: userId });
    const macrocycle = await this.macrocycleRepo.findOneBy({
      id: macrocycleId,
    });
    if (!user || !macrocycle) throw new Error('User or Macrocycle not found');
    const assigned = this.assignedRoutineRepo.create({ user, macrocycle });
    return this.assignedRoutineRepo.save(assigned);
  }

  async getAssignedRoutines(userId: number) {
    return this.assignedRoutineRepo.find({
      where: { user: { id: userId } },
      relations: ['macrocycle'],
    });
  }

  async unassignRoutine(assignedRoutineId: number) {
    return this.assignedRoutineRepo.delete(assignedRoutineId);
  }

  // 🚀 NUEVA FUNCIONALIDAD: Crear rutina completa desde wizard
  async createCompleteRoutine(data: CreateCompleteRoutineDto) {
    const queryRunner = this.dataSource.createQueryRunner();
    await queryRunner.connect();
    await queryRunner.startTransaction();

    try {
      console.log(
        '🎯 Iniciando creación de rutina completa para student:',
        data.studentId,
      );

      // 1. Crear Macrociclo
      const macrocycle = await this.createMacrocycle(
        data.macrocycle,
        data.studentId,
        queryRunner,
      );
      console.log('✅ Macrociclo creado:', macrocycle.id);

      // 2. Crear Mesociclos
      const mesocycles = await this.createMesocycles(
        data.mesociclos,
        macrocycle.id,
        queryRunner,
      );
      console.log('✅ Mesociclos creados:', mesocycles.length);

      // 3. Crear Microciclos (replicando plantillas)
      for (const microConfig of data.microciclos) {
        const mesocycle = mesocycles[microConfig.mesocicloIndex];
        await this.createMicrocyclesFromTemplate(
          microConfig,
          mesocycle.id,
          queryRunner,
        );
        console.log(
          `✅ Microciclos creados para mesociclo ${microConfig.mesocicloIndex + 1}`,
        );
      }

      await queryRunner.commitTransaction();
      console.log('🎉 Rutina completa creada exitosamente');

      return {
        success: true,
        macrocycleId: macrocycle.id,
        message: 'Rutina creada exitosamente',
      };
    } catch (error) {
      await queryRunner.rollbackTransaction();
      console.error('❌ Error creando rutina:', error);
      throw new BadRequestException(`Error creating routine: ${error.message}`);
    } finally {
      await queryRunner.release();
    }
  }

  private async createMacrocycle(
    macroData: any,
    studentId: number,
    queryRunner: any,
  ) {
    const macrocycle = queryRunner.manager.create(Macrocycle, {
      name: macroData.nombre,
      studentId,
      startDate: macroData.fechaInicio,
      endDate: macroData.fechaFin,
      objetivo: macroData.objetivo,
    });
    return await queryRunner.manager.save(macrocycle);
  }

  private async createMesocycles(
    mesociclosData: any[],
    macrocycleId: number,
    queryRunner: any,
  ) {
    const mesocycles = [];
    for (const mesoData of mesociclosData) {
      const mesocycle = queryRunner.manager.create(Mesocycle, {
        name: mesoData.nombre,
        macrocycle: { id: macrocycleId },
        startDate: new Date(mesoData.fechaInicio),
        endDate: new Date(mesoData.fechaFin),
        objetivo: mesoData.objetivo,
      });
      const savedMeso = await queryRunner.manager.save(mesocycle);
      mesocycles.push(savedMeso);
    }
    return mesocycles;
  }

  private async createMicrocyclesFromTemplate(
    config: any,
    mesocycleId: number,
    queryRunner: any,
  ) {
    // Crear N microciclos idénticos basados en la plantilla
    for (let i = 0; i < config.cantidadMicrociclos; i++) {
      const microcycle = queryRunner.manager.create(Microcycle, {
        name: `Microciclo ${i + 1}`,
        mesocycle: { id: mesocycleId },
        startDate: new Date(), // TODO: calcular fechas correctas
        endDate: new Date(), // TODO: calcular fechas correctas
        objetivo: 'Generado automáticamente',
      });
      const savedMicro = await queryRunner.manager.save(microcycle);

      // Para cada día de la plantilla
      for (const diaTemplate of config.plantillaDias) {
        const day = queryRunner.manager.create(Day, {
          microcycle: { id: savedMicro.id },
          dia: diaTemplate.dia,
          nombre: diaTemplate.nombre,
          esDescanso: diaTemplate.esDescanso,
        });
        const savedDay = await queryRunner.manager.save(day);

        // Para cada ejercicio de la plantilla (solo si no es día de descanso)
        if (!diaTemplate.esDescanso) {
          for (const ejercicioTemplate of diaTemplate.ejercicios) {
            const exercise = queryRunner.manager.create(Exercise, {
              day: { id: savedDay.id },
              nombre: ejercicioTemplate.nombre,
              grupoMuscular: ejercicioTemplate.grupoMuscular,
              series: ejercicioTemplate.series,
              repeticiones: ejercicioTemplate.repeticiones,
              descanso: ejercicioTemplate.descanso,
              rirEsperado: ejercicioTemplate.rirEsperado,
              orden: ejercicioTemplate.orden || 1, // Agregar el campo orden
            });
            await queryRunner.manager.save(exercise);
          }
        }
      }
    }
  }
}
