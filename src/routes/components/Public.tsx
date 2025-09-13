import { Suspense, type ReactNode } from "react";
import { Loader2 } from "lucide-react";

type Props = {
  children: ReactNode;
};

export function PublicRoute({ children }: Props) {
  return (
    <Suspense
      fallback={
        <div className="flex items-center justify-center min-h-screen">
          <Loader2 className="h-8 w-8 animate-spin" />
        </div>
      }
    >
      {children}
    </Suspense>
  );
}
