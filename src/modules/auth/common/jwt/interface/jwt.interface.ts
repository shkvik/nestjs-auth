export interface JwtAuthPayload {
  userId: number;
  ip: string;
  browser: string;
  platform: string;
  os: string;
  device?: string;
}

export interface JwtPair {
  accessToken: string;
  refreshToken: string;
}
