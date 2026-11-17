"use client";
import { Suspense, useState } from "react";
import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import axios from "axios";
import { Stethoscope, AlertCircle } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { loginSchema, LoginInput } from "@/lib/validations";

function LoginForm() {
  const router = useRouter();
  const [loginError, setLoginError] = useState<string | null>(null);
  const searchParams = useSearchParams();
  const callbackUrl = searchParams.get("callbackUrl");

  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm<LoginInput>({ resolver: zodResolver(loginSchema) });

  async function onSubmit(data: LoginInput) {
    setLoginError(null);
    try {
      const res = await axios.post("/api/auth/login", data);
      const redirectTo = callbackUrl || res.data.data.redirect || "/admin/dashboard";
      window.location.href = redirectTo;
    } catch (err: unknown) {
      const message = axios.isAxiosError(err)
        ? err.response?.data?.error || `Server error ${err.response?.status}`
        : "Network error — check your connection";
      setLoginError(message);
    }
  }

  return (
    <div className="bg-white py-8 px-6 shadow-sm border border-gray-200 rounded-xl">
      {loginError && (
        <div className="mb-5 flex items-start gap-3 rounded-xl bg-red-50 border border-red-200 px-4 py-3 text-red-700 text-sm">
          <AlertCircle className="h-4 w-4 mt-0.5 shrink-0" />
          <span>{loginError}</span>
        </div>
      )}
      <form onSubmit={handleSubmit(onSubmit)} className="space-y-5">
        <Input
          label="Email address"
          type="email"
          autoComplete="email"
          required
          error={errors.email?.message}
          {...register("email")}
        />
        <div>
          <Input
            label="Password"
            type="password"
            autoComplete="current-password"
            required
            error={errors.password?.message}
            {...register("password")}
          />
          <div className="text-right mt-1">
            <Link href="/forgot-password" className="text-xs text-[#1A5C38] hover:underline">
              Forgot password?
            </Link>
          </div>
        </div>
        <Button type="submit" loading={isSubmitting} className="w-full" size="lg">
          Sign in
        </Button>
      </form>
    </div>
  );
}

export default function LoginPage() {
  return (
    <div className="min-h-screen bg-gray-50 flex flex-col justify-center py-12 sm:px-6 lg:px-8">
      <div className="sm:mx-auto sm:w-full sm:max-w-md">
        <Link href="/" className="flex items-center justify-center gap-2.5 mb-6">
          <div className="h-10 w-10 rounded-xl bg-[#1A5C38] flex items-center justify-center">
            <Stethoscope className="h-5 w-5 text-white" />
          </div>
          <div>
            <p className="font-bold text-gray-900">LIFEX Mobile Clinic</p>
          </div>
        </Link>
        <h1 className="text-center text-2xl font-bold text-gray-900">Sign in to your account</h1>
        <p className="text-center text-sm text-gray-500 mt-2">
          Staff login — clinic admin access only
        </p>
      </div>

      <div className="mt-8 sm:mx-auto sm:w-full sm:max-w-md">
        <Suspense fallback={<div className="bg-white py-8 px-6 shadow-sm border border-gray-200 rounded-xl" />}>
          <LoginForm />
        </Suspense>
      </div>
    </div>
  );
}
