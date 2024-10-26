import { Body, Controller, Get, Req, UseInterceptors } from '@nestjs/common';
import { AuthenticationService } from './authentication.service';
import { ApiBody, ApiConsumes, ApiTags } from '@nestjs/swagger';
import { FileInterceptor } from '@nestjs/platform-express';
import { LoginDtoReq, LoginDtoRes } from './dto/login.dto';
import { Request } from 'express';

@Controller('auth')
@ApiTags('Auth')
export class AuthenticationController {
  constructor(private readonly authenticationService: AuthenticationService) {}

  @Get('login')
  @ApiConsumes('multipart/form-data')
  @UseInterceptors(FileInterceptor('file'))
  @ApiBody({ type: LoginDtoReq })
  public async login(@Body() dto: LoginDtoReq, @Req() req: Request): Promise<LoginDtoRes> {
    return this.authenticationService.login({ ...dto, req });
  }

  @Get('logout')
  public async logout(request: string): Promise<string> {
    return this.authenticationService.logout(request);
  }

  @Get('refresh-token')
  public async refreshToken(request: string): Promise<string> {
    return this.authenticationService.refreshToken(request);
  }
}
