import type { SendMailOptions } from 'nodemailer'

/**
 * Creates a transport on-demand.
 */
async function factory(options: Mailer | MailerFactory): Promise<Mailer> {
  if (typeof options === 'function') {
    return await options()
  }

  return options
}

export type { SendMailOptions }

/**
 * Represents a generic mailer.
 */
export interface Mailer<T = any> {
  /**
   * Sends an email.
   */
  sendMail: (mailOptions: SendMailOptions) => Promise<T>
}

type PromiseOr<T> = Promise<T> | T
type MailerFactory = () => PromiseOr<Mailer>
type MailersConfig = Record<string, Mailer | MailerFactory>
type MailerType<T> = T extends MailerFactory ? Awaited<ReturnType<T>> : T extends Mailer ? T : never
type MailerSentType<T> = T extends Mailer<infer U> ? U : never

/**
 * Represents a mailer provider, it holds a collection of mailers and provides access to a default configured mailer.
 */
export interface MailerProvider<T extends MailersConfig, TDefaultMailer extends keyof T> extends Mailer<MailerSentType<MailerType<T[TDefaultMailer]>>> {
  /**
   * The default mailer to use.
   */
  readonly default: TDefaultMailer

  /**
   * Get a mailer. Subsequential call return a cached value.
   *
   * @remarks It returns a promise as mailers are instantiated on-demand.
   */
  mailer: <TMailer extends keyof T>(mailer: TMailer) => Promise<MailerType<T[TMailer]>>

  // /**
  //  * Get a mailer driver, it always re-run the factory function, no caching is performed.
  //  *
  //  * @remarks It returns a promise as mailers are instantiated on-demand.
  //  */
  // driver: <TMailer extends keyof T>(mailer: TMailer) => Promise<MailerType<T[TMailer]>>

  /**
   * Sends an email with a specific mailer.
   */
  sendMailWith: <TMailer extends keyof T>(mailer: TMailer, mailOptions: SendMailOptions) => Promise<MailerSentType<MailerType<T[TMailer]>>>
}

/**
 * Represent a set of options for a mailer provider.
 */
export interface MailerOptions<T extends MailersConfig = MailersConfig> {
  /**
   * The default mailer to use.
   */
  default: keyof T

  /**
   * The mailers configuration options.
   */
  mailers: T
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
export function createMailer<const T extends MailerOptions>(options: T): MailerProvider<T['mailers'], T['default']> {
  return new _MailerProvider<T['mailers'], T['default']>(options)
}

/**
 * An implementation of a mailer provider.
 *
 * ### Note for developers
 * - This class uses `any` extensively.
 * - It does perform some manipulation on the `options` object unnecessarily.
 * - It does store mailers object **references** twice, one in `#config` and the other in `#mailers`.
 */
class _MailerProvider<T extends MailersConfig, TDefaultMailer extends keyof T> implements MailerProvider<T, TDefaultMailer> {
  /**
   * The default mailer key.
   */
  #default: PropertyKey

  /**
   * The mailers config, it contains either a factory or an instance.
   */
  #config: MailersConfig

  /**
   * The resolved mailers.
   */
  #mailers: Record<PropertyKey, Mailer> = {}

  /**
   * Create a new {@link Mailer} instance.
   *
   * #### Note: do not use this class directly, prefer {@link createMailer} when possible.
   */
  constructor({ default: defaultMailer, mailers: { ...config } }: MailerOptions<T>) {
    this.#default = defaultMailer
    this.#config = config
  }

  get default() {
    return this.#default as any
  }

  mailer = async (mailer: any): Promise<any> => {
    /**
     * The resolved mailer instance, if any.
     */
    const mailerInstance = this.#mailers[mailer]

    // There is a cached mailer instance, return it
    if (mailerInstance) {
      return mailerInstance
    }

    /**
     * The mailer config, either a factory or an instance.
     */
    const config = this.#config[mailer]

    // Dev: make sure you are requesting a maker that exists
    if (!config) {
      throw new TypeError(`Mailer ${String(mailer)} is not configured.`)
    }

    // Creates and store a new driver
    return this.#mailers[mailer] = await factory(config) as any
  }

  sendMail = async (mailOptions: any): Promise<any> => {
    /**
     * The resolved mailer instance.
     */
    const mailerInstance = await this.mailer(this.#default)

    return await mailerInstance.sendMail(mailOptions)
  }

  sendMailWith = async (mailer: any, mailOptions: any): Promise<any> => {
    /**
     * The resolved mailer instance.
     */
    const mailerInstance = await this.mailer(mailer)

    return await mailerInstance.sendMail(mailOptions)
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
