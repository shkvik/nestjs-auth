import {
  Body,
  Controller,
  Inject,
  Post,
  Res,
  UseInterceptors,
} from '@nestjs/common';
import { AuthenticationService } from './authentication.service';
import { ApiBody, ApiConsumes, ApiTags } from '@nestjs/swagger';
import { FileInterceptor } from '@nestjs/platform-express';
import { LoginDtoReq, LoginDtoRes } from './dto/login.dto';
import { Response } from 'express';


@Controller('auth-email')
@ApiTags('Auth Email')
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
}
