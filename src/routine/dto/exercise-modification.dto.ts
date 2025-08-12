import {
  IsNotEmpty,
  IsString,
  IsNumber,
  IsOptional,
  IsEnum,
} from 'class-validator';

export class CreateOverrideDto {
  @IsNotEmpty()
  @IsString()
  field: string; // 'series', 'repeticiones', 'descanso', 'rirEsperado'

  @IsNotEmpty()
  @IsString()
  value: string;

  @IsNotEmpty()
  @IsEnum(['solo-dia', 'desde-dia'])
  scope: 'solo-dia' | 'desde-dia';

  @IsNotEmpty()
  @IsNumber()
  microcycleId: number;

  @IsOptional()
  @IsString()
  razon?: string;
}

export class UpdateTemplateDto {
  @IsNotEmpty()
  @IsString()
  field: string;

  @IsNotEmpty()
  @IsString()
  value: string;

  @IsNotEmpty()
  @IsNumber()
  fromMicrocycle: number; // A partir de qué microciclo aplicar
}
