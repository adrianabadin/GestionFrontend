export abstract class GoogleError extends Error {
  public text:string  
  constructor (public ErrorContent?: any, public message: string = 'Generic Google Error', public code: number = 2000) {
      super(message)
      this.name = 'Google Error'
      this.message = message
      this.text=message
      if (Error.captureStackTrace) {
        Error.captureStackTrace(this, GoogleError)
      }
    }
  }
