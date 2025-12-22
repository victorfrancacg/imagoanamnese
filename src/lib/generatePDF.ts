import jsPDF from "jspdf";
import { QuestionnaireData } from "@/types/questionnaire";

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

export function generateQuestionnairePDF(data: QuestionnaireData): Blob {
  const doc = new jsPDF();
  const pageWidth = doc.internal.pageSize.getWidth();
  const margin = 20;
  let yPos = 20;

  // Helper function to add text and handle page breaks
  const addText = (text: string, x: number, fontSize: number = 10, isBold: boolean = false) => {
    if (yPos > 270) {
      doc.addPage();
      yPos = 20;
    }
    doc.setFontSize(fontSize);
    doc.setFont("helvetica", isBold ? "bold" : "normal");
    doc.text(text, x, yPos);
  };

  const addLine = (startX: number, endX: number, color: [number, number, number] = [0, 102, 204]) => {
    doc.setDrawColor(...color);
    doc.setLineWidth(0.5);
    doc.line(startX, yPos, endX, yPos);
  };

  const addRow = (label: string, value: string, highlight: boolean = false) => {
    if (yPos > 270) {
      doc.addPage();
      yPos = 20;
    }
    doc.setFontSize(10);
    doc.setFont("helvetica", "normal");
    doc.setTextColor(100, 100, 100);
    doc.text(label, margin, yPos);
    
    doc.setTextColor(highlight ? 220 : 51, highlight ? 53 : 51, highlight ? 69 : 51);
    doc.setFont("helvetica", highlight ? "bold" : "normal");
    doc.text(value, pageWidth - margin, yPos, { align: "right" });
    yPos += 7;
  };

  // Header
  doc.setTextColor(0, 102, 204);
  addText("Questionário Clínico", pageWidth / 2, 20, true);
  doc.text("Questionário Clínico", pageWidth / 2, yPos, { align: "center" });
  yPos += 8;
  doc.setTextColor(100, 100, 100);
  doc.setFontSize(12);
  doc.text("Exame de Tomografia Computadorizada", pageWidth / 2, yPos, { align: "center" });
  yPos += 5;
  addLine(margin, pageWidth - margin);
  yPos += 10;

  // Date
  const currentDate = new Date().toLocaleDateString('pt-BR');
  doc.setFontSize(9);
  doc.setTextColor(100, 100, 100);
  doc.text(`Data: ${currentDate}`, pageWidth - margin, yPos, { align: "right" });
  yPos += 15;

  // Dados Pessoais
  doc.setTextColor(0, 102, 204);
  addText("Dados Pessoais", margin, 14, true);
  yPos += 3;
  addLine(margin, pageWidth - margin, [221, 221, 221]);
  yPos += 8;

  const sexoLabel = data.sexo === 'masculino' 
    ? 'Masculino' 
    : data.sexo === 'feminino' 
    ? 'Feminino' 
    : '-';

  addRow("Nome", data.nome || '-');
  addRow("CPF", data.cpf || '-');
  addRow("Data de Nascimento", formatDate(data.dataNascimento));
  addRow("Sexo", sexoLabel);
  addRow("Peso", data.peso ? `${data.peso} kg` : '-');
  addRow("Altura", data.altura ? `${data.altura} cm` : '-');
  addRow("Tipo do Exame", data.tipoExame || '-');
  addRow("Data do Exame", formatDate(data.dataExame));
  yPos += 8;

  // Questões de Segurança
  doc.setTextColor(0, 102, 204);
  addText("Questões de Segurança", margin, 14, true);
  yPos += 3;
  addLine(margin, pageWidth - margin, [221, 221, 221]);
  yPos += 8;

  addRow("Contraindicação", formatBoolean(data.temContraindicacao), data.temContraindicacao === true);
  if (data.temContraindicacao && data.contraindicacaoDetalhes) {
    addRow("Detalhes da contraindicação", data.contraindicacaoDetalhes);
  }
  addRow("Tomografia anterior (12 meses)", formatBoolean(data.tomografiaAnterior));
  addRow("Alergia a contraste", formatBoolean(data.alergia), data.alergia === true);
  if (data.alergia && data.alergiaDetalhes) {
    addRow("Detalhes da alergia", data.alergiaDetalhes);
  }
  if (data.sexo === 'feminino') {
    addRow("Gravidez", formatBoolean(data.gravida), data.gravida === true);
  }
  yPos += 8;

  // Questões Clínicas
  doc.setTextColor(0, 102, 204);
  addText("Questões Clínicas", margin, 14, true);
  yPos += 3;
  addLine(margin, pageWidth - margin, [221, 221, 221]);
  yPos += 8;

  const sintomasLabel = data.sintomas.length > 0
    ? data.sintomas.map(s => s === 'outros' && data.sintomasOutros 
        ? `Outros: ${data.sintomasOutros}` 
        : SINTOMAS_LABELS[s] || s).join(', ')
    : 'Nenhum sintoma selecionado';

  addRow("Motivo do Exame", data.motivoExame || '-');
  addRow("Sintomas", sintomasLabel);
  
  if (data.sexo === 'feminino') {
    addRow("Diagnóstico de câncer de mama", formatBoolean(data.cancerMama), data.cancerMama === true);
    addRow("Amamentação", formatBoolean(data.amamentando));
  }
  if (data.sexo === 'masculino') {
    addRow("Problemas na próstata", formatBoolean(data.problemaProstata), data.problemaProstata === true);
    addRow("Dificuldades urinárias", formatBoolean(data.dificuldadeUrinaria), data.dificuldadeUrinaria === true);
  }
  yPos += 8;

  // Termo de Consentimento
  doc.setTextColor(0, 102, 204);
  addText("Termo de Consentimento", margin, 14, true);
  yPos += 3;
  addLine(margin, pageWidth - margin, [221, 221, 221]);
  yPos += 8;

  addRow("Aceita riscos do exame", formatBoolean(data.aceitaRiscos));
  addRow("Autoriza compartilhamento de dados", formatBoolean(data.aceitaCompartilhamento));
  yPos += 10;

  // Assinatura
  if (data.assinaturaData) {
    addLine(margin, pageWidth - margin, [0, 102, 204]);
    yPos += 10;
    
    doc.setFont("helvetica", "bold");
    doc.setTextColor(51, 51, 51);
    doc.setFontSize(11);
    doc.text("Assinatura do Paciente:", margin, yPos);
    yPos += 8;

    try {
      doc.addImage(data.assinaturaData, 'PNG', margin, yPos, 60, 25);
      yPos += 30;
    } catch (e) {
      console.error("Erro ao adicionar assinatura:", e);
    }
  }

  // Footer
  yPos += 10;
  addLine(margin, pageWidth - margin, [221, 221, 221]);
  yPos += 8;
  doc.setFontSize(8);
  doc.setTextColor(150, 150, 150);
  doc.setFont("helvetica", "italic");
  doc.text("Documento gerado automaticamente pelo sistema de questionário clínico.", pageWidth / 2, yPos, { align: "center" });

  return doc.output('blob');
}
