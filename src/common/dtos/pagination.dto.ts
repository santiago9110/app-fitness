import { ApiProperty } from '@nestjs/swagger';

import { Type, Transform } from 'class-transformer';
import { IsOptional, IsPositive, Min, IsBoolean, Max } from 'class-validator';

export class PaginationDto {
  @ApiProperty({
    default: 10,
    description: 'How many rows do you need',
  })
  @IsOptional()
  @IsPositive()
  @Type(() => Number) // enableImplicitConversions: true
  limit?: number;

  @ApiProperty({
    default: 0,
    description: 'How many rows do you want to skip',
  })
  @IsOptional()
  @Min(0)
  @Type(() => Number) // enableImplicitConversions: true
  offset?: number;

  @ApiProperty({
    default: false,
    description: 'Indicates if the entity should be active',
  })
  @IsOptional()
  @IsBoolean()
  @Transform(({ value }) => value === 'true')
  isActive?: boolean;

  @ApiProperty({
    default: new Date().getMonth() + 1,
  })
  @IsOptional()
  @Min(1)
  @Max(12)
  @Type(() => Number) // enableImplicitConversions: true
  month?: number;

  @ApiProperty({
    default: new Date().getFullYear(),
  })
  @IsOptional()
  @Type(() => Number) // enableImplicitConversions: true
  year?: number;
}
