import {
  Body,
  Controller,
  Get,
  Inject,
  Post,
  Res,
  UseGuards,
  UseInterceptors,
} from '@nestjs/common';
import { ApiBearerAuth, ApiConsumes, ApiTags } from '@nestjs/swagger';
import { FileInterceptor } from '@nestjs/platform-express';
import { BaseGuard } from 'src/guards/base.guard';
import { CONFIG_AUTH } from 'src/config/config.export';
import { Response } from 'express';
import { RefreshGuard } from 'src/guards/refresh.guard';
import { Jwt } from '../../common/jwt/jwt.decorator';
import { JwtAuthPayload } from '../../common/jwt/interface/jwt.interface';
import { AuthenticationService } from './authentication.service';
import {
  ConfirmDtoReq,
  ConfirmDtoRes,
  RefreshDtoRes,
  SendDtoReq,
  SendDtoRes,
} from './dto';

@Controller('auth-sms')
@ApiTags('Auth SMS')
export class AuthenticationController {
  @Inject()
  private authorizationService: AuthenticationService;

  @Post('send-code')
  @ApiConsumes('multipart/form-data')
  @UseInterceptors(FileInterceptor('file'))
  public async sendCode(@Body() dto: SendDtoReq): Promise<SendDtoRes> {
    return this.authorizationService.sendCode(dto);
  }

  @Post('confirm-code')
  @ApiConsumes('multipart/form-data')
  @UseInterceptors(FileInterceptor('file'))
  public confirmCode(
    @Res({ passthrough: true }) res: Response,
    @Body() dto: ConfirmDtoReq,
  ): Promise<ConfirmDtoRes> {
    return this.authorizationService.confirmCode(res, dto);
  }

  @Get('refresh-token')
  @ApiBearerAuth()
  @UseGuards(new RefreshGuard(CONFIG_AUTH.JWT_REFRESH))
  public async refresh(
    @Res({ passthrough: true }) res: Response,
    @Jwt() jwt: JwtAuthPayload,
  ): Promise<RefreshDtoRes> {
    return this.authorizationService.refresh(res, jwt);
  }

  @Get('validate-token')
  @ApiBearerAuth()
  @UseGuards(new BaseGuard(CONFIG_AUTH.JWT_ACCESS))
  public validateToken(): boolean {
    return true;
  }
}
