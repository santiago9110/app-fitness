import {
  Injectable,
  NotFoundException,
  BadRequestException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Coach } from './entities/coach.entity';
import { CreateCoachDto, UpdateCoachDto } from './dto';
import { User } from '../auth/entities/user.entity';
import { Sport } from '../sport/entities/sport.entity';
import { Role } from '../roles/entities/rol.entity';

@Injectable()
export class CoachService {
  constructor(
    @InjectRepository(Coach)
    private readonly coachRepository: Repository<Coach>,
    @InjectRepository(User)
    private readonly userRepository: Repository<User>,
    @InjectRepository(Sport)
    private readonly sportRepository: Repository<Sport>,
    @InjectRepository(Role)
    private readonly roleRepository: Repository<Role>,
  ) {}

  async create(createCoachDto: CreateCoachDto): Promise<Coach> {
    const { userId, sportIds, ...coachData } = createCoachDto;

    // Verificar que el usuario existe y tiene rol de coach
    const user = await this.userRepository.findOne({
      where: { id: userId },
      relations: ['roles'],
    });
    if (!user) {
      throw new NotFoundException(`Usuario con ID ${userId} no encontrado`);
    }

    const hasCoachRole = user.roles.some((role) => role.name === 'coach');
    if (!hasCoachRole) {
      throw new BadRequestException('El usuario debe tener rol de coach');
    }

    // Verificar que no existe un coach para este usuario
    const existingCoach = await this.coachRepository.findOne({
      where: { userId },
    });
    if (existingCoach) {
      throw new BadRequestException('Ya existe un coach para este usuario');
    }

    // Crear el coach
    const coach = this.coachRepository.create({
      ...coachData,
      userId,
      user,
    });

    // Asignar deportes si se proporcionan
    if (sportIds && sportIds.length > 0) {
      const sports = await this.sportRepository.findByIds(sportIds);
      if (sports.length !== sportIds.length) {
        throw new BadRequestException('Algunos deportes no fueron encontrados');
      }
      coach.sports = sports;
    }

    return await this.coachRepository.save(coach);
  }

  async findAll(): Promise<Coach[]> {
    return await this.coachRepository.find({
      relations: ['user', 'sports', 'students'],
      order: { id: 'DESC' },
    });
  }

  async findOne(id: number): Promise<Coach> {
    const coach = await this.coachRepository.findOne({
      where: { id },
      relations: ['user', 'sports', 'students'],
    });

    if (!coach) {
      throw new NotFoundException(`Coach con ID ${id} no encontrado`);
    }

    return coach;
  }

  async findByUserId(userId: number): Promise<Coach> {
    const coach = await this.coachRepository.findOne({
      where: { userId },
      relations: ['user', 'sports', 'students'],
    });

    if (!coach) {
      throw new NotFoundException(`Coach para usuario ${userId} no encontrado`);
    }

    return coach;
  }

  async findBySport(sportId: number): Promise<Coach[]> {
    return await this.coachRepository
      .createQueryBuilder('coach')
      .leftJoinAndSelect('coach.user', 'user')
      .leftJoinAndSelect('coach.sports', 'sport')
      .where('sport.id = :sportId', { sportId })
      .andWhere('coach.isActive = :isActive', { isActive: true })
      .getMany();
  }

  async update(id: number, updateCoachDto: UpdateCoachDto): Promise<Coach> {
    const { sportIds, addSportIds, removeSportIds, ...updateData } =
      updateCoachDto;

    const coach = await this.findOne(id);

    // Actualizar campos básicos
    Object.assign(coach, updateData);
    coach.updatedAt = new Date();

    // Manejar deportes
    if (sportIds !== undefined) {
      // Reemplazar todos los deportes
      if (sportIds.length > 0) {
        const sports = await this.sportRepository.findByIds(sportIds);
        if (sports.length !== sportIds.length) {
          throw new BadRequestException(
            'Algunos deportes no fueron encontrados',
          );
        }
        coach.sports = sports;
      } else {
        coach.sports = [];
      }
    } else {
      // Agregar/remover deportes específicos
      if (addSportIds && addSportIds.length > 0) {
        const sportsToAdd = await this.sportRepository.findByIds(addSportIds);
        if (sportsToAdd.length !== addSportIds.length) {
          throw new BadRequestException(
            'Algunos deportes a agregar no fueron encontrados',
          );
        }

        // Evitar duplicados
        const currentSportIds = coach.sports.map((s) => s.id);
        const newSports = sportsToAdd.filter(
          (s) => !currentSportIds.includes(s.id),
        );
        coach.sports = [...coach.sports, ...newSports];
      }

      if (removeSportIds && removeSportIds.length > 0) {
        coach.sports = coach.sports.filter(
          (sport) => !removeSportIds.includes(sport.id),
        );
      }
    }

    return await this.coachRepository.save(coach);
  }

  async remove(id: number): Promise<void> {
    const coach = await this.findOne(id);
    await this.coachRepository.remove(coach);
  }

  async toggleActive(id: number): Promise<Coach> {
    const coach = await this.findOne(id);
    coach.isActive = !coach.isActive;
    coach.updatedAt = new Date();
    return await this.coachRepository.save(coach);
  }

  async getAvailableUsers(): Promise<User[]> {
    // Obtener usuarios con rol coach que no tienen coach asignado
    const existingCoachUserIds = await this.coachRepository
      .createQueryBuilder('coach')
      .select('coach.userId')
      .getRawMany()
      .then((results) => results.map((r) => r.coach_userId));

    const queryBuilder = this.userRepository
      .createQueryBuilder('user')
      .leftJoinAndSelect('user.roles', 'role')
      .where('role.name = :roleName', { roleName: 'coach' });

    if (existingCoachUserIds.length > 0) {
      queryBuilder.andWhere('user.id NOT IN (:...existingUserIds)', {
        existingUserIds: existingCoachUserIds,
      });
    }

    return await queryBuilder.getMany();
  }
}
