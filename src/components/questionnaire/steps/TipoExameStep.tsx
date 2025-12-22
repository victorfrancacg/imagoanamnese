import { QuestionCard } from "../QuestionCard";
import { QuestionnaireData, TipoExame } from "@/types/questionnaire";
import { 
  Scan, 
  Activity, 
  Bone, 
  Heart 
} from "lucide-react";

interface TipoExameStepProps {
  data: QuestionnaireData;
  updateData: (updates: Partial<QuestionnaireData>) => void;
  onNext: () => void;
}

const EXAM_TYPES: { id: TipoExame; label: string; description: string; icon: React.ElementType }[] = [
  { 
    id: 'tomografia', 
    label: 'Tomografia Computadorizada', 
    description: 'Exame de imagem por raios-X',
    icon: Scan
  },
  { 
    id: 'ressonancia', 
    label: 'Ressonância Magnética', 
    description: 'Exame de imagem por campo magnético',
    icon: Activity
  },
  { 
    id: 'densitometria', 
    label: 'Densitometria Óssea', 
    description: 'Avaliação da densidade dos ossos',
    icon: Bone
  },
  { 
    id: 'mamografia', 
    label: 'Mamografia', 
    description: 'Exame de imagem das mamas',
    icon: Heart
  },
];

export function TipoExameStep({ data, updateData, onNext }: TipoExameStepProps) {
  const handleSelect = (tipoExame: TipoExame) => {
    updateData({ tipoExame });
    onNext();
  };

  return (
    <QuestionCard
      title="Tipo de Exame"
      subtitle="Selecione o exame que você irá realizar"
    >
      <div className="space-y-4">
        {EXAM_TYPES.map((exam) => {
          const Icon = exam.icon;
          const isSelected = data.tipoExame === exam.id;
          
          return (
            <button
              key={exam.id}
              onClick={() => handleSelect(exam.id)}
              className={`w-full p-5 rounded-xl border-2 text-left transition-all duration-200 hover:shadow-md ${
                isSelected 
                  ? 'border-primary bg-primary/5 shadow-md' 
                  : 'border-border hover:border-primary/50 hover:bg-accent/50'
              }`}
            >
              <div className="flex items-center gap-4">
                <div className={`p-3 rounded-lg ${
                  isSelected 
                    ? 'bg-primary text-primary-foreground' 
                    : 'bg-muted text-muted-foreground'
                }`}>
                  <Icon className="w-6 h-6" />
                </div>
                <div className="flex-1">
                  <h3 className="font-semibold text-foreground text-lg">
                    {exam.label}
                  </h3>
                  <p className="text-sm text-muted-foreground mt-1">
                    {exam.description}
                  </p>
                </div>
              </div>
            </button>
          );
        })}
      </div>
    </QuestionCard>
  );
}
