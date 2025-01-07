import { IdentityType } from "src/db/entities";

export interface IdentitySendOptions {
  to: string;
  code: string;
} 

export abstract class IdentityProvider {
  abstract type: IdentityType;
  abstract sendAuthCode(opts: IdentitySendOptions): Promise<void> | void;
  abstract sendRecoveryCode(opts: IdentitySendOptions): Promise<void> | void;
}