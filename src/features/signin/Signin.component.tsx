import React, { useState, useEffect } from "react";
import { login, requestPasswordReset } from "./Signin.service";
import { LoginCredentials, UserResponse } from "./Signin.types";
import {
  Card,
  CardHeader,
  CardTitle,
  CardDescription,
  CardContent,
  CardFooter,
} from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Mail, Lock, KeyRound } from "lucide-react";
import { useNavigate, Link } from "react-router-dom";
import { useDispatch } from "react-redux";
import { setCredentials } from "../../redux/slices/authSlices";
import { setUserData } from "../../redux/slices/userSlice";
import { RateLimiter } from "../../utils/rateLimit";
import { useToast } from "@/hooks/use-toast";
import {
  validateEmail,
  validateOTP,
  validatePassword,
} from "../../utils/validationConstants";
import { Helmet } from "react-helmet-async";
import axios from "axios";
import { resendVerificationCode, verifyEmail } from "../signup/Signup.service";
import { VerificationCredentials } from "../signup/Signup.types";
import { LoadingSpinner } from "@/components/common/loading spinner/LoadingSpinner.component";

const RATE_LIMIT_CONFIG = {
  maxAttempts: 20,
  windowMs: 15 * 60 * 1000,
};

const signinLimiter = new RateLimiter("authIn", RATE_LIMIT_CONFIG);

const Signin = () => {
  // Signin states
  const [userInput, setUserInput] = useState<LoginCredentials>({
    email: "",
    password: "",
  });
  const [errors, setErrors] = useState({
    email: "",
    password: "",
    server: "",
    otp: "",
  });
  const [isLoading, setIsLoading] = useState(false);
  const [unverifiedEmail, setUnverifiedEmail] = useState<string | null>(null);
  // Add these with other state declarations
  const [verificationStep, setVerificationStep] = useState(false);
  const [otpInput, setOtpInput] = useState("");
  // Forgot password states
  const [forgotPasswordStep, setForgotPasswordStep] = useState(false);
  const [forgotPasswordEmail, setForgotPasswordEmail] = useState("");
  const [forgotPasswordLoading, setForgotPasswordLoading] = useState(false);
  const [resendTimer, setResendTimer] = useState(0);

  const { toast } = useToast();
  const navigate = useNavigate();
  const dispatch = useDispatch();

  // Timer effect for forgot password cooldown
  useEffect(() => {
    let timer: NodeJS.Timeout;
    if (resendTimer > 0) {
      timer = setInterval(() => {
        setResendTimer((prev) => prev - 1);
      }, 1000);
    }
    return () => clearInterval(timer);
  }, [resendTimer]);

  const validateField = (name: string, value: string): string => {
    switch (name) {
      case "email":
        return validateEmail(value);
      case "password":
        return validatePassword(value);
      case "otp":
        return validateOTP(value);
      default:
        return "";
    }
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setUserInput((prev) => ({ ...prev, [name]: value }));
    setUnverifiedEmail(null);

    const fieldError = validateField(name, value);
    setErrors((prev) => ({
      ...prev,
      [name]: fieldError,
      server: fieldError ? "" : prev.server,
    }));
  };

  const handleResendCode = async () => {
    if (resendTimer > 0 || !unverifiedEmail) return;

    try {
      await resendVerificationCode(unverifiedEmail);
      setResendTimer(60); // 60-second cooldown
      toast({
        title: "Verification Code Sent",
        description: "A new verification code has been sent to your email.",
        duration: 3000,
      });
    } catch (error) {
      if (axios.isAxiosError(error)) {
        const errorMessage =
          error.response?.data?.message || "Failed to resend code";
        toast({
          title: "Error",
          description: errorMessage,
          variant: "destructive",
          duration: 3000,
        });
      }
    }
  };
  const handleVerificationSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    const otpError = validateField("otp", otpInput);
    if (otpError) {
      setErrors((prev) => ({ ...prev, otp: otpError }));
      return;
    }

    setIsLoading(true);
    try {
      const verificationData: VerificationCredentials = {
        email: unverifiedEmail!,
        otp: otpInput,
      };

      await verifyEmail(verificationData);

      // After successful verification, try to login again
      const response = await login(userInput);
      handleLoginSuccess(response.data);
    } catch (error) {
      if (axios.isAxiosError(error)) {
        const errorMessage =
          error.response?.data?.message || "Verification failed";
        setErrors((prev) => ({ ...prev, server: errorMessage }));
        toast({
          title: "Error",
          description: errorMessage,
          variant: "destructive",
          duration: 3000,
        });
      }
    } finally {
      setIsLoading(false);
    }
  };
  const handleForgotPassword = async (e: React.FormEvent) => {
    e.preventDefault();

    const emailError = validateField("email", forgotPasswordEmail);
    if (emailError) {
      setErrors((prev) => ({ ...prev, email: emailError }));
      return;
    }

    setForgotPasswordLoading(true);
    try {
      await requestPasswordReset({ email: forgotPasswordEmail });
      setResendTimer(60); // Start 60-second cooldown

      toast({
        title: "Reset Code Sent",
        description: "Please check your email for the password reset code.",
        duration: 5000,
      });

      // Navigate to reset password page
      navigate("/auth/reset-password", {
        state: { email: forgotPasswordEmail },
        replace: true,
      });
    } catch (error) {
      if (axios.isAxiosError(error)) {
        const errorMessage =
          error.response?.data?.message || "Failed to send reset code";
        setErrors((prev) => ({ ...prev, server: errorMessage }));
        toast({
          title: "Error",
          description: errorMessage,
          variant: "destructive",
          duration: 3000,
        });
      }
    } finally {
      setForgotPasswordLoading(false);
    }
  };

  const handleLoginSuccess = (responseData: UserResponse["data"]) => {
    if (!responseData.isEmailVerified) {
      setUnverifiedEmail(responseData.email);
      setVerificationStep(true);
      setResendTimer(60);
      toast({
        title: "Verification Required",
        description: "Please verify your email to continue.",
        duration: 2000,
        variant: "destructive",
      });
      return;
    }

    dispatch(
      setCredentials({
        accessToken: responseData.accessToken,
        id: responseData.id,
        _initialized: true,
      })
    );
    dispatch(
      setUserData({
        username: responseData.name,
        email: responseData.email,
        role: responseData.role,
      })
    );

    signinLimiter.reset();
    const navigation =
      responseData.role === "ADMIN"
        ? "/dashboard/admin/users"
        : "/dashboard/todo";

    toast({
      title: "Welcome back!",
      description: "Successfully signed in.",
      duration: 3000,
    });

    navigate(navigation);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    const rateLimit = signinLimiter.canAttempt();
    if (!rateLimit.allowed) {
      const minutes = Math.ceil(rateLimit.remainingMs! / 60000);
      const errorMessage = `Too many login attempts. Please try again in ${minutes} minutes`;
      toast({
        title: "Access Temporarily Blocked",
        description: errorMessage,
        variant: "destructive",
        duration: 3000,
      });
      setErrors((prev) => ({ ...prev, server: errorMessage }));
      return;
    }

    const emailError = validateField("email", userInput.email);
    const passwordError = validateField("password", userInput.password);

    if (emailError || passwordError) {
      setErrors({ ...errors, email: emailError, password: passwordError });
      return;
    }

    setIsLoading(true);
    try {
      const response = await login(userInput);
      handleLoginSuccess(response.data);
    } catch (error) {
      signinLimiter.increment();
      if (axios.isAxiosError(error)) {
        const errorMessage =
          error.response?.data?.message || "An error occurred";
        setErrors((prev) => ({ ...prev, server: errorMessage }));
        toast({
          title: "Error",
          description: errorMessage,
          variant: "destructive",
          duration: 3000,
        });
      }
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <>
      <Helmet>
        <title>
          {forgotPasswordStep ? "Reset Password" : "Sign In"} | Your App Name
        </title>
        <meta
          name="description"
          content={
            forgotPasswordStep
              ? "Reset your password to regain access to your account"
              : "Sign in to access your account and manage your tasks"
          }
        />
        <meta name="robots" content="noindex, nofollow" />
        <link rel="canonical" href={window.location.href} />
      </Helmet>

      <main className="flex-1 flex items-center justify-center bg-gray-50 px-4 sm:px-6 lg:px-8">
        <Card className="w-full max-w-md">
          <CardHeader className="space-y-1">
            <CardTitle className="text-2xl font-bold text-center">
              {forgotPasswordStep
                ? "Reset your password"
                : "Sign in to your account"}
            </CardTitle>
            <CardDescription className="text-center text-gray-500">
              {forgotPasswordStep
                ? "Enter your email to receive a password reset code"
                : "Enter your credentials to access your account"}
            </CardDescription>
          </CardHeader>

          <CardContent>
            {forgotPasswordStep ? (
              <form onSubmit={handleForgotPassword} className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="forgotPasswordEmail">Email address</Label>
                  <div className="relative">
                    <Mail
                      className="absolute left-3 top-3 h-4 w-4 text-gray-400"
                      aria-hidden="true"
                    />
                    <Input
                      id="forgotPasswordEmail"
                      name="email"
                      type="email"
                      placeholder="Enter your email"
                      value={forgotPasswordEmail}
                      onChange={(e) => {
                        setForgotPasswordEmail(e.target.value);
                        const fieldError = validateField(
                          "email",
                          e.target.value
                        );
                        setErrors((prev) => ({ ...prev, email: fieldError }));
                      }}
                      className={`pl-10 ${
                        errors.email ? "border-red-500" : ""
                      }`}
                    />
                    {errors.email && (
                      <p className="mt-1 text-xs text-red-500">
                        {errors.email}
                      </p>
                    )}
                  </div>
                </div>

                {errors.server && (
                  <div className="text-sm text-red-500 text-center p-2 bg-red-50 rounded">
                    {errors.server}
                  </div>
                )}

                <Button
                  type="submit"
                  className="w-full"
                  disabled={forgotPasswordLoading || resendTimer > 0}
                >
                  {forgotPasswordLoading
                    ? "Sending..."
                    : resendTimer > 0
                    ? `Try again in ${resendTimer}s`
                    : "Send Reset Code"}
                </Button>

                <div className="text-center">
                  <Button
                    type="button"
                    variant="link"
                    className="text-sm"
                    onClick={() => {
                      setForgotPasswordStep(false);
                      setErrors({
                        email: "",
                        password: "",
                        server: "",
                        otp: "",
                      });
                    }}
                  >
                    Back to Sign in
                  </Button>
                </div>
              </form>
            ) : verificationStep ? (
              <form onSubmit={handleVerificationSubmit} className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="otp">Verification Code</Label>
                  <div className="relative">
                    <KeyRound
                      className="absolute left-3 top-3 h-4 w-4 text-gray-400"
                      aria-hidden="true"
                    />
                    <Input
                      id="otp"
                      name="otp"
                      type="text"
                      maxLength={6}
                      placeholder="Enter 6-digit code"
                      value={otpInput}
                      onChange={(e) => {
                        setOtpInput(e.target.value);
                        const otpError = validateField("otp", e.target.value);
                        setErrors((prev) => ({ ...prev, otp: otpError }));
                      }}
                      className={`pl-10 ${errors.otp ? "border-red-500" : ""}`}
                      aria-invalid={!!errors.otp}
                    />
                    {errors.otp && (
                      <p className="mt-1 text-xs text-red-500">{errors.otp}</p>
                    )}
                  </div>
                </div>

                <div className="text-center">
                  <Button
                    type="button"
                    variant="link"
                    onClick={handleResendCode}
                    disabled={resendTimer > 0}
                    className="text-sm"
                  >
                    {resendTimer > 0
                      ? `Resend code in ${resendTimer}s`
                      : "Resend verification code"}
                  </Button>
                </div>

                {errors.server && (
                  <div className="text-sm text-red-500 text-center p-2 bg-red-50 rounded">
                    {errors.server}
                  </div>
                )}

                <Button type="submit" className="w-full" disabled={isLoading}>
                  {isLoading ? (
                    <LoadingSpinner size="lg" label="Verifying..." />
                  ) : (
                    "Verify Email"
                  )}
                </Button>

                <div className="text-center">
                  <Button
                    type="button"
                    variant="link"
                    className="text-sm"
                    onClick={() => {
                      setVerificationStep(false);
                      setErrors({
                        email: "",
                        password: "",
                        server: "",
                        otp: "",
                      });
                    }}
                  >
                    Back to Sign in
                  </Button>
                </div>
              </form>
            ) : (
              <form onSubmit={handleSubmit} className="space-y-4">
                <div className="space-y-1">
                  <Label htmlFor="email">Email address</Label>
                  <div className="relative">
                    <Mail
                      className="absolute left-3 top-3 h-4 w-4 text-gray-400"
                      aria-hidden="true"
                    />
                    <Input
                      id="email"
                      name="email"
                      type="email"
                      placeholder="Email"
                      autoComplete="email"
                      value={userInput.email}
                      onChange={handleChange}
                      className={`pl-10 ${
                        errors.email ? "border-red-500" : ""
                      }`}
                    />
                    {errors.email && (
                      <p className="mt-1 text-xs text-red-500">
                        {errors.email}
                      </p>
                    )}
                  </div>
                </div>

                <div className="space-y-1">
                  <Label htmlFor="password">Password</Label>
                  <div className="relative">
                    <Lock
                      className="absolute left-3 top-3 h-4 w-4 text-gray-400"
                      aria-hidden="true"
                    />
                    <Input
                      id="password"
                      name="password"
                      type="password"
                      placeholder="Password"
                      autoComplete="current-password"
                      value={userInput.password}
                      onChange={handleChange}
                      className={`pl-10 ${
                        errors.password ? "border-red-500" : ""
                      }`}
                    />
                    {errors.password && (
                      <p className="mt-1 text-xs text-red-500">
                        {errors.password}
                      </p>
                    )}
                  </div>
                </div>

                {errors.server && (
                  <div className="text-sm text-red-500 text-center p-2 bg-red-50 rounded">
                    {errors.server}
                  </div>
                )}

                <Button type="submit" className="w-full" disabled={isLoading}>
                  {isLoading ? "Signing in..." : "Sign in"}
                </Button>

                <div className="text-center">
                  <Button
                    type="button"
                    variant="link"
                    className="text-sm text-primary hover:text-primary/90"
                    onClick={() => {
                      setForgotPasswordStep(true);
                      setErrors({
                        email: "",
                        password: "",
                        server: "",
                        otp: "",
                      });
                    }}
                  >
                    Forgot your password?
                  </Button>
                </div>
              </form>
            )}
          </CardContent>

          <CardFooter className="flex flex-col space-y-4">
            <div className="text-sm text-center">
              <span>Don't have an account? </span>
              <Link
                to="/auth/signup"
                className="font-medium text-primary hover:text-primary/90"
              >
                Create an account
              </Link>
            </div>
          </CardFooter>
        </Card>
      </main>
    </>
  );
};

export default Signin;
