import { useForm } from "react-hook-form";
import { Link, useNavigate } from "react-router-dom";
import { Eye, EyeOff } from "lucide-react";
import { useState } from "react";
import { useAuth } from "../lib/useAuth";

interface RegisterForm {
  "full name": string;
  email: string;
  username: string;
  gender: "male" | "female";
  password: string;
  "confirm password": string;
}

export default function Register() {
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const navigate = useNavigate();
  const { getMe } = useAuth();

  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting, isLoading, isValid },
    watch,
  } = useForm<RegisterForm>();

  const submit = async (data: RegisterForm) => {
    const { email, username, gender, password } = data;

    try {
      const res = await fetch("/api/auth/register", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          fullname: data["full name"],
          email,
          username,
          gender,
          password,
          confirmPassword: data["confirm password"],
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

  const inputs = [
    { name: "Full Name", errors: errors["full name"] },
    {
      name: "Username",
      errors: errors.username,
    },
    { name: "Email", errors: errors.email },
  ];
  const secretInputs = [
    {
      name: "Password",
      placeholder: "Enter your password",
      errors: errors.password,
      type: showPassword ? "text" : "password",
      function: setShowPassword,
    },
    {
      name: "Confirm password",
      placeholder: "Confirm your password",
      errors: errors["confirm password"],
      type: showConfirmPassword ? "text" : "password",
      function: setShowConfirmPassword,
    },
  ];
  return (
    <section className="flex justify-center items-center  px-8">
      <div className="backdrop-blur-sm px-8 py-12 rounded-lg shadow-sm shadow-gray-700 w-full min-w-72 max-w-96">
        <h2 className="text-3xl font-bold mb-8 text-opacity-90 text-center text-gray-400">
          Welcome To Our Website
        </h2>
        <form className="space-y-6" onSubmit={handleSubmit(submit)}>
          {inputs.map((input) => (
            <label
              className="text-gray-600 font-bold mb-2 flex flex-col gap-2"
              key={input.name}
            >
              {input.name}
              <input
                type="text"
                className="w-full px-3 py-2 border bg-opacity-50 bg-blue-950 shadow-inner rounded-md focus:outline-none text-gray-200"
                placeholder={`Enter your ${input.name.toLowerCase()}`}
                {...register(input.name.toLowerCase() as keyof RegisterForm, {
                  required: `${input.name} is required`,
                  minLength: {
                    value: input.name.toLowerCase() !== "email" ? 3 : 0,
                    message: `${input.name} must be at least 3 characters`,
                  },
                  ...(input.name.toLowerCase() === "email" && {
                    pattern: {
                      value: /^[^\s@]+@[^\s@]+\.[^\s@]+$/,
                      message: "Invalid email address",
                    },
                  }),
                })}
              />
              {input.errors && (
                <p className="text-red-500">{input.errors.message}</p>
              )}
            </label>
          ))}
          <div className="text-gray-600 font-bold mb-2 flex flex-col gap-2 ">
            Gender
            <div className="flex gap-6">
              <label className="cursor-pointer flex">
                <input
                  type="radio"
                  value="male"
                  checked={watch("gender") === "male"}
                  className="mr-2 cursor-pointer "
                  {...register("gender", {
                    required: "Gender is required",
                  })}
                />
                Male
              </label>
              <label className="cursor-pointer flex">
                <input
                  type="radio"
                  value="female"
                  checked={watch("gender") === "female"}
                  className="mr-2 cursor-pointer "
                  {...register("gender", {
                    required: "Gender is required",
                  })}
                />
                Female
              </label>
            </div>
            {errors.gender && (
              <p className="text-red-500">{errors.gender.message}</p>
            )}
          </div>
          {secretInputs.map((input) => (
            <label
              className="text-gray-600 font-bold mb-2 flex flex-col gap-2 relative"
              key={input.name}
            >
              {input.name}
              <input
                type="password"
                className="w-full px-3 py-2 border bg-opacity-50 bg-blue-950 shadow-inner rounded-md focus:outline-none text-gray-200"
                placeholder={input.placeholder}
                {...register(input.name.toLowerCase() as keyof RegisterForm, {
                  required: `${input.name} is required`,
                  minLength: {
                    value: 6,
                    message: `${input.name} must be at least 6 characters`,
                  },
                  validate:
                    input.name.toLowerCase() === "confirm password"
                      ? (value) =>
                          value === watch("password") ||
                          "Passwords do not match"
                      : undefined,
                })}
              />
              <button
                type="button"
                className="absolute right-3 top-10 cursor-pointer"
                onClick={() => input.function((prev) => !prev)}
              >
                {input.type === "password" ? (
                  <Eye className="hover:text-blue-400 transition duration-150" />
                ) : (
                  <EyeOff className="hover:text-blue-400 transition duration-150" />
                )}
              </button>
              {input.errors && (
                <p className="text-red-500">{input.errors.message}</p>
              )}
            </label>
          ))}
          <button
            type="submit"
            disabled={isSubmitting || isLoading || !isValid}
            className="w-full shadow-md bg-opacity-50 py-2 px-4 bg-orange-500 hover:bg-orange-400 rounded-md text-white font-bold transition duration-300 disabled:bg-gray-500 disabled:cursor-not-allowed"
          >
            {isSubmitting || isLoading ? "Signing Up..." : "Sign Up"}
          </button>
          <p className="text-gray-300 text-center select-none">
            Already have an account?{" "}
            <Link
              to="/login"
              className="text-blue-500 hover:underline font-semibold"
            >
              {" "}
              Log In
            </Link>
          </p>
        </form>
      </div>
    </section>
  );
}
