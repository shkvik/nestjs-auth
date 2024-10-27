import { Body, Controller, Get, Post, UseGuards, UseInterceptors } from '@nestjs/common';
import { AuthenticationService } from './authentication.service';
import { ApiBearerAuth, ApiBody, ApiConsumes, ApiTags } from '@nestjs/swagger';
import { FileInterceptor } from '@nestjs/platform-express';
import { LoginDtoReq, LoginDtoRes } from './dto/login.dto';
import { BaseGuard } from 'src/guards/base.guard';
import { CONFIG_AUTH } from 'src/config/config.export';
import { Jwt } from '../../common/jwt/jwt.decorator';
import { JwtAuthPayload } from '../../common/jwt/interface/jwt.interface';
import { RefreshDtoRes } from './dto/refresh.dto';

@Controller('auth')
@ApiTags('Auth')
export class AuthenticationController {
  constructor(private readonly authenticationService: AuthenticationService) { }

  @Post('login')
  @ApiBody({ type: LoginDtoReq })
  @ApiConsumes('multipart/form-data')
  @UseInterceptors(FileInterceptor('file'))
  public async login(@Body() dto: LoginDtoReq): Promise<LoginDtoRes> {
    return this.authenticationService.login(dto);
  }

  @Get('logout')
  @ApiBearerAuth()
  @UseGuards(new BaseGuard(CONFIG_AUTH.JWT_ACCESS))
  public async logout(@Jwt() jwt: JwtAuthPayload): Promise<void> {
    await this.authenticationService.logout(jwt);
  }

  @Get('refresh')
  @ApiBearerAuth()
  @UseGuards(new BaseGuard(CONFIG_AUTH.JWT_REFRESH))
  public async refresh(@Jwt() jwt: JwtAuthPayload): Promise<RefreshDtoRes> {
    return this.authenticationService.refresh(jwt);
  }
}