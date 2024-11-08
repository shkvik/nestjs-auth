import { Request } from 'express';
import { JwtPayload, verify } from 'jsonwebtoken';
import {
  Injectable,
  CanActivate,
  ExecutionContext,
  UnauthorizedException
} from '@nestjs/common';

@Injectable()
export class BaseGuard implements CanActivate {

  constructor(private readonly jwtKey: string) { }

  public canActivate(context: ExecutionContext): boolean {
    const request: Request = context.switchToHttp().getRequest();
    request['jwt'] = this.getPayload(request.headers.authorization, this.jwtKey);
    return true;
  }

  protected getPayload(authorizationHeader: string, key: string): JwtPayload {
    if (!authorizationHeader) {
      throw new UnauthorizedException();
    }
    const accessToken = authorizationHeader.split(' ')[1];
    if (!accessToken) {
      throw new UnauthorizedException();
    }
    try {
      return verify(accessToken, key) as JwtPayload;
    } catch {
      throw new UnauthorizedException();
    }
  }
}