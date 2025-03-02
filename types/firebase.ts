import { ConfirmationResult, RecaptchaVerifier } from 'firebase/auth'

export interface FirebaseError {
  code: string
  message: string
}

export interface ReCaptchaResponse {
  response: string
  widgetId: string
}

declare global {
  interface Window {
    recaptchaVerifier?: RecaptchaVerifier
    recaptchaWidgetId?: number
    grecaptcha?: {
      reset: (widgetId: number) => void
    }
  }
} 