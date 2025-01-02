import {
  Body,
  Controller,
  Inject,
  Post,
  Res,
  UseInterceptors,
} from '@nestjs/common';
import { ApiConsumes, ApiTags } from '@nestjs/swagger';
import { FileInterceptor } from '@nestjs/platform-express';
import { Response } from 'express';
import { AuthenticationService } from './authentication.service';
import {
  ConfirmDtoReq,
  ConfirmDtoRes,
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
}
