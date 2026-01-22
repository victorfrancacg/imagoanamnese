import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import Index from "./pages/Index";
import NotFound from "./pages/NotFound";

// Technician module imports
import { AuthProvider } from "@/contexts/AuthContext";
import { ProtectedRoute } from "@/components/tecnico/ProtectedRoute";
import { TechnicianLayout } from "@/components/tecnico/TechnicianLayout";
import Login from "./pages/tecnico/Login";
import Register from "./pages/tecnico/Register";
import QuestionnaireList from "./pages/tecnico/QuestionnaireList";
import QuestionnaireDetail from "./pages/tecnico/QuestionnaireDetail";
import QuestionnaireReview from "./pages/tecnico/QuestionnaireReview";
import QuestionnaireSignature from "./pages/tecnico/QuestionnaireSignature";
import MamografiaDesenho from "./pages/tecnico/MamografiaDesenho";

// Admin module imports
import { AdminAuthProvider } from "@/contexts/AdminAuthContext";
import { ProtectedRoute as AdminProtectedRoute } from "@/components/admin/ProtectedRoute";
import { AdminLayout } from "@/components/admin/AdminLayout";
import AdminLogin from "./pages/admin/Login";
import AdminDashboard from "./pages/admin/Dashboard";
import PendingTechnicians from "./pages/admin/PendingTechnicians";

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

          {/* Technician routes - wrapped with AuthProvider */}
          <Route path="/tecnico/login" element={<AuthProvider><Login /></AuthProvider>} />
          <Route path="/tecnico/register" element={<Register />} />
          <Route
            path="/tecnico"
            element={
              <AuthProvider>
                <ProtectedRoute>
                  <TechnicianLayout />
                </ProtectedRoute>
              </AuthProvider>
            }
          >
            <Route index element={<Navigate to="/tecnico/questionarios" replace />} />
            <Route path="questionarios" element={<QuestionnaireList />} />
            <Route path="questionario/:id" element={<QuestionnaireDetail />} />
            <Route path="questionario/:id/desenho-mamas" element={<MamografiaDesenho />} />
            <Route path="questionario/:id/revisao" element={<QuestionnaireReview />} />
            <Route path="questionario/:id/assinatura" element={<QuestionnaireSignature />} />
          </Route>

          {/* Admin routes - wrapped with AdminAuthProvider */}
          <Route path="/admin/login" element={<AdminAuthProvider><AdminLogin /></AdminAuthProvider>} />
          <Route
            path="/admin"
            element={
              <AdminAuthProvider>
                <AdminProtectedRoute>
                  <AdminLayout />
                </AdminProtectedRoute>
              </AdminAuthProvider>
            }
          >
            <Route index element={<AdminDashboard />} />
            <Route path="tecnicos-pendentes" element={<PendingTechnicians />} />
          </Route>

          {/* ADD ALL CUSTOM ROUTES ABOVE THE CATCH-ALL "*" ROUTE */}
          <Route path="*" element={<NotFound />} />
        </Routes>
      </BrowserRouter>
    </TooltipProvider>
  </QueryClientProvider>
);

export default App;
