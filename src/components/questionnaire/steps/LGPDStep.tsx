import { QuestionCard } from "../QuestionCard";
import { NavigationButtons } from "../NavigationButtons";
import { Checkbox } from "@/components/ui/checkbox";
import { Label } from "@/components/ui/label";
import { QuestionnaireData } from "@/types/questionnaire";

interface LGPDStepProps {
  data: QuestionnaireData;
  updateData: (updates: Partial<QuestionnaireData>) => void;
  onNext: () => void;
  onBack: () => void;
}

export function LGPDStep({ data, updateData, onNext, onBack }: LGPDStepProps) {
  const canProceed = data.aceitaCompartilhamento === true;

  return (
    <QuestionCard
      title="Termo de Consentimento – LGPD"
      subtitle="Por favor, leia atentamente o termo abaixo"
    >
      <div className="space-y-6">
        {/* Texto do termo LGPD */}
        <div className="p-4 rounded-lg bg-accent/30 border border-border">
          <p className="text-sm text-muted-foreground leading-relaxed whitespace-pre-line">
            Declaro que fui informado(a) e AUTORIZO a IMAGO – Diagnóstico por Imagem a coletar, utilizar, armazenar e tratar meus dados pessoais e dados sensíveis de saúde, conforme a Lei nº 13.709/2018 (LGPD), exclusivamente para fins de anamnese, realização e segurança dos exames, emissão de laudos, comunicação entre profissionais de saúde, cumprimento de obrigações legais e melhoria dos serviços prestados.
          </p>
          <p className="text-sm text-muted-foreground leading-relaxed whitespace-pre-line mt-4">
            Autorizo também o compartilhamento dos dados estritamente necessários com profissionais de saúde, sistemas e prestadores vinculados à IMAGO, comprometidos com a confidencialidade e a segurança da informação. Estou ciente de que posso exercer meus direitos previstos na LGPD a qualquer momento, inclusive revogar este consentimento, observadas as implicações legais e assistenciais.
          </p>
        </div>

        {/* Checkbox de aceite */}
        <label className="flex items-start space-x-3 p-4 rounded-lg border border-border hover:bg-accent/50 transition-colors cursor-pointer">
          <Checkbox
            id="lgpd-aceite"
            checked={data.aceitaCompartilhamento === true}
            onCheckedChange={(checked) => updateData({ aceitaCompartilhamento: checked === true })}
            className="mt-0.5"
          />
          <span className="text-sm leading-relaxed font-medium">
            Li e aceito o Termo de Consentimento para Tratamento de Dados – IMAGO
          </span>
        </label>

        {!data.aceitaCompartilhamento && data.aceitaCompartilhamento !== null && (
          <div className="p-4 rounded-lg bg-destructive/10 border border-destructive/30">
            <p className="text-sm text-destructive">
              Para prosseguir com o questionário, é necessário aceitar o termo de consentimento LGPD.
            </p>
          </div>
        )}
      </div>

      <NavigationButtons
        onBack={onBack}
        onNext={onNext}
        disabled={!canProceed}
      />
    </QuestionCard>
  );
}
