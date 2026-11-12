import type { AuthUser } from '../types/auth-user';

export interface AuthenticatedRequest {
  headers: Record<string, string | string[] | undefined>;
  user?: AuthUser;
}
