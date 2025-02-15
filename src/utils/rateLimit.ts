import { store } from "../redux/persist/persist";
import { setRateLimit, resetRateLimit } from "../redux/slices/ratelimiterSlice";

interface RateLimitConfig {
  maxAttempts: number;
  windowMs: number;
}

interface RateLimitResult {
  allowed: boolean;
  remainingMs?: number;
  remainingAttempts?: number;
}

export class RateLimiter {
  private readonly key: string;
  private readonly config: RateLimitConfig;

  constructor(key: string, config: RateLimitConfig) {
    this.key = key;
    this.config = config;
  }

  private getState() {
    const state = store.getState().rateLimit[this.key];
    if (!state) return null;

    // Clean up expired window
    const now = Date.now();
    if (now - state.windowStart >= this.config.windowMs) {
      store.dispatch(resetRateLimit(this.key));
      return null;
    }

    return state;
  }

  canAttempt(): RateLimitResult {
    const state = this.getState();
    if (!state)
      return { allowed: true, remainingAttempts: this.config.maxAttempts };

    const now = Date.now();
    const timeElapsed = now - state.windowStart;

    if (timeElapsed >= this.config.windowMs) {
      store.dispatch(resetRateLimit(this.key));
      return { allowed: true, remainingAttempts: this.config.maxAttempts };
    }

    if (state.attempts >= this.config.maxAttempts) {
      return {
        allowed: false,
        remainingMs: this.config.windowMs - timeElapsed,
        remainingAttempts: 0,
      };
    }

    return {
      allowed: true,
      remainingMs: this.config.windowMs - timeElapsed,
      remainingAttempts: this.config.maxAttempts - state.attempts,
    };
  }

  increment(): void {
    const state = this.getState();
    const now = Date.now();

    if (!state) {
      store.dispatch(
        setRateLimit({
          key: this.key,
          attempts: 1,
          windowStart: now,
        })
      );
      return;
    }

    store.dispatch(
      setRateLimit({
        key: this.key,
        attempts: state.attempts + 1,
        windowStart: state.windowStart,
      })
    );
  }

  reset(): void {
    store.dispatch(resetRateLimit(this.key));
  }
}

const SIGNIN_RATE_LIMIT_CONFIG = {
  maxAttempts: 20,
  windowMs: 15 * 60 * 1000,
};

const SIGNUP_RATE_LIMIT_CONFIG = {
  maxAttempts: 15,
  windowMs: 30 * 60 * 1000,
};

export const signinLimiter = new RateLimiter(
  "signIn",
  SIGNIN_RATE_LIMIT_CONFIG
);
export const signupLimiter = new RateLimiter(
  "signUp",
  SIGNUP_RATE_LIMIT_CONFIG
);
