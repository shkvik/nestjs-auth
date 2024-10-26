import { Request, Response } from 'express';

export interface ActivateAccountDtoReq {
  req: Request;
  res: Response;
  activationLink: string;
}

export type ActivateAccountDtoRes = void;
