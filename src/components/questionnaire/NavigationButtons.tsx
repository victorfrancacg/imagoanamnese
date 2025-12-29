import { Button } from "@/components/ui/button";
import { ChevronLeft, ChevronRight, Check } from "lucide-react";

interface NavigationButtonsProps {
  onBack?: () => void;
  onNext: () => void;
  showBack?: boolean;
  isLastStep?: boolean;
  disabled?: boolean;
  nextLabel?: string;
}

export function NavigationButtons({
  onBack,
  onNext,
  showBack = true,
  isLastStep = false,
  disabled = false,
  nextLabel,
}: NavigationButtonsProps) {
  const getButtonLabel = () => {
    if (nextLabel) return nextLabel;
    return isLastStep ? "Finalizar" : "Próximo";
  };

  return (
    <div className="flex justify-between gap-2 sm:gap-4 mt-6 sm:mt-8">
      {showBack && onBack ? (
        <Button
          variant="outline"
          onClick={onBack}
          className="flex items-center gap-1 sm:gap-2 px-3 sm:px-6 text-sm sm:text-base h-10 sm:h-11"
        >
          <ChevronLeft className="w-4 h-4" />
          <span className="hidden xs:inline">Voltar</span>
        </Button>
      ) : (
        <div />
      )}
      <Button
        onClick={onNext}
        disabled={disabled}
        className="flex items-center gap-1 sm:gap-2 px-4 sm:px-8 text-sm sm:text-base h-10 sm:h-11 bg-gradient-to-r from-primary to-primary-glow hover:opacity-90 transition-opacity shadow-md"
      >
        {getButtonLabel()}
        {isLastStep ? (
          <Check className="w-4 h-4" />
        ) : (
          <ChevronRight className="w-4 h-4" />
        )}
      </Button>
    </div>
  );
}
