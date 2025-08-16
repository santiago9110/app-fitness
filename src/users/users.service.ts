import { InjectRepository } from '@nestjs/typeorm';
import { DataSource, Repository, Not, IsNull } from 'typeorm';
import * as bcrypt from 'bcrypt';
import {
  Injectable,
  InternalServerErrorException,
  BadRequestException,
  Logger,
  NotFoundException,
} from '@nestjs/common';

import { CreateUserDto } from './dto/create-user.dto';
import { UpdateUserDto } from './dto/update-user.dto';
import { FilterUsersDto } from './dto/filter-users.dto';
import { UserResponseDto } from './dto/user-response.dto';
import { ERROR_DB } from '../constants';
import { User } from '../auth/entities/user.entity';
import { plainToInstance } from 'class-transformer';

@Injectable()
export class UsersService {
  private readonly logger = new Logger('UserService');
  constructor(
    @InjectRepository(User)
    private readonly userRepository: Repository<User>,

    private readonly dataSource: DataSource,
  ) {}

  async create(createUserDto: CreateUserDto) {
    const queryRunner = this.dataSource.createQueryRunner();
    await queryRunner.connect();
    await queryRunner.startTransaction();

    const { password, ...clientPayload } = createUserDto;
    try {
      const user = await queryRunner.manager.save(User, {
        ...clientPayload,
        password: bcrypt.hashSync(password, 10),
      });

      await queryRunner.commitTransaction();
      delete user.password;
      return { user };
    } catch (error) {
      await queryRunner.rollbackTransaction();

      this.handleDBExceptions(error);
    }
  }

  async findAll(filters: FilterUsersDto) {
    const {
      role,
      isActive,
      search,
      startDate,
      endDate,
      page = 1,
      limit = 10,
    } = filters;

    const query = this.userRepository
      .createQueryBuilder('user')
      .leftJoinAndSelect('user.roles', 'role')
      .where('user.deletedAt IS NULL');

    if (role) {
      query.andWhere('role.name = :role', { role });
    }

    if (isActive !== undefined) {
      query.andWhere('user.isActive = :isActive', { isActive });
    }

    if (search) {
      query.andWhere(
        '(user.fullName ILIKE :search OR user.email ILIKE :search)',
        { search: `%${search}%` },
      );
    }

    if (startDate) {
      query.andWhere('user.createdAt >= :startDate', { startDate });
    }

    if (endDate) {
      query.andWhere('user.createdAt <= :endDate', { endDate });
    }

    const skip = (page - 1) * limit;

    const [users, total] = await query.take(limit).skip(skip).getManyAndCount();

    return {
      data: plainToInstance(UserResponseDto, users, {
        excludeExtraneousValues: true,
      }),
      total,
      page,
      limit,
    };
  }

  async findOne(id: number) {
    const user = await this.userRepository.findOneBy({ id });

    if (!user) throw new NotFoundException(`User with id: ${id} not found`);

    return user;
  }

  async update(id: number, updateUserDto: UpdateUserDto) {
    const user = await this.userRepository.preload({
      id: id,
      ...updateUserDto,
    });

    if (!user) throw new NotFoundException(`User with id: ${id} not found`);

    try {
      await this.userRepository.save(user);
      return user;
    } catch (error) {
      this.handleDBExceptions(error);
    }
  }

  async remove(id: number) {
    await this.findOne(id);
    await this.userRepository.softDelete(id);
  }

  async restore(id: number) {
    await this.userRepository.restore(id);
    return this.findOne(id);
  }

  async toggleActiveStatus(id: number) {
    const user = await this.findOne(id);
    user.isActive = !user.isActive;
    await this.userRepository.save(user);
    return user;
  }

  async getUserStats() {
    const [total, active, inactive, deleted, byRole] = await Promise.all([
      this.userRepository.count(),
      this.userRepository.count({ where: { isActive: true } }),
      this.userRepository.count({ where: { isActive: false } }),
      this.userRepository.count({ withDeleted: true, where: { deletedAt: Not(IsNull()) } }),
      this.userRepository
        .createQueryBuilder('user')
        .leftJoin('user.roles', 'role')
        .select('role.name', 'role')
        .addSelect('COUNT(*)', 'count')
        .where('user.deletedAt IS NULL')
        .groupBy('role.name')
        .getRawMany(),
    ]);

    return { total, active, inactive, deleted, byRole };
  }

  private handleDBExceptions(error: any) {
    this.logger.error(error.sqlMessage);
    if (error.code === ERROR_DB.ER_DUP_ENTRY)
      throw new BadRequestException(`${error.sqlMessage} `);
    throw new InternalServerErrorException(
      'Unexpected error, check server logs',
    );
  }
}
