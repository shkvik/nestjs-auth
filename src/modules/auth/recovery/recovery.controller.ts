import { Controller, Get } from '@nestjs/common';
import { RecoveryService } from './recovery.service';
import { ApiTags } from '@nestjs/swagger';

@Controller('auth')
@ApiTags('Auth')
export class RecoveryController {
  constructor(private readonly recoveryService: RecoveryService) {}

  @Get('send-email')
  public async sendEmail(request: string): Promise<string> {
    return this.recoveryService.sendEmail(request);
  }

  @Get('confirm-email')
  public async confirmEmail(request: string): Promise<string> {
    return this.recoveryService.confirmEmail(request);
  }

  @Get('change-password')
  public async changePassword(request: string): Promise<string> {
    return this.recoveryService.changePassword(request);
  }
}
