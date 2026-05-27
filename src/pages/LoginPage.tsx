import { GoogleLoginButton } from "../features/auth/components/GoogleLoginButton";
import { LoginForm } from "../features/auth/components/LoginForm";
import { Link } from "react-router";
import { useSearchParams } from "react-router";

export function LoginPage() {
  const [searchParams] = useSearchParams();
  const error = searchParams.get("error");

  return (
    <div>
      {error && (
        <div className="bg-red-500/10 border border-red-500 text-red-500 px-4 py-3 rounded mb-4">
          {error}
        </div>
      )}
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
            <div className="flex items-center gap-4 my-6">
              <div className="flex-1 border-t border-gray">
                <span className="flex items-center justify-center text-medium-gray text-sm my-4">
                  ou
                </span>
              </div>
            </div>
            <GoogleLoginButton />

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
    </div>
  );
}
