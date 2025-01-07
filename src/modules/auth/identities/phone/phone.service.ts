import { Injectable } from '@nestjs/common';
import { post } from 'axios';
import { randomUUID } from 'crypto';
import { CONFIG_SMS_PROVIDER } from './phone.config';
import { IdentityProvider, IdentitySendOptions } from '../identity.abstract';
import { IdentityType } from 'src/db/entities';
import {
  InitCallReqBody,
  InitCallReqDto,
  InitCallResBody,
} from './dto/init.dto';

@Injectable()
export class PhoneService extends IdentityProvider {
  public override readonly type = IdentityType.PHONE;

  public override async sendAuthCode(opts: IdentitySendOptions): Promise<void> {
    await this.initCall({
      phone: Number(opts.to),
      code: Number(opts.code),
      client: ''
    });
  }
  public override async sendRecoveryCode(opts: IdentitySendOptions): Promise<void> {
    await this.initCall({
      phone: Number(opts.to),
      code: Number(opts.code),
      client: ''
    });
  }
  private async initCall(dto: InitCallReqDto): Promise<InitCallResBody> {
    const url = CONFIG_SMS_PROVIDER.UCALLER_INIT_CALL_URL;
    const secretKey = CONFIG_SMS_PROVIDER.UCALLER_SECRET_KEY;
    const serviceId = CONFIG_SMS_PROVIDER.UCALLER_SERVICE_ID;

    const body: InitCallReqBody = {
      ...dto,
      unique: randomUUID(),
      voice: false,
    };
    const res = await post<InitCallResBody>(url, body, {
      headers: {
        Authorization: `Bearer ${secretKey}.${serviceId}`,
      },
    });
    return res.data as InitCallResBody;
  }
}
