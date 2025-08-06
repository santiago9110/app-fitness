
import { Controller, Get, Post, Body, Param, Patch, Put, Delete, ParseIntPipe } from '@nestjs/common';
import { MicrocycleService } from './microcycle.service';
import { CreateMicrocycleDto } from './dto/create-microcycle.dto';

@Controller('microcycle')
export class MicrocycleController {
  constructor(private readonly microcycleService: MicrocycleService) {}

  @Post(':mesocycleId')
  create(
    @Param('mesocycleId', ParseIntPipe) mesocycleId: number,
    @Body() data: CreateMicrocycleDto,
  ) {
    return this.microcycleService.create(mesocycleId, data);
  }

  @Get('mesocycle/:mesocycleId')
  findAll(@Param('mesocycleId', ParseIntPipe) mesocycleId: number) {
    return this.microcycleService.findAll(mesocycleId);
  }

  @Get(':id')
  findOne(@Param('id', ParseIntPipe) id: number) {
    return this.microcycleService.findOne(id);
  }

  @Patch(':id')
  update(@Param('id', ParseIntPipe) id: number, @Body() data: any) {
    return this.microcycleService.update(id, data);
  }

  @Put(':id')
  replace(@Param('id', ParseIntPipe) id: number, @Body() data: any) {
    return this.microcycleService.update(id, data);
  }

  @Delete(':id')
  remove(@Param('id', ParseIntPipe) id: number) {
    return this.microcycleService.remove(id);
  }
}
