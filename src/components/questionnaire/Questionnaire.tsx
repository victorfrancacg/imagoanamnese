import { useState, useCallback } from "react";
import { ProgressBar } from "./ProgressBar";
import { DadosPessoaisStep } from "./steps/DadosPessoaisStep";
import { SegurancaStep } from "./steps/SegurancaStep";
import { ClinicasStep } from "./steps/ClinicasStep";
import { ConsentimentoStep } from "./steps/ConsentimentoStep";
import { Summary } from "./Summary";
import { QuestionnaireData, initialData } from "@/types/questionnaire";
import { Stethoscope } from "lucide-react";

export function Questionnaire() {
  const [currentStep, setCurrentStep] = useState(1);
  const [data, setData] = useState<QuestionnaireData>(initialData);
  const [isCompleted, setIsCompleted] = useState(false);

  const totalSteps = 4; // Dados Pessoais, Segurança, Clínicas, Consentimento

  const updateData = useCallback((updates: Partial<QuestionnaireData>) => {
    setData((prev) => ({ ...prev, ...updates }));
  }, []);

  const handleNext = useCallback(() => {
    if (currentStep === totalSteps) {
      setIsCompleted(true);
    } else {
      setCurrentStep((prev) => prev + 1);
    }
  }, [currentStep, totalSteps]);

  const handleBack = useCallback(() => {
    setCurrentStep((prev) => Math.max(1, prev - 1));
  }, []);

  const handleReset = useCallback(() => {
    setData(initialData);
    setCurrentStep(1);
    setIsCompleted(false);
  }, []);

  const renderStep = () => {
    if (isCompleted) {
      return <Summary data={data} onReset={handleReset} />;
    }

    switch (currentStep) {
      case 1:
        return (
          <DadosPessoaisStep
            data={data}
            updateData={updateData}
            onNext={handleNext}
          />
        );
      case 2:
        return (
          <SegurancaStep
            data={data}
            updateData={updateData}
            onNext={handleNext}
            onBack={handleBack}
          />
        );
      case 3:
        return (
          <ClinicasStep
            data={data}
            updateData={updateData}
            onNext={handleNext}
            onBack={handleBack}
          />
        );
      case 4:
        return (
          <ConsentimentoStep
            data={data}
            updateData={updateData}
            onNext={handleNext}
            onBack={handleBack}
          />
        );
      default:
        return null;
    }
  };

  return (
    <div className="min-h-screen bg-background py-8 px-4">
      <div className="max-w-2xl mx-auto">
        {/* Header */}
        <div className="text-center mb-8 animate-fade-in">
          <div className="inline-flex items-center justify-center w-16 h-16 rounded-2xl bg-gradient-to-br from-primary to-primary-glow mb-4 shadow-glow">
            <Stethoscope className="w-8 h-8 text-primary-foreground" />
          </div>
          <h1 className="text-2xl md:text-3xl font-bold text-foreground mb-2">
            Questionário Clínico
          </h1>
          <p className="text-muted-foreground">
            Exame de Tomografia Computadorizada
          </p>
        </div>

        {/* Progress Bar - only show during questionnaire */}
        {!isCompleted && (
          <div className="mb-8 animate-fade-in">
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
