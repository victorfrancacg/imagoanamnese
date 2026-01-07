import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import Index from "./pages/Index";
import NotFound from "./pages/NotFound";

// Technician module imports
import { ProtectedRoute } from "@/components/tecnico/ProtectedRoute";
import { TechnicianLayout } from "@/components/tecnico/TechnicianLayout";
import Login from "./pages/tecnico/Login";
import Dashboard from "./pages/tecnico/Dashboard";
import QuestionnaireList from "./pages/tecnico/QuestionnaireList";
import QuestionnaireDetail from "./pages/tecnico/QuestionnaireDetail";
import QuestionnaireReview from "./pages/tecnico/QuestionnaireReview";
import QuestionnaireSignature from "./pages/tecnico/QuestionnaireSignature";

const queryClient = new QueryClient();

const App = () => (
  <QueryClientProvider client={queryClient}>
    <TooltipProvider>
      <Toaster />
      <Sonner />
      <BrowserRouter>
        <Routes>
          {/* Patient route - DO NOT MODIFY */}
          <Route path="/" element={<Index />} />

          {/* Technician routes */}
          <Route path="/tecnico/login" element={<Login />} />
          <Route
            path="/tecnico"
            element={
              <ProtectedRoute>
                <TechnicianLayout />
              </ProtectedRoute>
            }
          >
            <Route index element={<Dashboard />} />
            <Route path="questionarios" element={<QuestionnaireList />} />
            <Route path="questionario/:id" element={<QuestionnaireDetail />} />
            <Route path="questionario/:id/revisao" element={<QuestionnaireReview />} />
            <Route path="questionario/:id/assinatura" element={<QuestionnaireSignature />} />
          </Route>

          {/* ADD ALL CUSTOM ROUTES ABOVE THE CATCH-ALL "*" ROUTE */}
          <Route path="*" element={<NotFound />} />
        </Routes>
      </BrowserRouter>
    </TooltipProvider>
  </QueryClientProvider>
);

export default App;
