"use client";

import { useState, useContext } from "react";
import { useNavigate, Link } from "react-router-dom";
import { useForm, type SubmitHandler } from "react-hook-form";
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

import type { LoginPayload } from "@/utils/types";
import { login } from "@/utils/apiService";
import { Contexts } from "@/context/Contexts";


export default function SignInPage() {
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const navigate = useNavigate();
  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<LoginPayload>();
  const { setToken, setUser } = useContext(Contexts);

  const onSubmit: SubmitHandler<LoginPayload> = async (data) => {
    try {
      setError(null);
      const res = await login(data);
      localStorage.setItem("token", res.accessToken);
      setUser(res.user);
      setToken(res.accessToken);

      navigate("/chat");
      // or your dashboard route
    } catch (err) {
      console.error(err);
      setError("Login failed");
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
        <Link to="/signup">
          <Button
            variant="outline"
            className="bg-transparent hover:bg-slate-800 text-white border-slate-600 hover:border-slate-500 px-6 py-2 rounded-full"
          >
            Sign Up
          </Button>
        </Link>
      </header>

      {/* Sign In Form */}
      <main className="flex items-center justify-center min-h-[calc(100vh-120px)] px-6">
        <Card className="w-full max-w-md bg-slate-800/50 border-slate-700 backdrop-blur-sm">
          <CardHeader className="text-center">
            <CardTitle className="text-2xl font-bold text-white">
              Welcome Back
            </CardTitle>
            <CardDescription className="text-gray-400">
              Sign in to continue your conversations
            </CardDescription>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="email" className="text-white">
                  Email
                </Label>
                <Input
                  {...register("email", { required: "Email is required" })}
                  type="email"
                  placeholder="you@example.com"
                  className="bg-slate-700/50 border-slate-600 text-white placeholder:text-gray-400 focus:border-emerald-500"
                />
                {errors.email && (
                  <p className="text-sm text-red-400">{errors.email.message}</p>
                )}
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
                    placeholder="••••••••"
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

              {error && <p className="text-sm text-red-500">{error}</p>}

              <div className="flex items-center justify-between">
                <Link
                  to="#"
                  className="text-sm text-emerald-400 hover:text-emerald-300"
                >
                  Forgot password?
                </Link>
              </div>

              <Button
                type="submit"
                className="w-full bg-emerald-500 hover:bg-emerald-600 text-white py-2 rounded-full font-medium"
              >
                Sign In
              </Button>
            </form>

            <div className="mt-6 text-center">
              <p className="text-gray-400">
                {"Don't have an account? "}
                <Link
                  to="/signup"
                  className="text-emerald-400 hover:text-emerald-300 font-medium"
                >
                  Sign up
                </Link>
              </p>
            </div>
          </CardContent>
        </Card>
      </main>
    </div>
  );
}
