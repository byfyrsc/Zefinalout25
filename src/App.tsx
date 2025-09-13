import { BrowserRouter } from "react-router-dom";
import { motion } from "framer-motion";
import { useEffect } from "react"; // Importar useEffect

import { DevHelper } from "@/components/DevHelper";
import { AppProviders } from "@/components/AppProviders";
import { AppRoutes } from "@/routes";
import { useUIStore } from "@/stores/uiStore"; // Importar useUIStore

const App = () => {
  const { isDarkMode } = useUIStore(); // Obter o estado isDarkMode

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
          <AppRoutes />
          <DevHelper />
        </BrowserRouter>
      </AppProviders>
    </motion.div>
  );
};

export default App;