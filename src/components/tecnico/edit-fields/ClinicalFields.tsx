import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Checkbox } from "@/components/ui/checkbox";
import { Input } from "@/components/ui/input";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { QuestionnaireData } from "@/types/questionnaire";

interface ClinicalFieldsProps {
  data: QuestionnaireData;
  updateData: (updates: Partial<QuestionnaireData>) => void;
}

/**
 * Componente de campos clínicos para edição
 * Adaptado de ClinicasStep.tsx - versão simplificada para edição
 */
export function ClinicalFields({ data, updateData }: ClinicalFieldsProps) {
  const tipoExame = data.tipoExame;
  const isFeminino = data.sexo === 'feminino';
  const isMasculino = data.sexo === 'masculino';
  const isDensitometria = tipoExame === 'densitometria';
  const isMamografia = tipoExame === 'mamografia';
  const isTomografiaOuRessonancia = tipoExame === 'tomografia' || tipoExame === 'ressonancia';

  // Regiões disponíveis para seleção
  const regioesDisponiveis = [
    { id: 'cabeca', label: 'Cabeça' },
    { id: 'pescoco', label: 'Pescoço' },
    { id: 'tronco', label: 'Tronco' },
    { id: 'membros_superiores', label: 'Membros Superiores' },
    { id: 'membros_inferiores', label: 'Membros Inferiores' },
  ];

  const handleRegiaoChange = (regiaoId: string, checked: boolean) => {
    const currentRegioes = data.regioesExame || [];
    if (checked) {
      updateData({ regioesExame: [...currentRegioes, regiaoId] });
    } else {
      updateData({ regioesExame: currentRegioes.filter(r => r !== regiaoId) });
    }
  };

  const getMotivoLabel = () => {
    if (tipoExame === 'densitometria') {
      return 'Por que seu médico solicitou esse exame de Densitometria?';
    }
    if (tipoExame === 'mamografia') {
      return 'Motivo do exame de Mamografia';
    }
    return 'Motivo do Exame';
  };

  return (
    <div className="space-y-6">
      {/* Regiões do Exame - Apenas para Tomografia e Ressonância */}
      {isTomografiaOuRessonancia && (
        <div className="space-y-3 p-4 rounded-lg bg-accent/30 border border-border">
          <Label className="text-sm font-medium">
            Regiões submetidas ao exame <span className="text-destructive">*</span>
          </Label>
          <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
            {regioesDisponiveis.map((regiao) => (
              <div
                key={regiao.id}
                className="flex items-center space-x-3 p-3 rounded-lg border border-border hover:bg-accent/50 transition-colors cursor-pointer"
                onClick={() => handleRegiaoChange(regiao.id, !(data.regioesExame || []).includes(regiao.id))}
              >
                <Checkbox
                  id={`edit-regiao-${regiao.id}`}
                  checked={(data.regioesExame || []).includes(regiao.id)}
                  onCheckedChange={(checked) => handleRegiaoChange(regiao.id, checked as boolean)}
                />
                <Label htmlFor={`edit-regiao-${regiao.id}`} className="cursor-pointer font-normal">
                  {regiao.label}
                </Label>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Motivo do Exame */}
      <div className="space-y-2">
        <Label htmlFor="edit-motivo">{getMotivoLabel()}</Label>
        <Textarea
          id="edit-motivo"
          placeholder="Descreva o motivo do exame"
          value={data.motivoExame}
          onChange={(e) => updateData({ motivoExame: e.target.value })}
          className="min-h-[100px]"
        />
      </div>

      {/* Campos específicos por tipo de exame */}
      {isTomografiaOuRessonancia && (
        <>
          <div className="space-y-3">
            <Label>Sofreu algum trauma na região a ser examinada?</Label>
            <RadioGroup
              value={data.traumaRegiao === null ? '' : data.traumaRegiao ? 'sim' : 'nao'}
              onValueChange={(value) => updateData({ traumaRegiao: value === 'sim' })}
              className="flex gap-4"
            >
              <div className="flex items-center space-x-2 p-3 rounded-lg border hover:bg-accent/50 flex-1">
                <RadioGroupItem value="sim" id="edit-trauma-sim" />
                <Label htmlFor="edit-trauma-sim" className="cursor-pointer">Sim</Label>
              </div>
              <div className="flex items-center space-x-2 p-3 rounded-lg border hover:bg-accent/50 flex-1">
                <RadioGroupItem value="nao" id="edit-trauma-nao" />
                <Label htmlFor="edit-trauma-nao" className="cursor-pointer">Não</Label>
              </div>
            </RadioGroup>
          </div>

          <div className="space-y-3">
            <Label>Já fez alguma cirurgia em qualquer lugar do corpo?</Label>
            <RadioGroup
              value={data.cirurgiaCorpo === null ? '' : data.cirurgiaCorpo ? 'sim' : 'nao'}
              onValueChange={(value) => updateData({ cirurgiaCorpo: value === 'sim' })}
              className="flex gap-4"
            >
              <div className="flex items-center space-x-2 p-3 rounded-lg border hover:bg-accent/50 flex-1">
                <RadioGroupItem value="sim" id="edit-cirurgia-sim" />
                <Label htmlFor="edit-cirurgia-sim" className="cursor-pointer">Sim</Label>
              </div>
              <div className="flex items-center space-x-2 p-3 rounded-lg border hover:bg-accent/50 flex-1">
                <RadioGroupItem value="nao" id="edit-cirurgia-nao" />
                <Label htmlFor="edit-cirurgia-nao" className="cursor-pointer">Não</Label>
              </div>
            </RadioGroup>
            {data.cirurgiaCorpo && (
              <Textarea
                placeholder="Descreva qual cirurgia"
                value={data.cirurgiaCorpoDetalhes ?? ''}
                onChange={(e) => updateData({ cirurgiaCorpoDetalhes: e.target.value })}
                className="animate-fade-in"
              />
            )}
          </div>

          <div className="space-y-3">
            <Label>Tem histórico de câncer?</Label>
            <RadioGroup
              value={data.historicoCancer === null ? '' : data.historicoCancer ? 'sim' : 'nao'}
              onValueChange={(value) => updateData({ historicoCancer: value === 'sim' })}
              className="flex gap-4"
            >
              <div className="flex items-center space-x-2 p-3 rounded-lg border hover:bg-accent/50 flex-1">
                <RadioGroupItem value="sim" id="edit-cancer-sim" />
                <Label htmlFor="edit-cancer-sim" className="cursor-pointer">Sim</Label>
              </div>
              <div className="flex items-center space-x-2 p-3 rounded-lg border hover:bg-accent/50 flex-1">
                <RadioGroupItem value="nao" id="edit-cancer-nao" />
                <Label htmlFor="edit-cancer-nao" className="cursor-pointer">Não</Label>
              </div>
            </RadioGroup>
            {data.historicoCancer && (
              <Textarea
                placeholder="Descreva em qual local"
                value={data.historicoCancerDetalhes ?? ''}
                onChange={(e) => updateData({ historicoCancerDetalhes: e.target.value })}
                className="animate-fade-in"
              />
            )}
          </div>

          {tipoExame === 'ressonancia' && (
            <div className="space-y-3">
              <Label>Tem exames relacionados à doença atual?</Label>
              <RadioGroup
                value={data.examesRelacionados === null ? '' : data.examesRelacionados ? 'sim' : 'nao'}
                onValueChange={(value) => updateData({ examesRelacionados: value === 'sim' })}
                className="flex gap-4"
              >
                <div className="flex items-center space-x-2 p-3 rounded-lg border hover:bg-accent/50 flex-1">
                  <RadioGroupItem value="sim" id="edit-exames-sim" />
                  <Label htmlFor="edit-exames-sim" className="cursor-pointer">Sim</Label>
                </div>
                <div className="flex items-center space-x-2 p-3 rounded-lg border hover:bg-accent/50 flex-1">
                  <RadioGroupItem value="nao" id="edit-exames-nao" />
                  <Label htmlFor="edit-exames-nao" className="cursor-pointer">Não</Label>
                </div>
              </RadioGroup>
              {data.examesRelacionados && (
                <Textarea
                  placeholder="Descreva quais exames"
                  value={data.examesRelacionadosDetalhes ?? ''}
                  onChange={(e) => updateData({ examesRelacionadosDetalhes: e.target.value })}
                  className="animate-fade-in"
                />
              )}
            </div>
          )}
        </>
      )}

      {/* Perguntas de gênero específicas */}
      {isFeminino && tipoExame === 'tomografia' && (
        <div className="space-y-3">
          <Label>Você está em período de amamentação?</Label>
          <RadioGroup
            value={data.amamentando === null ? '' : data.amamentando ? 'sim' : 'nao'}
            onValueChange={(value) => updateData({ amamentando: value === 'sim' })}
            className="flex gap-4"
          >
            <div className="flex items-center space-x-2 p-3 rounded-lg border hover:bg-accent/50 flex-1">
              <RadioGroupItem value="sim" id="edit-amamentando-sim" />
              <Label htmlFor="edit-amamentando-sim" className="cursor-pointer">Sim</Label>
            </div>
            <div className="flex items-center space-x-2 p-3 rounded-lg border hover:bg-accent/50 flex-1">
              <RadioGroupItem value="nao" id="edit-amamentando-nao" />
              <Label htmlFor="edit-amamentando-nao" className="cursor-pointer">Não</Label>
            </div>
          </RadioGroup>
        </div>
      )}

      {isMasculino && isTomografiaOuRessonancia && (
        <>
          <div className="space-y-3">
            <Label>Tem histórico de problemas na próstata?</Label>
            <RadioGroup
              value={data.problemaProstata === null ? '' : data.problemaProstata ? 'sim' : 'nao'}
              onValueChange={(value) => updateData({ problemaProstata: value === 'sim' })}
              className="flex gap-4"
            >
              <div className="flex items-center space-x-2 p-3 rounded-lg border hover:bg-accent/50 flex-1">
                <RadioGroupItem value="sim" id="edit-prostata-sim" />
                <Label htmlFor="edit-prostata-sim" className="cursor-pointer">Sim</Label>
              </div>
              <div className="flex items-center space-x-2 p-3 rounded-lg border hover:bg-accent/50 flex-1">
                <RadioGroupItem value="nao" id="edit-prostata-nao" />
                <Label htmlFor="edit-prostata-nao" className="cursor-pointer">Não</Label>
              </div>
            </RadioGroup>
          </div>

          <div className="space-y-3">
            <Label>Tem dificuldades urinárias ou histórico de infecção urinária?</Label>
            <RadioGroup
              value={data.dificuldadeUrinaria === null ? '' : data.dificuldadeUrinaria ? 'sim' : 'nao'}
              onValueChange={(value) => updateData({ dificuldadeUrinaria: value === 'sim' })}
              className="flex gap-4"
            >
              <div className="flex items-center space-x-2 p-3 rounded-lg border hover:bg-accent/50 flex-1">
                <RadioGroupItem value="sim" id="edit-urinaria-sim" />
                <Label htmlFor="edit-urinaria-sim" className="cursor-pointer">Sim</Label>
              </div>
              <div className="flex items-center space-x-2 p-3 rounded-lg border hover:bg-accent/50 flex-1">
                <RadioGroupItem value="nao" id="edit-urinaria-nao" />
                <Label htmlFor="edit-urinaria-nao" className="cursor-pointer">Não</Label>
              </div>
            </RadioGroup>
          </div>
        </>
      )}

      {/* Nota: Campos de Mamografia e Densitometria foram omitidos por brevidade */}
      {/* mas devem ser implementados seguindo o mesmo padrão */}
      {(isMamografia || isDensitometria) && (
        <div className="p-4 bg-muted rounded-lg">
          <p className="text-sm text-muted-foreground">
            Para editar campos detalhados de {isMamografia ? 'Mamografia' : 'Densitometria'},
            consulte o questionário completo original ou entre em contato com o suporte.
          </p>
        </div>
      )}
    </div>
  );
}
