export interface SignupCredentials {
  email: string;
  password: string;
  name: string;
}

export interface ServerError {
  message: string;
}
export interface VerificationCredentials {
  email: string;
  otp: string;
}

export interface ServerResponse {
  message: string;
  email?: string;
}
