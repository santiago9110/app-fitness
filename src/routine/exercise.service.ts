import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Exercise } from './exercise.entity';
import { Day } from './day.entity';
import { SetEntity } from './set.entity';
import { ExerciseModification } from './exercise-modification.entity';
import {
  CreateOverrideDto,
  UpdateTemplateDto,
} from './dto/exercise-modification.dto';

@Injectable()
export class ExerciseService {
  constructor(
    @InjectRepository(Exercise)
    private exerciseRepo: Repository<Exercise>,
    @InjectRepository(Day)
    private dayRepo: Repository<Day>,
    @InjectRepository(SetEntity)
    private setRepo: Repository<SetEntity>,
    @InjectRepository(ExerciseModification)
    private modificationRepo: Repository<ExerciseModification>,
  ) {}

  create(dayId: number, data: Partial<Exercise>) {
    return this.dayRepo.findOne({ where: { id: dayId } }).then((day) => {
      if (!day) throw new Error('Day not found');
      const exercise = this.exerciseRepo.create({ ...data, day });
      return this.exerciseRepo.save(exercise);
    });
  }

  findAll(dayId: number) {
    return this.exerciseRepo.find({
      where: { day: { id: dayId } },
      relations: ['sets'],
    });
  }

  findOne(id: number) {
    return this.exerciseRepo.findOne({ where: { id }, relations: ['sets'] });
  }

  update(id: number, data: Partial<Exercise>) {
    return this.exerciseRepo.update(id, data);
  }

  remove(id: number) {
    return this.exerciseRepo.delete(id);
  }

  // 🚀 NUEVOS MÉTODOS para FASE 2: Sistema de modificaciones
  async createOverride(exerciseId: number, overrideData: CreateOverrideDto) {
    const exercise = await this.exerciseRepo.findOne({
      where: { id: exerciseId },
    });
    if (!exercise) throw new Error('Exercise not found');

    // Obtener valor actual del campo
    const currentValue = exercise[overrideData.field];

    if (overrideData.scope === 'solo-dia') {
      // Override puntual - almacenar en campo overrides
      const currentOverrides = exercise.overrides || {};
      currentOverrides[overrideData.microcycleId] = {
        ...currentOverrides[overrideData.microcycleId],
        [overrideData.field]: overrideData.value,
        fechaModificacion: new Date(),
        razon: overrideData.razon,
      };

      await this.exerciseRepo.update(exerciseId, {
        overrides: currentOverrides,
      });

      // Registrar modificación
      const modification = this.modificationRepo.create({
        exerciseId,
        microcycleId: overrideData.microcycleId,
        fieldName: overrideData.field,
        oldValue: currentValue,
        newValue: overrideData.value,
        scope: overrideData.scope,
        createdBy: 1, // TODO: obtener del JWT
      });
      await this.modificationRepo.save(modification);

      return { success: true, type: 'override', affected: 1 };
    }

    // Si es 'desde-dia', se maneja en updateTemplate
    return this.updateTemplate(exerciseId, {
      field: overrideData.field,
      value: overrideData.value,
      fromMicrocycle: overrideData.microcycleId,
    });
  }

  async updateTemplate(exerciseId: number, updateData: UpdateTemplateDto) {
    const exercise = await this.exerciseRepo.findOne({
      where: { id: exerciseId },
    });
    if (!exercise) throw new Error('Exercise not found');

    const currentValue = exercise[updateData.field];

    // Actualizar el template base
    await this.exerciseRepo.update(exerciseId, {
      [updateData.field]: updateData.value,
    });

    // TODO: Aplicar a todos los microciclos desde el especificado
    // Esto requeriría buscar todos los ejercicios "hermanos" en microciclos posteriores

    // Registrar modificación
    const modification = this.modificationRepo.create({
      exerciseId,
      microcycleId: updateData.fromMicrocycle,
      fieldName: updateData.field,
      oldValue: currentValue,
      newValue: updateData.value,
      scope: 'desde-dia',
      createdBy: 1, // TODO: obtener del JWT
    });
    await this.modificationRepo.save(modification);

    return { success: true, type: 'template-update', affected: 'multiple' };
  }

  // 🚀 NUEVO MÉTODO: Crear set para un ejercicio
  async createSet(exerciseId: number, setData: any) {
    const exercise = await this.exerciseRepo.findOne({
      where: { id: exerciseId },
    });
    if (!exercise) throw new Error('Exercise not found');

    const newSet = this.setRepo.create({
      exercise: { id: exerciseId },
      reps: setData.reps || 0,
      load: setData.load || 0,
      actualRir: setData.actualRir || null,
      actualRpe: setData.actualRpe || null,
      notes: setData.notes || null,
      order: setData.order || 1,
    });

    return await this.setRepo.save(newSet);
  }
}
