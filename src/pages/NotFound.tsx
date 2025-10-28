import { Link, useLocation } from "react-router-dom";
import { useEffect } from "react";
import { Button } from "@/components/ui/button";
import { ArrowLeft, SearchX, Sparkles } from "lucide-react";
import { motion } from "framer-motion";

const NotFoundPage = () => {
  const location = useLocation();

  useEffect(() => {
    console.error(
      `404 Not Found: User tried to access a non-existent route: ${location.pathname}`
    );
  }, [location.pathname]);

  return (
    <div className="min-h-screen w-full flex flex-col items-center justify-center p-4 bg-muted/30">
      <motion.div 
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
        className="absolute top-6 left-6"
      >
        <Link to="/" className="flex items-center space-x-2">
          <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-primary text-primary-foreground">
            <Sparkles className="h-5 w-5" />
          </div>
          <span className="text-2xl font-bold">DigaZÉ</span>
        </Link>
      </motion.div>

      <motion.div 
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
        className="text-center space-y-6"
      >
        <div className="relative flex justify-center items-center">
          <motion.span 
            initial={{ opacity: 0, scale: 0.8 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.5, delay: 0.1 }}
            className="text-[12rem] font-bold text-primary/10 leading-none"
          >
            404
          </motion.span>
          <motion.div
            initial={{ opacity: 0, scale: 0.8 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.5, delay: 0.2 }}
          >
            <SearchX className="absolute h-24 w-24 text-primary/80" />
          </motion.div>
        </div>
        
        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.3 }}
          className="space-y-2"
        >
          <h1 className="text-3xl font-bold tracking-tight text-foreground sm:text-4xl">
            Página não encontrada
          </h1>
          <p className="text-lg text-muted-foreground">
            Oops! Parece que a página que você está procurando não existe.
          </p>
        </motion.div>

        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.4 }}
          className="flex items-center justify-center gap-4"
        >
          <Button variant="outline" asChild>
            <Link to={-1 as any}> {/* Go back to previous page */}
              <ArrowLeft className="mr-2 h-4 w-4" />
              Voltar
            </Link>
          </Button>
          <Button asChild>
            <Link to="/">
              Ir para o Início
            </Link>
          </Button>
        </motion.div>
      </motion.div>
    </div>
  );
};

export default NotFoundPage;