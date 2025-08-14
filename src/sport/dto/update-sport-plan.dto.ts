import { PartialType } from '@nestjs/mapped-types';
import { CreateSportPlanDto } from './create-sport-plan.dto';

export class UpdateSportPlanDto extends PartialType(CreateSportPlanDto) {}
