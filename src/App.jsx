import React from "react";
import { AnimatePresence } from "framer-motion";
import AppRoutes from "./routes/AppRoutes";
import { useAuthContext } from "./context/AuthContext";
import Preloader from "./components/ui/Preloader";

const App = () => {
  const { loading } = useAuthContext();

  return (
    <>
      <AnimatePresence>{loading && <Preloader />}</AnimatePresence>
      {!loading && <AppRoutes />}
    </>
  );
};

export default App;
