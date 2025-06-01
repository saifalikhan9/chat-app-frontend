"use client";

import type React from "react";

import { useState } from "react";
import { MessageCircle, Eye, EyeOff } from "lucide-react";
import { Button } from "../components/ui/button";
import { Input } from "../components/ui/input";
import { Label } from "../components/ui/label";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "../components/ui/card";
import { Link, useNavigate } from "react-router-dom";
import type { SignupPayload } from "@/utils/types";
import { useForm, type SubmitHandler } from "react-hook-form";
import { signup } from "@/utils/apiService";

export default function SignUpPage() {
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const navigate = useNavigate();

  const {
    register,
    handleSubmit,
    formState: { errors },
    getValues,
  } = useForm<SignupPayload>();
  const onSubmit: SubmitHandler<SignupPayload> = async (data) => {
    try {
      setError(null);
      const res = await signup(data);
      console.log("Login successful", res);
      navigate("/friends"); // or your dashboard route
    } catch (err) {
      console.error(err);
      setError(err?.response?.data?.message || "SignUp failed");
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-b from-slate-900 via-purple-900 to-black">
      {/* Header */}
      <header className="flex items-center justify-between p-6 lg:px-12">
        <Link to="/" className="flex items-center gap-3">
          <MessageCircle className="h-8 w-8 text-white" />
          <span className="text-xl font-bold text-white tracking-wider">
            CHAT APP
          </span>
        </Link>
        <Link to="/signin">
          <Button
            variant="outline"
            className="bg-transparent hover:bg-slate-800 text-white border-slate-600 hover:border-slate-500 px-6 py-2 rounded-full"
          >
            Sign In
          </Button>
        </Link>
      </header>

      {/* Sign Up Form */}
      <main className="flex items-center justify-center min-h-[calc(100vh-120px)] px-6">
        <Card className="w-full max-w-md bg-slate-800/50 border-slate-700 backdrop-blur-sm">
          <CardHeader className="text-center">
            <CardTitle className="text-2xl font-bold text-white">
              Create Account
            </CardTitle>
            <CardDescription className="text-gray-400">
              Join the conversation and connect with friends
            </CardDescription>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="name" className="text-white">
                  Full Name
                </Label>
                <Input
                  {...register("name", { required: "Name is required" })}
                  type="text"
                  placeholder="Enter your full name"
                  required
                  className="bg-slate-700/50 border-slate-600 text-white placeholder:text-gray-400 focus:border-emerald-500"
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="email" className="text-white">
                  Email
                </Label>
                <Input
                  {...register("email", { required: "Email is required" })}
                  type="email"
                  placeholder="Enter your email"
                  required
                  className="bg-slate-700/50 border-slate-600 text-white placeholder:text-gray-400 focus:border-emerald-500"
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="password" className="text-white">
                  Password
                </Label>
                <div className="relative">
                  <Input
                    {...register("password", {
                      required: "Password is required",
                    })}
                    type={showPassword ? "text" : "password"}
                    placeholder="Create a password"
                    required
                    className="bg-slate-700/50 border-slate-600 text-white placeholder:text-gray-400 focus:border-emerald-500 pr-10"
                  />
                  <Button
                    type="button"
                    variant="ghost"
                    size="sm"
                    className="absolute right-0 top-0 h-full px-3 text-gray-400 hover:text-white"
                    onClick={() => setShowPassword(!showPassword)}
                  >
                    {showPassword ? (
                      <EyeOff className="h-4 w-4" />
                    ) : (
                      <Eye className="h-4 w-4" />
                    )}
                  </Button>
                </div>
                {errors.password && (
                  <p className="text-sm text-red-400">
                    {errors.password.message}
                  </p>
                )}
              </div>

              <div className="space-y-2">
                <Label htmlFor="confirmPassword" className="text-white">
                  Confirm Password
                </Label>
                <div className="relative">
                  <Input
                    {...register("confirmPassword", {
                      required: "Please re-enter your password",
                      validate: (values) =>
                        values === getValues("password") ||
                        "password do not match",
                    })}
                    type={showConfirmPassword ? "text" : "password"}
                    placeholder="Confirm your password"
                    required
                    className="bg-slate-700/50 border-slate-600 text-white placeholder:text-gray-400 focus:border-emerald-500 pr-10"
                  />
                  <Button
                    type="button"
                    variant="ghost"
                    size="sm"
                    className="absolute right-0 top-0 h-full px-3 text-gray-400 hover:text-white"
                    onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                  >
                    {showConfirmPassword ? (
                      <EyeOff className="h-4 w-4" />
                    ) : (
                      <Eye className="h-4 w-4" />
                    )}
                  </Button>
                </div>
                {errors && <p className="text-sm text-red-400">{errors.confirmPassword?.message}</p>}
              </div>

              <Button
                type="submit"
                className="w-full bg-emerald-500 hover:bg-emerald-600 text-white py-2 rounded-full font-medium"
              >
                Create Account
              </Button>
            </form>

            <div className="mt-6 text-center">
              <p className="text-gray-400">
                Already have an account?{" "}
                <Link
                  to="/signin"
                  className="text-emerald-400 hover:text-emerald-300 font-medium"
                >
                  Sign in
                </Link>
              </p>
            </div>
          </CardContent>
        </Card>
      </main>
    </div>
  );
}
