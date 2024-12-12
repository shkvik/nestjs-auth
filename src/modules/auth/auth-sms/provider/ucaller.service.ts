import { Injectable } from '@nestjs/common';
import { post } from 'axios';
import { randomUUID } from 'crypto';
import { CONFIG_UCALLER } from './ucaller.config';
import {
  InitCallReqBody,
  InitCallReqDto,
  InitCallResBody,
} from './dto/init.dto';

@Injectable()
export class UcallerService {
  public async initCall(dto: InitCallReqDto): Promise<InitCallResBody> {
    const url = CONFIG_UCALLER.UCALLER_INIT_CALL_URL;
    const secretKey = CONFIG_UCALLER.UCALLER_SECRET_KEY;
    const serviceId = CONFIG_UCALLER.UCALLER_SERVICE_ID;

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
