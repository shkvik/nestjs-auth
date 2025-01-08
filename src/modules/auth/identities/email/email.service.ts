import { Injectable } from '@nestjs/common';
import { Transporter, createTransport } from 'nodemailer';
import SMTPTransport from 'nodemailer/lib/smtp-transport';
import { CONFIG_APP } from 'src/config/config.export';
import { MockMethod } from 'src/modules/auth/utilities/mock.decorator';
import { IdentityProvider } from '../identity.abstract';
import { IdentityType } from 'src/db/entities';

const tmp_email = 'tmp_email';
const tmp_password = 'tmp_password';

@Injectable()
export class EmailService extends IdentityProvider {
  public override readonly type = IdentityType.EMAIL;
  
  public readonly Transporter: Transporter<SMTPTransport.SentMessageInfo>;

  constructor() {
    super();
    this.Transporter = createTransport({
      service: 'gmail',
      host: 'smtp.gmail.com',
      port: 587,
      secure: false,
      auth: {
        user: tmp_email,
        pass: tmp_password,
      },
    });
  }

  @MockMethod({ condition: () => CONFIG_APP.NODE_ENV === 'local' })
  public async sendAuthCode(options: {
    to: string;
    code: string;
  }): Promise<void> {
    await this.Transporter.sendMail({
      from: tmp_email,
      to: options.to,
      subject: 'Account activation code',
      html: `
			<div> 
				<h1>Your activation code</h1>
				<a href="${options.code}">${options.code}</a>
			</div> 
			`,
    });
  }

  @MockMethod({ condition: () => CONFIG_APP.NODE_ENV === 'local' })
  public async sendRecoveryCode(options: {
    to: string;
    code: string;
  }): Promise<void> {
    await this.Transporter.sendMail({
      from: tmp_email,
      to: options.to,
      subject: 'Recovery password code',
      html: `
			<div> 
				<h1>${options.code}</h1>
			</div> 
			`,
    });
  }
}
