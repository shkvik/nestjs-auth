import { Body, Controller, Get, Post } from '@nestjs/common';
import { RecoveryService } from './recovery.service';
import { ApiTags } from '@nestjs/swagger';
import { SendDtoReq } from './dto/send.dto';

@Controller('auth')
@ApiTags('Auth')
export class RecoveryController {
  constructor(private readonly recoveryService: RecoveryService) {}

  @Post('send-code')
  public async sendCode(@Body() dto: SendDtoReq) {
    return this.recoveryService.sendCode(dto);
  }

  // @Get('confirm-email')
  // public async confirmEmail(request: string): Promise<string> {
  //   return this.recoveryService.confirmCode(request);
  // }

  @Get('change-password')
  public async changePassword(request: string): Promise<string> {
    return this.recoveryService.changePassword(request);
  }
}
