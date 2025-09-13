import { BrowserRouter } from "react-router-dom";
import { motion } from "framer-motion";

import { DevHelper } from "@/components/DevHelper";
import { AppProviders } from "@/components/AppProviders";
import { AppRoutes } from "@/routes";

const App = () => (
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

export default App;