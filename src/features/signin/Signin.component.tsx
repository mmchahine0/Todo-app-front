import React, { useState, useEffect } from "react";
import { login } from "./Signin.service";
import { LoginCredentials } from "./Signin.types";
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
import { Mail, Lock } from "lucide-react";
import { useNavigate, Link } from "react-router-dom";
import { useDispatch } from "react-redux";
import { setCredentials } from "../../redux/slices/authSlices";
import { setUserData } from "../../redux/slices/userSlice";
import { RateLimiter } from "../../utils/rateLimit";
import { useToast } from "@/hooks/use-toast";
import {
  validateEmail,
  validatePassword,
} from "../../utils/validationConstants";
import { Helmet } from "react-helmet-async";
import axios from "axios";

const RATE_LIMIT_CONFIG = {
  maxAttempts: 5,
  windowMs: 15 * 60 * 1000,
};
const signinLimiter = new RateLimiter("authIn", RATE_LIMIT_CONFIG);

const Signin = () => {
  const [userInput, setUserInput] = useState<LoginCredentials>({
    email: "",
    password: "",
  });
  const [errors, setErrors] = useState({
    email: "",
    password: "",
    server: "",
  });
  const [isLoading, setIsLoading] = useState(false);
  const { toast } = useToast();
  const [attemptCount, setAttemptCount] = useState(0);

  const navigate = useNavigate();
  const dispatch = useDispatch();

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
      default:
        return "";
    }
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setUserInput((prev) => ({ ...prev, [name]: value }));

    // Clear errors when user starts typing
    const fieldError = validateField(name, value);
    setErrors((prev) => ({
      ...prev,
      [name]: fieldError,
      server: fieldError ? "" : prev.server,
    }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    // Rate limiting check
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

    // Validate all fields
    const emailError = validateField("email", userInput.email);
    const passwordError = validateField("password", userInput.password);

    if (emailError || passwordError) {
      setErrors({ email: emailError, password: passwordError, server: "" });
      return;
    }

    setIsLoading(true);
    try {
      const response = await login(userInput);
      const responseData = response.data;

      if (responseData?.accessToken) {
        // Successful login
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

        // Announce successful login to screen readers
        const announcement = document.getElementById("success-announcement");
        if (announcement) {
          announcement.textContent =
            "Login successful. Redirecting to dashboard.";
        }

        navigate(navigation);
      }
    } catch (error) {
      signinLimiter.increment();
      setAttemptCount((prev) => prev + 1);

      if (axios.isAxiosError(error)) {
        const errorMessage =
          error.response?.data?.message || "An error occurred during sign in";
        setErrors((prev) => ({ ...prev, server: errorMessage }));
      }
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <>
      <Helmet>
        <title>Sign In | Your App Name</title>
        <meta
          name="description"
          content="Sign in to access your account and manage your tasks"
        />
        <meta name="robots" content="noindex, nofollow" />{" "}
        {/* Don't index login pages */}
        <link rel="canonical" href={window.location.href} />
      </Helmet>

      {/* Announcements for screen readers */}
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

      <main className="min-h-screen flex items-center justify-center bg-gray-50 py-12 px-4 sm:px-6 lg:px-8">
        <Card className="w-full max-w-md">
          <CardHeader className="space-y-1">
            <CardTitle className="text-2xl font-bold text-center">
              Sign in to your account
            </CardTitle>
            <CardDescription className="text-center text-gray-500">
              Enter your credentials to access your account
            </CardDescription>
          </CardHeader>

          <CardContent>
            <form
              onSubmit={handleSubmit}
              className="space-y-4"
              aria-label="Sign in form"
              noValidate
            >
              <div className="space-y-1">
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
                    value={userInput.email}
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

              <div className="space-y-1">
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
                    autoComplete="current-password"
                    placeholder="Enter your password"
                    value={userInput.password}
                    onChange={handleChange}
                    className={`pl-10 ${
                      errors.password ? "border-red-500" : ""
                    }`}
                    aria-required="true"
                    aria-invalid={!!errors.password}
                    aria-describedby={
                      errors.password ? "password-error" : undefined
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
                </div>
              </div>

              {errors.server && (
                <div
                  className="text-sm text-red-500 text-center p-2 bg-red-50 rounded"
                  role="alert"
                  aria-live="assertive"
                >
                  {errors.server}
                  {attemptCount > 2 && (
                    <p className="text-xs mt-1">
                      Having trouble? Make sure your caps lock is off and try
                      again.
                    </p>
                  )}
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
                    <span className="sr-only">Signing in, please wait...</span>
                    <span aria-hidden="true">Signing in...</span>
                  </>
                ) : (
                  "Sign in"
                )}
              </Button>
            </form>
          </CardContent>

          <CardFooter className="flex flex-col space-y-4">
            <div className="text-sm text-center">
              <p className="font-medium text-black-500">
                Don't have an account?
              </p>
              <Link
                to="/auth/signup"
                className="font-medium text-primary hover:text-primary/90 focus:outline-none focus:underline"
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
