import { Body, Controller, Get, Post, Query, Redirect, UseInterceptors } from '@nestjs/common';
import { RegistrationService } from './registration.service';
import { ApiBody, ApiConsumes, ApiTags } from '@nestjs/swagger';
import { FileInterceptor } from '@nestjs/platform-express';
import { 
  ActivateDtoReq, 
  ActivateDtoRes, 
  CreateDtoReq,
  CreateDtoRes
} from './dto';

@Controller('auth')
@ApiTags('Auth')
export class RegistrationController {
  constructor(private readonly registrationService: RegistrationService) {}

  @Post('create-account')
  @ApiConsumes('multipart/form-data')
  @ApiBody({ type: CreateDtoReq })
  @UseInterceptors(FileInterceptor('file'))
  public async createAccount(@Body() dto: CreateDtoReq): Promise<CreateDtoRes> {
    return this.registrationService.createAccount(dto);
  }

  @Get('activate-account')
  @Redirect()
  public async activateAccount(@Query() dto: ActivateDtoReq): Promise<ActivateDtoRes> {
    return { url: await this.registrationService.activateAccount(dto) };
  }
}