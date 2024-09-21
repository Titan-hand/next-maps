"use client";
import React, { useState } from "react";
import { useForm } from "react-hook-form";
import { FiArrowRight, FiEye, FiEyeOff } from "react-icons/fi";
import { redirect } from "next/navigation";

import useAuth from "@/hooks/useAuth";
import { createClient } from "@/utils/supabase/client";
import Link from "next/link";

const SignUp = () => {
  // React hook form
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

      // Register user in database
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

  // Redirect if user is already logged in
  if (user) {
    redirect("/");
  }

  return (
    <div
      style={{
        maxWidth: "600px",
        margin: "auto",
        padding: "20px",
        display: "flex",
        alignItems: "center",
      }}
    >
      <div style={{ width: "100%" }}>
        <div
          style={{
            padding: "20px",
            textAlign: "center",
            boxShadow: "0 0 10px rgba(0, 0, 0, 0.1)",
            borderRadius: "10px",
          }}
        >
          <form onSubmit={onSubmit} autoComplete="off">
            <div style={{ display: "flex", flexDirection: "column", gap: "16px" }}>
              {signUpError && (
                <div style={{ color: "red" }}>
                  <p>Error creating user!</p>
                </div>
              )}
              {signUpSuccess && (
                <div style={{ color: "green" }}>
                  <p>Account created! Please check your email to verify your account.</p>
                </div>
              )}
              {/* Email */}
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
                  style={{ width: "100%", padding: "8px", fontSize: "16px" }}
                />
                {errors.email && <p style={{ color: "red" }}>{errors.email.message}</p>}
              </div>
              {/* Password */}
              <div>
                <label htmlFor="password">Password</label>
                <div style={{ position: "relative" }}>
                  <input
                    type={showPass ? "text" : "password"}
                    {...register("password", {
                      required: "Password is required",
                    })}
                    style={{ width: "100%", padding: "8px", fontSize: "16px" }}
                  />
                  <button
                    type="button"
                    onClick={handleToggleShowPassword}
                    style={{
                      position: "absolute",
                      right: "10px",
                      top: "50%",
                      transform: "translateY(-50%)",
                      border: "none",
                      background: "none",
                    }}
                  >
                    {showPass ? <FiEyeOff /> : <FiEye />}
                  </button>
                </div>
                {errors.password && <p style={{ color: "red" }}>{errors.password.message}</p>}
              </div>
              {/* Password Repeat */}
              <div>
                <label htmlFor="passwordRepeat">Repeat Password</label>
                <div style={{ position: "relative" }}>
                  <input
                    type={showPass2 ? "text" : "password"}
                    {...register("passwordRepeat", {
                      required: true,
                      validate: (value) => value === watch("password") || "Passwords do not match",
                    })}
                    style={{ width: "100%", padding: "8px", fontSize: "16px" }}
                  />
                  <button
                    type="button"
                    onClick={handleToggleShowPassword2}
                    style={{
                      position: "absolute",
                      right: "10px",
                      top: "50%",
                      transform: "translateY(-50%)",
                      border: "none",
                      background: "none",
                    }}
                  >
                    {showPass2 ? <FiEyeOff /> : <FiEye />}
                  </button>
                </div>
                {errors.passwordRepeat && (
                  <p style={{ color: "red" }}>{errors.passwordRepeat.message}</p>
                )}
              </div>
              <div>
                <button
                  type="submit"
                  disabled={loading}
                  style={{
                    width: "100%",
                    padding: "12px",
                    backgroundColor: "blue",
                    color: "white",
                    fontSize: "18px",
                    borderRadius: "5px",
                    cursor: "pointer",
                    display: "flex",
                    justifyContent: "center",
                    alignItems: "center",
                  }}
                >
                  Sign Up
                  <FiArrowRight style={{ marginLeft: "8px", fontSize: "20px" }} />
                </button>
              </div>
            </div>
          </form>

          <div style={{ marginTop: "16px", display: "flex", justifyContent: "center", gap: "8px" }}>
            <Link href="/login">Login</Link>
          </div>
        </div>
      </div>
    </div>
  );
};

export default SignUp;
