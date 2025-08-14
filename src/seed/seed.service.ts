import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Role } from '../roles/entities/rol.entity';
import { User } from '../auth/entities/user.entity';
import { Sport } from '../sport/entities/sport.entity';
import { SportPlan } from '../sport/entities/sport-plan.entity';
import { Student } from '../student/entities/student.entity';
import { StudentService } from '../student/student.service';
import { Coach } from '../coach/entities/coach.entity';
import { Repository } from 'typeorm';
import { initialData } from './data/seed-data';
import * as bcrypt from 'bcrypt';

@Injectable()
export class SeedService {
  constructor(
    @InjectRepository(Role)
    private readonly roleRepository: Repository<Role>,

    @InjectRepository(User)
    private readonly userRepository: Repository<User>,

    @InjectRepository(Sport)
    private readonly sportRepository: Repository<Sport>,

    @InjectRepository(SportPlan)
    private readonly sportPlanRepository: Repository<SportPlan>,

    @InjectRepository(Student)
    private readonly studentRepository: Repository<Student>,

    @InjectRepository(Coach)
    private readonly coachRepository: Repository<Coach>,
    private readonly studentService: StudentService,
  ) {}

  async runSeed() {
    await this.deleteTables();

    const roles = await this.insertRoles();
    await this.insertUsers(roles);
    const sports = await this.insertSports();
    const sportPlans = await this.insertSportPlans(sports);
    const coaches = await this.insertCoaches(roles);
    await this.insertStudentsWithUsers(sports, sportPlans, roles, coaches);

    return {
      message: 'Seed executed successfully!',
      rolesCreated: initialData.roles.length,
      usersCreated: initialData.users.length,
      sportsCreated: initialData.sports.length,
      sportPlansCreated: initialData.sportPlans.length,
      coachesCreated: initialData.coaches.length,
      studentsCreated: initialData.students.length,
    };
  }

  private async deleteTables() {
    // Eliminar estudiantes primero (por las relaciones)
    await this.studentRepository
      .createQueryBuilder()
      .delete()
      .where({})
      .execute();
    // Eliminar coaches
    await this.coachRepository
      .createQueryBuilder()
      .delete()
      .where({})
      .execute();
    // Eliminar usuarios (por las relaciones)
    await this.userRepository.createQueryBuilder().delete().where({}).execute();
    // Eliminar planes deportivos antes que deportes
    await this.sportPlanRepository
      .createQueryBuilder()
      .delete()
      .where({})
      .execute();
    // Eliminar deportes
    await this.sportRepository
      .createQueryBuilder()
      .delete()
      .where({})
      .execute();
    // Luego eliminar roles
    await this.roleRepository.createQueryBuilder().delete().where({}).execute();
  }

  private async insertCoaches(roles: Role[]) {
    const seedCoaches = initialData.coaches;
    const coachRole = roles.find((role) => role.name === 'coach');
    if (!coachRole) {
      throw new Error('Coach role not found');
    }

    const coaches: Coach[] = [];
    for (const coachData of seedCoaches) {
      // Crear usuario para el coach
      const hashedPassword = await bcrypt.hash(coachData.password, 10);
      const user = this.userRepository.create({
        email: coachData.email,
        fullName: `${coachData.firstName} ${coachData.lastName}`,
        password: hashedPassword,
        roles: [coachRole], // Asignar rol de coach
      });
      const savedUser = await this.userRepository.save(user);
      // Crear coach
      const coach = this.coachRepository.create({
        userId: savedUser.id,
        salary: coachData.salary,
        specialization: coachData.specialty,
      });
      const savedCoach = await this.coachRepository.save(coach);
      coaches.push(savedCoach);
    }
    return coaches;
  }

  private async insertRoles() {
    const seedRoles = initialData.roles;

    const roles: Role[] = [];

    seedRoles.forEach((roleData) => {
      roles.push(this.roleRepository.create(roleData));
    });

    const dbRoles = await this.roleRepository.save(roles);

    return dbRoles;
  }

  private async insertUsers(roles: Role[]) {
    const seedUsers = initialData.users;

    const users: User[] = [];

    for (const userData of seedUsers) {
      // Encriptar la contraseña
      const hashedPassword = await bcrypt.hash(userData.password, 10);

      // Buscar los roles por nombre
      const userRoles = roles.filter((role) =>
        userData.roles.includes(role.name),
      );

      const user = this.userRepository.create({
        email: userData.email,
        fullName: userData.fullName,
        password: hashedPassword,
        roles: userRoles,
      });

      users.push(user);
    }

    const dbUsers = await this.userRepository.save(users);

    return dbUsers;
  }

  private async insertSports() {
    const seedSports = initialData.sports;

    const sports: Sport[] = [];

    seedSports.forEach((sportData) => {
      sports.push(this.sportRepository.create(sportData));
    });

    const dbSports = await this.sportRepository.save(sports);

    return dbSports;
  }

  private async insertSportPlans(sports: Sport[]) {
    const seedSportPlans = initialData.sportPlans;

    const sportPlans: SportPlan[] = [];

    for (const sportPlanData of seedSportPlans) {
      // Buscar el deporte por nombre
      const sport = sports.find((s) => s.name === sportPlanData.sportName);
      if (!sport) {
        console.warn(
          `Sport ${sportPlanData.sportName} not found for sport plan ${sportPlanData.name}`,
        );
        continue;
      }

      const sportPlan = this.sportPlanRepository.create({
        name: sportPlanData.name,
        weeklyFrequency: sportPlanData.weeklyFrequency,
        monthlyFee: sportPlanData.monthlyFee,
        description: sportPlanData.description,
        isActive: sportPlanData.isActive,
        sport: { id: sport.id } as Sport,
        sportId: sport.id,
      });

      sportPlans.push(sportPlan);
    }

    const dbSportPlans = await this.sportPlanRepository.save(sportPlans);

    return dbSportPlans;
  }

  private async insertStudentsWithUsers(
    sports: Sport[],
    sportPlans: SportPlan[],
    roles: Role[],
    coaches: Coach[],
  ) {
    const seedStudents = initialData.students;
    const userRole = roles.find((role) => role.name === 'user');
    if (!userRole) {
      throw new Error('User role not found');
    }
    const createdStudents: Student[] = [];
    for (const studentData of seedStudents) {
      // Buscar el deporte por nombre
      const sport = sports.find((s) => s.name === studentData.sportName);
      if (!sport) {
        console.warn(
          `Sport ${studentData.sportName} not found for student ${studentData.firstName}`,
        );
        continue;
      }

      // Buscar el plan deportivo por nombre (si está especificado)
      let sportPlan = null;
      if (studentData.sportPlanName) {
        sportPlan = sportPlans.find(
          (sp) =>
            sp.name === studentData.sportPlanName && sp.sportId === sport.id,
        );
        if (!sportPlan) {
          console.warn(
            `Sport plan ${studentData.sportPlanName} not found for sport ${studentData.sportName} and student ${studentData.firstName}`,
          );
        }
      }

      // Buscar el coach por email
      let coach = null;
      if (studentData.coachEmail) {
        coach = coaches.find((c) => c.user.email === studentData.coachEmail);
        if (!coach) {
          console.warn(
            `Coach ${studentData.coachEmail} not found for student ${studentData.firstName}`,
          );
        }
      }
      // Crear el usuario primero
      const hashedPassword = await bcrypt.hash(studentData.password, 10);
      const user = this.userRepository.create({
        email: studentData.email,
        fullName: `${studentData.firstName} ${studentData.lastName}`,
        password: hashedPassword,
        roles: [userRole],
      });
      const savedUser = await this.userRepository.save(user);
      // Crear el estudiante con el usuario, deporte, plan deportivo (si existe) y coach relacionado
      const student = this.studentRepository.create({
        firstName: studentData.firstName,
        lastName: studentData.lastName,
        birthDate: new Date(studentData.birthDate),
        phone: studentData.phone,
        startDate: new Date(studentData.startDate),
        document: studentData.document,
        isActive: studentData.isActive,
        sport: { id: sport.id } as Sport,
        sportPlan: sportPlan ? ({ id: sportPlan.id } as SportPlan) : undefined,
        sportPlanId: sportPlan?.id,
        user: { id: savedUser.id } as User,
        coach: coach ? ({ id: coach.id } as Coach) : undefined,
      });
      const savedStudent = await this.studentRepository.save(student);
      // Generar las cuotas para el estudiante
      await this.studentService.generateFeesForNewStudent(savedStudent.id);
      createdStudents.push(savedStudent);
    }
    return createdStudents;
  }
}
