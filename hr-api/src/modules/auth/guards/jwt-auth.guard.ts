import { ExecutionContext, Injectable } from '@nestjs/common';
import { Reflector } from '@nestjs/core';
import { AuthGuard } from '@nestjs/passport';
import { IS_PUBLIC_KEY } from '../decorators/public.decorator';
// Passport JWT guard that protects routes by validating the access token.
@Injectable()
export class JwtAurhGuard extends AuthGuard('jwt') {
  constructor(private reflector: Reflector) {
    super();
  }

  canActivate(context: ExecutionContext) {
    // Checking the public decorator
    const isPublic = this.reflector.getAllAndOverride<boolean>(IS_PUBLIC_KEY, [
      context.getHandler(),
      context.getClass(),
    ]);

    // If the root is public, we skip authentication
    if (isPublic) {
      return true;
    }

    // Otherwise, we run normal authentication
    return super.canActivate(context);
  }
}
