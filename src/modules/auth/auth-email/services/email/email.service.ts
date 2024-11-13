import { Injectable } from '@nestjs/common';
import { Transporter, createTransport } from 'nodemailer';
import SMTPTransport from 'nodemailer/lib/smtp-transport';
import { CONFIG_APP } from 'src/config/config.export';
import { MockMethod } from 'src/modules/auth/common/utilities/mock.decorator';

const tmp_email = 'tmp_email';
const tmp_password = 'tmp_password';

@Injectable()
export class EmailService {
  public readonly Transporter: Transporter<SMTPTransport.SentMessageInfo>;

  constructor() {
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

  @MockMethod({ condition: () => CONFIG_APP.NODE_ENV === 'local'})
  public async sendActivationMail(options: { to: string; link: string }): Promise<void> {
    await this.Transporter.sendMail({
      from: tmp_email,
      to: options.to,
      subject: 'Account activation link',
      html: `
			<div> 
				<h1>For activation go to link</h1>
				<a href="${options.link}">${options.link}</a>
			</div> 
			`,
    });
  }
  
  @MockMethod({ condition: () => CONFIG_APP.NODE_ENV === 'local'})
  public async sendRecoveryCode(options: { to: string; code: string }): Promise<void> {
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
