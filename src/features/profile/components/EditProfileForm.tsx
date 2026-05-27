import { useState } from "react";
import { useForm, Controller } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { Eye, EyeOff, Loader2 } from "lucide-react";
import { toast } from "react-toastify";
import {
  editProfileSchema,
  type EditProfileFormData,
} from "../schemas/editProfileSchema";
import { profileService } from "../services/profileService";
import { useAuth } from "../../auth/hooks/useAuth";
import { CategorySelector } from "./CategorySelector";

export function EditProfileForm() {
  const [showPassword, setShowPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const { user, setAuth, accessToken } = useAuth();

  const {
    register,
    handleSubmit,
    control,
    formState: { errors },
  } = useForm<EditProfileFormData>({
    resolver: zodResolver(editProfileSchema),
    defaultValues: {
      name: user?.name || "",
      email: user?.email || "",
      password: "",
      description: user?.description || "",
      categories: user?.categories || [],
    },
  });

  const onSubmit = async (data: EditProfileFormData) => {
    if (!user) return;

    setIsLoading(true);
    try {
      // Remover password se estiver vazia
      const updateData = { ...data };
      if (!updateData.password || updateData.password.trim() === "") {
        delete updateData.password;
      }

      const updatedUser = await profileService.updateProfile(
        user.id,
        updateData,
      );

      // Atualizar contexto de auth mantendo o accessToken atual
      setAuth({
        user: updatedUser,
        accessToken: accessToken || "", // Mantém o token existente no contexto
      });

      toast.success("Perfil atualizado com sucesso!");
    } catch (error) {
      const message =
        error instanceof Error ? error.message : "Erro ao atualizar perfil";
      toast.error(message);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-6 max-w-2xl">
      {/* Nome */}
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

      {/* Email */}
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

      {/* Senha */}
      <div>
        <label
          htmlFor="password"
          className="block text-sm font-medium text-offwhite mb-2"
        >
          Nova Senha (opcional)
        </label>
        <div className="relative">
          <input
            {...register("password")}
            type={showPassword ? "text" : "password"}
            id="password"
            disabled={isLoading}
            className="w-full px-4 py-3 bg-dark-gray text-white rounded-lg border border-gray focus:border-highlight-green focus:outline-none focus:ring-2 focus:ring-highlight-green/50 disabled:opacity-50 disabled:cursor-not-allowed transition pr-12"
            placeholder="Deixe em branco para manter a atual"
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
      </div>

      {/* Descrição */}
      <div>
        <label
          htmlFor="description"
          className="block text-sm font-medium text-offwhite mb-2"
        >
          Descrição
        </label>
        <textarea
          {...register("description")}
          id="description"
          disabled={isLoading}
          rows={4}
          className="w-full px-4 py-3 bg-dark-gray text-white rounded-lg border border-gray focus:border-highlight-green focus:outline-none focus:ring-2 focus:ring-highlight-green/50 disabled:opacity-50 disabled:cursor-not-allowed transition resize-none"
          placeholder="Conte um pouco sobre você e suas habilidades..."
        />
        {errors.description && (
          <p className="mt-1 text-sm text-red-500">
            {errors.description.message}
          </p>
        )}
      </div>

      {/* Categories */}
      <div>
        <Controller
          name="categories"
          control={control}
          render={({ field }) => (
            <CategorySelector
              value={field.value || []}
              onChange={field.onChange}
              disabled={isLoading}
            />
          )}
        />
        {errors.categories && (
          <p className="mt-1 text-sm text-red-500">
            {errors.categories.message}
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
            Salvando...
          </>
        ) : (
          "Salvar Alterações"
        )}
      </button>
    </form>
  );
}
