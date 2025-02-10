import React, { useState, useEffect } from "react";
import { signup } from "./Signup.service";
import { SignupCredentials, ServerError } from "./Signup.types";
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
import { Mail, Lock, User } from "lucide-react";
import { Link, useNavigate } from "react-router-dom";
import { RateLimiter } from "../../utils/rateLimit";
import { useToast } from "@/hooks/use-toast";
import {
  validateEmail,
  validatePassword,
  validateName,
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
  const [errors, setErrors] = useState({
    email: "",
    password: "",
    name: "",
    server: "",
  });
  const [isLoading, setIsLoading] = useState(false);
  const [passwordStrength, setPasswordStrength] = useState({
    score: 0,
    feedback: "",
  });
  const { toast } = useToast();
  const navigate = useNavigate();

  // Announce errors to screen readers
  useEffect(() => {
    if (errors.server) {
      const announcement = document.getElementById("error-announcement");
      if (announcement) {
        announcement.textContent = errors.server;
      }
    }
  }, [errors.server]);

  const validateField = (name: string, value: string): string => {
    switch (name) {
      case "email":
        return validateEmail(value);
      case "password":
        return validatePassword(value);
      case "name":
        return validateName(value);
      default:
        return "";
    }
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setCredentials((prev) => ({ ...prev, [name]: value }));

    // Clear errors when user starts typing
    const fieldError = validateField(name, value);
    setErrors((prev) => ({
      ...prev,
      [name]: fieldError,
      server: "",
    }));

    // Update password strength when password changes
    if (name === "password") {
      const strength = value.length;
      setPasswordStrength({
        score: Math.min(Math.floor(strength / 2), 4),
        feedback:
          strength < 8 ? "Password is too weak" : "Password strength is good",
      });
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    // Check rate limit
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

    // Validate all fields
    const emailError = validateField("email", credentials.email);
    const passwordError = validateField("password", credentials.password);
    const nameError = validateField("name", credentials.name);

    if (emailError || passwordError || nameError) {
      setErrors({
        email: emailError,
        password: passwordError,
        name: nameError,
        server: "",
      });

      // Announce validation errors to screen readers
      const announcement = document.getElementById("error-announcement");
      if (announcement) {
        announcement.textContent =
          "Please correct the form errors before submitting.";
      }
      return;
    }

    setIsLoading(true);
    try {
      signupLimiter.increment();
      await signup(credentials);
      signupLimiter.reset();

      // Announce success to screen readers
      const announcement = document.getElementById("success-announcement");
      if (announcement) {
        announcement.textContent =
          "Account created successfully. Redirecting to login page.";
      }

      toast({
        title: "Success",
        description: "Account created successfully. Please sign in.",
        duration: 3000,
      });

      navigate("/auth/login");
    } catch (err) {
      const axioserr = err as AxiosError<ServerError>;
      const errorMessage =
        axioserr.response?.data.message || "An error occurred during sign up";
      setErrors((prev) => ({ ...prev, server: errorMessage }));
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <>
      <Helmet>
        <title>Create Account | Your App Name</title>
        <meta
          name="description"
          content="Create a new account to get started"
        />
        <meta name="robots" content="noindex, nofollow" />
        <link rel="canonical" href={window.location.href} />
      </Helmet>

      {/* Screen reader announcements */}
      <div
        className="sr-only"
        role="status"
        aria-live="polite"
        id="success-announcement"
      ></div>
      <div
        className="sr-only"
        role="alert"
        aria-live="assertive"
        id="error-announcement"
      ></div>

      <main className="flex-1 flex items-center justify-center bg-gray-50 px-4 sm:px-6 lg:px-8">
        <Card className="w-full max-w-md">
          <CardHeader className="space-y-1">
            <CardTitle className="text-2xl font-bold text-center">
              Create your account
            </CardTitle>
            <CardDescription className="text-center text-gray-500">
              Enter your details to create a new account
            </CardDescription>
          </CardHeader>
          <CardContent>
            <form
              onSubmit={handleSubmit}
              className="space-y-4"
              aria-label="Sign up form"
              noValidate
            >
              <div className="space-y-2">
                <Label htmlFor="name">
                  Name
                  <span aria-hidden="true" className="text-red-500">
                    *
                  </span>
                  <span className="sr-only">required</span>
                </Label>
                <div className="relative">
                  <User
                    className="absolute left-3 top-3 h-4 w-4 text-gray-400"
                    aria-hidden="true"
                  />
                  <Input
                    id="name"
                    name="name"
                    type="text"
                    autoComplete="name"
                    placeholder="Your name"
                    value={credentials.name}
                    onChange={handleChange}
                    className={`pl-10 ${errors.name ? "border-red-500" : ""}`}
                    aria-required="true"
                    aria-invalid={!!errors.name}
                    aria-describedby={errors.name ? "name-error" : undefined}
                    required
                  />
                  {errors.name && (
                    <p
                      id="name-error"
                      className="mt-1 text-xs text-red-500"
                      role="alert"
                    >
                      {errors.name}
                    </p>
                  )}
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="email">
                  Email address
                  <span aria-hidden="true" className="text-red-500">
                    *
                  </span>
                  <span className="sr-only">required</span>
                </Label>
                <div className="relative">
                  <Mail
                    className="absolute left-3 top-3 h-4 w-4 text-gray-400"
                    aria-hidden="true"
                  />
                  <Input
                    id="email"
                    name="email"
                    type="email"
                    autoComplete="email"
                    placeholder="name@example.com"
                    value={credentials.email}
                    onChange={handleChange}
                    className={`pl-10 ${errors.email ? "border-red-500" : ""}`}
                    aria-required="true"
                    aria-invalid={!!errors.email}
                    aria-describedby={errors.email ? "email-error" : undefined}
                    required
                  />
                  {errors.email && (
                    <p
                      id="email-error"
                      className="mt-1 text-xs text-red-500"
                      role="alert"
                    >
                      {errors.email}
                    </p>
                  )}
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="password">
                  Password
                  <span aria-hidden="true" className="text-red-500">
                    *
                  </span>
                  <span className="sr-only">required</span>
                </Label>
                <div className="relative">
                  <Lock
                    className="absolute left-3 top-3 h-4 w-4 text-gray-400"
                    aria-hidden="true"
                  />
                  <Input
                    id="password"
                    name="password"
                    type="password"
                    autoComplete="new-password"
                    placeholder="Create a password"
                    value={credentials.password}
                    onChange={handleChange}
                    className={`pl-10 ${
                      errors.password ? "border-red-500" : ""
                    }`}
                    aria-required="true"
                    aria-invalid={!!errors.password}
                    aria-describedby={
                      errors.password
                        ? "password-error password-strength"
                        : "password-strength"
                    }
                    required
                  />
                  {errors.password && (
                    <p
                      id="password-error"
                      className="mt-1 text-xs text-red-500"
                      role="alert"
                    >
                      {errors.password}
                    </p>
                  )}
                  <div
                    id="password-strength"
                    className="mt-2"
                    aria-live="polite"
                  >
                    <div className="flex gap-1">
                      {[...Array(4)].map((_, i) => (
                        <div
                          key={i}
                          className={`h-1 w-full rounded ${
                            i < passwordStrength.score
                              ? "bg-green-500"
                              : "bg-gray-200"
                          }`}
                          aria-hidden="true"
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
                <div
                  className="text-sm text-red-500 text-center p-2 bg-red-50 rounded"
                  role="alert"
                >
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
          </CardContent>

          <CardFooter className="flex flex-col space-y-4">
            <div className="text-sm text-center">
              <p className="font-medium text-black-500">
                Already have an account?
              </p>
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
