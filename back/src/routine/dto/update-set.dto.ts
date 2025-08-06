import { IsInt, IsOptional, Min } from 'class-validator';
import { Type } from 'class-transformer';

export class UpdateSetDto {
  @IsOptional()
  @Type(() => Number)
  @IsInt()
  @Min(0)
  reps?: number;

  @IsOptional()
  @Type(() => Number)
  @IsInt()
  @Min(0)
  load?: number;

  @IsOptional()
  @Type(() => Number)
  @IsInt()
  @Min(0)
  actualRir?: number;

  @IsOptional()
  @Type(() => Number)
  @IsInt()
  @Min(0)
  actualRpe?: number;

  @IsOptional()
  notes?: string;

  @IsOptional()
  @Type(() => Number)
  @IsInt()
  @Min(0)
  order?: number;
}
