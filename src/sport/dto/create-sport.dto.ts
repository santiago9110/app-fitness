import { IsNumber, IsOptional, IsString, MinLength } from 'class-validator';

export class CreateSportDto {
  @IsString()
  @MinLength(3)
  name: string;

  @IsString()
  @IsOptional()
  description: string;

  @IsNumber()
  @IsOptional()
  monthlyFee: number; // Opcional: precio base por compatibilidad
}
