import { useState } from "react";
import { useAuth } from "../hooks/useAuth";
import { useNavigate } from "react-router";
import { useForm } from "react-hook-form";
import {
  registerSchema,
  type RegisterFormData,
} from "../schemas/registerSchema";
import { zodResolver } from "@hookform/resolvers/zod";
import { authService } from "../services/authService";
import { toast } from "react-toastify";
import { Eye, EyeOff, Loader2 } from "lucide-react";

export function RegisterForm() {
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const { setAuth } = useAuth();
  const navigate = useNavigate();

  const {
    register,
    handleSubmit,
    watch,
    formState: { errors },
  } = useForm<RegisterFormData>({
    resolver: zodResolver(registerSchema),
  });

  const password = watch("password");

  const calculatePasswordStrength = (pwd: string) => {
    if (!pwd) return 0;
    let strength = 0;
    if (pwd.length >= 6) strength++;
    if (/[A-Z]/.test(pwd) && /[a-z]/.test(pwd)) strength++;
    if (/[0-9]/.test(pwd)) strength++;
    if (/[^A-Za-z0-9]/.test(pwd)) strength++;
    return strength;
  };

  const passwordStrength = calculatePasswordStrength(password);

  const strengthColors = [
    "bg-red-500",
    "bg-red-500",
    "bg-yellow-500",
    "bg-highlight-green",
    "bg-highlight-green",
  ];

  const strengthLabels = [
    "Muito Fraca",
    "Fraca",
    "Média",
    "Forte",
    "Muito Forte",
  ];

  const onSubmit = async (data: RegisterFormData) => {
    setIsLoading(true);
    try {
      const response = await authService.register(data);
      setAuth(response);
      toast.success("Cadastro realizado com sucesso!");
      navigate("/");
    } catch (error) {
      const message =
        error instanceof Error ? error.message : "Erro ao fazer cadastro";
      toast.error(message);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
      {/* Name Field */}
      <div>
        <label
          htmlFor="name"
          className="block text-sm font-medium text-offwhite mb-2"
        >
          Nome
        </label>
        <input
          {...register("name")}
          type="text"
          id="name"
          disabled={isLoading}
          className="w-full px-4 py-3 bg-dark-gray text-white rounded-lg border border-gray focus:border-highlight-green focus:outline-none focus:ring-2 focus:ring-highlight-green/50 disabled:opacity-50 disabled:cursor-not-allowed transition"
          placeholder="Seu nome completo"
        />
        {errors.name && (
          <p className="mt-1 text-sm text-red-500">{errors.name.message}</p>
        )}
      </div>

      {/* Email Field */}
      <div>
        <label
          htmlFor="email"
          className="block text-sm font-medium text-offwhite mb-2"
        >
          Email
        </label>
        <input
          {...register("email")}
          type="email"
          id="email"
          disabled={isLoading}
          className="w-full px-4 py-3 bg-dark-gray text-white rounded-lg border border-gray focus:border-highlight-green focus:outline-none focus:ring-2 focus:ring-highlight-green/50 disabled:opacity-50 disabled:cursor-not-allowed transition"
          placeholder="seu@email.com"
        />
        {errors.email && (
          <p className="mt-1 text-sm text-red-500">{errors.email.message}</p>
        )}
      </div>

      {/* Password Field */}
      <div>
        <label
          htmlFor="password"
          className="block text-sm font-medium text-offwhite mb-2"
        >
          Senha
        </label>
        <div className="relative">
          <input
            {...register("password")}
            type={showPassword ? "text" : "password"}
            id="password"
            disabled={isLoading}
            className="w-full px-4 py-3 bg-dark-gray text-white rounded-lg border border-gray focus:border-highlight-green focus:outline-none focus:ring-2 focus:ring-highlight-green/50 disabled:opacity-50 disabled:cursor-not-allowed transition pr-12"
            placeholder="••••••••"
          />
          <button
            type="button"
            onClick={() => setShowPassword(!showPassword)}
            disabled={isLoading}
            className="absolute right-3 top-1/2 -translate-y-1/2 text-medium-gray hover:text-white transition disabled:opacity-50"
          >
            {showPassword ? <EyeOff size={20} /> : <Eye size={20} />}
          </button>
        </div>
        {errors.password && (
          <p className="mt-1 text-sm text-red-500">{errors.password.message}</p>
        )}

        {/* Password Strength Indicator */}
        {password && (
          <div className="mt-2">
            <div className="flex gap-1 mb-1">
              {[0, 1, 2, 3].map((index) => (
                <div
                  key={index}
                  className={`h-1 flex-1 rounded ${
                    index < passwordStrength
                      ? strengthColors[passwordStrength]
                      : "bg-gray"
                  }`}
                />
              ))}
            </div>
            <p
              className={`text-xs ${
                passwordStrength >= 3
                  ? "text-highlight-green"
                  : "text-medium-gray"
              }`}
            >
              {strengthLabels[passwordStrength]}
            </p>
          </div>
        )}
      </div>

      {/* Confirm Password Field */}
      <div>
        <label
          htmlFor="confirmPassword"
          className="block text-sm font-medium text-offwhite mb-2"
        >
          Confirmar Senha
        </label>
        <div className="relative">
          <input
            {...register("confirmPassword")}
            type={showConfirmPassword ? "text" : "password"}
            id="confirmPassword"
            disabled={isLoading}
            className="w-full px-4 py-3 bg-dark-gray text-white rounded-lg border border-gray focus:border-highlight-green focus:outline-none focus:ring-2 focus:ring-highlight-green/50 disabled:opacity-50 disabled:cursor-not-allowed transition pr-12"
            placeholder="••••••••"
          />
          <button
            type="button"
            onClick={() => setShowConfirmPassword(!showConfirmPassword)}
            disabled={isLoading}
            className="absolute right-3 top-1/2 -translate-y-1/2 text-medium-gray hover:text-white transition disabled:opacity-50"
          >
            {showConfirmPassword ? <EyeOff size={20} /> : <Eye size={20} />}
          </button>
        </div>
        {errors.confirmPassword && (
          <p className="mt-1 text-sm text-red-500">
            {errors.confirmPassword.message}
          </p>
        )}
      </div>

      {/* Submit Button */}
      <button
        type="submit"
        disabled={isLoading}
        className="w-full bg-highlight-green text-graphite font-semibold py-3 px-4 rounded-lg hover:bg-pastel-green transition disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
      >
        {isLoading ? (
          <>
            <Loader2 className="animate-spin" size={20} />
            Criando conta...
          </>
        ) : (
          "Criar conta"
        )}
      </button>
    </form>
  );
}
