import {
  IsNotEmpty,
  IsString,
  IsNumber,
  IsArray,
  ValidateNested,
  IsOptional,
  IsBoolean,
} from 'class-validator';
import { Type } from 'class-transformer';

export class CreateExerciseDto {
  @IsNotEmpty()
  @IsString()
  nombre: string;

  @IsNotEmpty()
  @IsString()
  grupoMuscular: string;

  @IsNotEmpty()
  @IsString()
  series: string;

  @IsNotEmpty()
  @IsString()
  repeticiones: string;

  @IsNotEmpty()
  @IsString()
  descanso: string;

  @IsNotEmpty()
  @IsString()
  rirEsperado: string;

  @IsOptional()
  @IsNumber()
  orden?: number;
}

export class CreateDayDto {
  @IsNotEmpty()
  @IsNumber()
  dia: number;

  @IsNotEmpty()
  @IsString()
  nombre: string;

  @IsBoolean()
  esDescanso: boolean;

  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => CreateExerciseDto)
  ejercicios: CreateExerciseDto[];
}

export class CreateMicrocycleTemplateDto {
  @IsNotEmpty()
  @IsNumber()
  mesocicloIndex: number;

  @IsNotEmpty()
  @IsNumber()
  cantidadMicrociclos: number;

  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => CreateDayDto)
  plantillaDias: CreateDayDto[];
}

export class CreateMacrocycleDto {
  @IsNotEmpty()
  @IsString()
  nombre: string;

  @IsNotEmpty()
  @IsString()
  fechaInicio: string;

  @IsNotEmpty()
  @IsString()
  fechaFin: string;

  @IsOptional()
  @IsString()
  objetivo?: string;
}

export class CreateMesocycleDto {
  @IsNotEmpty()
  @IsString()
  nombre: string;

  @IsNotEmpty()
  @IsString()
  fechaInicio: string;

  @IsNotEmpty()
  @IsString()
  fechaFin: string;

  @IsOptional()
  @IsString()
  objetivo?: string;
}

export class CreateCompleteRoutineDto {
  @IsNotEmpty()
  @IsNumber()
  studentId: number;

  @ValidateNested()
  @Type(() => CreateMacrocycleDto)
  macrocycle: CreateMacrocycleDto;

  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => CreateMesocycleDto)
  mesociclos: CreateMesocycleDto[];

  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => CreateMicrocycleTemplateDto)
  microciclos: CreateMicrocycleTemplateDto[];
}
