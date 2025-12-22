import { QuestionCard } from "../QuestionCard";
import { NavigationButtons } from "../NavigationButtons";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Checkbox } from "@/components/ui/checkbox";
import { Input } from "@/components/ui/input";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { QuestionnaireData } from "@/types/questionnaire";

interface ClinicasStepProps {
  data: QuestionnaireData;
  updateData: (updates: Partial<QuestionnaireData>) => void;
  onNext: () => void;
  onBack: () => void;
}

// Sintomas por tipo de exame (exceto tomografia que tem perguntas específicas)
const SINTOMAS_RESSONANCIA = [
  { id: 'dor-articular', label: 'Dor articular' },
  { id: 'dor-coluna', label: 'Dor na coluna' },
  { id: 'dor-cabeca', label: 'Dor de cabeça frequente' },
  { id: 'tontura', label: 'Tontura ou vertigem' },
  { id: 'formigamento', label: 'Formigamento ou dormência' },
  { id: 'outros', label: 'Outros' },
];

const SINTOMAS_DENSITOMETRIA = [
  { id: 'fratura-recente', label: 'Fratura recente' },
  { id: 'dor-ossea', label: 'Dor óssea' },
  { id: 'perda-altura', label: 'Perda de altura' },
  { id: 'menopausa', label: 'Menopausa' },
  { id: 'uso-corticoides', label: 'Uso prolongado de corticoides' },
  { id: 'outros', label: 'Outros' },
];

const SINTOMAS_MAMOGRAFIA = [
  { id: 'nodulo', label: 'Nódulo palpável' },
  { id: 'dor-mama', label: 'Dor na mama' },
  { id: 'secrecao', label: 'Secreção mamilar' },
  { id: 'alteracao-pele', label: 'Alteração na pele da mama' },
  { id: 'historico-familiar', label: 'Histórico familiar de câncer de mama' },
  { id: 'outros', label: 'Outros' },
];

export function ClinicasStep({ data, updateData, onNext, onBack }: ClinicasStepProps) {
  const tipoExame = data.tipoExame;
  const isFeminino = data.sexo === 'feminino';
  const isMasculino = data.sexo === 'masculino';

  // Novas perguntas específicas para Tomografia
  const showTraumaRegiao = tipoExame === 'tomografia';
  const showCirurgiaCorpo = tipoExame === 'tomografia';
  const showHistoricoCancer = tipoExame === 'tomografia';

  // Selecionar sintomas baseado no tipo de exame (exceto tomografia que não terá mais)
  const getSintomasOptions = () => {
    switch (tipoExame) {
      case 'ressonancia':
        return SINTOMAS_RESSONANCIA;
      case 'densitometria':
        return SINTOMAS_DENSITOMETRIA;
      case 'mamografia':
        return SINTOMAS_MAMOGRAFIA;
      default:
        return [];
    }
  };

  const sintomasOptions = getSintomasOptions();
  const showSintomas = tipoExame !== 'tomografia' && sintomasOptions.length > 0;

  // Perguntas específicas por sexo e tipo de exame
  const showCancerMama = isFeminino && tipoExame === 'mamografia'; // Removido tomografia pois já tem histórico de câncer geral
  const showAmamentando = isFeminino && (tipoExame === 'tomografia' || tipoExame === 'ressonancia' || tipoExame === 'mamografia');
  const showProstata = isMasculino && (tipoExame === 'tomografia' || tipoExame === 'ressonancia');
  const showDificuldadeUrinaria = isMasculino && (tipoExame === 'tomografia' || tipoExame === 'ressonancia');

  // Validate required fields including sex-specific ones and new tomografia fields
  const baseValid = data.motivoExame.trim() !== '';
  const femininoValid = !showCancerMama || data.cancerMama !== null;
  const amamentandoValid = !showAmamentando || data.amamentando !== null;
  const masculinoValid = !showProstata || data.problemaProstata !== null;
  const urinariaValid = !showDificuldadeUrinaria || data.dificuldadeUrinaria !== null;
  
  // Validações específicas para Tomografia
  const traumaValid = !showTraumaRegiao || data.traumaRegiao !== null;
  const cirurgiaCorpoValid = !showCirurgiaCorpo || data.cirurgiaCorpo !== null;
  const cirurgiaCorpoDetalhesValid = !data.cirurgiaCorpo || (data.cirurgiaCorpoDetalhes?.trim() ?? '') !== '';
  const historicoCancerValid = !showHistoricoCancer || data.historicoCancer !== null;
  const historicoCancerDetalhesValid = !data.historicoCancer || (data.historicoCancerDetalhes?.trim() ?? '') !== '';
  
  const canProceed = baseValid && femininoValid && amamentandoValid && masculinoValid && urinariaValid && 
                     traumaValid && cirurgiaCorpoValid && cirurgiaCorpoDetalhesValid && historicoCancerValid && historicoCancerDetalhesValid;

  const handleSintomaChange = (sintomaId: string, checked: boolean) => {
    const newSintomas = checked
      ? [...data.sintomas, sintomaId]
      : data.sintomas.filter((s) => s !== sintomaId);
    updateData({ sintomas: newSintomas });
  };

  const getMotivoPlaceholder = () => {
    switch (tipoExame) {
      case 'tomografia':
        return 'Descreva o motivo da consulta, sintomas ou razões específicas para a realização da tomografia';
      case 'ressonancia':
        return 'Descreva o motivo da consulta, sintomas ou razões específicas para a realização da ressonância';
      case 'densitometria':
        return 'Descreva o motivo da consulta, como prevenção de osteoporose, acompanhamento de tratamento, etc.';
      case 'mamografia':
        return 'Descreva o motivo da consulta, como exame de rotina, investigação de sintomas, etc.';
      default:
        return 'Descreva o motivo da consulta';
    }
  };

  return (
    <QuestionCard
      title="Questões Clínicas"
      subtitle="Informações sobre o motivo do exame"
    >
      <div className="space-y-8">
        <div className="space-y-3">
          <Label htmlFor="motivo" className="text-base font-medium">
            Motivo do Exame
          </Label>
          <Textarea
            id="motivo"
            placeholder={getMotivoPlaceholder()}
            value={data.motivoExame}
            onChange={(e) => updateData({ motivoExame: e.target.value })}
            className="min-h-[120px]"
          />
        </div>

        {/* Sintomas - apenas para exames que não são tomografia */}
        {showSintomas && (
          <div className="space-y-4">
            <Label className="text-base font-medium">
              Sintomas Relacionados (selecione todos que se aplicam)
            </Label>
            <div className="space-y-3">
              {sintomasOptions.map((sintoma) => (
                <div
                  key={sintoma.id}
                  className="flex items-center space-x-3 p-4 rounded-lg border border-border hover:bg-accent/50 transition-colors cursor-pointer"
                  onClick={() => handleSintomaChange(sintoma.id, !data.sintomas.includes(sintoma.id))}
                >
                  <Checkbox
                    id={sintoma.id}
                    checked={data.sintomas.includes(sintoma.id)}
                    onCheckedChange={(checked) => handleSintomaChange(sintoma.id, checked as boolean)}
                  />
                  <Label htmlFor={sintoma.id} className="cursor-pointer flex-1">
                    {sintoma.label}
                  </Label>
                </div>
              ))}
            </div>

            {data.sintomas.includes('outros') && (
              <Input
                type="text"
                placeholder="Por favor, especifique outros sintomas"
                value={data.sintomasOutros ?? ''}
                onChange={(e) => updateData({ sintomasOutros: e.target.value })}
                className="h-12 text-base animate-fade-in"
              />
            )}
          </div>
        )}

        {/* Perguntas específicas para Tomografia */}
        {showTraumaRegiao && (
          <div className="space-y-3 animate-fade-in">
            <Label className="text-base font-medium">
              Sofreu algum trauma na região a ser examinada?
            </Label>
            <RadioGroup
              value={data.traumaRegiao === null ? '' : data.traumaRegiao ? 'sim' : 'nao'}
              onValueChange={(value) => updateData({ traumaRegiao: value === 'sim' })}
              className="flex gap-4"
            >
              <div className="flex items-center space-x-2 p-3 rounded-lg border border-border hover:bg-accent/50 transition-colors cursor-pointer flex-1">
                <RadioGroupItem value="sim" id="trauma-sim" />
                <Label htmlFor="trauma-sim" className="cursor-pointer">Sim</Label>
              </div>
              <div className="flex items-center space-x-2 p-3 rounded-lg border border-border hover:bg-accent/50 transition-colors cursor-pointer flex-1">
                <RadioGroupItem value="nao" id="trauma-nao" />
                <Label htmlFor="trauma-nao" className="cursor-pointer">Não</Label>
              </div>
            </RadioGroup>
          </div>
        )}

        {showCirurgiaCorpo && (
          <div className="space-y-3 animate-fade-in">
            <Label className="text-base font-medium">
              Já fez alguma cirurgia em qualquer lugar do corpo? Se sim, qual?
            </Label>
            <RadioGroup
              value={data.cirurgiaCorpo === null ? '' : data.cirurgiaCorpo ? 'sim' : 'nao'}
              onValueChange={(value) => updateData({ cirurgiaCorpo: value === 'sim' })}
              className="flex gap-4"
            >
              <div className="flex items-center space-x-2 p-3 rounded-lg border border-border hover:bg-accent/50 transition-colors cursor-pointer flex-1">
                <RadioGroupItem value="sim" id="cirurgia-corpo-sim" />
                <Label htmlFor="cirurgia-corpo-sim" className="cursor-pointer">Sim</Label>
              </div>
              <div className="flex items-center space-x-2 p-3 rounded-lg border border-border hover:bg-accent/50 transition-colors cursor-pointer flex-1">
                <RadioGroupItem value="nao" id="cirurgia-corpo-nao" />
                <Label htmlFor="cirurgia-corpo-nao" className="cursor-pointer">Não</Label>
              </div>
            </RadioGroup>
            {data.cirurgiaCorpo && (
              <Textarea
                placeholder="Por favor, descreva qual cirurgia"
                value={data.cirurgiaCorpoDetalhes ?? ''}
                onChange={(e) => updateData({ cirurgiaCorpoDetalhes: e.target.value })}
                className="mt-3 animate-fade-in"
              />
            )}
          </div>
        )}

        {showHistoricoCancer && (
          <div className="space-y-3 animate-fade-in">
            <Label className="text-base font-medium">
              Tem histórico de câncer? Se sim, em qual local?
            </Label>
            <RadioGroup
              value={data.historicoCancer === null ? '' : data.historicoCancer ? 'sim' : 'nao'}
              onValueChange={(value) => updateData({ historicoCancer: value === 'sim' })}
              className="flex gap-4"
            >
              <div className="flex items-center space-x-2 p-3 rounded-lg border border-border hover:bg-accent/50 transition-colors cursor-pointer flex-1">
                <RadioGroupItem value="sim" id="historico-cancer-sim" />
                <Label htmlFor="historico-cancer-sim" className="cursor-pointer">Sim</Label>
              </div>
              <div className="flex items-center space-x-2 p-3 rounded-lg border border-border hover:bg-accent/50 transition-colors cursor-pointer flex-1">
                <RadioGroupItem value="nao" id="historico-cancer-nao" />
                <Label htmlFor="historico-cancer-nao" className="cursor-pointer">Não</Label>
              </div>
            </RadioGroup>
            {data.historicoCancer && (
              <Textarea
                placeholder="Por favor, descreva em qual local"
                value={data.historicoCancerDetalhes ?? ''}
                onChange={(e) => updateData({ historicoCancerDetalhes: e.target.value })}
                className="mt-3 animate-fade-in"
              />
            )}
          </div>
        )}

        {/* Perguntas específicas para mulheres */}
        {(showCancerMama || showAmamentando) && (
          <div className="space-y-6 pt-4 border-t border-border animate-fade-in">
            {showCancerMama && (
              <div className="space-y-3">
                <Label className="text-base font-medium">
                  Você já foi diagnosticada com câncer de mama?
                </Label>
                <RadioGroup
                  value={data.cancerMama === null ? '' : data.cancerMama ? 'sim' : 'nao'}
                  onValueChange={(value) => updateData({ cancerMama: value === 'sim' })}
                  className="flex gap-4"
                >
                  <div className="flex items-center space-x-2 p-3 rounded-lg border border-border hover:bg-accent/50 transition-colors cursor-pointer flex-1">
                    <RadioGroupItem value="sim" id="cancer-sim" />
                    <Label htmlFor="cancer-sim" className="cursor-pointer">Sim</Label>
                  </div>
                  <div className="flex items-center space-x-2 p-3 rounded-lg border border-border hover:bg-accent/50 transition-colors cursor-pointer flex-1">
                    <RadioGroupItem value="nao" id="cancer-nao" />
                    <Label htmlFor="cancer-nao" className="cursor-pointer">Não</Label>
                  </div>
                </RadioGroup>
              </div>
            )}

            {showAmamentando && (
              <div className="space-y-3">
                <Label className="text-base font-medium">
                  Você está em período de amamentação?
                </Label>
                <RadioGroup
                  value={data.amamentando === null ? '' : data.amamentando ? 'sim' : 'nao'}
                  onValueChange={(value) => updateData({ amamentando: value === 'sim' })}
                  className="flex gap-4"
                >
                  <div className="flex items-center space-x-2 p-3 rounded-lg border border-border hover:bg-accent/50 transition-colors cursor-pointer flex-1">
                    <RadioGroupItem value="sim" id="amamentando-sim" />
                    <Label htmlFor="amamentando-sim" className="cursor-pointer">Sim</Label>
                  </div>
                  <div className="flex items-center space-x-2 p-3 rounded-lg border border-border hover:bg-accent/50 transition-colors cursor-pointer flex-1">
                    <RadioGroupItem value="nao" id="amamentando-nao" />
                    <Label htmlFor="amamentando-nao" className="cursor-pointer">Não</Label>
                  </div>
                </RadioGroup>
              </div>
            )}
          </div>
        )}

        {/* Perguntas específicas para homens */}
        {(showProstata || showDificuldadeUrinaria) && (
          <div className="space-y-6 pt-4 border-t border-border animate-fade-in">
            {showProstata && (
              <div className="space-y-3">
                <Label className="text-base font-medium">
                  Você tem histórico de problemas na próstata?
                </Label>
                <RadioGroup
                  value={data.problemaProstata === null ? '' : data.problemaProstata ? 'sim' : 'nao'}
                  onValueChange={(value) => updateData({ problemaProstata: value === 'sim' })}
                  className="flex gap-4"
                >
                  <div className="flex items-center space-x-2 p-3 rounded-lg border border-border hover:bg-accent/50 transition-colors cursor-pointer flex-1">
                    <RadioGroupItem value="sim" id="prostata-sim" />
                    <Label htmlFor="prostata-sim" className="cursor-pointer">Sim</Label>
                  </div>
                  <div className="flex items-center space-x-2 p-3 rounded-lg border border-border hover:bg-accent/50 transition-colors cursor-pointer flex-1">
                    <RadioGroupItem value="nao" id="prostata-nao" />
                    <Label htmlFor="prostata-nao" className="cursor-pointer">Não</Label>
                  </div>
                </RadioGroup>
              </div>
            )}

            {showDificuldadeUrinaria && (
              <div className="space-y-3">
                <Label className="text-base font-medium">
                  Você tem dificuldades urinárias ou histórico de infecção urinária?
                </Label>
                <RadioGroup
                  value={data.dificuldadeUrinaria === null ? '' : data.dificuldadeUrinaria ? 'sim' : 'nao'}
                  onValueChange={(value) => updateData({ dificuldadeUrinaria: value === 'sim' })}
                  className="flex gap-4"
                >
                  <div className="flex items-center space-x-2 p-3 rounded-lg border border-border hover:bg-accent/50 transition-colors cursor-pointer flex-1">
                    <RadioGroupItem value="sim" id="urinaria-sim" />
                    <Label htmlFor="urinaria-sim" className="cursor-pointer">Sim</Label>
                  </div>
                  <div className="flex items-center space-x-2 p-3 rounded-lg border border-border hover:bg-accent/50 transition-colors cursor-pointer flex-1">
                    <RadioGroupItem value="nao" id="urinaria-nao" />
                    <Label htmlFor="urinaria-nao" className="cursor-pointer">Não</Label>
                  </div>
                </RadioGroup>
              </div>
            )}
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
