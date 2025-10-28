import { ApiProperty } from '@nestjs/swagger';

export class UserDto {
  @ApiProperty()
  id: string;

  @ApiProperty()
  name: string;

  @ApiProperty()
  phoneNumber: string;

  @ApiProperty()
  email: string;

  // 👇 AGREGA ESTA PARTE
  @ApiProperty({
    example: 1,
    description: 'Estado del usuario: 1 = activo, 2 = inactivo',
  })
  status: number;

  @ApiProperty({ example: ['USER'] })
  roles: string[];
}
