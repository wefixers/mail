import type { Transporter } from 'nodemailer'
import type { SentMessageInfo } from 'nodemailer/lib/ses-transport'
import type { SESClientConfig } from '@aws-sdk/client-ses'

import { createTransport } from 'nodemailer'
import * as aws from '@aws-sdk/client-ses'

export type SESTransporter = Transporter<SentMessageInfo>

export interface SESConfig extends SESClientConfig {
}

/**
 * Create a AWS SES transporter.
 *
 * #### Example:
 *
 * ```ts
 * import { ses } from '@fixers/mail/mailers/mailgun'
 *
 * const sesMailer = ses({
 *   region: "REGION"
 * })
 * ```
 */
export function ses(config?: SESConfig): SESTransporter {
  const ses = new aws.SES({
    ...config,
  })

  return createTransport({
    SES: {
      ses,
      aws,
    },
  })
}
