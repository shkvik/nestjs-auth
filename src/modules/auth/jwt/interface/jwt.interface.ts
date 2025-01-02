export interface JwtAuthPayload {
  userId: number;
  sessionId: string;
}

export interface JwtPair {
  accessToken: string;
  refreshToken: string;
}
