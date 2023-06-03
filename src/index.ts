import type { SendMailOptions } from 'nodemailer'

export type { SendMailOptions }

/**
 * Represents a generic mailer.
 */
export interface Mailer<T = any> {
  /**
   * Sends an email.
   */
  sendMail: (mail: SendMailOptions) => Promise<T>
}

/**
 * Represents a factory function that creates a {@link Mailer}.
 */
export type MailerFactory = () => (Promise<Mailer> | Mailer)

/**
 * Represents a collection of {@link Mailer} and their associated names.
 */
export type MailersConfig = Record<string, Mailer | MailerFactory>

/**
 * Represents a mailer provider, it holds a collection of mailers and provides access to a default configured mailer.
 */
export interface MailerProvider extends Mailer {
  /**
   * The default mailer to use.
   */
  default: string

  /**
   * Get a mailer. Subsequential calls return a cached value.
   *
   * @remarks It returns a promise as mailers are instantiated on-demand.
   */
  mailer: (mailer: string | null) => Promise<Mailer>

  // /**
  //  * Get a mailer driver, it always re-run the factory function, no caching is performed.
  //  *
  //  * @remarks It returns a promise as mailers are instantiated on-demand.
  //  */
  // driver: (mailer: TMailer) => Promise<MailerType<T[TMailer]>>

  /**
   * Sends an email with a specific mailer, use `null` if you want to use the default mailer.
   */
  sendMailWith: (mailer: string | null, mail: SendMailOptions) => Promise<any>
}

/**
 * Represent a set of options for a mailer provider.
 */
export interface MailerOptions {
  /**
   * The default mailer to use.
   */
  default: string

  /**
   * The mailers configuration options.
   */
  mailers: MailersConfig
}

/**
 * Create a new {@link Mailer} instance.
 *
 * #### Example:
 *
 * ```ts
 * import { createMailer } from '@fixers/mail'
 *
 * const mailer = createMailer({
 *   default: 'mailgun',
 *   mailers: {
 *     mailgun: mailgun({
 *       domain: process.env.MAILGUN_DOMAIN,
 *       secret: process.env.MAILGUN_API_KEY
 *     })
 *   }
 * })
 * ```
 */
export function createMailer(options: MailerOptions): MailerProvider {
  return new _MailerProvider(options)
}

/**
 * Creates a transport on-demand.
 */
async function factory(options: Mailer | MailerFactory): Promise<Mailer> {
  if (typeof options === 'function') {
    return await options()
  }

  return options
}

/**
 * An implementation of a mailer provider.
 *
 * ### Note for developers
 * - It does perform some manipulation on the `options` object unnecessarily.
 * - It may store mailers object **references** twice, one in `#config` and the other in `#mailers`.
 */
class _MailerProvider implements MailerProvider {
  /**
   * The default mailer key.
   */
  default: string

  /**
   * The mailers config, it contains either a factory or an instance.
   */
  #config: MailersConfig

  /**
   * The resolved mailers.
   */
  #mailers: Record<string, Mailer> = {}

  /**
   * Create a new {@link Mailer} instance.
   *
   * #### Note: do not use this class directly, prefer {@link createMailer} when possible.
   */
  constructor({ default: defaultMailer, mailers: { ...config } }: MailerOptions) {
    this.default = defaultMailer
    this.#config = config
  }

  mailer = async (mailer: string | null): Promise<Mailer> => {
    mailer = mailer === null ? this.default : mailer

    /**
     * The resolved mailer instance, if any.
     */
    const mailerInstance = this.#mailers[mailer]

    // There is a cached mailer instance, returns it
    if (mailerInstance) {
      return mailerInstance
    }

    /**
     * The mailer config, either a factory or an instance.
     */
    const config = this.#config[mailer]

    // Dev: make sure you are requesting a mailer that exists!
    if (!config) {
      throw new Error(`Mailer ${String(mailer)} is not configured.`)
    }

    // Creates and store a new driver
    return this.#mailers[mailer] = await factory(config)
  }

  sendMail = async (mail: SendMailOptions): Promise<any> => {
    /**
     * The resolved mailer instance.
     */
    const mailerInstance = await this.mailer(this.default)

    return await mailerInstance.sendMail(mail)
  }

  sendMailWith = async (mailer: string | null, mail: SendMailOptions): Promise<any> => {
    mailer = mailer === null ? this.default : mailer

    /**
     * The resolved mailer instance.
     */
    const mailerInstance = await this.mailer(mailer === null ? this.default : mailer)

    return await mailerInstance.sendMail(mail)
  }
}

// /**
//  * Represents a generic mailer error.
//  *
//  * This error can occur due to a misconfiguration or when an error is thrown by the underlying driver.
//  *
//  * In case of an underlying error, the original thrown error can be accessed via the `error.cause` property.
//  */
// export class MailerError extends Error { }
