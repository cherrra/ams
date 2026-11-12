export interface AuthUser {
  id: number;
  email: string;
  isAdmin: boolean;
}

export interface JwtPayload {
  sub: number;
  email: string;
  isAdmin: boolean;
}
