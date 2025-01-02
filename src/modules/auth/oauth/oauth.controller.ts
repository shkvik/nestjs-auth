import { Controller, Get } from '@nestjs/common';
import { ApiTags } from '@nestjs/swagger';

@Controller('oauth')
@ApiTags('OAuth 2.0.')
export class OAuthController {
  @Get('google')
  public async googleLogin(): Promise<void> {}

  @Get('facebook')
  public async facebookLogin(): Promise<void> {}

  @Get('apple')
  public async appleLogin(): Promise<void> {}
}
