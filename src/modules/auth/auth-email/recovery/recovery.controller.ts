import {
  Body,
  Controller,
  Post,
  UseGuards,
  UseInterceptors,
} from '@nestjs/common';
import { RecoveryService } from './recovery.service';
import { ApiBearerAuth, ApiBody, ApiConsumes, ApiTags } from '@nestjs/swagger';
import { SendDtoReq, SendDtoRes } from './dto/send.dto';
import { ConfirmDtoReq, ConfirmDtoRes } from './dto/confirm.dto';
import { FileInterceptor } from '@nestjs/platform-express';
import { BaseGuard } from 'src/guards/base.guard';
import { CONFIG_AUTH } from 'src/config/config.export';
import { Jwt } from '../../common/jwt/jwt.decorator';
import { JwtAuthPayload } from '../../common/jwt/interface/jwt.interface';
import { ChangeDtoReq, ChangeDtoRes } from './dto/change.dto';

@Controller('auth-email')
@ApiTags('Auth Email')
export class RecoveryController {
  constructor(private readonly recoveryService: RecoveryService) {}

  @Post('send-code')
  @ApiConsumes('multipart/form-data')
  @ApiBody({ type: SendDtoReq })
  @UseInterceptors(FileInterceptor('file'))
  public async sendCode(@Body() dto: SendDtoReq): Promise<SendDtoRes> {
    return this.recoveryService.sendCode(dto);
  }

  @Post('confirm-code')
  @ApiConsumes('multipart/form-data')
  @ApiBody({ type: ConfirmDtoReq })
  @UseInterceptors(FileInterceptor('file'))
  public async confirmCode(@Body() dto: ConfirmDtoReq): Promise<ConfirmDtoRes> {
    return this.recoveryService.confirmCode(dto);
  }

  @Post('change-password')
  @ApiConsumes('multipart/form-data')
  @ApiBody({ type: ChangeDtoReq })
  @ApiBearerAuth()
  @UseInterceptors(FileInterceptor('file'))
  @UseGuards(new BaseGuard(CONFIG_AUTH.JWT_RECOVERY))
  public async changePassword(
    @Body() dto: ChangeDtoReq,
    @Jwt() jwt: JwtAuthPayload,
  ): Promise<ChangeDtoRes> {
    return this.recoveryService.changePassword({
      ...dto,
      ...jwt,
    });
  }
}
