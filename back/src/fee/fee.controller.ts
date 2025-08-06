import {
  Controller,
  Get,
  Post,
  Body,
  Patch,
  Param,
  Delete,
  Query,
  UseGuards,
  Request,
} from '@nestjs/common';
import { AuthGuard } from '@nestjs/passport';
import { FeeService } from './fee.service';
import { CreateFeeDto } from './dto/create-fee.dto';
import { UpdateFeeDto } from './dto/update-fee.dto';
import { PaginationDto } from '../common/dtos/pagination.dto';

@Controller('fee')
export class FeeController {
  constructor(private readonly feeService: FeeService) {}

  @Post()
  create(@Body() createFeeDto: CreateFeeDto) {
    return this.feeService.create(createFeeDto);
  }

  @Get()
  findAll(@Query() paginationDto: PaginationDto) {
    return this.feeService.findAll(paginationDto);
  }

  @Get('by-period')
  async getFeesByPeriod(
    @Query('month') month: string,
    @Query('year') year: string,
    @Query() paginationDto: PaginationDto
  ) {
    const monthNumber = month ? parseInt(month) : undefined;
    const yearNumber = year ? parseInt(year) : undefined;
    
    return this.feeService.getFeesByPeriod(monthNumber, yearNumber, paginationDto);
  }

  @Get('student/:studentId/unpaid')
  async getUnpaidFeesByStudent(@Param('studentId') studentId: string) {
    const unpaidFees = await this.feeService.getUnpaidFeesByStudent(+studentId);
    return {
      studentId: +studentId,
      unpaidFeesCount: unpaidFees.length,
      unpaidFees: unpaidFees.map(fee => ({
        id: fee.id,
        month: fee.month,
        year: fee.year,
        monthName: this.getMonthName(fee.month),
        value: fee.value,
        amountPaid: fee.amountPaid,
        remainingAmount: fee.value - fee.amountPaid,
        startDate: fee.startDate,
        endDate: fee.endDate
      }))
    };
  }

  @Get('student/:studentId/validate-payment/:feeId')
  async validateSequentialPayment(
    @Param('studentId') studentId: string,
    @Param('feeId') feeId: string
  ) {
    return this.feeService.validateSequentialPayment(+studentId, +feeId);
  }

  @Get('my-fees/:studentId')
  async getMyFees(@Param('studentId') studentId: string) {
    return this.feeService.getStudentFeesWithDetails(+studentId);
  }

  @Get('my-fees')
  @UseGuards(AuthGuard('jwt'))
  async getMyFeesAuthenticated(@Request() req) {
    // Obtener el studentId del usuario autenticado
    const userId = req.user.id;
    return this.feeService.getStudentFeesWithDetailsByUserId(userId);
  }

  @Get(':term')
  findOne(@Param('term') term: string) {
    return this.feeService.findOne(term);
  }

  @Patch(':id')
  update(@Param('id') id: string, @Body() updateFeeDto: UpdateFeeDto) {
    return this.feeService.update(+id, updateFeeDto);
  }

  private getMonthName(month: number): string {
    const months = [
      'Enero', 'Febrero', 'Marzo', 'Abril', 'Mayo', 'Junio',
      'Julio', 'Agosto', 'Septiembre', 'Octubre', 'Noviembre', 'Diciembre'
    ];
    return months[month - 1];
  }

  @Delete(':id')
  remove(@Param('id') id: string) {
    return this.feeService.remove(+id);
  }
}

