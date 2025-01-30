import React, { useState } from "react";
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
import axios from "axios";

const RATE_LIMIT_CONFIG = {
  maxAttempts: 5, // 5 attempts
  windowMs: 15 * 60 * 1000, // 15 minutes
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

  const navigate = useNavigate();
  const dispatch = useDispatch();

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
    setErrors((prev) => ({
      ...prev,
      [name]: validateField(name, value),
      server: "",
    }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    // Check rate limit
    const rateLimit = signinLimiter.canAttempt();
    if (!rateLimit.allowed) {
      const minutes = Math.ceil(rateLimit.remainingMs! / 60000);
      toast({
        title: "Too many attempts",
        description: `Please try again in ${minutes} minutes`,
        variant: "destructive",
        duration: 2000,
      });
      return;
    }

    setErrors({ email: "", password: "", server: "" });

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
      if (responseData && responseData.accessToken) {
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
        navigate(navigation);
      } else {
        setErrors((prev) => ({
          ...prev,
          server: "Invalid credentials",
        }));
      }
    } catch (error) {
      signinLimiter.increment();
      if (axios.isAxiosError(error)) {
        const errorMessage =
          error.response?.data?.message || "An error occurred";
        setErrors((prev) => ({
          ...prev,
          server: errorMessage,
        }));
      }
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50 py-12 px-4 sm:px-6 lg:px-8">
      <Card className="w-full max-w-md">
        <CardHeader className="space-y-1">
          <CardTitle className="text-2xl font-bold text-center">
            Sign in
          </CardTitle>
          <CardDescription className="text-center text-gray-500">
            Enter your credentials to access your account
          </CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="space-y-1">
              <Label htmlFor="email">Email address</Label>
              <div className="relative">
                <Mail className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
                <Input
                  id="email"
                  name="email"
                  type="email"
                  placeholder="name@example.com"
                  value={userInput.email}
                  onChange={handleChange}
                  className={`pl-10 ${errors.email ? "border-red-500" : ""}`}
                  required
                />
                {errors.email && (
                  <p className="mt-1 text-xs text-red-500">{errors.email}</p>
                )}
              </div>
            </div>
            <div className="space-y-1">
              <Label htmlFor="password">Password</Label>
              <div className="relative">
                <Lock className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
                <Input
                  id="password"
                  name="password"
                  type="password"
                  placeholder="Enter your password"
                  value={userInput.password}
                  onChange={handleChange}
                  className={`pl-10 ${errors.password ? "border-red-500" : ""}`}
                  required
                />
                {errors.password && (
                  <p className="mt-1 text-xs text-red-500">{errors.password}</p>
                )}
              </div>
            </div>
            {errors.server && (
              <p className="text-sm text-red-500 text-center">
                {errors.server}
              </p>
            )}
            <Button type="submit" className="w-full" disabled={isLoading}>
              {isLoading ? "Signing in..." : "Sign in"}
            </Button>
          </form>
        </CardContent>
        <CardFooter className="flex flex-col space-y-4">
          <div className="text-sm text-center">
            <p className="font-medium text-black-500">Don't have an account?</p>
            <Link
              to="/signup"
              className="font-medium text-primary hover:text-primary/90"
            >
              Sign up
            </Link>
          </div>
        </CardFooter>
      </Card>
    </div>
  );
};

export default Signin;
