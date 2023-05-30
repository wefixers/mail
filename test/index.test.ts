import { expect, it } from 'vitest'

import type { SendMailOptions } from '../src'

import { createMailer } from '../src'
import { mailgun } from '../src/mailers/mailgun'
import { ses } from '../src/mailers/ses'

const testEmail: SendMailOptions = {
  from: 'me@example.com',
  to: 'you@example.com',
  subject: 'Testing Mailer',
  text: 'Hello from the mock mailer!',
}

it('creates a mailer', async () => {
  const mailer = createMailer({
    default: 'mailgun',
    mailers: {
      test: () => {
        return {
          async sendMail(mailOptions) {
            return mailOptions
          },
        }
      },
      mailgun: () => mailgun({
        secret: '<secret>',
      }),
      ses: ses(),
    },
  })

  expect(mailer).not.toBeFalsy()
  expect(mailer.default).toBe('mailgun')

  expect(await mailer.mailer('test')).not.toBeFalsy()
  expect(await mailer.mailer('mailgun')).not.toBeFalsy()
  expect(await mailer.mailer('ses')).not.toBeFalsy()

  expect(await mailer.sendMailWith('test', testEmail)).toBe(testEmail)
})
