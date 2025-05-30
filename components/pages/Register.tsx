"use client";
import React, { useState } from "react";
import { useForm } from "react-hook-form";
import { useToggle } from "usehooks-ts";
import { FiArrowRight, FiEye, FiEyeOff } from "react-icons/fi";
import { Input, Button } from "@heroui/react";
import { redirect, useRouter } from "next/navigation";
import Link from "next/link";
import useAuth from "@/hooks/useAuth";
import { toast } from "sonner";

const SignUpPage = () => {
  const {
    register,
    handleSubmit,
    watch,
    formState: { errors },
  } = useForm<{
    email: string;
    password: string;
    passwordRepeat: string;
  }>();
  const { user, signUp } = useAuth();
  const router = useRouter();
  const [isShowPassword, toggleShowPassword] = useToggle(false);
  const [loading, setLoading] = useState<boolean>(false);

  const onSubmit = handleSubmit(async (validFormData) => {
    try {
      setLoading(true);
      const { email, password } = validFormData;

      // Use the signUp function from useAuth hook
      const { error } = await signUp({ email, password });

      if (error) {
        toast.error(error.message || "Error creating account");
        return;
      }

      // No need to manually insert into profiles table
      // The database trigger will automatically create the profile

      // Show success toast and redirect to map page
      toast.success(
        "Account created! Please check your email to verify your account."
      );

      // Redirect regardless of user state since we know signup was successful
      router.push("/map");
    } catch (error) {
      console.error(error);
      toast.error("An unexpected error occurred");
    } finally {
      setLoading(false);
    }
  });

  // Only redirect on initial load if user is already logged in
  // We'll handle the redirect manually after signup
  if (user && !loading) {
    router.push("/map");
  }

  return (
    <div className="max-w-80 w-full mx-auto mt-60">
      <p className="flex justify-center text-center">
        <svg
          className="mb-8"
          xmlns="http://www.w3.org/2000/svg"
          width="32"
          height="32"
          viewBox="0 0 32 32"
          style={{
            height: 50,
            width: 50,
          }}
        >
          <g fill="#d1d5db">
            <path d="M14.5 24.823v1.96c0 .22-.24.35-.43.24l-2.8-1.69a.66.66 0 0 1-.31-.56v-1.96c0-.22.24-.35.43-.24l2.8 1.69c.19.12.31.33.31.56" />
            <path d="M16.89 1.289h.003l10.921 6.642c.557.343.896.956.896 1.602v12.44c0 .936-.482 1.838-1.314 2.336l-10.543 6.406a1.9 1.9 0 0 1-1.996 0L4.311 24.307A2.73 2.73 0 0 1 3 21.973V9.533c0-.636.332-1.261.908-1.6l10.931-6.65a1.98 1.98 0 0 1 2.052.006m-1.03 1.714L6.083 8.95l3.51 2.145l9.79-5.951zm6.815 4.143l-9.805 5.952l3 1.832l9.905-5.898zM5 21.973c0 .259.137.496.35.625l9.513 5.78V16.659l-3.103-1.895v1.788c0 .24-.26.38-.46.27l-2.68-1.63a.31.31 0 0 1-.14-.26V12.76L5 10.634zm21.36.625l.008-.004a.72.72 0 0 0 .342-.622v-11.17l-9.847 5.865v11.702z" />
          </g>
        </svg>
      </p>
      <form onSubmit={onSubmit} autoComplete="off">
        <div className="flex flex-col gap-4">
          <div>
            <label htmlFor="email">Email</label>
            <Input
              autoFocus
              disabled={loading}
              type="email"
              {...register("email", {
                required: "Email is required",
                pattern: {
                  value: /^[A-Z0-9._%+-]+@[A-Z0-9.-]+\.[A-Z]{2,}$/i,
                  message: "Invalid email address",
                },
              })}
            />
            {errors.email && (
              <p className="block text-orange-700 text-sm mt-1">
                {errors.email.message}
              </p>
            )}
          </div>

          <div>
            <label htmlFor="password">Password</label>
            <Input
              disabled={loading}
              type={isShowPassword ? "text" : "password"}
              endContent={
                <button
                  className="focus:outline-none"
                  type="button"
                  onClick={toggleShowPassword}
                  aria-label="toggle password visibility"
                >
                  {isShowPassword ? (
                    <FiEyeOff className="text-2xl text-default-400 pointer-events-none" />
                  ) : (
                    <FiEye className="text-2xl text-default-400 pointer-events-none" />
                  )}
                </button>
              }
              {...register("password", {
                required: "Password is required",
                minLength: {
                  value: 6,
                  message: "Password must be at least 6 characters",
                },
              })}
            />
            {errors.password && (
              <p className="block text-orange-700 text-sm mt-1">
                {errors.password.message}
              </p>
            )}
          </div>

          <div>
            <label htmlFor="passwordRepeat">Repeat Password</label>
            <Input
              disabled={loading}
              type={isShowPassword ? "text" : "password"}
              endContent={
                <button
                  className="focus:outline-none"
                  type="button"
                  onClick={toggleShowPassword}
                  aria-label="toggle password visibility"
                >
                  {isShowPassword ? (
                    <FiEyeOff className="text-2xl text-default-400 pointer-events-none" />
                  ) : (
                    <FiEye className="text-2xl text-default-400 pointer-events-none" />
                  )}
                </button>
              }
              {...register("passwordRepeat", {
                required: "Please confirm your password",
                validate: (value) =>
                  value === watch("password") || "Passwords don't match",
              })}
            />
            {errors.passwordRepeat && (
              <p className="block text-orange-700 text-sm mt-1">
                {errors.passwordRepeat.message}
              </p>
            )}
          </div>

          <Button
            type="submit"
            disabled={loading}
            color="primary"
            fullWidth
            isLoading={loading}
          >
            Sign Up
            <FiArrowRight />
          </Button>
        </div>
      </form>
      <div className="flex flex-col items-center justify-center mt-6 text-slate-500">
        <Link href="/login">
          <span className="inline-block me-2">
            Do you already have an account?
          </span>
          <span>Login</span>
        </Link>
      </div>
    </div>
  );
};

export default SignUpPage;
