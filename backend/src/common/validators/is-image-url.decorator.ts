import { registerDecorator, type ValidationOptions } from 'class-validator'

const LOCAL_IMAGE_PATH = /^\/images\/(?!\.{1,2}(?:\/|$))[A-Za-z0-9._-]+(?:\/(?!\.{1,2}(?:\/|$))[A-Za-z0-9._-]+)*$/

export function IsImageUrl(validationOptions?: ValidationOptions): PropertyDecorator {
  return (target, propertyKey) => {
    registerDecorator({
      name: 'isImageUrl',
      target: target.constructor,
      propertyName: propertyKey.toString(),
      options: validationOptions,
      validator: {
        validate(value: unknown): boolean {
          if (typeof value !== 'string' || /[\s\\]/.test(value)) return false

          if (LOCAL_IMAGE_PATH.test(value)) return true

          try {
            const url = new URL(value)
            return (
              (url.protocol === 'http:' || url.protocol === 'https:') &&
              url.hostname.length > 0 &&
              !url.username &&
              !url.password
            )
          } catch {
            return false
          }
        },
      },
    })
  }
}
