import { GoogleIcon } from "./GoogleIcon";

export function GoogleLoginButton() {
  const handleClick = () => {
    window.location.href = "http://localhost:3001/auth/google";
  };

  return (
    <button
      type="button"
      onClick={handleClick}
      className="flex items-center justify-center gap-3 w-full bg-white text-gray-800 border border-gray-300 rounded-lg px-4 py-3 hover:bg-gray-50 font-prompt"
    >
      <GoogleIcon className="w-6 h-6" />
      Entrar com Google
    </button>
  );
}
