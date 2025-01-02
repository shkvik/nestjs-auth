import { Body, Controller, Inject, Post, Res, UseInterceptors } from '@nestjs/common';
import { RegistrationService } from './registration.service';
import { ApiBody, ApiConsumes, ApiTags } from '@nestjs/swagger';
import { Response } from 'express';
import { FileInterceptor } from '@nestjs/platform-express';
import {
  CreateAccountDtoReq, 
  CreateAccountDtoRes,
  ActivateAccountDtoReq, 
  ActivateAccountDtoRes, 
} from './dto';

@Controller('auth')
@ApiTags('Auth')
export class RegistrationController {

  @Inject()
  private readonly registrationService: RegistrationService;

  @Post('create-account')
  @ApiConsumes('multipart/form-data')
  @ApiBody({ type: CreateAccountDtoReq })
  @UseInterceptors(FileInterceptor('file'))
  public async createAccount(@Body() dto: CreateAccountDtoReq): Promise<CreateAccountDtoRes> {
    return this.registrationService.createAccount(dto);
  }

  @Post('activate-account')
  @ApiConsumes('multipart/form-data')
  @ApiBody({ type: ActivateAccountDtoReq })
  @UseInterceptors(FileInterceptor('file'))
  public async activateAccount(
    @Res({ passthrough: true }) res: Response,
    @Body() dto: ActivateAccountDtoReq,
  ): Promise<ActivateAccountDtoRes> {
    return this.registrationService.activateAccount(res, dto);
  }
}
