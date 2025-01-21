import React, { useState } from "react";
import { signup } from "./Signup.service";
import { SignupCredentials,ServerError } from "./Signup.types";
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
import { useNavigate } from "react-router-dom";
import { RateLimiter } from "../../utils/rateLimit";
import { useToast } from "@/hooks/use-toast";
import {
  validateEmail,
  validatePassword,
  validateName,
} from "../../utils/validationConstants";
import { AxiosError } from "axios";

const RATE_LIMIT_CONFIG = {
  maxAttempts: 5, // 5 attempts
  windowMs: 15 * 60 * 1000, // 15 minutes
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
  const { toast } = useToast();

  const navigate = useNavigate();

  // Replace the validateField function
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
    setErrors((prev) => ({
      ...prev,
      [name]: validateField(name, value),
      server: "",
    }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    // Check rate limit
    const rateLimit = signupLimiter.canAttempt();
    if (!rateLimit.allowed) {
      const minutes = Math.ceil(rateLimit.remainingMs! / 60000);
      toast({
        title: "Too many attempts",
        description: `Please try again in ${minutes} minutes`,
        duration: 2000,
      });
      return;
    }

    setErrors({ email: "", password: "", name: "", server: "" });

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
      return;
    }

    setIsLoading(true);
    try {
      signupLimiter.increment();
      await signup(credentials);

      signupLimiter.reset();
      navigate("/login");
    } catch (err : any) {
      const axioserr = err as AxiosError<ServerError>
      setErrors((prev) => ({
        ...prev,
        server: `${axioserr.response?.data.message}`,
      }));
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50 py-12 px-4 sm:px-6 lg:px-8">
      <Card className="w-full max-w-md">
        <CardHeader className="space-y-1">
          <CardTitle className="text-2xl font-bold text-center">
            Sign up
          </CardTitle>
          <CardDescription className="text-center text-gray-500">
            Enter your details to create a new account
          </CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="name">Name</Label>
              <div className="relative">
                <User className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
                <Input
                  id="name"
                  name="name"
                  type="text"
                  placeholder="Your name"
                  value={credentials.name}
                  onChange={handleChange}
                  className={`pl-10 ${errors.name ? "border-red-500" : ""}`}
                  required
                />
                {errors.name && (
                  <p className="mt-1 text-xs text-red-500">{errors.name}</p>
                )}
              </div>
            </div>
            <div className="space-y-2">
              <Label htmlFor="email">Email address</Label>
              <div className="relative">
                <Mail className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
                <Input
                  id="email"
                  name="email"
                  type="email"
                  placeholder="name@example.com"
                  value={credentials.email}
                  onChange={handleChange}
                  className={`pl-10 ${errors.email ? "border-red-500" : ""}`}
                  required
                />
                {errors.email && (
                  <p className="mt-1 text-xs text-red-500">{errors.email}</p>
                )}
              </div>
            </div>
            <div className="space-y-2">
              <Label htmlFor="password">Password</Label>
              <div className="relative">
                <Lock className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
                <Input
                  id="password"
                  name="password"
                  type="password"
                  placeholder="Enter your password"
                  value={credentials.password}
                  onChange={handleChange}
                  className={`pl-10 ${errors.password ? "border-red-500" : ""}`}
                  required
                />
                {errors.password && (
                  <p className="mt-1 text-xs text-red-500">{errors.password}</p>
                )}
                {errors.server && (
                  <p className="text-sm text-red-500 text-center">
                    {errors.server}
                  </p>
                )}
              </div>
            </div>
            <Button type="submit" className="w-full" disabled={isLoading}>
              {isLoading ? "Signing up..." : "Sign up"}
            </Button>
          </form>
        </CardContent>
        <CardFooter className="flex flex-col space-y-4">
          <div className="text-sm text-center">
            <p className="font-medium text-primary text-black-500">
              Already have an account?
            </p>
            <a
              href="/login"
              className="font-medium text-primary hover:text-primary/90 text-gray-500"
            >
              Sign in
            </a>
          </div>
        </CardFooter>
      </Card>
    </div>
  );
};

export default Signup;
