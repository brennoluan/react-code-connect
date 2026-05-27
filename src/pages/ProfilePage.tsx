import { useAuth } from "../features/auth/hooks/useAuth";
import { EditProfileForm } from "../features/profile/components/EditProfileForm";

export function ProfilePage() {
  const { user } = useAuth();
  return (
    <div className="p-8">
      <div className="mb-8">
        <h1 className="font-prompt text-4xl font-semibold text-highlight-green mb-6">
          Perfil
        </h1>
        <p className="font-prompt text-lg text-medium-gray">
          Olá, {user?.name}! Edite suas informações abaixo.
        </p>
      </div>
      <EditProfileForm />
    </div>
  );
}
