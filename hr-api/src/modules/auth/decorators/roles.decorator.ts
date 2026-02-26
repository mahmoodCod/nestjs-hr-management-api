import { SetMetadata } from '@nestjs/common';
import { Role } from '../../../shared/enums/user-role.enum';

// Custom decorator to assign required roles metadata to route handlers for role-based access control.
export const ROLES_KEY = 'roles';
export const Roles = (...roles: Role[]) => SetMetadata(ROLES_KEY, roles);
