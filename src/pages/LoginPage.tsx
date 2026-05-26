import { Link } from "react-router";
import { LoginForm } from "../features/auth/components/LoginForm";

export function LoginPage() {
  return (
    <div className="min-h-screen flex items-center justify-center bg-graphite px-4">
      <div className="w-full max-w-md">
        {/* Header */}
        <div className="text-center mb-8">
          <h1 className="text-4xl font-semibold text-highlight-green mb-2">
            Bem-vindo(a) de volta
          </h1>
          <p className="text-medium-gray">
            Entre com suas credenciais para continuar
          </p>
        </div>

        {/* Login Card */}
        <div className="bg-dark-gray rounded-xl p-8 shadow-2xl border border-gray">
          <LoginForm />

          {/* Register Link */}
          <div className="mt-6 text-center">
            <p className="text-medium-gray">
              Não tem uma conta?{" "}
              <Link
                to="/register"
                className="text-highlight-green hover:text-pastel-green transition font-medium"
              >
                Registre-se
              </Link>
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
