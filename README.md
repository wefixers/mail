# Node mailer

A tiny wrapper around nodemailer, no dependencies.

# Install
```sh
pnpm i @fixers/mail
```

```sh
npm install @fixers/mail
```

# Usage
```ts
import { createMailer } from '@fixers/mail'
import { mailgun } from '@fixers/mail/mailers/mailgun'
import { ses } from '@fixers/mail/mailers/ses'

const mailer = createMailer({
  default: 'mailgun',
  mailers: {
    mailgun: mailgun({
      domain: process.env.MAILGUN_DOMAIN,
      secret: process.env.MAILGUN_API_KEY
    }),
    ses: ses()
  }
})

// it uses 'mailgun', the default mailer
await mailer.sendMail({ })

// with 'ses'
await mailer.sendMailWith('ses', { })
```
