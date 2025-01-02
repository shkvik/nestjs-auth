import { Injectable } from '@nestjs/common';
import { post } from 'axios';
import { randomUUID } from 'crypto';
import { CONFIG_SMS_PROVIDER } from './phone.config';
import {
  InitCallReqBody,
  InitCallReqDto,
  InitCallResBody,
} from './dto/init.dto';

@Injectable()
export class PhoneService {
  public async initCall(dto: InitCallReqDto): Promise<InitCallResBody> {
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
