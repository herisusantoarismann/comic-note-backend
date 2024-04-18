import { Injectable, CanActivate, ExecutionContext } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';

@Injectable()
export class AuthGuard implements CanActivate {
  constructor(private jwtService: JwtService) {}

  canActivate(context: ExecutionContext): boolean {
    const request = context.switchToHttp().getRequest();
    const authorizationHeader = request.headers['authorization'];

    if (!authorizationHeader || !authorizationHeader.startsWith('Bearer ')) {
      return false;
    }

    const token = authorizationHeader.split(' ')[1];
    try {
      const decoded = this.jwtService.verify(token);
      request.user = decoded; // Optionally, you can set the user object in the request
      return true;
    } catch (error) {
      return false;
    }
  }
}
