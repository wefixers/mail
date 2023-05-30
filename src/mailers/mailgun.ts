import type { Transporter } from 'nodemailer'
import type { SentMessageInfo } from 'nodemailer/lib/smtp-transport'
import type { Options } from 'nodemailer-mailgun-transport'

import { createTransport } from 'nodemailer'
import mg from 'nodemailer-mailgun-transport'

export type MailgunTransporter = Transporter<SentMessageInfo>

export interface MailgunConfig extends Omit<Options, 'auth'> {
  /**
   * The secret access key.
   *
   * @example process.env.MAILGUN_SECRET
   */
  secret: string

  /**
   * The sending domain.
   *
   * @example process.env.MAILGUN_DOMAIN
   */
  domain?: string
}

/**
 * Create a a Mailgun transporter.
 *
 * #### Example:
 *
 * ```ts
 * import { mailgun } from '@fixers/mail/mailers/mailgun'
 *
 * const mailgunMailer = mailgun({
 *   domain: process.env.MAILGUN_DOMAIN,
 *   secret: process.env.MAILGUN_API_KEY
 * })
 * ```
 */
export function mailgun({ secret, domain, ...config }: MailgunConfig): MailgunTransporter {
  if (!secret) {
    // DEV: make sure your process.env.MAILGUN_DOMAIN is set
    throw new TypeError('Mailgun secret is required')
  }

  return createTransport(mg({
    auth: {
      domain,
      apiKey: secret,
    },
    ...config,
  }))
}
