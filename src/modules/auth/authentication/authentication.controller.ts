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
import { ApiBearerAuth, ApiBody, ApiConsumes, ApiTags } from '@nestjs/swagger';
import { BaseGuard } from 'src/guards/base.guard';
import { CONFIG_AUTH } from 'src/config/config.export';
import { RefreshDtoRes } from './dto/refresh.dto';
import { Response } from 'express';
import { RefreshGuard } from 'src/guards/refresh.guard';
import { JwtAuthPayload } from '../jwt/interface/jwt.interface';
import { Jwt } from '../jwt/jwt.decorator';
import { LoginDtoReq, LoginDtoRes } from './dto';
import { FileInterceptor } from '@nestjs/platform-express';
import { AuthenticationService } from './authentication.service';

@Controller('auth')
@ApiTags('Auth')
export class AuthenticationController {

  @Inject()
  private readonly authenticationService: AuthenticationService;

  @Post('login')
  @ApiBody({ type: LoginDtoReq })
  @ApiConsumes('multipart/form-data')
  @UseInterceptors(FileInterceptor('file'))
  public async login(
    @Res({ passthrough: true }) res: Response,
    @Body() dto: LoginDtoReq,
  ): Promise<LoginDtoRes> {
    return this.authenticationService.login(res, dto);
  }

  @Get('logout')
  @ApiBearerAuth()
  @UseGuards(new BaseGuard(CONFIG_AUTH.JWT_ACCESS))
  public async logout(
    @Res({ passthrough: true }) res: Response,
    @Jwt() jwt: JwtAuthPayload,
  ): Promise<void> {
    return this.authenticationService.logout(res, jwt);
  }

  @Post('2fa-totp')
  @ApiBody({ type: LoginDtoReq })
  @ApiConsumes('multipart/form-data')
  @UseInterceptors(FileInterceptor('file'))
  public async twoFactorTOTP(
    //@ts-ignore
    @Res({ passthrough: true }) res: Response,
    //@ts-ignore
    @Body() dto: LoginDtoReq,
    //@ts-ignore
  ): Promise<LoginDtoRes> {
    //return this.authenticationService.login(res, dto);
  }

  @Get('validate-token')
  @ApiBearerAuth()
  @UseGuards(new BaseGuard(CONFIG_AUTH.JWT_ACCESS))
  public validateToken(): boolean {
    return true;
  }

  @Get('refresh-token')
  @ApiBearerAuth()
  @UseGuards(new RefreshGuard(CONFIG_AUTH.JWT_REFRESH))
  public async refresh(
    @Res({ passthrough: true }) res: Response,
    @Jwt() jwt: JwtAuthPayload,
  ): Promise<RefreshDtoRes> {
    return this.authenticationService.refresh(res, jwt);
  }
}
