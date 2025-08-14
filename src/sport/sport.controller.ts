import {
  Controller,
  Get,
  Post,
  Body,
  Patch,
  Param,
  Delete,
  Query,
} from '@nestjs/common';
import { SportService } from './sport.service';
import { CreateSportDto } from './dto/create-sport.dto';
import { UpdateSportDto } from './dto/update-sport.dto';
import { CreateSportPlanDto } from './dto/create-sport-plan.dto';
import { UpdateSportPlanDto } from './dto/update-sport-plan.dto';
import { PaginationDto } from '../common/dtos/pagination.dto';

@Controller('sports')
export class SportController {
  constructor(private readonly sportService: SportService) {}

  @Post()
  create(@Body() createSportDto: CreateSportDto) {
    return this.sportService.create(createSportDto);
  }

  @Get()
  findAll(@Query() paginationDto: PaginationDto) {
    return this.sportService.findAll(paginationDto);
  }

  @Get(':id')
  findOne(@Param('id') id: string) {
    return this.sportService.findOne(+id);
  }

  @Patch(':id')
  update(@Param('id') id: string, @Body() updateSportDto: UpdateSportDto) {
    return this.sportService.update(+id, updateSportDto);
  }

  @Delete(':id')
  remove(@Param('id') id: string) {
    return this.sportService.remove(+id);
  }

  // Endpoints para SportPlan
  @Post('plans')
  createSportPlan(@Body() createSportPlanDto: CreateSportPlanDto) {
    return this.sportService.createSportPlan(createSportPlanDto);
  }

  @Get('plans')
  findAllSportPlans(@Query('sportId') sportId?: string) {
    return this.sportService.findAllSportPlans(sportId ? +sportId : undefined);
  }

  @Get(':sportId/plans')
  findSportPlansBySport(@Param('sportId') sportId: string) {
    return this.sportService.findAllSportPlans(+sportId);
  }

  @Get('plans/:id')
  findOneSportPlan(@Param('id') id: string) {
    return this.sportService.findOneSportPlan(+id);
  }

  @Patch('plans/:id')
  updateSportPlan(
    @Param('id') id: string,
    @Body() updateSportPlanDto: UpdateSportPlanDto,
  ) {
    return this.sportService.updateSportPlan(+id, updateSportPlanDto);
  }

  @Delete('plans/:id')
  removeSportPlan(@Param('id') id: string) {
    return this.sportService.removeSportPlan(+id);
  }
}
