/* eslint-disable @typescript-eslint/no-unsafe-member-access */
/* eslint-disable @typescript-eslint/no-unsafe-argument */
/* eslint-disable @typescript-eslint/no-unsafe-assignment */
import { CanActivate, ExecutionContext, Injectable } from '@nestjs/common';
import { Reflector } from '@nestjs/core';
import { ROLES_KEY } from '../decorators/roles.decorator';

@Injectable()
export class RolesGuard implements CanActivate {
  constructor(private reflector: Reflector) {}

  // Guards routes by validating that the authenticated user's role matches the required roles metadata.
  canActivate(context: ExecutionContext): boolean {
    // get roles in metadata
    const requiredRoles = this.reflector.getAllAndOverride<string[]>(
      ROLES_KEY,
      [context.getClass(), context.getHandler()],
    );

    if (!requiredRoles) return true;

    // get user data from jwt token
    const { user } = context.switchToHttp().getRequest();

    return requiredRoles.includes(user.role);
  }
}
