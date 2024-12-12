import { ApiProperty } from '@nestjs/swagger';
import { Allow, IsEmail } from 'class-validator';

export class SendDtoReq {
  @ApiProperty({
    description: 'Email address of the user',
    example: 'example@email.com',
  })
  @IsEmail()
  public email: string;
}

export class SendDtoRes {
  @Allow()
  result: boolean;
}
