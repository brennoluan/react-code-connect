import { RegisterForm } from "../features/auth/components/RegisterForm";
import { Link } from "react-router";

export function RegisterPage() {
  return (
    <div className="min-h-screen flex items-center justify-center bg-graphite px-4">
      <div className="w-full max-w-md">
        {/* Header */}
        <div className="text-center mb-8">
          <h1 className="text-4xl font-semibold text-highlight-green mb-2">
            Crie sua conta
          </h1>
          <p className="text-medium-gray">
            Preencha os dados abaixo para começar
          </p>
        </div>

        {/* Register Card */}
        <div className="bg-dark-gray rounded-xl p-8 shadow-2xl border border-gray">
          <RegisterForm />

          {/* Login Link */}
          <div className="mt-6 text-center">
            <p className="text-medium-gray">
              Já tem uma conta?{" "}
              <Link
                to="/login"
                className="text-highlight-green hover:text-pastel-green transition font-medium"
              >
                Faça login
              </Link>
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
