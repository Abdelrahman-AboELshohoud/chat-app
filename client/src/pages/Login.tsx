import { Eye, EyeOff } from "lucide-react";
import { useState } from "react";
import { useForm } from "react-hook-form";
import { Link, useNavigate } from "react-router-dom";
import { useAuth } from "../lib/useAuth";

interface LoginForm {
  email: string;
  password: string;
}

export default function Login() {
  const [showPassword, setShowPassword] = useState(false);
  const navigate = useNavigate();
  const { getMe } = useAuth();

  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting, isLoading, isValid },
  } = useForm<LoginForm>();

  const submit = async (data: LoginForm) => {
    const { email, password } = data;
    try {
      const res = await fetch("/api/auth/login", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          email,
          password,
        }),
      });
    
      if (res.ok) {
        getMe();
        navigate("/");
      } 
    } catch (error) {
      console.log(error);
    }
  };

  const emailInput = {
    name: "Email",
    errors: errors.email,
  };

  const passwordInput = {
    name: "Password",
    errors: errors.password,
  };

  return (
    <section className="flex justify-center items-center  px-8">
      <div className="backdrop-blur-sm px-8 py-12 rounded-lg shadow-sm shadow-gray-700 w-full min-w-72 max-w-96">
        <h2 className="text-3xl font-bold mb-8 text-opacity-90 text-center text-gray-400">
          Welcome Back!
        </h2>
        <form className="space-y-6" onSubmit={handleSubmit(submit)}>
          <label className="text-gray-600 font-bold mb-2 relative flex flex-col gap-2">
            {emailInput.name}
            <input
              type="email"
              className="w-full px-3 py-2 border bg-opacity-50 bg-blue-950 shadow-inner rounded-md focus:outline-none text-gray-200"
              placeholder={`Enter your ${emailInput.name.toLowerCase()}`}
              {...register(emailInput.name.toLowerCase() as keyof LoginForm, {
                required: `${emailInput.name} is required`,
                minLength: {
                  value: 3,
                  message: `${emailInput.name} must be at least 3 characters`,
                },
                pattern: {
                  value: /^[^\s@]+@[^\s@]+\.[^\s@]+$/,
                  message: "Invalid email address",
                },
              })}
            />
            {emailInput.errors && (
              <p className="text-red-500">{emailInput.errors.message}</p>
            )}
          </label>

          <label className="text-gray-600 font-bold mb-2 relative flex flex-col gap-2">
            {passwordInput.name}
            <input
              type={showPassword ? "text" : "password"}
              className="w-full px-3 py-2 border bg-opacity-50 bg-blue-950 shadow-inner rounded-md focus:outline-none text-gray-200"
              placeholder={`Enter your ${passwordInput.name.toLowerCase()}`}
              {...register(
                passwordInput.name.toLowerCase() as keyof LoginForm,
                {
                  required: `${passwordInput.name} is required`,
                  minLength: {
                    value: 3,
                    message: `${passwordInput.name} must be at least 3 characters`,
                  },
                }
              )}
            />
            <button
              type="button"
              className="absolute right-3 top-10 cursor-pointer"
              onClick={() => setShowPassword(!showPassword)}
            >
              {showPassword ? (
                <Eye className="hover:text-blue-400 transition duration-150" />
              ) : (
                <EyeOff className="hover:text-blue-400 transition duration-150" />
              )}
            </button>
            {passwordInput.errors && (
              <p className="text-red-500">{passwordInput.errors.message}</p>
            )}
          </label>

          <div className="flex flex-col gap-2">
            <button
              disabled={isSubmitting || isLoading || !isValid}
              type="submit"
              className="w-full shadow-md bg-opacity-50 py-2 px-4 bg-orange-500 hover:bg-orange-400 rounded-md text-white font-bold transition duration-300 disabled:bg-gray-500 disabled:cursor-not-allowed"
            >
              {isSubmitting || isLoading ? "Signing In..." : "Sign In"}
            </button>
            <Link
              to="/forgot-password"
              className="text-blue-200 text-center font-bold select-none ml-auto text-sm hover:underline mb-2"
            >
              Forgot Password?
            </Link>
            <p className="text-gray-300 text-center select-none">
              Don't have an account?{" "}
              <Link
                to="/register"
                className="text-blue-500 hover:underline font-semibold"
              >
                Sign Up
              </Link>
            </p>
          </div>
        </form>
      </div>
    </section>
  );
}
