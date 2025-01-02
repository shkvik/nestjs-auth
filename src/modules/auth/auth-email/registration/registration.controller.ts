import { Body, Controller, HttpCode, Post, Res, UseInterceptors } from '@nestjs/common';
import { RegistrationService } from './registration.service';
import { ApiBody, ApiConsumes, ApiTags } from '@nestjs/swagger';
import { Response } from 'express';
import { FileInterceptor } from '@nestjs/platform-express';
import {
  ActivateDtoReq,
  ActivateDtoRes,
  CreateDtoReq,
  CreateDtoRes,
} from './dto';

@Controller('auth-email')
@ApiTags('Auth Email')
export class RegistrationController {
  constructor(private readonly registrationService: RegistrationService) {}

  @Post('create-account')
  @ApiConsumes('multipart/form-data')
  @ApiBody({ type: CreateDtoReq })
  @UseInterceptors(FileInterceptor('file'))
  public async createAccount(@Body() dto: CreateDtoReq): Promise<CreateDtoRes> {
    return this.registrationService.createAccount(dto);
  }

  @Post('activate-account')
  @ApiConsumes('multipart/form-data')
  @ApiBody({ type: ActivateDtoReq })
  @UseInterceptors(FileInterceptor('file'))
  @HttpCode(201)
  public async activateAccount(
    @Res({ passthrough: true }) res: Response,
    @Body() dto: ActivateDtoReq,
  ): Promise<ActivateDtoRes> {
    return this.registrationService.activateAccount(res, dto);
  }
}
