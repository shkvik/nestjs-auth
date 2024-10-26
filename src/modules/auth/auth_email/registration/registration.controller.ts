import { Body, Controller, Get, Post, Query, Req, Res, UseInterceptors } from '@nestjs/common';
import { RegistrationService } from './registration.service';
import { ApiBody, ApiConsumes, ApiTags } from '@nestjs/swagger';
import { FileInterceptor } from '@nestjs/platform-express';
import { ActivateAccountDtoRes, CreateAccountDtoReq, CreateAccountDtoRes } from './dto';
import { Request, Response } from 'express';

@Controller('auth')
@ApiTags('Auth')
export class RegistrationController {
  constructor(private readonly registrationService: RegistrationService) {}

  @Post('create-account')
  @ApiConsumes('multipart/form-data')
  @ApiBody({ type: CreateAccountDtoReq })
  @UseInterceptors(FileInterceptor('file'))
  public async createAccount(@Body() dto: CreateAccountDtoReq): Promise<CreateAccountDtoRes> {
    return this.registrationService.createAccount(dto);
  }

  @Get('activate-account')
  public async activateAccount(
    @Req() req: Request,
    @Res() res: Response,
    @Query('activation_link') activationLink: string,
  ): Promise<ActivateAccountDtoRes> {
    const url = await this.registrationService.activateAccount({
      req,
      res,
      activationLink,
    });
    res.redirect(url);
  }
}
