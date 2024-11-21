"use client";
import React, { useState } from "react";
import { useForm } from "react-hook-form";
import { useToggle } from "usehooks-ts";
import { FiArrowRight, FiEye, FiEyeOff } from "react-icons/fi";
import { Input, Button } from "@nextui-org/react";
import { redirect, useRouter } from "next/navigation";
import Link from "next/link";
import useAuth from "@/hooks/useAuth";
import { isRedirectError } from "next/dist/client/components/redirect";

const LoginPage = () => {
  const [isShowPassword, toggleShowPassword] = useToggle(false);
  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm({
    defaultValues: {
      email: "",
      password: "",
    },
  });

  const { user, login } = useAuth();
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [invalidCredentialsError, setInvalidCredentialsError] = useState(false);

  const onSubmit = handleSubmit(async (validFormData) => {
    let redirectRoute = "";

    try {
      setLoading(true);
      setInvalidCredentialsError(false);

      const { email, password } = validFormData;

      const { error } = await login({ email, password });

      if (!error) {
        alert("Welcome back!");
        redirectRoute = "/";
        return;
      }

      if (error.message === "Email not confirmed") {
        alert("Need to confirm email!");
        return;
      } else {
        setInvalidCredentialsError(true);
      }
    } catch (error) {
      console.error("the error", error);
      if (isRedirectError(error)) {
        console.log("is redirect error, nothing to worry about");
      } else {
        alert("Invalid email or password");
      }
    } finally {
      setLoading(false);
      if (redirectRoute) router.push(redirectRoute);
    }
  });

  // Redirect if user is already logged in
  if (user) {
    redirect("/");
  }

  return (
    <div className="max-w-80 mx-auto mt-60">
      <form onSubmit={onSubmit} autoComplete="off">
        <div>
          <div className="mb-4">
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
              <p className="block text-orange-700 text-sm mt-1">{errors.email.message}</p>
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
              })}
            />

            {errors.password && (
              <p className="block text-orange-700 text-sm mt-1">{errors.password.message}</p>
            )}
          </div>

          <Button
            type="submit"
            disabled={loading}
            color="primary"
            fullWidth
            className="mt-3"
            isLoading={loading}
          >
            Login
            <FiArrowRight />
          </Button>
          {invalidCredentialsError && (
            <strong className="block text-orange-700 text-center text-sm mt-3">
              Invalid email or password, please try again
            </strong>
          )}
        </div>
      </form>

      <div className="flex flex-col items-center justify-center mt-6 text-slate-500	">
        <button>Forgot password?</button>

        <Link href="/register">
          <span>Don't have an account?</span>
          <span>Sign up</span>
        </Link>
      </div>
    </div>
  );
};

export default LoginPage;
