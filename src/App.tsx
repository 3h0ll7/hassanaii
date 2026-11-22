import { lazy, Suspense } from "react";
import { BrowserRouter, Navigate, Route, Routes } from "react-router-dom";
import { LanguageProvider } from "@/contexts/LanguageContext";
import Portfolio from "./pages/Portfolio";
// Three.js is heavy: load the space journey only when someone opens it.
const Space = lazy(() => import("./pages/Space"));
import NotFound from "./pages/NotFound";

const App = () => (
  <LanguageProvider>
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<Portfolio />} />
        {/* The space journey of tech projects moved here; the footer links to it. */}
        <Route path="/space" element={<Suspense fallback={null}><Space /></Suspense>} />
        {/* Old addresses keep working. */}
        <Route path="/classic" element={<Navigate to="/" replace />} />
        <Route path="/projects" element={<Navigate to="/space" replace />} />
        <Route path="*" element={<NotFound />} />
      </Routes>
    </BrowserRouter>
  </LanguageProvider>
);

export default App;
