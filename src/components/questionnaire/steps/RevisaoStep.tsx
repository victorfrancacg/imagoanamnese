import { QuestionCard } from "../QuestionCard";
import { NavigationButtons } from "../NavigationButtons";
import { QuestionnaireData, TipoExame } from "@/types/questionnaire";
import { User, Shield, Stethoscope, Edit2, FileText } from "lucide-react";
import { Button } from "@/components/ui/button";

interface RevisaoStepProps {
  data: QuestionnaireData;
  onNext: () => void;
  onBack: () => void;
  onEditStep: (step: number) => void;
}

// Mapa de labels para todos os sintomas possíveis
const SINTOMAS_LABELS: Record<string, string> = {
  // Tomografia
  'dor-peito': 'Dor no peito',
  'dificuldade-respiratoria': 'Dificuldade respiratória',
  'dor-abdominal': 'Dor abdominal',
  // Ressonância
  'dor-articular': 'Dor articular',
  'dor-coluna': 'Dor na coluna',
  'dor-cabeca': 'Dor de cabeça frequente',
  'tontura': 'Tontura ou vertigem',
  'formigamento': 'Formigamento ou dormência',
  // Densitometria
  'fratura-recente': 'Fratura recente',
  'dor-ossea': 'Dor óssea',
  'perda-altura': 'Perda de altura',
  'menopausa': 'Menopausa',
  'uso-corticoides': 'Uso prolongado de corticoides',
  // Mamografia
  'nodulo': 'Nódulo palpável',
  'dor-mama': 'Dor na mama',
  'secrecao': 'Secreção mamilar',
  'alteracao-pele': 'Alteração na pele da mama',
  'historico-familiar': 'Histórico familiar de câncer de mama',
  // Comum
  'outros': 'Outros',
};

const TIPO_EXAME_LABELS: Record<TipoExame, string> = {
  'tomografia': 'Tomografia Computadorizada',
  'ressonancia': 'Ressonância Magnética',
  'densitometria': 'Densitometria Óssea',
  'mamografia': 'Mamografia',
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
  const tipoExame = data.tipoExame;
  
  const sexoLabel = data.sexo === 'masculino' 
    ? 'Masculino' 
    : data.sexo === 'feminino' 
    ? 'Feminino' 
    : '-';

  const tipoExameLabel = tipoExame ? TIPO_EXAME_LABELS[tipoExame] : '-';

  const sintomasLabel = data.sintomas.length > 0
    ? data.sintomas.map(s => s === 'outros' && data.sintomasOutros 
        ? `Outros: ${data.sintomasOutros}` 
        : SINTOMAS_LABELS[s] || s).join(', ')
    : 'Nenhum';

  // Determinar quais campos de segurança mostrar baseado no tipo de exame
  const showContraindicacao = tipoExame === 'tomografia' || tipoExame === 'ressonancia';
  const showExameAnterior = tipoExame === 'tomografia' || tipoExame === 'ressonancia';
  const showAlergia = tipoExame === 'tomografia' || tipoExame === 'ressonancia';

  // Labels dinâmicos para exame anterior
  const exameAnteriorLabel = tipoExame === 'ressonancia' 
    ? 'Ressonância anterior (12 meses)' 
    : 'Tomografia anterior (12 meses)';

  // Perguntas clínicas específicas por sexo e tipo
  const showCancerMama = data.sexo === 'feminino' && (tipoExame === 'tomografia' || tipoExame === 'mamografia');
  const showAmamentando = data.sexo === 'feminino' && (tipoExame === 'tomografia' || tipoExame === 'ressonancia' || tipoExame === 'mamografia');
  const showProstata = data.sexo === 'masculino' && (tipoExame === 'tomografia' || tipoExame === 'ressonancia');
  const showDificuldadeUrinaria = data.sexo === 'masculino' && (tipoExame === 'tomografia' || tipoExame === 'ressonancia');

  return (
    <QuestionCard
      title="Revisão das Respostas"
      subtitle="Confira suas respostas antes de assinar o termo de consentimento. Você pode editar qualquer seção clicando em 'Editar'."
    >
      <div className="space-y-4">
        {/* Tipo de Exame */}
        <SectionCard title="Tipo de Exame" icon={FileText} onEdit={() => onEditStep(1)}>
          <InfoRow label="Exame selecionado" value={tipoExameLabel} />
        </SectionCard>

        {/* Dados Pessoais */}
        <SectionCard title="Dados Pessoais" icon={User} onEdit={() => onEditStep(2)}>
          <InfoRow label="Nome" value={data.nome || '-'} />
          <InfoRow label="CPF" value={data.cpf || '-'} />
          <InfoRow label="Data de Nascimento" value={formatDate(data.dataNascimento)} />
          <InfoRow label="Sexo" value={sexoLabel} />
          <InfoRow label="Peso" value={data.peso ? `${data.peso} kg` : '-'} />
          <InfoRow label="Altura" value={data.altura ? `${data.altura} cm` : '-'} />
          <InfoRow label="Data do Exame" value={formatDate(data.dataExame)} />
        </SectionCard>

        {/* Questões de Segurança */}
        <SectionCard title="Questões de Segurança" icon={Shield} onEdit={() => onEditStep(3)}>
          {showContraindicacao && (
            <>
              <InfoRow 
                label="Contraindicação" 
                value={formatBoolean(data.temContraindicacao)} 
                highlight={data.temContraindicacao === true}
              />
              {data.temContraindicacao && data.contraindicacaoDetalhes && (
                <InfoRow label="Detalhes" value={data.contraindicacaoDetalhes} />
              )}
            </>
          )}
          {showExameAnterior && (
            <InfoRow label={exameAnteriorLabel} value={formatBoolean(data.tomografiaAnterior)} />
          )}
          {showAlergia && (
            <>
              <InfoRow 
                label="Alergia a contraste" 
                value={formatBoolean(data.alergia)} 
                highlight={data.alergia === true}
              />
              {data.alergia && data.alergiaDetalhes && (
                <InfoRow label="Detalhes da alergia" value={data.alergiaDetalhes} />
              )}
            </>
          )}
          {data.sexo === 'feminino' && (
            <InfoRow 
              label="Gravidez" 
              value={formatBoolean(data.gravida)} 
              highlight={data.gravida === true}
            />
          )}
          {tipoExame === 'densitometria' && data.sexo !== 'feminino' && (
            <InfoRow label="Status" value="Sem contraindicações específicas" />
          )}
        </SectionCard>

        {/* Questões Clínicas */}
        <SectionCard title="Questões Clínicas" icon={Stethoscope} onEdit={() => onEditStep(4)}>
          <InfoRow label="Motivo do Exame" value={data.motivoExame || '-'} />
          <InfoRow label="Sintomas" value={sintomasLabel} />
          {showCancerMama && (
            <InfoRow 
              label="Câncer de mama" 
              value={formatBoolean(data.cancerMama)} 
              highlight={data.cancerMama === true}
            />
          )}
          {showAmamentando && (
            <InfoRow label="Amamentação" value={formatBoolean(data.amamentando)} />
          )}
          {showProstata && (
            <InfoRow 
              label="Problemas na próstata" 
              value={formatBoolean(data.problemaProstata)} 
              highlight={data.problemaProstata === true}
            />
          )}
          {showDificuldadeUrinaria && (
            <InfoRow 
              label="Dificuldades urinárias" 
              value={formatBoolean(data.dificuldadeUrinaria)} 
              highlight={data.dificuldadeUrinaria === true}
            />
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
