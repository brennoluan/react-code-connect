import { useNavigate, useSearchParams } from "react-router";
import { useAuth } from "../features/auth/hooks/useAuth";
import { useEffect, useRef } from "react";
import { toast } from "react-toastify";
import { authService } from "../features/auth/services/authService";
import { LoadingComponent } from "../features/auth/components/LoadingComponent";

export function AuthCallbackPage() {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const { setAuth } = useAuth();
  const hasProcessed = useRef(false);

  useEffect(() => {
    // Prevenir múltiplas execuções (React Strict Mode)
    if (hasProcessed.current) return;
    hasProcessed.current = true;

    const process = async () => {
      const token = searchParams.get("token");
      const error = searchParams.get("error");

      if (error) {
        toast.error(`Erro ao fazer login com Google: ${error}`);
        navigate(`/login?error=${error}`);
        return;
      }

      if (!token) {
        toast.error("Token de autenticação não encontrado");
        navigate(`/login?error=token_not_found`);
        return;
      }

      try {
        const response = await authService.refresh();
        setAuth(response);
        toast.success("Login realizado com sucesso!");
        navigate("/");
      } catch {
        toast.error("Erro ao fazer login com Google");
        navigate(`/login?error=auth_failed`);
        return;
      }
    };
    process();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  return <LoadingComponent />;
}
