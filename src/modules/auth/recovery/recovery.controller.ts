import {
  Body,
  Controller,
  Inject,
  Post,
  UseGuards,
  UseInterceptors,
} from '@nestjs/common';
import { RecoveryService } from './recovery.service';
import { ApiBearerAuth, ApiBody, ApiConsumes, ApiTags } from '@nestjs/swagger';
import { SendRecoveryCodeDtoReq, SendRecoveryCodeDtoRes } from './dto/send-recovery-code.dto';
import { ConfirmRecoveryCodeDtoReq, ConfirmRecoveryCodeDtoRes } from './dto/confirm-recovery-code.dto';
import { FileInterceptor } from '@nestjs/platform-express';
import { BaseGuard } from 'src/guards/base.guard';
import { CONFIG_AUTH } from 'src/config/config.export';
import { ChangePasswordDtoReq, ChangePasswordDtoRes } from './dto/change-password.dto';
import { JwtAuthPayload } from '../jwt/interface/jwt.interface';
import { Jwt } from '../jwt/jwt.decorator';

@Controller('auth')
@ApiTags('Auth')
export class RecoveryController {

  @Inject()
  private readonly recoveryService: RecoveryService;

  @Post('send-recovery-code')
  @ApiConsumes('multipart/form-data')
  @ApiBody({ type: SendRecoveryCodeDtoReq })
  @UseInterceptors(FileInterceptor('file'))
  public async sendRecoveryCode(
    @Body() dto: SendRecoveryCodeDtoReq
  ): Promise<SendRecoveryCodeDtoRes> {
    return this.recoveryService.sendRecoveryCode(dto);
  }

  @Post('confirm-recovery-code')
  @ApiConsumes('multipart/form-data')
  @ApiBody({ type: ConfirmRecoveryCodeDtoReq })
  @UseInterceptors(FileInterceptor('file'))
  public async confirmRecoveryCode(
    @Body() dto: ConfirmRecoveryCodeDtoReq
  ): Promise<ConfirmRecoveryCodeDtoRes> {
    return this.recoveryService.confirmCode(dto);
  }

  @Post('change-password')
  @ApiConsumes('multipart/form-data')
  @ApiBody({ type: ChangePasswordDtoReq })
  @ApiBearerAuth()
  @UseInterceptors(FileInterceptor('file'))
  @UseGuards(new BaseGuard(CONFIG_AUTH.JWT_RECOVERY))
  public async changePassword(
    @Body() dto: ChangePasswordDtoReq,
    @Jwt() jwt: JwtAuthPayload,
  ): Promise<ChangePasswordDtoRes> {
    return this.recoveryService.changePassword(dto, jwt);
  }
}
