import { Injectable } from '@nestjs/common';
import { AuthGuard } from '@nestjs/passport';

// Passport JWT guard that protects routes by validating the access token.
@Injectable()
export class JwtAurhGuard extends AuthGuard('jwt') {}
