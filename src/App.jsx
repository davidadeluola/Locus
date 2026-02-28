import React from "react";
import { AnimatePresence } from "framer-motion";
import AppRoutes from "./routes/AppRoutes";
import { useAuthContext } from "./context/AuthContext";
import Preloader from "./components/ui/Preloader";
import { Toaster } from 'sonner';
import ErrorBoundary from './components/ErrorBoundary';

const App = () => {
  const { loading, activeSession } = useAuthContext();

  return (
    <ErrorBoundary
      fallback={
        activeSession ? (
          <div className="p-6 max-w-xl mx-auto mt-12 bg-zinc-900 border border-orange-800 rounded-lg">
            <h3 className="text-orange-400 font-semibold mb-2">OTP Created</h3>
            <p className="text-sm text-zinc-400 mb-4">An OTP was generated for your session. Refresh the page to view it.</p>
            <div className="flex gap-2">
              <button onClick={() => window.location.reload()} className="px-4 py-2 bg-orange-600 text-white rounded">Refresh</button>
            </div>
          </div>
        ) : (
          <div className="p-6 max-w-xl mx-auto mt-12 bg-zinc-900 border border-red-800 rounded-lg">
            <h3 className="text-red-400 font-semibold mb-2">Something went wrong</h3>
            <p className="text-sm text-zinc-400 mb-4">An unexpected error occurred. You can reload the page to try again.</p>
            <div className="flex gap-2">
              <button onClick={() => window.location.reload()} className="px-4 py-2 bg-red-600 text-white rounded">Reload</button>
            </div>
          </div>
        )
      }
    >
      <Toaster position="top-right" richColors={false} visibleToasts={1} closeButton={false} />
      <AnimatePresence>{loading && <Preloader />}</AnimatePresence>
      {!loading && <AppRoutes />}
    </ErrorBoundary>
  );
};

export default App;
