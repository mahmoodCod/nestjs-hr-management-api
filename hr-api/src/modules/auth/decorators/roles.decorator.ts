import { SetMetadata } from '@nestjs/common';

// Custom decorator to assign required roles metadata to route handlers for role-based access control.
export const ROLES_KEY = 'roles';
export const Roles = (...roles: string[]) => SetMetadata(ROLES_KEY, roles);
