"use client";
import React, { useState } from "react";
import { useForm } from "react-hook-form";
import { FiArrowRight, FiEye, FiEyeOff } from "react-icons/fi";
import { redirect } from "next/navigation";

import useAuth from "@/hooks/useAuth";
import { createClient } from "@/utils/supabase/client";
import Link from "next/link";

const SignUp = () => {
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
  const supabase = createClient();

  const [showPass, setShowPass] = useState<boolean>(false);
  const [showPass2, setShowPass2] = useState<boolean>(false);
  const [loading, setLoading] = useState<boolean>(false);
  const [signUpError, setSignUpError] = useState<boolean>(false);
  const [signUpSuccess, setSignUpSuccess] = useState<boolean>(false);

  const handleToggleShowPassword = () => setShowPass(!showPass);
  const handleToggleShowPassword2 = () => setShowPass2(!showPass2);

  const onSubmit = handleSubmit(async (validFormData) => {
    try {
      setLoading(true);
      setSignUpError(false);
      setSignUpSuccess(false);

      const { email, password } = validFormData;

      const { error, user } = await signUp({ email, password });

      if (error) {
        setSignUpError(true);
        return;
      }

      const { error: dbError } = await supabase.from("users").insert({
        id: user?.id || window.crypto.randomUUID(),
        username: user?.email || window.crypto.randomUUID(),
        avatar_url: user?.user_metadata?.avatar_url || "",
      });

      if (dbError) {
        console.error(dbError);
        setSignUpError(true);
        setSignUpSuccess(false);
        return;
      }

      setSignUpSuccess(true);
    } catch (error) {
      setSignUpError(true);
      setSignUpSuccess(false);
    } finally {
      setLoading(false);
    }
  });

  if (user) {
    redirect("/");
  }

  return (
    <div className="max-w-lg mx-auto p-5 flex items-center">
      <div className="w-full">
        <div className="p-5 text-center shadow-lg rounded-lg">
          <form onSubmit={onSubmit} autoComplete="off">
            <div className="flex flex-col gap-4">
              {signUpError && (
                <div className="text-red-500">
                  <p>Error creating user!</p>
                </div>
              )}
              {signUpSuccess && (
                <div className="text-green-500">
                  <p>Account created! Please check your email to verify your account.</p>
                </div>
              )}
              <div>
                <label htmlFor="email">Email</label>
                <input
                  type="email"
                  {...register("email", {
                    required: "Email is required",
                    pattern: {
                      value: /^[A-Z0-9._%+-]+@[A-Z0-9.-]+\.[A-Z]{2,}$/i,
                      message: "Invalid email address",
                    },
                  })}
                  className="w-full p-2 text-lg border rounded-md"
                />
                {errors.email && <p className="text-red-500">{errors.email.message}</p>}
              </div>
              <div>
                <label htmlFor="password">Password</label>
                <div className="relative">
                  <input
                    type={showPass ? "text" : "password"}
                    {...register("password", {
                      required: "Password is required",
                    })}
                    className="w-full p-2 text-lg border rounded-md"
                  />
                  <button
                    type="button"
                    onClick={handleToggleShowPassword}
                    className="absolute right-3 top-1/2 transform -translate-y-1/2 bg-none border-none"
                  >
                    {showPass ? <FiEyeOff /> : <FiEye />}
                  </button>
                </div>
                {errors.password && <p className="text-red-500">{errors.password.message}</p>}
              </div>
              <div>
                <label htmlFor="passwordRepeat">Repeat Password</label>
                <div className="relative">
                  <input
                    type={showPass2 ? "text" : "password"}
                    {...register("passwordRepeat", {
                      required: true,
                      validate: (value) => value === watch("password") || "Passwords do not match",
                    })}
                    className="w-full p-2 text-lg border rounded-md"
                  />
                  <button
                    type="button"
                    onClick={handleToggleShowPassword2}
                    className="absolute right-3 top-1/2 transform -translate-y-1/2 bg-none border-none"
                  >
                    {showPass2 ? <FiEyeOff /> : <FiEye />}
                  </button>
                </div>
                {errors.passwordRepeat && (
                  <p className="text-red-500">{errors.passwordRepeat.message}</p>
                )}
              </div>
              <div>
                <button
                  type="submit"
                  disabled={loading}
                  className="w-full p-3 bg-blue-600 text-white text-lg rounded-md flex justify-center items-center"
                >
                  Sign Up
                  <FiArrowRight className="ml-2 text-xl" />
                </button>
              </div>
            </div>
          </form>

          <div className="mt-4 flex justify-center gap-2">
            <Link href="/login">Login</Link>
          </div>
        </div>
      </div>
    </div>
  );
};

export default SignUp;
