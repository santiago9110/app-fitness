// ...existing code...


import {
  BadRequestException,
  Injectable,
  InternalServerErrorException,
  Logger,
  NotFoundException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { DataSource, Repository } from 'typeorm';

import { UpdateStudentDto, CreateStudentDto } from './dto';
import { PaginationDto } from '../common/dtos/pagination.dto';
import { Student } from './entities/student.entity';
import { ERROR_DB } from '../constants';
import { Sport } from '../sport/entities/sport.entity';
import { FeeService } from '../fee/fee.service';
import { Fee } from '../fee/entities/fee.entity';

@Injectable()
export class StudentService {
  private readonly logger = new Logger('StudentService');

  constructor(
    @InjectRepository(Student)
    private readonly studentRepository: Repository<Student>,

    @InjectRepository(Sport)
    private readonly sportRepository: Repository<Sport>,

    @InjectRepository(Fee)
    private readonly feeRepository: Repository<Fee>,

    private readonly dataSource: DataSource,

    private readonly feeService: FeeService,
  ) {}

  async create(createStudentDto: CreateStudentDto) {
    const { sportId, ...studentPayload } = createStudentDto;

    const sport = sportId
      ? await this.sportRepository.findOneBy({ id: sportId })
      : '';

    if (!sport)
      throw new NotFoundException(`Sport with id: ${sportId} not found`);

    const queryRunner = this.dataSource.createQueryRunner();
    await queryRunner.connect();
    await queryRunner.startTransaction();
    try {
      const student = await queryRunner.manager.save(Student, {
        ...studentPayload,
        sport,
      });

      await queryRunner.commitTransaction();

      // Llama a la nueva función en StudentService para generar las cuotas
      await this.generateFeesForNewStudent(student.id);

      this.logger.log(`Student created`);
      return { student };
    } catch (error) {
      await queryRunner.rollbackTransaction();
      this.handleDBExceptions(error);
    }
  }

  async findAll(paginationDto: PaginationDto) {
    const { limit = 10, offset = 0, isActive } = paginationDto;

    const students = await this.studentRepository.find({
      take: limit,
      skip: offset,
      where: {
        isActive: isActive,
      },
    });

    this.logger.log('Get all studentes');
    return students;
  }

  async findOne(term: string) {
    this.logger.log(`Get student by ${term}`);

    const isIdSearch = Number.isInteger(Number(term));

    let student: Student;

    if (isIdSearch) {
      student = await this.studentRepository.findOneBy({ id: +term });
    } else {
      const queryBuilder = this.studentRepository.createQueryBuilder('student');
      queryBuilder.where(
        `UPPER(student.firstName) LIKE :firstName OR UPPER(student.lastName) LIKE :lastName`,
        {
          firstName: `%${term.toUpperCase()}%`,
          lastName: `%${term.toUpperCase()}%`,
        },
      );
      student = await queryBuilder.getOne();
    }

    if (!student) {
      throw new NotFoundException(`Student with term: ${term} not found`);
    }

    return student;
  }

  async update(id: number, updateStudentDto: UpdateStudentDto) {
    const { sportId, ...studentPayload } = updateStudentDto;
    const sport = sportId
      ? await this.sportRepository.findOneBy({ id: sportId })
      : '';

    // if (!sport)
    //   throw new NotFoundException(`Sport with id: ${sportId} not found`);

    const student = await this.studentRepository.preload({
      id,
      ...studentPayload,
      ...(sport ? { sport } : {}),
    });

    if (!student)
      throw new NotFoundException(`Studen with id: "${id}" not found`);

    const queryRunner = this.dataSource.createQueryRunner();
    await queryRunner.connect();
    await queryRunner.startTransaction();
    try {
      await queryRunner.manager.save(student);
      await queryRunner.commitTransaction();
      await queryRunner.release();
    } catch (error) {
      await queryRunner.rollbackTransaction();
      await queryRunner.release();

      this.handleDBExceptions(error);
    }

    return { student };
  }

  remove(id: number) {
    return `This action removes a #${id} student`;
  }

  private handleDBExceptions(error: any) {
    this.logger.error(error.sqlMessage);
    if (error.code === ERROR_DB.ER_DUP_ENTRY)
      throw new BadRequestException(`${error.sqlMessage} `);
    throw new InternalServerErrorException('Ayuda!');
  }

  async generateFeesForNewStudent(studentId: number): Promise<void> {
    const student = await this.studentRepository.findOne({
      where: { id: studentId },
      relations: ['sport']
    });

    if (!student) {
      throw new NotFoundException(`Student not found with id: ${studentId}`);
    }

    const today = new Date();
    
    // Generar 3 cuotas mensuales a partir de hoy
    for (let i = 0; i < 3; i++) {
      const startDate = new Date(today);
      startDate.setMonth(today.getMonth() + i);
      
      const endDate = new Date(startDate);
      endDate.setMonth(endDate.getMonth() + 1);
      endDate.setDate(endDate.getDate() - 1); // Un día antes del próximo mes

      const month = startDate.getMonth() + 1; // JavaScript months are 0-indexed
      const year = startDate.getFullYear();

      const existingFee = await this.feeRepository.findOne({
        where: {
          student: { id: student.id },
          month: month,
          year: year,
        },
      });

      if (!existingFee) {
        const newFee = this.feeRepository.create({
          student: { id: student.id } as Student,
          startDate: startDate,
          endDate: endDate,
          value: student.sport.monthlyFee,
          amountPaid: 0,
          month: month,
          year: year,
        });
        await this.feeRepository.save(newFee);
        
        this.logger.log(`Fee generated for student ${student.id}: ${startDate.toDateString()} - ${endDate.toDateString()}`);
      }
    }
  }

    async findByCoachUserId(coachUserId: number) {
    // Busca el coach por el userId
    const students = await this.studentRepository
      .createQueryBuilder('student')
      .leftJoinAndSelect('student.user', 'user')
      .leftJoinAndSelect('student.sport', 'sport')
      .leftJoinAndSelect('student.coach', 'coach')
      .leftJoinAndSelect('coach.user', 'coachUser')
      .where('coachUser.id = :coachUserId', { coachUserId })
      .getMany();
    return students;
  }
}
