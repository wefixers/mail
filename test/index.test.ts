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

  expect(mailer).toBeTypeOf('object')

  expect(mailer).toHaveProperty('default')
  expect(mailer).toHaveProperty('sendMail')
  expect(mailer).toHaveProperty('sendMailWith')

  expect(mailer.default).toBeTypeOf('string')
  expect(mailer.sendMail).toBeTypeOf('function')
  expect(mailer.sendMailWith).toBeTypeOf('function')

  expect(mailer.default).toBe('mailgun')

  // test a send email with test
  expect(await mailer.sendMailWith('test', testEmail)).toBe(testEmail)
  expect(await mailer.mailer(null)).toBe(await mailer.mailer('mailgun'))

  for (const mailerKey of ['test', 'mailgun', 'ses']) {
    const resolvedMailer = await mailer.mailer(mailerKey)

    expect(resolvedMailer).toBeTypeOf('object')
    expect(resolvedMailer).toHaveProperty('sendMail')
    expect(resolvedMailer.sendMail).toBeTypeOf('function')
  }

  await expect(mailer.mailer('')).rejects.toBeInstanceOf(Error)

  // NOTE: the mailer is empty therefore it takes 2 whitespace ↓ this is not a typo!
  await expect(mailer.mailer('')).rejects.toThrowError('Mailer  is not configured.')

  await expect(mailer.mailer('<none>')).rejects.toBeInstanceOf(Error)
  await expect(mailer.mailer('<none>')).rejects.toThrowError('Mailer <none> is not configured.')
})
