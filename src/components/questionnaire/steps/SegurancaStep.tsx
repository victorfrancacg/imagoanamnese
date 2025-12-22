import { QuestionCard } from "../QuestionCard";
import { NavigationButtons } from "../NavigationButtons";
import { Label } from "@/components/ui/label";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Textarea } from "@/components/ui/textarea";
import { QuestionnaireData } from "@/types/questionnaire";
import { AlertTriangle } from "lucide-react";

interface SegurancaStepProps {
  data: QuestionnaireData;
  updateData: (updates: Partial<QuestionnaireData>) => void;
  onNext: () => void;
  onBack: () => void;
}

export function SegurancaStep({ data, updateData, onNext, onBack }: SegurancaStepProps) {
  const tipoExame = data.tipoExame;
  
  // Perguntas variam por tipo de exame
  const needsContraindicacao = tipoExame === 'tomografia' || tipoExame === 'ressonancia';
  const needsExameAnterior = tipoExame === 'tomografia' || tipoExame === 'ressonancia';
  const needsAlergia = tipoExame === 'tomografia' || tipoExame === 'ressonancia';
  const needsGravidez = data.sexo === 'feminino' && (tipoExame === 'tomografia' || tipoExame === 'ressonancia' || tipoExame === 'mamografia');
  const needsMetalImplant = tipoExame === 'ressonancia';
  const needsClaustrofobia = tipoExame === 'ressonancia';
  const needsProteseMamaria = tipoExame === 'mamografia' && data.sexo === 'feminino';
  
  // Novas perguntas específicas para Tomografia
  const needsMetformina = tipoExame === 'tomografia';
  const needsCirurgiaRenal = tipoExame === 'tomografia';
  const needsDoencaRenal = tipoExame === 'tomografia';

  const canProceed = () => {
    // Validar campos obrigatórios baseado no tipo de exame
    if (needsContraindicacao && data.temContraindicacao === null) return false;
    if (data.temContraindicacao && (data.contraindicacaoDetalhes?.trim() ?? '') === '') return false;
    
    if (needsExameAnterior && data.tomografiaAnterior === null) return false;
    
    if (needsAlergia && data.alergia === null) return false;
    if (data.alergia && (data.alergiaDetalhes?.trim() ?? '') === '') return false;
    
    if (needsGravidez && data.gravida === null) return false;
    
    // Validações específicas para Tomografia
    if (needsMetformina && data.usaMetformina === null) return false;
    if (needsCirurgiaRenal && data.cirurgiaRenal === null) return false;
    if (data.cirurgiaRenal && (data.cirurgiaRenalDetalhes?.trim() ?? '') === '') return false;
    if (needsDoencaRenal && data.doencaRenal === null) return false;
    if (data.doencaRenal && (data.doencaRenalDetalhes?.trim() ?? '') === '') return false;
    
    // Para densitometria, apenas gravidez é relevante para mulheres
    if (tipoExame === 'densitometria' && data.sexo === 'feminino' && data.gravida === null) return false;
    
    return true;
  };

  const getExameAnteriorLabel = () => {
    switch (tipoExame) {
      case 'tomografia':
        return 'Você já foi submetido a outro exame de tomografia computadorizada nos últimos 12 meses?';
      case 'ressonancia':
        return 'Você já foi submetido a outro exame de ressonância magnética nos últimos 12 meses?';
      default:
        return 'Você já realizou este exame anteriormente?';
    }
  };

  const getContraindicacaoLabel = () => {
    switch (tipoExame) {
      case 'ressonancia':
        return 'Você tem alguma condição que possa contraindicar a realização do exame (marcapasso, implante coclear, clipes de aneurisma, fragmentos metálicos, etc.)?';
      case 'tomografia':
        return 'Você tem alguma condição que possa contraindicar a realização do exame (marcapasso, prótese metálica, etc.)?';
      default:
        return 'Você tem alguma condição que possa contraindicar a realização do exame?';
    }
  };

  return (
    <QuestionCard
      title="Questões de Segurança"
      subtitle="Informações importantes para a realização do exame"
    >
      <div className="space-y-8">
        {/* Contraindicação - Tomografia e Ressonância */}
        {needsContraindicacao && (
          <div className="space-y-3 animate-fade-in">
            <Label className="text-base font-medium flex items-center gap-2">
              <AlertTriangle className="w-4 h-4 text-warning" />
              {getContraindicacaoLabel()}
            </Label>
            <RadioGroup
              value={data.temContraindicacao === null ? '' : data.temContraindicacao ? 'sim' : 'nao'}
              onValueChange={(value) => updateData({ temContraindicacao: value === 'sim' })}
              className="flex gap-4"
            >
              <div className="flex items-center space-x-2 p-3 rounded-lg border border-border hover:bg-accent/50 transition-colors cursor-pointer flex-1">
                <RadioGroupItem value="sim" id="contraind-sim" />
                <Label htmlFor="contraind-sim" className="cursor-pointer">Sim</Label>
              </div>
              <div className="flex items-center space-x-2 p-3 rounded-lg border border-border hover:bg-accent/50 transition-colors cursor-pointer flex-1">
                <RadioGroupItem value="nao" id="contraind-nao" />
                <Label htmlFor="contraind-nao" className="cursor-pointer">Não</Label>
              </div>
            </RadioGroup>
            {data.temContraindicacao && (
              <Textarea
                placeholder="Por favor, descreva sua condição"
                value={data.contraindicacaoDetalhes ?? ''}
                onChange={(e) => updateData({ contraindicacaoDetalhes: e.target.value })}
                className="mt-3 animate-fade-in"
              />
            )}
          </div>
        )}

        {/* Exame Anterior - Tomografia e Ressonância */}
        {needsExameAnterior && (
          <div className="space-y-3 animate-fade-in">
            <Label className="text-base font-medium">
              {getExameAnteriorLabel()}
            </Label>
            <RadioGroup
              value={data.tomografiaAnterior === null ? '' : data.tomografiaAnterior ? 'sim' : 'nao'}
              onValueChange={(value) => updateData({ tomografiaAnterior: value === 'sim' })}
              className="flex gap-4"
            >
              <div className="flex items-center space-x-2 p-3 rounded-lg border border-border hover:bg-accent/50 transition-colors cursor-pointer flex-1">
                <RadioGroupItem value="sim" id="tomo-sim" />
                <Label htmlFor="tomo-sim" className="cursor-pointer">Sim</Label>
              </div>
              <div className="flex items-center space-x-2 p-3 rounded-lg border border-border hover:bg-accent/50 transition-colors cursor-pointer flex-1">
                <RadioGroupItem value="nao" id="tomo-nao" />
                <Label htmlFor="tomo-nao" className="cursor-pointer">Não</Label>
              </div>
            </RadioGroup>
          </div>
        )}

        {/* Alergia - Tomografia e Ressonância (contraste) */}
        {needsAlergia && (
          <div className="space-y-3 animate-fade-in">
            <Label className="text-base font-medium flex items-center gap-2">
              <AlertTriangle className="w-4 h-4 text-warning" />
              Você tem alguma alergia conhecida a contraste ou outros agentes utilizados em exames?
            </Label>
            <RadioGroup
              value={data.alergia === null ? '' : data.alergia ? 'sim' : 'nao'}
              onValueChange={(value) => updateData({ alergia: value === 'sim' })}
              className="flex gap-4"
            >
              <div className="flex items-center space-x-2 p-3 rounded-lg border border-border hover:bg-accent/50 transition-colors cursor-pointer flex-1">
                <RadioGroupItem value="sim" id="alergia-sim" />
                <Label htmlFor="alergia-sim" className="cursor-pointer">Sim</Label>
              </div>
              <div className="flex items-center space-x-2 p-3 rounded-lg border border-border hover:bg-accent/50 transition-colors cursor-pointer flex-1">
                <RadioGroupItem value="nao" id="alergia-nao" />
                <Label htmlFor="alergia-nao" className="cursor-pointer">Não</Label>
              </div>
            </RadioGroup>
            {data.alergia && (
              <Textarea
                placeholder="Por favor, descreva sua alergia"
                value={data.alergiaDetalhes ?? ''}
                onChange={(e) => updateData({ alergiaDetalhes: e.target.value })}
                className="mt-3 animate-fade-in"
              />
            )}
          </div>
        )}

        {/* Gravidez - para mulheres em exames relevantes */}
        {needsGravidez && (
          <div className="space-y-3 animate-fade-in">
            <Label className="text-base font-medium flex items-center gap-2">
              <AlertTriangle className="w-4 h-4 text-warning" />
              Você está grávida ou suspeita que possa estar?
            </Label>
            <RadioGroup
              value={data.gravida === null ? '' : data.gravida ? 'sim' : 'nao'}
              onValueChange={(value) => updateData({ gravida: value === 'sim' })}
              className="flex gap-4"
            >
              <div className="flex items-center space-x-2 p-3 rounded-lg border border-border hover:bg-accent/50 transition-colors cursor-pointer flex-1">
                <RadioGroupItem value="sim" id="gravida-sim" />
                <Label htmlFor="gravida-sim" className="cursor-pointer">Sim</Label>
              </div>
              <div className="flex items-center space-x-2 p-3 rounded-lg border border-border hover:bg-accent/50 transition-colors cursor-pointer flex-1">
                <RadioGroupItem value="nao" id="gravida-nao" />
                <Label htmlFor="gravida-nao" className="cursor-pointer">Não</Label>
              </div>
            </RadioGroup>
          </div>
        )}

        {/* Perguntas específicas para Tomografia */}
        {needsMetformina && (
          <div className="space-y-3 animate-fade-in">
            <Label className="text-base font-medium">
              Você faz uso de metformina?
            </Label>
            <RadioGroup
              value={data.usaMetformina === null ? '' : data.usaMetformina ? 'sim' : 'nao'}
              onValueChange={(value) => updateData({ usaMetformina: value === 'sim' })}
              className="flex gap-4"
            >
              <div className="flex items-center space-x-2 p-3 rounded-lg border border-border hover:bg-accent/50 transition-colors cursor-pointer flex-1">
                <RadioGroupItem value="sim" id="metformina-sim" />
                <Label htmlFor="metformina-sim" className="cursor-pointer">Sim</Label>
              </div>
              <div className="flex items-center space-x-2 p-3 rounded-lg border border-border hover:bg-accent/50 transition-colors cursor-pointer flex-1">
                <RadioGroupItem value="nao" id="metformina-nao" />
                <Label htmlFor="metformina-nao" className="cursor-pointer">Não</Label>
              </div>
            </RadioGroup>
          </div>
        )}

        {needsCirurgiaRenal && (
          <div className="space-y-3 animate-fade-in">
            <Label className="text-base font-medium">
              Tem alguma cirurgia renal? (p.ex. retirada de rim e transplante renal)
            </Label>
            <RadioGroup
              value={data.cirurgiaRenal === null ? '' : data.cirurgiaRenal ? 'sim' : 'nao'}
              onValueChange={(value) => updateData({ cirurgiaRenal: value === 'sim' })}
              className="flex gap-4"
            >
              <div className="flex items-center space-x-2 p-3 rounded-lg border border-border hover:bg-accent/50 transition-colors cursor-pointer flex-1">
                <RadioGroupItem value="sim" id="cirurgia-renal-sim" />
                <Label htmlFor="cirurgia-renal-sim" className="cursor-pointer">Sim</Label>
              </div>
              <div className="flex items-center space-x-2 p-3 rounded-lg border border-border hover:bg-accent/50 transition-colors cursor-pointer flex-1">
                <RadioGroupItem value="nao" id="cirurgia-renal-nao" />
                <Label htmlFor="cirurgia-renal-nao" className="cursor-pointer">Não</Label>
              </div>
            </RadioGroup>
            {data.cirurgiaRenal && (
              <Textarea
                placeholder="Por favor, descreva qual cirurgia renal"
                value={data.cirurgiaRenalDetalhes ?? ''}
                onChange={(e) => updateData({ cirurgiaRenalDetalhes: e.target.value })}
                className="mt-3 animate-fade-in"
              />
            )}
          </div>
        )}

        {needsDoencaRenal && (
          <div className="space-y-3 animate-fade-in">
            <Label className="text-base font-medium">
              Tem alguma doença renal? (p. ex. insuficiência renal ou doença renal crônica)
            </Label>
            <RadioGroup
              value={data.doencaRenal === null ? '' : data.doencaRenal ? 'sim' : 'nao'}
              onValueChange={(value) => updateData({ doencaRenal: value === 'sim' })}
              className="flex gap-4"
            >
              <div className="flex items-center space-x-2 p-3 rounded-lg border border-border hover:bg-accent/50 transition-colors cursor-pointer flex-1">
                <RadioGroupItem value="sim" id="doenca-renal-sim" />
                <Label htmlFor="doenca-renal-sim" className="cursor-pointer">Sim</Label>
              </div>
              <div className="flex items-center space-x-2 p-3 rounded-lg border border-border hover:bg-accent/50 transition-colors cursor-pointer flex-1">
                <RadioGroupItem value="nao" id="doenca-renal-nao" />
                <Label htmlFor="doenca-renal-nao" className="cursor-pointer">Não</Label>
              </div>
            </RadioGroup>
            {data.doencaRenal && (
              <Textarea
                placeholder="Por favor, descreva qual doença renal"
                value={data.doencaRenalDetalhes ?? ''}
                onChange={(e) => updateData({ doencaRenalDetalhes: e.target.value })}
                className="mt-3 animate-fade-in"
              />
            )}
          </div>
        )}

        {/* Gravidez para densitometria - mulheres */}
        {tipoExame === 'densitometria' && data.sexo === 'feminino' && !needsGravidez && (
          <div className="space-y-3 animate-fade-in">
            <Label className="text-base font-medium flex items-center gap-2">
              <AlertTriangle className="w-4 h-4 text-warning" />
              Você está grávida ou suspeita que possa estar?
            </Label>
            <RadioGroup
              value={data.gravida === null ? '' : data.gravida ? 'sim' : 'nao'}
              onValueChange={(value) => updateData({ gravida: value === 'sim' })}
              className="flex gap-4"
            >
              <div className="flex items-center space-x-2 p-3 rounded-lg border border-border hover:bg-accent/50 transition-colors cursor-pointer flex-1">
                <RadioGroupItem value="sim" id="gravida-sim" />
                <Label htmlFor="gravida-sim" className="cursor-pointer">Sim</Label>
              </div>
              <div className="flex items-center space-x-2 p-3 rounded-lg border border-border hover:bg-accent/50 transition-colors cursor-pointer flex-1">
                <RadioGroupItem value="nao" id="gravida-nao" />
                <Label htmlFor="gravida-nao" className="cursor-pointer">Não</Label>
              </div>
            </RadioGroup>
          </div>
        )}

        {/* Mensagem para Densitometria se não houver perguntas específicas */}
        {tipoExame === 'densitometria' && data.sexo !== 'feminino' && (
          <div className="p-4 rounded-lg bg-muted/50 text-muted-foreground animate-fade-in">
            <p>A densitometria óssea é um exame de baixa radiação e sem contraste. Não há contraindicações específicas para o seu perfil.</p>
          </div>
        )}
      </div>

      <NavigationButtons
        onBack={onBack}
        onNext={onNext}
        disabled={!canProceed()}
      />
    </QuestionCard>
  );
}
