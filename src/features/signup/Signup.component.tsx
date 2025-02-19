import React, { useState, useEffect } from "react";
import { signup, verifyEmail, resendVerificationCode } from "./Signup.service";
import { SignupCredentials, VerificationCredentials } from "./Signup.types";
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
import { Mail, Lock, User, KeyRound } from "lucide-react";
import { Link, useNavigate } from "react-router-dom";
import { RateLimiter } from "../../utils/rateLimit";
import { useToast } from "@/hooks/use-toast";
import {
  validateEmail,
  validatePassword,
  validateName,
  validateOTP,
} from "../../utils/validationConstants";
import { AxiosError } from "axios";
import { Helmet } from "react-helmet-async";

const RATE_LIMIT_CONFIG = {
  maxAttempts: 5,
  windowMs: 15 * 60 * 1000,
};

const signupLimiter = new RateLimiter("authUp", RATE_LIMIT_CONFIG);

const Signup: React.FC = () => {
  const [credentials, setCredentials] = useState<SignupCredentials>({
    email: "",
    password: "",
    name: "",
  });
  const [verificationStep, setVerificationStep] = useState(false);
  const [otpInput, setOtpInput] = useState("");
  const [registeredEmail, setRegisteredEmail] = useState("");
  const [resendTimer, setResendTimer] = useState(0);
  const [errors, setErrors] = useState({
    email: "",
    password: "",
    name: "",
    otp: "",
    server: "",
  });
  const [isLoading, setIsLoading] = useState(false);
  const [passwordStrength, setPasswordStrength] = useState({
    score: 0,
    feedback: "",
  });
  const { toast } = useToast();
  const navigate = useNavigate();

  useEffect(() => {
    let timer: NodeJS.Timeout;
    if (resendTimer > 0) {
      timer = setInterval(() => {
        setResendTimer((prev) => prev - 1);
      }, 1000);
    }
    return () => clearInterval(timer);
  }, [resendTimer]);

  const handleResendCode = async () => {
    if (resendTimer > 0) return;

    try {
      await resendVerificationCode(registeredEmail);
      setResendTimer(60); // 60-second cooldown
      toast({
        title: "Verification Code Sent",
        description: "A new verification code has been sent to your email.",
        duration: 3000,
      });
    } catch (error) {
      const axiosError = error as AxiosError<{ message: string }>;
      toast({
        title: "Error",
        description:
          axiosError.response?.data.message || "Failed to resend code",
        variant: "destructive",
        duration: 3000,
      });
    }
  };

  const validateField = (name: string, value: string): string => {
    switch (name) {
      case "email":
        return validateEmail(value);
      case "password":
        return validatePassword(value);
      case "name":
        return validateName(value);
      case "otp":
        return validateOTP(value);
      default:
        return "";
    }
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;

    if (name === "otp") {
      setOtpInput(value);
      const otpError = validateField(name, value);
      setErrors((prev) => ({ ...prev, otp: otpError }));
    } else {
      setCredentials((prev) => ({ ...prev, [name]: value }));
      const fieldError = validateField(name, value);
      setErrors((prev) => ({
        ...prev,
        [name]: fieldError,
        server: "",
      }));

      if (name === "password") {
        const strength = value.length;
        setPasswordStrength({
          score: Math.min(Math.floor(strength / 2), 4),
          feedback:
            strength < 8 ? "Password is too weak" : "Password strength is good",
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
        email: registeredEmail,
        otp: otpInput,
      };

      await verifyEmail(verificationData);

      toast({
        title: "Success",
        description: "Email verified successfully. You can now sign in.",
        duration: 3000,
      });

      navigate("/auth/login");
    } catch (error) {
      const axiosError = error as AxiosError<{ message: string }>;
      setErrors((prev) => ({
        ...prev,
        server: axiosError.response?.data.message || "Verification failed",
      }));
    } finally {
      setIsLoading(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    const rateLimit = signupLimiter.canAttempt();
    if (!rateLimit.allowed) {
      const minutes = Math.ceil(rateLimit.remainingMs! / 60000);
      const errorMessage = `Too many signup attempts. Please try again in ${minutes} minutes`;

      toast({
        title: "Access Temporarily Blocked",
        description: errorMessage,
        variant: "destructive",
        duration: 3000,
      });

      setErrors((prev) => ({ ...prev, server: errorMessage }));
      return;
    }

    const emailError = validateField("email", credentials.email);
    const passwordError = validateField("password", credentials.password);
    const nameError = validateField("name", credentials.name);

    if (emailError || passwordError || nameError) {
      setErrors({
        ...errors,
        email: emailError,
        password: passwordError,
        name: nameError,
      });
      return;
    }

    setIsLoading(true);
    try {
      signupLimiter.increment();
      await signup(credentials);
      signupLimiter.reset();

      setRegisteredEmail(credentials.email);
      setVerificationStep(true);
      setResendTimer(60); // Initial 60-second cooldown for resend

      toast({
        title: "Account Created",
        description: "Please check your email for the verification code.",
        duration: 5000,
      });
    } catch (err) {
      const axiosErr = err as AxiosError<{ message: string }>;
      const errorMessage =
        axiosErr.response?.data.message || "An error occurred during sign up";
      setErrors((prev) => ({ ...prev, server: errorMessage }));
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <>
      <Helmet>
        <title>{verificationStep ? "Verify Email" : "Create Account"}</title>
        <meta
          name="description"
          content={
            verificationStep
              ? "Verify your email address"
              : "Create a new account to get started"
          }
        />
        <meta name="robots" content="noindex, nofollow" />
        <link rel="canonical" href={window.location.href} />
      </Helmet>

      <main className="flex-1 flex items-center justify-center bg-gray-50 px-4 sm:px-6 lg:px-8">
        <Card className="w-full max-w-md">
          <CardHeader className="space-y-1">
            <CardTitle className="text-2xl font-bold text-center">
              {verificationStep ? "Verify Your Email" : "Create your account"}
            </CardTitle>
            <CardDescription className="text-center text-gray-500">
              {verificationStep
                ? "Enter the verification code sent to your email"
                : "Enter your details to create a new account"}
            </CardDescription>
          </CardHeader>

          <CardContent>
            {verificationStep ? (
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
                      onChange={handleChange}
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
                  {isLoading ? "Verifying..." : "Verify email"}
                </Button>
              </form>
            ) : (
              <form onSubmit={handleSubmit} className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="name">Name</Label>
                  <div className="relative">
                    <User
                      className="absolute left-3 top-3 h-4 w-4 text-gray-400"
                      aria-hidden="true"
                    />
                    <Input
                      id="name"
                      name="name"
                      type="text"
                      placeholder="Username"
                      value={credentials.name}
                      onChange={handleChange}
                      className={`pl-10 ${errors.name ? "border-red-500" : ""}`}
                    />
                    {errors.name && (
                      <p className="mt-1 text-xs text-red-500">{errors.name}</p>
                    )}
                  </div>
                </div>

                <div className="space-y-2">
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
                      value={credentials.email}
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

                <div className="space-y-2">
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
                      value={credentials.password}
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
                    <div className="mt-2">
                      <div className="flex gap-1">
                        {[...Array(4)].map((_, i) => (
                          <div
                            key={i}
                            className={`h-1 w-full rounded ${
                              i < passwordStrength.score
                                ? "bg-green-500"
                                : "bg-gray-200"
                            }`}
                          />
                        ))}
                      </div>
                      <p className="text-xs mt-1 text-gray-600">
                        {passwordStrength.feedback}
                      </p>
                    </div>
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
                  disabled={isLoading}
                  aria-disabled={isLoading}
                >
                  {isLoading ? (
                    <>
                      <span className="sr-only">
                        Creating account, please wait...
                      </span>
                      <span aria-hidden="true">Creating account...</span>
                    </>
                  ) : (
                    "Create account"
                  )}
                </Button>
              </form>
            )}
          </CardContent>

          <CardFooter className="flex flex-col space-y-4">
            <div className="text-sm text-center">
              <span>Already have an account? </span>
              <Link
                to="/auth/login"
                className="font-medium text-primary hover:text-primary/90 focus:outline-none focus:underline"
              >
                Sign in instead
              </Link>
            </div>
          </CardFooter>
        </Card>
      </main>
    </>
  );
};

export default Signup;
