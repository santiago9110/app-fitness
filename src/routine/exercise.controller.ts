import {
  Controller,
  Get,
  Post,
  Body,
  Param,
  Patch,
  Delete,
  ParseIntPipe,
  Put,
} from '@nestjs/common';
import { ExerciseService } from './exercise.service';
import {
  CreateOverrideDto,
  UpdateTemplateDto,
} from './dto/exercise-modification.dto';

@Controller('exercise')
export class ExerciseController {
  constructor(private readonly exerciseService: ExerciseService) {}

  @Post(':dayId')
  create(@Param('dayId', ParseIntPipe) dayId: number, @Body() data: any) {
    return this.exerciseService.create(dayId, data);
  }

  @Get('day/:dayId')
  findAll(@Param('dayId', ParseIntPipe) dayId: number) {
    return this.exerciseService.findAll(dayId);
  }

  @Get(':id')
  findOne(@Param('id', ParseIntPipe) id: number) {
    return this.exerciseService.findOne(id);
  }

  @Patch(':id')
  update(@Param('id', ParseIntPipe) id: number, @Body() data: any) {
    return this.exerciseService.update(id, data);
  }

  @Delete(':id')
  remove(@Param('id', ParseIntPipe) id: number) {
    return this.exerciseService.remove(id);
  }

  // 🚀 NUEVAS APIs de modificación para FASE 2
  @Post(':id/override')
  async createOverride(
    @Param('id', ParseIntPipe) exerciseId: number,
    @Body() overrideData: CreateOverrideDto,
  ) {
    return await this.exerciseService.createOverride(exerciseId, overrideData);
  }

  @Put(':id/update-template')
  async updateTemplate(
    @Param('id', ParseIntPipe) exerciseId: number,
    @Body() updateData: UpdateTemplateDto,
  ) {
    return await this.exerciseService.updateTemplate(exerciseId, updateData);
  }

  // 🚀 NUEVA API: Crear sets para un ejercicio
  @Post(':id/sets')
  async createSet(
    @Param('id', ParseIntPipe) exerciseId: number,
    @Body() setData: any,
  ) {
    return await this.exerciseService.createSet(exerciseId, setData);
  }
}
