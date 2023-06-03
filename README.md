# Node mailer

[![npm version][npm-version-src]][npm-version-href]
[![npm downloads][npm-downloads-src]][npm-downloads-href]
[![License][license-src]][license-href]

A tiny wrapper around nodemailer, no dependencies!

_Who am I kiddin, nodemailer is the dependency!_

- [✨ &nbsp;Release Notes](/CHANGELOG.md)
- [Install](#install)
- [Usage](#usage)
  - [Configure using nodemailer](#configure-using-nodemailer)
  - [With custom mailers](#with-custom-mailers)
- [Caveats](#caveats)

## Install
```sh
pnpm i @fixers/mail
```

```sh
npm install @fixers/mail
```

## Usage

> Make sure to add any optional dependency!

```sh
pnpm add @aws-sdk/client-ses
pnpm add nodemailer-mailgun-transport
```

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

### Configure using nodemailer

If you prefer to configure nodemailer by yourself:

```ts
import { createMailer } from '@fixers/mail'
import { createTransport } from 'nodemailer'
import mg from 'nodemailer-mailgun-transport'

const mailer = createMailer({
  default: 'mailgun',
  mailers: {
    mailtrap: createTransport({
      host: process.env.MAIL_HOST,
      port: process.env.MAIL_PORT,
      auth: {
        user: process.env.MAIL_USERNAME,
        pass: process.env.MAIL_PASSWORD,
      },
    }),
    mailgun: createTransport(mg({
      auth: {
        domain: env.MAILGUN_DOMAIN,
        apiKey: env.MAILGUN_SECRET
      }
    }))
  }
})
```

### With custom mailers

You can also use any mailer-compatible type:

```sh
pnpm add @types/nodemailer -D
```

```ts
import { createMailer } from '@fixers/mail'
import type { SendMailOptions } from 'nodemailer'

const mailer = createMailer({
  default: 'custom',
  mailers: {
    custom: {
      async sendMail(mailOptions: SendMailOptions) {
        // send an email home!
      }
    },
    // it can be a factory also, promise or not is up to you
    customFactory: async () => {
      return {
        async sendMail(mailOptions: SendMailOptions) {
          // send an email home!
        }
      }
    }
  }
})
```

## Caveats

- The mailer `default` is mandatory even when only a single mailer is defined, this might change in future

- Typings are loose, you might need to install `@types/nodemailer` to get proper `sendMail` typings, this may change in future as this library could provide some minimal typings that matches nodemailer.

- `@aws-sdk/client-ses` and `nodemailer-mailgun-transport` are optional peer dependency, you need to install them separately.


<!-- Badges -->
[npm-version-src]: https://img.shields.io/npm/v/@fixers/mail/latest.svg?style=flat&colorA=18181B&colorB=28CF8D
[npm-version-href]: https://npmjs.com/package/@fixers/mail

[npm-downloads-src]: https://img.shields.io/npm/dm/@fixers/mail.svg?style=flat&colorA=18181B&colorB=28CF8D
[npm-downloads-href]: https://npmjs.com/package/@fixers/mail

[license-src]: https://img.shields.io/npm/l/@fixers/mail.svg?style=flat&colorA=18181B&colorB=28CF8D
[license-href]: https://npmjs.com/package/@fixers/mail
