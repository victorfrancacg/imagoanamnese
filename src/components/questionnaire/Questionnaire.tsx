import { useState, useCallback } from "react";
import { ProgressBar } from "./ProgressBar";
import { TipoExameStep } from "./steps/TipoExameStep";
import { DadosPessoaisStep } from "./steps/DadosPessoaisStep";
import { LGPDStep } from "./steps/LGPDStep";
import { SegurancaStep } from "./steps/SegurancaStep";
import { ClinicasStep } from "./steps/ClinicasStep";
import { RevisaoStep } from "./steps/RevisaoStep";
import { ConsentimentoStep } from "./steps/ConsentimentoStep";
import { Summary } from "./Summary";
import { QuestionnaireData, initialData } from "@/types/questionnaire";
import { saveQuestionario } from "@/hooks/useQuestionarioSave";
import imagoLogo from "@/assets/imago-logo.png";

export function Questionnaire() {
  const [currentStep, setCurrentStep] = useState(1);
  const [data, setData] = useState<QuestionnaireData>(initialData);
  const [isCompleted, setIsCompleted] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [savedId, setSavedId] = useState<string | null>(null);
  const [pdfUrl, setPdfUrl] = useState<string | null>(null);

  const totalSteps = 7; // Tipo Exame, Dados Pessoais, LGPD, Segurança, Clínicas, Revisão, Consentimento

  const updateData = useCallback((updates: Partial<QuestionnaireData>) => {
    setData((prev) => ({ ...prev, ...updates }));
  }, []);

  const handleNext = useCallback(async () => {
    if (currentStep === totalSteps) {
      // Save to database when completing the questionnaire
      setIsSaving(true);
      const result = await saveQuestionario(data);
      setIsSaving(false);
      
      if (result.success) {
        setSavedId(result.id || null);
        setPdfUrl(result.pdfUrl || null);
        setIsCompleted(true);
      }
    } else {
      setCurrentStep((prev) => prev + 1);
    }
  }, [currentStep, totalSteps, data]);

  const handleBack = useCallback(() => {
    setCurrentStep((prev) => Math.max(1, prev - 1));
  }, []);

  const handleEditStep = useCallback((step: number) => {
    setCurrentStep(step);
  }, []);

  const handleReset = useCallback(() => {
    setData(initialData);
    setCurrentStep(1);
    setIsCompleted(false);
    setSavedId(null);
    setPdfUrl(null);
  }, []);

  const renderStep = () => {
    if (isCompleted) {
      return <Summary data={data} onReset={handleReset} savedId={savedId} />;
    }

    switch (currentStep) {
      case 1:
        return (
          <TipoExameStep
            data={data}
            updateData={updateData}
            onNext={handleNext}
          />
        );
      case 2:
        return (
          <DadosPessoaisStep
            data={data}
            updateData={updateData}
            onNext={handleNext}
            onBack={handleBack}
          />
        );
      case 3:
        return (
          <LGPDStep
            data={data}
            updateData={updateData}
            onNext={handleNext}
            onBack={handleBack}
          />
        );
      case 4:
        return (
          <SegurancaStep
            data={data}
            updateData={updateData}
            onNext={handleNext}
            onBack={handleBack}
          />
        );
      case 5:
        return (
          <ClinicasStep
            data={data}
            updateData={updateData}
            onNext={handleNext}
            onBack={handleBack}
          />
        );
      case 6:
        return (
          <RevisaoStep
            data={data}
            onNext={handleNext}
            onBack={handleBack}
            onEditStep={handleEditStep}
          />
        );
      case 7:
        return (
          <ConsentimentoStep
            data={data}
            updateData={updateData}
            onNext={handleNext}
            onBack={handleBack}
            isSaving={isSaving}
          />
        );
      default:
        return null;
    }
  };

  const getExamTypeLabel = () => {
    const labels: Record<string, string> = {
      'tomografia': 'Tomografia Computadorizada',
      'ressonancia': 'Ressonância Magnética',
      'densitometria': 'Densitometria Óssea',
      'mamografia': 'Mamografia',
    };
    return data.tipoExame ? labels[data.tipoExame] : 'Selecione o tipo de exame';
  };

  return (
    <div className="min-h-screen bg-background py-4 sm:py-6 md:py-8 px-3 sm:px-4">
      <div className="max-w-2xl mx-auto">
        {/* Header */}
        <div className="text-center mb-4 sm:mb-6 md:mb-8 animate-fade-in">
          <img 
            src={imagoLogo} 
            alt="IMAGO - Diagnóstico por Imagem" 
            className="h-10 sm:h-12 md:h-16 mx-auto mb-2 sm:mb-4 object-contain"
          />
          {currentStep > 1 && data.tipoExame && (
            <p className="text-muted-foreground text-xs sm:text-sm">
              Questionário de {getExamTypeLabel()}
            </p>
          )}
        </div>

        {/* Progress Bar - only show during questionnaire */}
        {!isCompleted && (
          <div className="mb-4 sm:mb-6 md:mb-8 animate-fade-in">
            <ProgressBar currentStep={currentStep} totalSteps={totalSteps} />
          </div>
        )}

        {/* Current Step */}
        <div key={isCompleted ? 'summary' : currentStep}>
          {renderStep()}
        </div>
      </div>
    </div>
  );
}
