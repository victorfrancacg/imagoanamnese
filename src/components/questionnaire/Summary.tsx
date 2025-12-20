import { QuestionnaireData } from "@/types/questionnaire";
import { Button } from "@/components/ui/button";
import { CheckCircle2, User, Shield, Stethoscope, FileCheck, RotateCcw, Download } from "lucide-react";
import jsPDF from "jspdf";

interface SummaryProps {
  data: QuestionnaireData;
  onReset: () => void;
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

export function Summary({ data, onReset }: SummaryProps) {
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

  const generatePDF = () => {
    const pdf = new jsPDF();
    const pageWidth = pdf.internal.pageSize.getWidth();
    let yPosition = 20;
    const lineHeight = 7;
    const marginLeft = 20;
    const maxWidth = pageWidth - 40;

    // Header
    pdf.setFontSize(18);
    pdf.setFont('helvetica', 'bold');
    pdf.text('Questionário Clínico', pageWidth / 2, yPosition, { align: 'center' });
    yPosition += 8;
    
    pdf.setFontSize(12);
    pdf.setFont('helvetica', 'normal');
    pdf.text('Exame de Tomografia Computadorizada', pageWidth / 2, yPosition, { align: 'center' });
    yPosition += 15;

    // Date
    pdf.setFontSize(10);
    pdf.text(`Data: ${new Date().toLocaleDateString('pt-BR')}`, marginLeft, yPosition);
    yPosition += 15;

    // Helper function to add section
    const addSection = (title: string) => {
      if (yPosition > 260) {
        pdf.addPage();
        yPosition = 20;
      }
      pdf.setFontSize(14);
      pdf.setFont('helvetica', 'bold');
      pdf.text(title, marginLeft, yPosition);
      yPosition += 10;
      pdf.setFont('helvetica', 'normal');
      pdf.setFontSize(10);
    };

    // Helper function to add item
    const addItem = (label: string, value: string) => {
      if (yPosition > 270) {
        pdf.addPage();
        yPosition = 20;
      }
      pdf.text(`${label}: ${value}`, marginLeft, yPosition);
      yPosition += lineHeight;
    };

    // Dados Pessoais
    addSection('Dados Pessoais');
    addItem('Nome', data.nome || '-');
    addItem('Idade', data.idade ? `${data.idade} anos` : '-');
    addItem('Sexo', sexoLabel);
    yPosition += 5;

    // Questões de Segurança
    addSection('Questões de Segurança');
    addItem('Contraindicação', formatBoolean(data.temContraindicacao));
    if (data.temContraindicacao && data.contraindicacaoDetalhes) {
      addItem('Detalhes da contraindicação', data.contraindicacaoDetalhes);
    }
    addItem('Tomografia anterior (12 meses)', formatBoolean(data.tomografiaAnterior));
    addItem('Alergia a contraste', formatBoolean(data.alergia));
    if (data.alergia && data.alergiaDetalhes) {
      addItem('Detalhes da alergia', data.alergiaDetalhes);
    }
    if (data.sexo === 'feminino') {
      addItem('Gravidez', formatBoolean(data.gravida));
    }
    yPosition += 5;

    // Questões Clínicas
    addSection('Questões Clínicas');
    addItem('Motivo do Exame', data.motivoExame || '-');
    
    // Handle long symptoms text
    const sintomasText = sintomasLabel;
    const splitSintomas = pdf.splitTextToSize(`Sintomas: ${sintomasText}`, maxWidth);
    pdf.text(splitSintomas, marginLeft, yPosition);
    yPosition += splitSintomas.length * lineHeight;
    
    // Sex-specific questions
    if (data.sexo === 'feminino') {
      yPosition += 3;
      addItem('Diagnóstico de câncer de mama', formatBoolean(data.cancerMama));
      addItem('Amamentação', formatBoolean(data.amamentando));
    }
    if (data.sexo === 'masculino') {
      yPosition += 3;
      addItem('Problemas na próstata', formatBoolean(data.problemaProstata));
      addItem('Dificuldades urinárias', formatBoolean(data.dificuldadeUrinaria));
    }
    yPosition += 5;

    // Termo de Consentimento
    addSection('Termo de Consentimento');
    addItem('Aceita riscos do exame', formatBoolean(data.aceitaRiscos));
    addItem('Autoriza compartilhamento de dados', formatBoolean(data.aceitaCompartilhamento));
    yPosition += 10;

    // Assinatura
    if (data.assinaturaData) {
      if (yPosition > 220) {
        pdf.addPage();
        yPosition = 20;
      }
      pdf.setFontSize(12);
      pdf.setFont('helvetica', 'bold');
      pdf.text('Assinatura do Paciente:', marginLeft, yPosition);
      yPosition += 5;
      
      try {
        pdf.addImage(data.assinaturaData, 'PNG', marginLeft, yPosition, 60, 30);
        yPosition += 35;
      } catch (e) {
        console.error('Error adding signature to PDF:', e);
      }
    }

    // Footer
    yPosition += 10;
    pdf.setFontSize(8);
    pdf.setFont('helvetica', 'italic');
    pdf.text('Documento gerado automaticamente pelo sistema de questionário clínico.', marginLeft, yPosition);

    // Save PDF
    const fileName = `questionario_${data.nome.replace(/\s+/g, '_').toLowerCase()}_${new Date().toISOString().split('T')[0]}.pdf`;
    pdf.save(fileName);
  };

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
          onClick={generatePDF}
          className="flex items-center gap-2 bg-gradient-to-r from-primary to-primary-glow"
        >
          <Download className="w-4 h-4" />
          Salvar Questionário
        </Button>
      </div>
    </div>
  );
}
