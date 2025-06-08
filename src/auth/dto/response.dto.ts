import { ApiProperty } from '@nestjs/swagger';

export class ResponseDto {
  @ApiProperty()
  result?: any;

  @ApiProperty({ default: true })
  isSuccess: boolean = true;

  @ApiProperty({ default: '' })
  message: string = '';
}