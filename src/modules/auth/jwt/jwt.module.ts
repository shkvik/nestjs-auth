import { Module } from '@nestjs/common';
import { JwtService } from './jwt.service';
import { JwtTokensDBModule } from 'src/schema/jwt-tokens/jwt.tokens.module';

@Module({
  imports: [JwtTokensDBModule],
  providers: [JwtService],
  exports: [JwtService],
})
export class JwtModule {}
