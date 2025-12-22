import { QuestionnaireData } from "@/types/questionnaire";
import { Button } from "@/components/ui/button";
import { CheckCircle2, User, Shield, Stethoscope, FileCheck, RotateCcw } from "lucide-react";

interface SummaryProps {
  data: QuestionnaireData;
  onReset: () => void;
  savedId?: string | null;
}

const SINTOMAS_LABELS: Record<string, string> = {
  'dor-peito': 'Dor no peito',
  'dificuldade-respiratoria': 'Dificuldade respiratória',
  'dor-abdominal': 'Dor abdominal',
  'outros': 'Outros',
};

function formatBoolean(value: boolean | null): string {
  if (value === null) return '-';
  return value ? 'Sim' : 'Não';
}

function formatDate(dateString: string): string {
  if (!dateString) return '-';
  const [year, month, day] = dateString.split('-');
  return `${day}/${month}/${year}`;
}

function SummarySection({ title, icon: Icon, children }: { title: string; icon: React.ElementType; children: React.ReactNode }) {
  return (
    <div className="space-y-3">
      <h3 className="flex items-center gap-2 text-lg font-semibold text-foreground">
        <Icon className="w-5 h-5 text-primary" />
        {title}
      </h3>
      <div className="pl-7 space-y-2">
        {children}
      </div>
    </div>
  );
}

function SummaryItem({ label, value, highlight }: { label: string; value: string; highlight?: boolean }) {
  return (
    <div className="flex flex-wrap justify-between gap-2 py-2 border-b border-border/50 last:border-0">
      <span className="text-muted-foreground">{label}</span>
      <span className={`font-medium ${highlight ? 'text-warning' : 'text-foreground'}`}>{value}</span>
    </div>
  );
}

export function Summary({ data, onReset, savedId }: SummaryProps) {
  const sexoLabel = data.sexo === 'masculino' 
    ? 'Masculino' 
    : data.sexo === 'feminino' 
    ? 'Feminino' 
    : '-';

  const sintomasLabel = data.sintomas.length > 0
    ? data.sintomas.map(s => s === 'outros' && data.sintomasOutros 
        ? `Outros: ${data.sintomasOutros}` 
        : SINTOMAS_LABELS[s] || s).join(', ')
    : 'Nenhum sintoma selecionado';

  return (
    <div className="w-full max-w-2xl mx-auto animate-slide-up">
      {/* Success Message */}
      <div className="text-center mb-8">
        <div className="inline-flex items-center justify-center w-20 h-20 rounded-full bg-success/10 mb-4">
          <CheckCircle2 className="w-10 h-10 text-success" />
        </div>
        <h1 className="text-2xl font-bold text-foreground mb-2">
          Questionário Preenchido com Sucesso!
        </h1>
        <p className="text-muted-foreground">
          Você preencheu com sucesso o questionário de anamnese para o exame de Tomografia Computadorizada.
        </p>
      </div>

      {/* Summary Card */}
      <div className="bg-card rounded-2xl p-8 shadow-lg space-y-8">
        <h2 className="text-xl font-semibold text-center text-foreground border-b border-border pb-4">
          Resumo das Respostas
        </h2>

        <SummarySection title="Dados Pessoais" icon={User}>
          <SummaryItem label="Nome" value={data.nome || '-'} />
          <SummaryItem label="CPF" value={data.cpf || '-'} />
          <SummaryItem label="Data de Nascimento" value={formatDate(data.dataNascimento)} />
          <SummaryItem label="Sexo" value={sexoLabel} />
          <SummaryItem label="Peso" value={data.peso ? `${data.peso} kg` : '-'} />
          <SummaryItem label="Altura" value={data.altura ? `${data.altura} cm` : '-'} />
          <SummaryItem label="Tipo do Exame" value={data.tipoExame || '-'} />
          <SummaryItem label="Data do Exame" value={formatDate(data.dataExame)} />
        </SummarySection>

        <SummarySection title="Questões de Segurança" icon={Shield}>
          <SummaryItem 
            label="Contraindicação" 
            value={formatBoolean(data.temContraindicacao)} 
            highlight={data.temContraindicacao === true}
          />
          {data.temContraindicacao && data.contraindicacaoDetalhes && (
            <SummaryItem label="Detalhes" value={data.contraindicacaoDetalhes} />
          )}
          <SummaryItem label="Tomografia anterior (12 meses)" value={formatBoolean(data.tomografiaAnterior)} />
          <SummaryItem 
            label="Alergia a contraste" 
            value={formatBoolean(data.alergia)} 
            highlight={data.alergia === true}
          />
          {data.alergia && data.alergiaDetalhes && (
            <SummaryItem label="Detalhes da alergia" value={data.alergiaDetalhes} />
          )}
          {data.sexo === 'feminino' && (
            <SummaryItem 
              label="Gravidez" 
              value={formatBoolean(data.gravida)} 
              highlight={data.gravida === true}
            />
          )}
        </SummarySection>

        <SummarySection title="Questões Clínicas" icon={Stethoscope}>
          <SummaryItem label="Motivo do Exame" value={data.motivoExame || '-'} />
          <SummaryItem label="Sintomas" value={sintomasLabel} />
          {data.sexo === 'feminino' && (
            <>
              <SummaryItem 
                label="Diagnóstico de câncer de mama" 
                value={formatBoolean(data.cancerMama)} 
                highlight={data.cancerMama === true}
              />
              <SummaryItem label="Amamentação" value={formatBoolean(data.amamentando)} />
            </>
          )}
          {data.sexo === 'masculino' && (
            <>
              <SummaryItem 
                label="Problemas na próstata" 
                value={formatBoolean(data.problemaProstata)} 
                highlight={data.problemaProstata === true}
              />
              <SummaryItem 
                label="Dificuldades urinárias" 
                value={formatBoolean(data.dificuldadeUrinaria)} 
                highlight={data.dificuldadeUrinaria === true}
              />
            </>
          )}
        </SummarySection>

        <SummarySection title="Termo de Consentimento" icon={FileCheck}>
          <SummaryItem label="Aceita riscos do exame" value={formatBoolean(data.aceitaRiscos)} />
          <SummaryItem label="Autoriza compartilhamento de dados" value={formatBoolean(data.aceitaCompartilhamento)} />
          {data.assinaturaData && (
            <div className="pt-3">
              <span className="text-muted-foreground text-sm">Assinatura:</span>
              <div className="mt-2 p-2 bg-background rounded-lg border border-border">
                <img src={data.assinaturaData} alt="Assinatura do paciente" className="max-h-20" />
              </div>
            </div>
          )}
        </SummarySection>
      </div>

      {/* Action Buttons */}
      <div className="flex flex-col sm:flex-row gap-4 mt-8 justify-center">
        <Button
          variant="outline"
          onClick={onReset}
          className="flex items-center gap-2"
        >
          <RotateCcw className="w-4 h-4" />
          Novo Questionário
        </Button>
      </div>
    </div>
  );
}
