import { PartialType } from '@nestjs/mapped-types';
import { CreateCoachDto } from './create-coach.dto';
import { IsOptional, IsNumber, IsArray } from 'class-validator';

export class UpdateCoachDto extends PartialType(CreateCoachDto) {
  @IsOptional()
  @IsArray()
  @IsNumber({}, { each: true })
  addSportIds?: number[];

  @IsOptional()
  @IsArray()
  @IsNumber({}, { each: true })
  removeSportIds?: number[];
}
