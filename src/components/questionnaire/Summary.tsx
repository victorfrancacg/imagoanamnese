import { QuestionnaireData } from "@/types/questionnaire";
import { Button } from "@/components/ui/button";
import { CheckCircle2, User, Shield, Stethoscope, FileCheck, RotateCcw, Download } from "lucide-react";

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

export function generateQuestionnaireHTML(data: QuestionnaireData): string {
  const sexoLabel = data.sexo === 'masculino' 
    ? 'Masculino' 
    : data.sexo === 'feminino' 
    ? 'Feminino' 
    : data.sexo === 'outro' 
    ? `Outro: ${data.sexoOutro}` 
    : '-';

  const sintomasLabel = data.sintomas.length > 0
    ? data.sintomas.map(s => s === 'outros' && data.sintomasOutros 
        ? `Outros: ${data.sintomasOutros}` 
        : SINTOMAS_LABELS[s] || s).join(', ')
    : 'Nenhum sintoma selecionado';

  const currentDate = new Date().toLocaleDateString('pt-BR');

  return `<!DOCTYPE html>
<html lang="pt-BR">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Questionário Clínico - ${data.nome}</title>
  <style>
    * {
      margin: 0;
      padding: 0;
      box-sizing: border-box;
    }
    body {
      font-family: 'Helvetica Neue', Arial, sans-serif;
      font-size: 12px;
      line-height: 1.5;
      color: #333;
      padding: 40px;
      max-width: 800px;
      margin: 0 auto;
    }
    .header {
      text-align: center;
      margin-bottom: 30px;
      padding-bottom: 20px;
      border-bottom: 2px solid #0066cc;
    }
    .header h1 {
      font-size: 24px;
      color: #0066cc;
      margin-bottom: 8px;
    }
    .header p {
      font-size: 14px;
      color: #666;
    }
    .date {
      text-align: right;
      color: #666;
      margin-bottom: 20px;
    }
    .section {
      margin-bottom: 25px;
    }
    .section-title {
      font-size: 16px;
      font-weight: bold;
      color: #0066cc;
      margin-bottom: 12px;
      padding-bottom: 5px;
      border-bottom: 1px solid #ddd;
    }
    .item {
      display: flex;
      justify-content: space-between;
      padding: 8px 0;
      border-bottom: 1px solid #eee;
    }
    .item:last-child {
      border-bottom: none;
    }
    .item-label {
      color: #666;
    }
    .item-value {
      font-weight: 500;
      color: #333;
    }
    .item-value.highlight {
      color: #dc3545;
      font-weight: bold;
    }
    .signature-section {
      margin-top: 30px;
      padding-top: 20px;
      border-top: 2px solid #0066cc;
    }
    .signature-label {
      font-weight: bold;
      margin-bottom: 10px;
    }
    .signature-image {
      max-width: 200px;
      max-height: 80px;
      border: 1px solid #ddd;
      padding: 5px;
      background: #fafafa;
    }
    .footer {
      margin-top: 40px;
      padding-top: 15px;
      border-top: 1px solid #ddd;
      text-align: center;
      font-size: 10px;
      color: #999;
      font-style: italic;
    }
  </style>
</head>
<body>
  <div class="header">
    <h1>Questionário Clínico</h1>
    <p>Exame de Tomografia Computadorizada</p>
  </div>

  <p class="date">Data: ${currentDate}</p>

  <div class="section">
    <h2 class="section-title">Dados Pessoais</h2>
    <div class="item">
      <span class="item-label">Nome</span>
      <span class="item-value">${data.nome || '-'}</span>
    </div>
    <div class="item">
      <span class="item-label">Idade</span>
      <span class="item-value">${data.idade ? `${data.idade} anos` : '-'}</span>
    </div>
    <div class="item">
      <span class="item-label">Sexo</span>
      <span class="item-value">${sexoLabel}</span>
    </div>
  </div>

  <div class="section">
    <h2 class="section-title">Questões de Segurança</h2>
    <div class="item">
      <span class="item-label">Contraindicação</span>
      <span class="item-value${data.temContraindicacao ? ' highlight' : ''}">${formatBoolean(data.temContraindicacao)}</span>
    </div>
    ${data.temContraindicacao && data.contraindicacaoDetalhes ? `
    <div class="item">
      <span class="item-label">Detalhes da contraindicação</span>
      <span class="item-value">${data.contraindicacaoDetalhes}</span>
    </div>
    ` : ''}
    <div class="item">
      <span class="item-label">Tomografia anterior (12 meses)</span>
      <span class="item-value">${formatBoolean(data.tomografiaAnterior)}</span>
    </div>
    <div class="item">
      <span class="item-label">Alergia a contraste</span>
      <span class="item-value${data.alergia ? ' highlight' : ''}">${formatBoolean(data.alergia)}</span>
    </div>
    ${data.alergia && data.alergiaDetalhes ? `
    <div class="item">
      <span class="item-label">Detalhes da alergia</span>
      <span class="item-value">${data.alergiaDetalhes}</span>
    </div>
    ` : ''}
    ${data.sexo === 'feminino' ? `
    <div class="item">
      <span class="item-label">Gravidez</span>
      <span class="item-value${data.gravida ? ' highlight' : ''}">${formatBoolean(data.gravida)}</span>
    </div>
    ` : ''}
  </div>

  <div class="section">
    <h2 class="section-title">Questões Clínicas</h2>
    <div class="item">
      <span class="item-label">Motivo do Exame</span>
      <span class="item-value">${data.motivoExame || '-'}</span>
    </div>
    <div class="item">
      <span class="item-label">Sintomas</span>
      <span class="item-value">${sintomasLabel}</span>
    </div>
    ${data.sexo === 'feminino' ? `
    <div class="item">
      <span class="item-label">Diagnóstico de câncer de mama</span>
      <span class="item-value${data.cancerMama ? ' highlight' : ''}">${formatBoolean(data.cancerMama)}</span>
    </div>
    <div class="item">
      <span class="item-label">Amamentação</span>
      <span class="item-value">${formatBoolean(data.amamentando)}</span>
    </div>
    ` : ''}
    ${data.sexo === 'masculino' ? `
    <div class="item">
      <span class="item-label">Problemas na próstata</span>
      <span class="item-value${data.problemaProstata ? ' highlight' : ''}">${formatBoolean(data.problemaProstata)}</span>
    </div>
    <div class="item">
      <span class="item-label">Dificuldades urinárias</span>
      <span class="item-value${data.dificuldadeUrinaria ? ' highlight' : ''}">${formatBoolean(data.dificuldadeUrinaria)}</span>
    </div>
    ` : ''}
  </div>

  <div class="section">
    <h2 class="section-title">Termo de Consentimento</h2>
    <div class="item">
      <span class="item-label">Aceita riscos do exame</span>
      <span class="item-value">${formatBoolean(data.aceitaRiscos)}</span>
    </div>
    <div class="item">
      <span class="item-label">Autoriza compartilhamento de dados</span>
      <span class="item-value">${formatBoolean(data.aceitaCompartilhamento)}</span>
    </div>
  </div>

  ${data.assinaturaData ? `
  <div class="signature-section">
    <p class="signature-label">Assinatura do Paciente:</p>
    <img src="${data.assinaturaData}" alt="Assinatura do paciente" class="signature-image" />
  </div>
  ` : ''}

  <div class="footer">
    Documento gerado automaticamente pelo sistema de questionário clínico.
  </div>
</body>
</html>`;
}

function downloadHTML(data: QuestionnaireData) {
  const html = generateQuestionnaireHTML(data);
  const blob = new Blob([html], { type: 'text/html;charset=utf-8' });
  const url = URL.createObjectURL(blob);
  const link = document.createElement('a');
  link.href = url;
  link.download = `questionario_${data.nome.replace(/\s+/g, '_').toLowerCase()}_${new Date().toISOString().split('T')[0]}.html`;
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
  URL.revokeObjectURL(url);
}

export function Summary({ data, onReset, savedId }: SummaryProps) {
  const sexoLabel = data.sexo === 'masculino' 
    ? 'Masculino' 
    : data.sexo === 'feminino' 
    ? 'Feminino' 
    : data.sexo === 'outro' 
    ? `Outro: ${data.sexoOutro}` 
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
          <SummaryItem label="Idade" value={data.idade ? `${data.idade} anos` : '-'} />
          <SummaryItem label="Sexo" value={sexoLabel} />
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
        <Button
          onClick={() => downloadHTML(data)}
          className="flex items-center gap-2 bg-gradient-to-r from-primary to-primary-glow"
        >
          <Download className="w-4 h-4" />
          Baixar HTML
        </Button>
      </div>
    </div>
  );
}