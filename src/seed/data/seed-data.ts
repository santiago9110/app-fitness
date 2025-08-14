interface SeedRole {
  name: string;
}

interface SeedUser {
  email: string;
  fullName: string;
  password: string;
  roles: string[];
}

interface SeedSport {
  name: string;
  description: string;
  monthlyFee?: number; // Opcional, como precio base
}

interface SeedSportPlan {
  name: string;
  weeklyFrequency: number;
  monthlyFee: number;
  description: string;
  isActive: boolean;
  sportName: string; // Nombre del deporte para buscar la relación
}

interface SeedStudent {
  firstName: string;
  lastName: string;
  birthDate: string;
  phone: string;
  startDate: string;
  document: string;
  isActive: boolean;
  sportName: string; // Nombre del deporte para buscar la relación
  sportPlanName?: string; // Nombre del plan deportivo (opcional)
  email: string; // Email para el usuario
  password: string; // Contraseña para el usuario
}

interface SeedCoach {
  firstName: string;
  lastName: string;
  email: string;
  password: string;
  salary?: number;
  specialty?: string;
  roles?: string[]; // Roles del coach, por defecto puede ser solo 'coach'
}

interface SeedData {
  roles: SeedRole[];
  users: SeedUser[];
  coaches: SeedCoach[];
  sports: SeedSport[];
  sportPlans: SeedSportPlan[];
  students: (SeedStudent & { coachEmail?: string })[];
}

export const initialData: SeedData = {
  roles: [
    {
      name: 'user',
    },
    {
      name: 'admin',
    },
    {
      name: 'super-admin',
    },
    { name: 'coach' },
  ],
  users: [
    {
      email: 'admin@fitfinance.com',
      fullName: 'Administrador Principal',
      password: 'Admin123!',
      roles: ['admin', 'super-admin'],
    },
    {
      email: 'user@fitfinance.com',
      fullName: 'Usuario de Prueba',
      password: 'User123!',
      roles: ['user'],
    },
    // // Coaches como usuarios
    // {
    //   email: 'brian@fitfinance.com',
    //   fullName: 'Brian Gómez',
    //   password: 'Coach123!',
    //   roles: ['coach'],
    // },
    // {
    //   email: 'lautaro@fitfinance.com',
    //   fullName: 'Lautaro Pérez',
    //   password: 'Coach123!',
    //   roles: ['coach'],
    // },
    // {
    //   email: 'mauro@fitfinance.com',
    //   fullName: 'Mauro Yini',
    //   password: 'Coach123!',
    //   roles: ['coach'],
    // },
  ],
  coaches: [
    {
      firstName: 'Brian',
      lastName: 'Gómez',
      email: 'brian@fitfinance.com',
      password: 'Coach123!',
      salary: 200000,
      specialty: 'Fuerza',
      roles: ['coach'],
    },
    {
      firstName: 'Lautaro',
      lastName: 'Pérez',
      email: 'lautaro@fitfinance.com',
      password: 'Coach123!',
      salary: 180000,
      specialty: 'Hipertrofia',
      roles: ['coach'],
    },
    {
      firstName: 'Mauro',
      lastName: 'Yini',
      email: 'mauro@fitfinance.com',
      password: 'Coach123!',
      salary: 220000,
      specialty: 'Funcional',
      roles: ['coach'],
    },
  ],
  sports: [
    {
      name: 'Musculación',
      description:
        'Entrenamiento con pesas y máquinas para desarrollo muscular',
      monthlyFee: 8000, // Precio base de referencia
    },
    {
      name: 'CrossFit',
      description: 'Entrenamiento funcional de alta intensidad',
      monthlyFee: 10000,
    },
    {
      name: 'Yoga',
      description: 'Práctica de posturas, respiración y meditación',
      monthlyFee: 6000,
    },
    {
      name: 'Pilates',
      description: 'Ejercicios de fortalecimiento y flexibilidad',
      monthlyFee: 6500,
    },
    {
      name: 'Boxeo',
      description: 'Arte marcial y deporte de combate',
      monthlyFee: 8000,
    },
    {
      name: 'Natación',
      description: 'Entrenamiento acuático completo',
      monthlyFee: 9000,
    },
    {
      name: 'Spinning',
      description: 'Ciclismo indoor con música y coreografía',
      monthlyFee: 5500,
    },
    {
      name: 'Zumba',
      description: 'Baile fitness con ritmos latinos',
      monthlyFee: 5000,
    },
    {
      name: 'Funcional',
      description: 'Entrenamiento funcional con peso corporal',
      monthlyFee: 6500,
    },
    {
      name: 'Artes Marciales',
      description: 'Karate, Taekwondo y otras disciplinas marciales',
      monthlyFee: 7000,
    },
    {
      name: 'Calistenia',
      description: 'Ejercicios con peso corporal al aire libre',
      monthlyFee: 6000,
    },
    {
      name: 'Aqua Aeróbicos',
      description: 'Ejercicios aeróbicos en el agua',
      monthlyFee: 7500,
    },
  ],
  sportPlans: [
    // Musculación Plans
    {
      name: '2 veces por semana',
      weeklyFrequency: 2,
      monthlyFee: 6500,
      description: 'Plan básico de musculación, ideal para principiantes',
      isActive: true,
      sportName: 'Musculación',
    },
    {
      name: '3 veces por semana',
      weeklyFrequency: 3,
      monthlyFee: 8500,
      description: 'Plan intermedio de musculación',
      isActive: true,
      sportName: 'Musculación',
    },
    {
      name: 'Plan ilimitado',
      weeklyFrequency: 7,
      monthlyFee: 12000,
      description: 'Acceso ilimitado al gimnasio',
      isActive: true,
      sportName: 'Musculación',
    },
    // CrossFit Plans
    {
      name: '2 veces por semana',
      weeklyFrequency: 2,
      monthlyFee: 8000,
      description: 'CrossFit básico para comenzar',
      isActive: true,
      sportName: 'CrossFit',
    },
    {
      name: '3 veces por semana',
      weeklyFrequency: 3,
      monthlyFee: 12000,
      description: 'CrossFit intermedio',
      isActive: true,
      sportName: 'CrossFit',
    },
    {
      name: '5 veces por semana',
      weeklyFrequency: 5,
      monthlyFee: 18000,
      description: 'CrossFit avanzado para atletas',
      isActive: true,
      sportName: 'CrossFit',
    },
    // Yoga Plans
    {
      name: '2 veces por semana',
      weeklyFrequency: 2,
      monthlyFee: 5000,
      description: 'Yoga relajante para principiantes',
      isActive: true,
      sportName: 'Yoga',
    },
    {
      name: '3 veces por semana',
      weeklyFrequency: 3,
      monthlyFee: 7000,
      description: 'Yoga intermedio con variedad de estilos',
      isActive: true,
      sportName: 'Yoga',
    },
    {
      name: 'Yoga ilimitado',
      weeklyFrequency: 7,
      monthlyFee: 10000,
      description: 'Acceso a todas las clases de yoga',
      isActive: true,
      sportName: 'Yoga',
    },
    // Boxeo Plans
    {
      name: '2 veces por semana',
      weeklyFrequency: 2,
      monthlyFee: 7000,
      description: 'Boxeo técnico y fitness',
      isActive: true,
      sportName: 'Boxeo',
    },
    {
      name: '3 veces por semana',
      weeklyFrequency: 3,
      monthlyFee: 9500,
      description: 'Entrenamiento completo de boxeo',
      isActive: true,
      sportName: 'Boxeo',
    },
    {
      name: 'Boxeo competitivo',
      weeklyFrequency: 5,
      monthlyFee: 15000,
      description: 'Preparación para competencias',
      isActive: true,
      sportName: 'Boxeo',
    },
    // Natación Plans
    {
      name: '2 veces por semana',
      weeklyFrequency: 2,
      monthlyFee: 8000,
      description: 'Natación recreativa',
      isActive: true,
      sportName: 'Natación',
    },
    {
      name: '3 veces por semana',
      weeklyFrequency: 3,
      monthlyFee: 11000,
      description: 'Entrenamiento técnico de natación',
      isActive: true,
      sportName: 'Natación',
    },
    // Spinning Plans
    {
      name: '2 veces por semana',
      weeklyFrequency: 2,
      monthlyFee: 4500,
      description: 'Spinning básico',
      isActive: true,
      sportName: 'Spinning',
    },
    {
      name: '3 veces por semana',
      weeklyFrequency: 3,
      monthlyFee: 6500,
      description: 'Spinning intensivo',
      isActive: true,
      sportName: 'Spinning',
    },
    // Planes básicos para otros deportes
    {
      name: '2 veces por semana',
      weeklyFrequency: 2,
      monthlyFee: 6500,
      description: 'Plan básico de Pilates',
      isActive: true,
      sportName: 'Pilates',
    },
    {
      name: '2 veces por semana',
      weeklyFrequency: 2,
      monthlyFee: 5000,
      description: 'Zumba divertido y energético',
      isActive: true,
      sportName: 'Zumba',
    },
    {
      name: '3 veces por semana',
      weeklyFrequency: 3,
      monthlyFee: 7500,
      description: 'Entrenamiento funcional completo',
      isActive: true,
      sportName: 'Funcional',
    },
    {
      name: '2 veces por semana',
      weeklyFrequency: 2,
      monthlyFee: 7000,
      description: 'Artes marciales tradicionales',
      isActive: true,
      sportName: 'Artes Marciales',
    },
    {
      name: '3 veces por semana',
      weeklyFrequency: 3,
      monthlyFee: 6500,
      description: 'Calistenia al aire libre',
      isActive: true,
      sportName: 'Calistenia',
    },
    {
      name: '2 veces por semana',
      weeklyFrequency: 2,
      monthlyFee: 7000,
      description: 'Aqua aeróbicos de bajo impacto',
      isActive: true,
      sportName: 'Aqua Aeróbicos',
    },
  ],
  students: [
    // Brian's students - Con diferentes planes
    {
      firstName: 'Carlos',
      lastName: 'González',
      birthDate: '1995-03-15',
      phone: '2235551234',
      startDate: '2025-01-15',
      document: '12345678',
      isActive: true,
      sportName: 'Musculación',
      sportPlanName: '3 veces por semana', // Plan intermedio
      email: 'carlos.gonzalez@fitfinance.com',
      password: 'Student123!',
      coachEmail: 'brian@fitfinance.com',
    },
    {
      firstName: 'María',
      lastName: 'Rodríguez',
      birthDate: '1992-07-22',
      phone: '2235555678',
      startDate: '2025-02-01',
      document: '23456789',
      isActive: true,
      sportName: 'Yoga',
      sportPlanName: '2 veces por semana', // Plan básico
      email: 'maria.rodriguez@fitfinance.com',
      password: 'Student123!',
      coachEmail: 'brian@fitfinance.com',
    },
    {
      firstName: 'Juan',
      lastName: 'Pérez',
      birthDate: '1988-11-10',
      phone: '2235559876',
      startDate: '2024-12-10',
      document: '34567890',
      isActive: true,
      sportName: 'CrossFit',
      sportPlanName: '5 veces por semana', // Plan avanzado
      email: 'juan.perez@fitfinance.com',
      password: 'Student123!',
      coachEmail: 'brian@fitfinance.com',
    },
    {
      firstName: 'Ana',
      lastName: 'Martínez',
      birthDate: '1990-05-08',
      phone: '2235554321',
      startDate: '2025-01-20',
      document: '45678901',
      isActive: true,
      sportName: 'Pilates',
      sportPlanName: '2 veces por semana',
      email: 'ana.martinez@fitfinance.com',
      password: 'Student123!',
      coachEmail: 'brian@fitfinance.com',
    },
    {
      firstName: 'Diego',
      lastName: 'López',
      birthDate: '1993-09-14',
      phone: '2235558765',
      startDate: '2025-02-15',
      document: '56789012',
      isActive: true,
      sportName: 'Boxeo',
      sportPlanName: '3 veces por semana', // Plan completo
      email: 'diego.lopez@fitfinance.com',
      password: 'Student123!',
      coachEmail: 'brian@fitfinance.com',
    },
    // Lautaro's students - Variedad de planes
    {
      firstName: 'Sofía',
      lastName: 'Fernández',
      birthDate: '1991-01-25',
      phone: '2235552468',
      startDate: '2025-01-08',
      document: '67890123',
      isActive: true,
      sportName: 'Natación',
      sportPlanName: '3 veces por semana', // Plan técnico
      email: 'sofia.fernandez@fitfinance.com',
      password: 'Student123!',
      coachEmail: 'lautaro@fitfinance.com',
    },
    {
      firstName: 'Mateo',
      lastName: 'Silva',
      birthDate: '1994-12-03',
      phone: '2235557890',
      startDate: '2025-02-20',
      document: '78901234',
      isActive: true,
      sportName: 'Spinning',
      sportPlanName: '3 veces por semana', // Plan intensivo
      email: 'mateo.silva@fitfinance.com',
      password: 'Student123!',
      coachEmail: 'lautaro@fitfinance.com',
    },
    {
      firstName: 'Valentina',
      lastName: 'Torres',
      birthDate: '1989-06-18',
      phone: '2235553456',
      startDate: '2024-11-25',
      document: '89012345',
      isActive: true,
      sportName: 'Zumba',
      sportPlanName: '2 veces por semana',
      email: 'valentina.torres@fitfinance.com',
      password: 'Student123!',
      coachEmail: 'lautaro@fitfinance.com',
    },
    {
      firstName: 'Lucas',
      lastName: 'Herrera',
      birthDate: '1996-08-07',
      phone: '2235556789',
      startDate: '2025-01-30',
      document: '90123456',
      isActive: true,
      sportName: 'Funcional',
      sportPlanName: '3 veces por semana',
      email: 'lucas.herrera@fitfinance.com',
      password: 'Student123!',
      coachEmail: 'lautaro@fitfinance.com',
    },
    {
      firstName: 'Camila',
      lastName: 'Morales',
      birthDate: '1987-04-12',
      phone: '2235551357',
      startDate: '2025-02-05',
      document: '01234567',
      isActive: true,
      sportName: 'Artes Marciales',
      sportPlanName: '2 veces por semana',
      email: 'camila.morales@fitfinance.com',
      password: 'Student123!',
      coachEmail: 'lautaro@fitfinance.com',
    },
    // Mauro's students - Incluyendo el plan premium de Musculación
    {
      firstName: 'Sebastián',
      lastName: 'Vargas',
      birthDate: '1992-10-28',
      phone: '2235559753',
      startDate: '2025-01-12',
      document: '11234567',
      isActive: true,
      sportName: 'Calistenia',
      sportPlanName: '3 veces por semana',
      email: 'sebastian.vargas@fitfinance.com',
      password: 'Student123!',
      coachEmail: 'mauro@fitfinance.com',
    },
    {
      firstName: 'Isabella',
      lastName: 'Castro',
      birthDate: '1986-02-14',
      phone: '2235558642',
      startDate: '2024-12-18',
      document: '22234567',
      isActive: true,
      sportName: 'Aqua Aeróbicos',
      sportPlanName: '2 veces por semana',
      email: 'isabella.castro@fitfinance.com',
      password: 'Student123!',
      coachEmail: 'mauro@fitfinance.com',
    },
    {
      firstName: 'Pedro',
      lastName: 'Ramírez',
      birthDate: '1993-03-22',
      phone: '2235551111',
      startDate: '2025-01-10',
      document: '33334444',
      isActive: true,
      sportName: 'Musculación',
      sportPlanName: 'Plan ilimitado', // Plan premium
      email: 'pedro.ramirez@fitfinance.com',
      password: 'Student123!',
      coachEmail: 'mauro@fitfinance.com',
    },
    {
      firstName: 'Florencia',
      lastName: 'Sosa',
      birthDate: '1995-09-17',
      phone: '2235552222',
      startDate: '2025-02-12',
      document: '55556666',
      isActive: true,
      sportName: 'Yoga',
      sportPlanName: 'Yoga ilimitado', // Plan premium de yoga
      email: 'florencia.sosa@fitfinance.com',
      password: 'Student123!',
      coachEmail: 'mauro@fitfinance.com',
    },
    {
      firstName: 'Tomás',
      lastName: 'Iglesias',
      birthDate: '1990-06-30',
      phone: '2235553333',
      startDate: '2025-01-25',
      document: '77778888',
      isActive: true,
      sportName: 'CrossFit',
      sportPlanName: '2 veces por semana', // Plan básico de CrossFit
      email: 'tomas.iglesias@fitfinance.com',
      password: 'Student123!',
      coachEmail: 'mauro@fitfinance.com',
    },
    // Estudiantes adicionales sin plan específico (usarán precio base del deporte)
    {
      firstName: 'Agustín',
      lastName: 'Mendoza',
      birthDate: '1994-08-20',
      phone: '2235554444',
      startDate: '2025-02-18',
      document: '99990000',
      isActive: true,
      sportName: 'Boxeo', // Sin plan específico
      email: 'agustin.mendoza@fitfinance.com',
      password: 'Student123!',
      coachEmail: 'brian@fitfinance.com',
    },
    {
      firstName: 'Catalina',
      lastName: 'Vega',
      birthDate: '1991-11-05',
      phone: '2235555555',
      startDate: '2025-01-28',
      document: '11110000',
      isActive: true,
      sportName: 'Natación', // Sin plan específico
      email: 'catalina.vega@fitfinance.com',
      password: 'Student123!',
      coachEmail: 'lautaro@fitfinance.com',
    },
  ],
};
