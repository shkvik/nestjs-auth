import { Global, Module } from '@nestjs/common';
import { JwtService } from './jwt.service';
import { JwtTokensDBModule } from 'src/schema/jwt-tokens/jwt.tokens.module';

@Global()
@Module({
  imports: [JwtTokensDBModule],
  providers: [JwtService],
  exports: [JwtTokensDBModule,JwtService],
})
export class JwtModule {}
