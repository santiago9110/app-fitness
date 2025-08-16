import { Exclude, Expose, Type } from 'class-transformer';
import { Role } from '../../roles/entities/rol.entity';

@Exclude()
export class UserResponseDto {
  @Expose()
  id: number;

  @Expose()
  email: string;

  @Expose()
  fullName: string;

  @Expose()
  isActive: boolean;

  @Expose()
  @Type(() => Role)
  roles: Role[];

  @Expose()
  deletedAt?: Date;
}
