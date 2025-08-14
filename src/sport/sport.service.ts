import {
  Injectable,
  Logger,
  InternalServerErrorException,
  BadRequestException,
  NotFoundException,
} from '@nestjs/common';
import { CreateSportDto } from './dto/create-sport.dto';
import { UpdateSportDto } from './dto/update-sport.dto';
import { CreateSportPlanDto } from './dto/create-sport-plan.dto';
import { UpdateSportPlanDto } from './dto/update-sport-plan.dto';
import { InjectRepository } from '@nestjs/typeorm';
import { Sport } from './entities/sport.entity';
import { SportPlan } from './entities/sport-plan.entity';
import { Repository } from 'typeorm';
import { ERROR_DB } from '../constants';
import { PaginationDto } from '../common/dtos/pagination.dto';

@Injectable()
export class SportService {
  private readonly logger = new Logger('SportService');

  constructor(
    @InjectRepository(Sport)
    private readonly sportRepository: Repository<Sport>,
    @InjectRepository(SportPlan)
    private readonly sportPlanRepository: Repository<SportPlan>,
  ) {}

  async create(createSportDto: CreateSportDto) {
    this.logger.log(`Create sport`);

    try {
      const sport = this.sportRepository.create(createSportDto);

      await this.sportRepository.save(sport);

      return { sport };
    } catch (error) {
      this.handleDBExceptions(error);
    }
  }

  async findAll(paginationDto: PaginationDto) {
    const { limit = 100, offset = 0, isActive } = paginationDto;

    const sports = await this.sportRepository.find({
      take: limit,
      skip: offset,
      relations: ['sportPlans'],
      order: { id: 'DESC' }, // Ordenar por ID descendente para mostrar los más recientes primero
    });

    return { sports };
  }

  async findOne(id: number) {
    const sport = await this.sportRepository.findOne({
      where: { id },
      relations: ['sportPlans'],
    });

    if (!sport) throw new NotFoundException(`Sport with id: ${id} not found`);

    return { sport };
  }

  async update(id: number, updateSportDto: UpdateSportDto) {
    const sport = await this.sportRepository.preload({
      id,
      ...updateSportDto,
    });

    if (!sport) throw new NotFoundException(`Sport with id: ${id} not found`);

    await this.sportRepository.save(sport);

    return { sport };
  }

  async remove(id: number) {
    const sport = await this.sportRepository.findOne({ where: { id } });

    if (!sport) throw new NotFoundException(`Sport with id: ${id} not found`);

    await this.sportRepository.remove(sport);

    return { message: `Sport with id: ${id} has been removed` };
  }

  // Métodos para SportPlan
  async createSportPlan(createSportPlanDto: CreateSportPlanDto) {
    this.logger.log(
      `Create sport plan for sport ${createSportPlanDto.sportId}`,
    );

    try {
      // Verificar que el deporte existe
      const sport = await this.sportRepository.findOne({
        where: { id: createSportPlanDto.sportId },
      });

      if (!sport) {
        throw new NotFoundException(
          `Sport with id: ${createSportPlanDto.sportId} not found`,
        );
      }

      const sportPlan = this.sportPlanRepository.create(createSportPlanDto);
      await this.sportPlanRepository.save(sportPlan);

      return { sportPlan };
    } catch (error) {
      this.handleDBExceptions(error);
    }
  }

  async findAllSportPlans(sportId?: number) {
    const whereCondition = sportId
      ? { sportId, isActive: true }
      : { isActive: true };

    const sportPlans = await this.sportPlanRepository.find({
      where: whereCondition,
      relations: ['sport'],
      order: { weeklyFrequency: 'ASC' },
    });

    return { sportPlans };
  }

  async findOneSportPlan(id: number) {
    const sportPlan = await this.sportPlanRepository.findOne({
      where: { id },
      relations: ['sport'],
    });

    if (!sportPlan)
      throw new NotFoundException(`Sport plan with id: ${id} not found`);

    return { sportPlan };
  }

  async updateSportPlan(id: number, updateSportPlanDto: UpdateSportPlanDto) {
    const sportPlan = await this.sportPlanRepository.preload({
      id,
      ...updateSportPlanDto,
    });

    if (!sportPlan)
      throw new NotFoundException(`Sport plan with id: ${id} not found`);

    await this.sportPlanRepository.save(sportPlan);

    return { sportPlan };
  }

  async removeSportPlan(id: number) {
    const sportPlan = await this.sportPlanRepository.findOne({ where: { id } });

    if (!sportPlan)
      throw new NotFoundException(`Sport plan with id: ${id} not found`);

    await this.sportPlanRepository.remove(sportPlan);

    return { message: `Sport plan with id: ${id} has been removed` };
  }

  private handleDBExceptions(error: any) {
    this.logger.error(error.sqlMessage || error.message);
    if (error.code === ERROR_DB.ER_DUP_ENTRY)
      throw new BadRequestException(`${error.sqlMessage} `);
    throw new InternalServerErrorException('Database error occurred');
  }

  // Método helper para obtener el precio mensual de un estudiante
  async getStudentMonthlyFee(student: any): Promise<number> {
    // Los estudiantes deben tener un plan específico asignado
    if (student.sportPlan?.monthlyFee) {
      return student.sportPlan.monthlyFee;
    }

    // Si no hay plan asignado, es un error de configuración
    throw new BadRequestException(
      `El estudiante ${student.firstName} ${student.lastName} debe tener un plan específico asignado. Por favor asigna un plan de entrenamiento.`,
    );
  }
}
