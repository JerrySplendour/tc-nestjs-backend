import { CanActivate, ExecutionContext, Injectable, SetMetadata } from '@nestjs/common';
import { AuthGuard } from '@nestjs/passport';
import { Reflector } from '@nestjs/core';

export const Roles = (...roles: string[]) => SetMetadata('roles', roles);
@Injectable() export class JwtAuthGuard extends AuthGuard('jwt') {}
@Injectable() export class RolesGuard implements CanActivate {
  constructor(private readonly reflector: Reflector) {}
  canActivate(context: ExecutionContext) {
    const roles = this.reflector.getAllAndOverride<string[]>('roles', [context.getHandler(), context.getClass()]);
    return !roles || roles.includes(context.switchToHttp().getRequest().user?.role);
  }
}
