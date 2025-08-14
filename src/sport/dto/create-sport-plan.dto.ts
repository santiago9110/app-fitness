import {
  IsString,
  IsNumber,
  IsOptional,
  IsBoolean,
  Min,
} from 'class-validator';

export class CreateSportPlanDto {
  @IsString()
  name: string;

  @IsNumber()
  @Min(1)
  weeklyFrequency: number;

  @IsNumber()
  @Min(0)
  monthlyFee: number;

  @IsOptional()
  @IsString()
  description?: string;

  @IsOptional()
  @IsBoolean()
  isActive?: boolean;

  @IsNumber()
  sportId: number;
}
