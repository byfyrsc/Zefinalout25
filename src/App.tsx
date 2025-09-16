import { BrowserRouter } from "react-router-dom";
import { motion } from "framer-motion";
import { useEffect, Suspense } from "react";
import { Loader2 } from "lucide-react";

import { DevHelper } from "@/components/DevHelper";
import { AppProviders } from "@/components/AppProviders";
import { AppRoutes } from "@/routes";
import { useUIStore } from "@/stores/uiStore";
import { PWAInstallPrompt } from "@/components/performance/PWAInstallPrompt"; // Importar PWAInstallPrompt

const App = () => {
  const { isDarkMode } = useUIStore();

  useEffect(() => {
    if (isDarkMode) {
      document.documentElement.classList.add("dark");
    } else {
      document.documentElement.classList.remove("dark");
    }
  }, [isDarkMode]);

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ duration: 0.5 }}
    >
      <AppProviders>
        <BrowserRouter>
          <Suspense
            fallback={
              <div className="flex items-center justify-center min-h-screen">
                <Loader2 className="h-8 w-8 animate-spin" />
              </div>
            }
          >
            <AppRoutes />
          </Suspense>
          <DevHelper />
          <PWAInstallPrompt /> {/* Renderizar o PWAInstallPrompt aqui */}
        </BrowserRouter>
      </AppProviders>
    </motion.div>
  );
};

export default App;
