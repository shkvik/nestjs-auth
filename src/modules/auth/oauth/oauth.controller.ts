import { Controller, Get } from '@nestjs/common';
import { ApiTags } from '@nestjs/swagger';

@Controller('oauth')
@ApiTags('OAuth 2.0.')
export class OAuthController {

  @Get('google')
  public async googleLogin() {

  }

  @Get('facebook')
  public async facebookLogin() {

  }

  @Get('apple')
  public async appleLogin() {

  }
}
