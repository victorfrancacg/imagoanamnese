import { QuestionCard } from "../QuestionCard";
import { NavigationButtons } from "../NavigationButtons";
import { QuestionnaireData } from "@/types/questionnaire";
import { User, Shield, Stethoscope, Edit2 } from "lucide-react";
import { Button } from "@/components/ui/button";

interface RevisaoStepProps {
  data: QuestionnaireData;
  onNext: () => void;
  onBack: () => void;
  onEditStep: (step: number) => void;
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

function SectionCard({ 
  title, 
  icon: Icon, 
  children, 
  onEdit 
}: { 
  title: string; 
  icon: React.ElementType; 
  children: React.ReactNode;
  onEdit: () => void;
}) {
  return (
    <div className="p-4 rounded-lg bg-accent/30 border border-border">
      <div className="flex items-center justify-between mb-3">
        <h3 className="flex items-center gap-2 text-base font-semibold text-foreground">
          <Icon className="w-4 h-4 text-primary" />
          {title}
        </h3>
        <Button
          type="button"
          variant="ghost"
          size="sm"
          onClick={onEdit}
          className="text-primary hover:text-primary-glow"
        >
          <Edit2 className="w-4 h-4 mr-1" />
          Editar
        </Button>
      </div>
      <div className="space-y-1 text-sm">
        {children}
      </div>
    </div>
  );
}

function InfoRow({ label, value, highlight }: { label: string; value: string; highlight?: boolean }) {
  return (
    <div className="flex justify-between gap-2 py-1">
      <span className="text-muted-foreground">{label}</span>
      <span className={`font-medium text-right ${highlight ? 'text-warning' : 'text-foreground'}`}>{value}</span>
    </div>
  );
}

export function RevisaoStep({ data, onNext, onBack, onEditStep }: RevisaoStepProps) {
  const sexoLabel = data.sexo === 'masculino' 
    ? 'Masculino' 
    : data.sexo === 'feminino' 
    ? 'Feminino' 
    : '-';

  const sintomasLabel = data.sintomas.length > 0
    ? data.sintomas.map(s => s === 'outros' && data.sintomasOutros 
        ? `Outros: ${data.sintomasOutros}` 
        : SINTOMAS_LABELS[s] || s).join(', ')
    : 'Nenhum';

  return (
    <QuestionCard
      title="Revisão das Respostas"
      subtitle="Confira suas respostas antes de assinar o termo de consentimento. Você pode editar qualquer seção clicando em 'Editar'."
    >
      <div className="space-y-4">
        {/* Dados Pessoais */}
        <SectionCard title="Dados Pessoais" icon={User} onEdit={() => onEditStep(1)}>
          <InfoRow label="Nome" value={data.nome || '-'} />
          <InfoRow label="CPF" value={data.cpf || '-'} />
          <InfoRow label="Data de Nascimento" value={formatDate(data.dataNascimento)} />
          <InfoRow label="Sexo" value={sexoLabel} />
          <InfoRow label="Peso" value={data.peso ? `${data.peso} kg` : '-'} />
          <InfoRow label="Altura" value={data.altura ? `${data.altura} cm` : '-'} />
          <InfoRow label="Tipo do Exame" value={data.tipoExame || '-'} />
          <InfoRow label="Data do Exame" value={formatDate(data.dataExame)} />
        </SectionCard>

        {/* Questões de Segurança */}
        <SectionCard title="Questões de Segurança" icon={Shield} onEdit={() => onEditStep(2)}>
          <InfoRow 
            label="Contraindicação" 
            value={formatBoolean(data.temContraindicacao)} 
            highlight={data.temContraindicacao === true}
          />
          {data.temContraindicacao && data.contraindicacaoDetalhes && (
            <InfoRow label="Detalhes" value={data.contraindicacaoDetalhes} />
          )}
          <InfoRow label="Tomografia anterior (12 meses)" value={formatBoolean(data.tomografiaAnterior)} />
          <InfoRow 
            label="Alergia a contraste" 
            value={formatBoolean(data.alergia)} 
            highlight={data.alergia === true}
          />
          {data.alergia && data.alergiaDetalhes && (
            <InfoRow label="Detalhes da alergia" value={data.alergiaDetalhes} />
          )}
          {data.sexo === 'feminino' && (
            <InfoRow 
              label="Gravidez" 
              value={formatBoolean(data.gravida)} 
              highlight={data.gravida === true}
            />
          )}
        </SectionCard>

        {/* Questões Clínicas */}
        <SectionCard title="Questões Clínicas" icon={Stethoscope} onEdit={() => onEditStep(3)}>
          <InfoRow label="Motivo do Exame" value={data.motivoExame || '-'} />
          <InfoRow label="Sintomas" value={sintomasLabel} />
          {data.sexo === 'feminino' && (
            <>
              <InfoRow 
                label="Câncer de mama" 
                value={formatBoolean(data.cancerMama)} 
                highlight={data.cancerMama === true}
              />
              <InfoRow label="Amamentação" value={formatBoolean(data.amamentando)} />
            </>
          )}
          {data.sexo === 'masculino' && (
            <>
              <InfoRow 
                label="Problemas na próstata" 
                value={formatBoolean(data.problemaProstata)} 
                highlight={data.problemaProstata === true}
              />
              <InfoRow 
                label="Dificuldades urinárias" 
                value={formatBoolean(data.dificuldadeUrinaria)} 
                highlight={data.dificuldadeUrinaria === true}
              />
            </>
          )}
        </SectionCard>
      </div>

      <NavigationButtons
        onBack={onBack}
        onNext={onNext}
        nextLabel="Continuar para Consentimento"
      />
    </QuestionCard>
  );
}
