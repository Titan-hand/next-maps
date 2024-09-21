"use client";
import React, { useState } from "react";
import { useForm } from "react-hook-form";
import { FiArrowRight, FiEye, FiEyeOff } from "react-icons/fi";
import { redirect, useRouter } from "next/navigation";
import Link from "next/link";
import useAuth from "@/hooks/useAuth";
import { isRedirectError } from "next/dist/client/components/redirect";

const LoginPage = () => {
  // React hook form
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

  const [showPass, setShowPass] = useState(false);
  const [loading, setLoading] = useState(false);
  const [invalidCredentialsError, setInvalidCredentialsError] = useState(false);

  const handleToggleShowPassword = () => setShowPass(!showPass);

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
    <div>
      <div>
        <div>
          <div>
            <form onSubmit={onSubmit} autoComplete="off">
              <div>
                {invalidCredentialsError && (
                  <div>
                    <p>Invalid email or password!</p>
                    <p>Please try again.</p>
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
                  />
                  {errors.email && <p>{errors.email.message}</p>}
                </div>
                <div>
                  <label htmlFor="password">Password</label>
                  <div>
                    <input
                      type={showPass ? "text" : "password"}
                      {...register("password", {
                        required: "Password is required",
                      })}
                    />
                    <button
                      type="button"
                      onClick={handleToggleShowPassword}
                      aria-label="Show password"
                    >
                      {showPass ? <FiEyeOff /> : <FiEye />}
                    </button>
                  </div>
                  {errors.password && <p>{errors.password.message}</p>}
                </div>
                <div>
                  <button type="submit" disabled={loading}>
                    Login
                    <FiArrowRight />
                  </button>
                </div>
              </div>
            </form>
            {/* Forgot password */}
            <div>
              <button>Forgot password?</button>
            </div>
     
            <div>
              <Link href="/register">
                <span>Don't have an account?</span>
                <span>Sign up</span>
              </Link>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default LoginPage;
