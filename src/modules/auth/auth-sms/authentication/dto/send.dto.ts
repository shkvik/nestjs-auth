import { ApiProperty } from '@nestjs/swagger';
import { IsPhoneNumber } from 'class-validator';

export class SendDtoReq {
  @ApiProperty({
    description: 'User phone',
    example: '+7(999) 555 22 11',
  })
  @IsPhoneNumber()
  public phone: string;
}

export class SendDtoRes {
  statusCode: number;
}
