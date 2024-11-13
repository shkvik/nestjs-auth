import { Response } from 'express';

export function setCookieRefreshToken(res: Response, token: string): void {
  res.cookie("refreshToken", `Bearer ${token}`, {
    httpOnly: true,
    secure: true,
    maxAge: 24 * 60 * 60 * 1000,
    sameSite: 'strict',
  });
}

export function clearCookieRefreshToken(res: Response): void {
  res.clearCookie("refreshToken", {
    httpOnly: true,
    secure: true,
    sameSite: 'strict',
  });
}