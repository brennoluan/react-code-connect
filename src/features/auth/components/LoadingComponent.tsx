import { Loader2 } from "lucide-react";

export function LoadingComponent() {
  return (
    <div className="min-h-screen bg-graphite flex items-center justify-center">
      <div className="text-center">
        <Loader2
          className="animate-spin text-highlight-green mx-auto mb-4"
          size={48}
        />
        <p className="text-medium-gray">Carregando...</p>
      </div>
    </div>
  );
}
