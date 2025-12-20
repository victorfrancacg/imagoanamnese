import { Button } from "@/components/ui/button";
import { ChevronLeft, ChevronRight, Check } from "lucide-react";

interface NavigationButtonsProps {
  onBack?: () => void;
  onNext: () => void;
  showBack?: boolean;
  isLastStep?: boolean;
  disabled?: boolean;
}

export function NavigationButtons({
  onBack,
  onNext,
  showBack = true,
  isLastStep = false,
  disabled = false,
}: NavigationButtonsProps) {
  return (
    <div className="flex justify-between gap-4 mt-8">
      {showBack && onBack ? (
        <Button
          variant="outline"
          onClick={onBack}
          className="flex items-center gap-2 px-6"
        >
          <ChevronLeft className="w-4 h-4" />
          Voltar
        </Button>
      ) : (
        <div />
      )}
      <Button
        onClick={onNext}
        disabled={disabled}
        className="flex items-center gap-2 px-8 bg-gradient-to-r from-primary to-primary-glow hover:opacity-90 transition-opacity shadow-md"
      >
        {isLastStep ? (
          <>
            Finalizar
            <Check className="w-4 h-4" />
          </>
        ) : (
          <>
            Próximo
            <ChevronRight className="w-4 h-4" />
          </>
        )}
      </Button>
    </div>
  );
}
