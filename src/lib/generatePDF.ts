import jsPDF from "jspdf";
import { QuestionnaireData } from "@/types/questionnaire";
import imagoLogo from "@/assets/imago-logo.png";

function formatBoolean(value: boolean | null): string {
  if (value === null) return '-';
  return value ? 'Sim' : 'Não';
}

function formatDate(dateString: string): string {
  if (!dateString) return '-';
  const [year, month, day] = dateString.split('-');
  return `${day}/${month}/${year}`;
}

// Cores do tema IMAGO
const COLORS = {
  primary: [59, 100, 143] as [number, number, number],      // Azul principal #3B648F
  primaryDark: [47, 79, 114] as [number, number, number],   // Azul escuro
  text: [51, 51, 51] as [number, number, number],            // Texto principal
  textLight: [120, 120, 120] as [number, number, number],    // Texto secundário
  border: [200, 210, 220] as [number, number, number],       // Bordas
  background: [245, 248, 250] as [number, number, number],   // Background claro
  white: [255, 255, 255] as [number, number, number],
};

export function generateQuestionnairePDF(data: QuestionnaireData): Blob {
  const doc = new jsPDF();
  const pageWidth = doc.internal.pageSize.getWidth();
  const pageHeight = doc.internal.pageSize.getHeight();
  const margin = 15;
  let yPos = 15;

  // Função para adicionar nova página se necessário
  const checkPageBreak = (height: number = 20) => {
    if (yPos + height > pageHeight - 25) {
      doc.addPage();
      yPos = 20;
      return true;
    }
    return false;
  };

  // Helper function to add text with page break handling
  const addText = (text: string, x: number, fontSize: number = 10, isBold: boolean = false, color: [number, number, number] = COLORS.text) => {
    checkPageBreak();
    doc.setFontSize(fontSize);
    doc.setFont("helvetica", isBold ? "bold" : "normal");
    doc.setTextColor(...color);
    doc.text(text, x, yPos);
  };

  const addLine = (startX: number, endX: number, color: [number, number, number] = COLORS.border) => {
    doc.setDrawColor(...color);
    doc.setLineWidth(0.3);
    doc.line(startX, yPos, endX, yPos);
  };

  // Adiciona uma linha de dados estilo tabela
  const addDataRow = (label: string, value: string, isHighlight: boolean = false) => {
    checkPageBreak(8);
    
    // Background alternado para melhor legibilidade
    doc.setFillColor(...COLORS.background);
    doc.rect(margin, yPos - 4, pageWidth - margin * 2, 7, 'F');
    
    doc.setFontSize(9);
    doc.setFont("helvetica", "normal");
    doc.setTextColor(...COLORS.textLight);
    doc.text(label, margin + 3, yPos);
    
    doc.setTextColor(isHighlight ? 180 : COLORS.text[0], isHighlight ? 50 : COLORS.text[1], isHighlight ? 50 : COLORS.text[2]);
    doc.setFont("helvetica", isHighlight ? "bold" : "normal");
    doc.text(value, pageWidth - margin - 3, yPos, { align: "right" });
    yPos += 7;
  };

  // Adiciona seção com título
  const addSection = (title: string) => {
    checkPageBreak(20);
    yPos += 5;
    
    // Badge azul para o título da seção
    const textWidth = doc.getTextWidth(title) + 10;
    doc.setFillColor(...COLORS.primary);
    
    // Retângulo arredondado
    doc.roundedRect(margin, yPos - 5, textWidth, 8, 2, 2, 'F');
    
    doc.setFontSize(9);
    doc.setFont("helvetica", "bold");
    doc.setTextColor(...COLORS.white);
    doc.text(title, margin + 5, yPos);
    yPos += 10;
  };

  const isDensitometria = data.tipoExame === 'densitometria';
  const isMamografia = data.tipoExame === 'mamografia';
  const isTomografia = data.tipoExame === 'tomografia';
  const isRessonancia = data.tipoExame === 'ressonancia';
  const isFeminino = data.sexo === 'feminino';

  // ========== CABEÇALHO ==========
  // Adicionar logo IMAGO
  try {
    doc.addImage(imagoLogo, 'PNG', margin, yPos, 45, 15);
  } catch (e) {
    // Fallback: texto do logo
    doc.setFontSize(20);
    doc.setFont("helvetica", "bold");
    doc.setTextColor(...COLORS.primary);
    doc.text("IMAGO", margin, yPos + 10);
    doc.setFontSize(7);
    doc.text("DIAGNÓSTICO POR IMAGEM", margin, yPos + 14);
  }

  // Badge do tipo de exame
  const examTypeLabels: Record<string, string> = {
    'tomografia': 'TOMOGRAFIA COMPUTADORIZADA',
    'ressonancia': 'RESSONÂNCIA MAGNÉTICA',
    'densitometria': 'DENSITOMETRIA',
    'mamografia': 'MAMOGRAFIA',
  };
  const examLabel = examTypeLabels[data.tipoExame] || 'EXAME';
  
  const badgeWidth = doc.getTextWidth(examLabel) + 20;
  const badgeX = pageWidth - margin - badgeWidth;
  
  // Badge arredondado azul
  doc.setFillColor(...COLORS.primary);
  doc.roundedRect(badgeX, yPos + 2, badgeWidth, 10, 5, 5, 'F');
  
  doc.setFontSize(10);
  doc.setFont("helvetica", "bold");
  doc.setTextColor(...COLORS.white);
  doc.text(examLabel, badgeX + badgeWidth / 2, yPos + 9, { align: "center" });
  
  yPos += 25;

  // Linha divisória do cabeçalho
  doc.setDrawColor(...COLORS.primary);
  doc.setLineWidth(1);
  doc.line(margin, yPos, pageWidth - margin, yPos);
  yPos += 8;

  // Data do documento
  const currentDate = new Date().toLocaleDateString('pt-BR');
  doc.setFontSize(8);
  doc.setTextColor(...COLORS.textLight);
  doc.text(`Documento gerado em: ${currentDate}`, pageWidth - margin, yPos, { align: "right" });
  yPos += 10;

  // ========== DADOS PESSOAIS ==========
  addSection("DADOS PESSOAIS");

  const sexoLabel = data.sexo === 'masculino' 
    ? 'Masculino' 
    : data.sexo === 'feminino' 
    ? 'Feminino' 
    : '-';

  addDataRow("Nome do Paciente", data.nome || '-');
  addDataRow("CPF", data.cpf || '-');
  addDataRow("Data de Nascimento", formatDate(data.dataNascimento));
  addDataRow("Sexo", sexoLabel);
  addDataRow("Peso", data.peso ? `${data.peso} kg` : '-');
  addDataRow("Altura", data.altura ? `${data.altura} cm` : '-');
  addDataRow("Data do Exame", formatDate(data.dataExame));

  // ========== QUESTÕES DE SEGURANÇA ==========
  addSection("QUESTÕES DE SEGURANÇA");

  // Campos segurança para Tomografia e Ressonância
  if (isTomografia || isRessonancia) {
    addDataRow("Possui contraindicação", formatBoolean(data.temContraindicacao), data.temContraindicacao === true);
    if (data.temContraindicacao && data.contraindicacaoDetalhes) {
      addDataRow("Detalhes da contraindicação", data.contraindicacaoDetalhes);
    }
    
    const exameAnteriorLabel = isRessonancia 
      ? 'Ressonância anterior (12 meses)' 
      : 'Tomografia anterior (12 meses)';
    addDataRow(exameAnteriorLabel, formatBoolean(data.tomografiaAnterior));
    addDataRow("Alergia a contraste", formatBoolean(data.alergia), data.alergia === true);
    if (data.alergia && data.alergiaDetalhes) {
      addDataRow("Detalhes da alergia", data.alergiaDetalhes);
    }
  }

  if (isFeminino) {
    addDataRow("Gravidez", formatBoolean(data.gravida), data.gravida === true);
  }
  
  // Campos específicos de Tomografia (Segurança)
  if (isTomografia) {
    addDataRow("Uso de metformina", formatBoolean(data.usaMetformina));
    addDataRow("Cirurgia renal", formatBoolean(data.cirurgiaRenal), data.cirurgiaRenal === true);
    if (data.cirurgiaRenal && data.cirurgiaRenalDetalhes) {
      addDataRow("Detalhes cirurgia renal", data.cirurgiaRenalDetalhes);
    }
    addDataRow("Doença renal", formatBoolean(data.doencaRenal), data.doencaRenal === true);
    if (data.doencaRenal && data.doencaRenalDetalhes) {
      addDataRow("Detalhes doença renal", data.doencaRenalDetalhes);
    }
  }

  // Campos específicos de Densitometria (Segurança)
  if (isDensitometria) {
    addDataRow("Exame contraste/bário recente", formatBoolean(data.exameContrasteRecente), data.exameContrasteRecente === true);
    addDataRow("Fraturou osso (5 anos)", formatBoolean(data.fraturouOsso), data.fraturouOsso === true);
    if (data.fraturouOsso && data.fraturouOssoDetalhes) {
      addDataRow("Detalhes da fratura", data.fraturouOssoDetalhes);
    }
    addDataRow("Perdeu mais de 3cm de altura", formatBoolean(data.perdeuAltura), data.perdeuAltura === true);
    addDataRow("Perda óssea em radiografia", formatBoolean(data.perdaOsseaRadiografia), data.perdaOsseaRadiografia === true);
    addDataRow("Cifose dorsal", formatBoolean(data.cifoseDorsal), data.cifoseDorsal === true);
    addDataRow("Mais de uma queda (12 meses)", formatBoolean(data.quedas12Meses), data.quedas12Meses === true);
    addDataRow("Parente com osteoporose", formatBoolean(data.parenteOsteoporose), data.parenteOsteoporose === true);
    if (data.parenteOsteoporose && data.parenteOsteoporoseDetalhes) {
      addDataRow("Qual parente", data.parenteOsteoporoseDetalhes);
    }
  }

  // ========== QUESTÕES CLÍNICAS ==========
  addSection("QUESTÕES CLÍNICAS");

  addDataRow(isDensitometria ? "Motivo (Densitometria)" : "Motivo do Exame", data.motivoExame || '-');
  
  // Campos específicos de Mamografia
  if (isMamografia) {
    addDataRow("Exame anterior", formatBoolean(data.mamoExameAnterior));
    if (data.mamoExameAnterior && data.mamoExameAnteriorDetalhes) {
      addDataRow("Quando realizou", data.mamoExameAnteriorDetalhes);
    }
    addDataRow("Última menstruação", data.mamoUltimaMenstruacao || '-');
    addDataRow("Na menopausa", formatBoolean(data.mamoMenopausa));
    if (data.mamoMenopausa && data.mamoMenopausaDetalhes) {
      addDataRow("Idade menopausa", data.mamoMenopausaDetalhes);
    }
    addDataRow("Usa hormônios", formatBoolean(data.mamoUsaHormonios));
    addDataRow("Tem filhos", formatBoolean(data.mamoTemFilhos));
    if (data.mamoTemFilhos && data.mamoTemFilhosDetalhes) {
      addDataRow("Amamentação", data.mamoTemFilhosDetalhes);
    }
    addDataRow("Problema nas mamas", formatBoolean(data.mamoProblemaMamas), data.mamoProblemaMamas === true);
    if (data.mamoProblemaMamas && data.mamoProblemaMamasDetalhes) {
      addDataRow("Detalhes problema", data.mamoProblemaMamasDetalhes);
    }
    addDataRow("Cirurgia nas mamas", formatBoolean(data.mamoCirurgiaMamas));
    if (data.mamoCirurgiaMamas && data.mamoCirurgiaMamasDetalhes) {
      addDataRow("Detalhes cirurgia", data.mamoCirurgiaMamasDetalhes);
    }
    addDataRow("Ultrassonografia mama", formatBoolean(data.mamoUltrassonografia));
    if (data.mamoUltrassonografia && data.mamoUltrassonografiaDetalhes) {
      addDataRow("Quando realizou", data.mamoUltrassonografiaDetalhes);
    }
    addDataRow("Histórico familiar câncer mama/ovário", formatBoolean(data.mamoHistoricoFamiliar), data.mamoHistoricoFamiliar === true);
    if (data.mamoHistoricoFamiliar && data.mamoHistoricoFamiliarDetalhes) {
      addDataRow("Quais parentes", data.mamoHistoricoFamiliarDetalhes);
    }
    addDataRow("Radioterapia mama", formatBoolean(data.mamoRadioterapia), data.mamoRadioterapia === true);
    if (data.mamoRadioterapia && data.mamoRadioterapiaDetalhes) {
      addDataRow("Ano radioterapia", data.mamoRadioterapiaDetalhes);
    }
  }
  
  // Campos específicos de Tomografia e Ressonância (Clínicas)
  if (isTomografia || isRessonancia) {
    addDataRow("Trauma na região", formatBoolean(data.traumaRegiao), data.traumaRegiao === true);
    addDataRow("Cirurgia no corpo", formatBoolean(data.cirurgiaCorpo));
    if (data.cirurgiaCorpo && data.cirurgiaCorpoDetalhes) {
      addDataRow("Detalhes cirurgia", data.cirurgiaCorpoDetalhes);
    }
    addDataRow("Histórico de câncer", formatBoolean(data.historicoCancer), data.historicoCancer === true);
    if (data.historicoCancer && data.historicoCancerDetalhes) {
      addDataRow("Detalhes câncer", data.historicoCancerDetalhes);
    }
  }
  
  // Campo específico de Ressonância
  if (isRessonancia) {
    addDataRow("Exames relacionados", formatBoolean(data.examesRelacionados));
    if (data.examesRelacionados && data.examesRelacionadosDetalhes) {
      addDataRow("Detalhes exames", data.examesRelacionadosDetalhes);
    }
  }

  // Campos específicos de Densitometria (Clínicas)
  if (isDensitometria) {
    addDataRow("Osteoporose", formatBoolean(data.temOsteoporose), data.temOsteoporose === true);
    addDataRow("Doença na tireoide", formatBoolean(data.doencaTireoide), data.doencaTireoide === true);
    if (data.doencaTireoide && data.doencaTireoideDetalhes) {
      addDataRow("Detalhes tireoide", data.doencaTireoideDetalhes);
    }
    addDataRow("Doença intestinal crônica", formatBoolean(data.doencaIntestinal), data.doencaIntestinal === true);
    if (data.doencaIntestinal && data.doencaIntestinalDetalhes) {
      addDataRow("Detalhes intestinal", data.doencaIntestinalDetalhes);
    }
    addDataRow("Hiperparatiroidismo", formatBoolean(data.temHiperparatiroidismo), data.temHiperparatiroidismo === true);
    addDataRow("Doença de Paget", formatBoolean(data.temDoencaPaget), data.temDoencaPaget === true);
    addDataRow("Má absorção de cálcio", formatBoolean(data.maAbsorcaoCalcio), data.maAbsorcaoCalcio === true);
    addDataRow("Osteomalácia", formatBoolean(data.temOsteomalacia), data.temOsteomalacia === true);
    addDataRow("Síndrome de Cushing", formatBoolean(data.temSindromeCushing), data.temSindromeCushing === true);
    addDataRow("Deficiência vitamina D", formatBoolean(data.deficienciaVitaminaD), data.deficienciaVitaminaD === true);
    addDataRow("Disfunção renal crônica", formatBoolean(data.disfuncaoRenalCronica), data.disfuncaoRenalCronica === true);
    addDataRow("Usa medicação regular", formatBoolean(data.usaMedicacaoRegular));
    if (data.usaMedicacaoRegular && data.usaMedicacaoRegularDetalhes) {
      addDataRow("Medicações", data.usaMedicacaoRegularDetalhes);
    }

    // Campos Densitometria Feminino
    if (isFeminino) {
      addDataRow("Passou pela menopausa", formatBoolean(data.passouMenopausa));
      if (data.passouMenopausa && data.passouMenopausaDetalhes) {
        addDataRow("Detalhes menopausa", data.passouMenopausaDetalhes);
      }
      addDataRow("Ciclos irregulares/perimenopausa", formatBoolean(data.ciclosIrregulares));
      addDataRow("Câncer de mama", formatBoolean(data.teveCancerMamaDensi), data.teveCancerMamaDensi === true);
      addDataRow("Histerectomia", formatBoolean(data.fezHisterectomia));
      if (data.fezHisterectomia && data.fezHisterectomiaDetalhes) {
        addDataRow("Detalhes histerectomia", data.fezHisterectomiaDetalhes);
      }
      addDataRow("Retirou ovários", formatBoolean(data.retirouOvarios));
    }
  }
  
  // Amamentando apenas para tomografia
  if (isFeminino && isTomografia) {
    addDataRow("Amamentação", formatBoolean(data.amamentando));
  }
  
  if (data.sexo === 'masculino' && (isTomografia || isRessonancia)) {
    addDataRow("Problemas na próstata", formatBoolean(data.problemaProstata), data.problemaProstata === true);
    addDataRow("Dificuldades urinárias", formatBoolean(data.dificuldadeUrinaria), data.dificuldadeUrinaria === true);
  }

  // ========== TERMO DE CONSENTIMENTO ==========
  addSection("TERMO DE CONSENTIMENTO");
  
  addDataRow("Aceita os riscos do exame", formatBoolean(data.aceitaRiscos));
  addDataRow("Autoriza compartilhamento de dados", formatBoolean(data.aceitaCompartilhamento));

  // ========== ASSINATURAS ==========
  checkPageBreak(80);
  yPos += 10;
  
  // Linha divisória antes das assinaturas
  doc.setDrawColor(...COLORS.primary);
  doc.setLineWidth(0.5);
  doc.line(margin, yPos, pageWidth - margin, yPos);
  yPos += 15;

  // Container das assinaturas
  const signatureWidth = (pageWidth - margin * 2 - 20) / 2;
  const signatureHeight = 40;

  // ===== Assinatura do Paciente (Esquerda) =====
  doc.setFontSize(9);
  doc.setFont("helvetica", "bold");
  doc.setTextColor(...COLORS.primary);
  doc.text("ASSINATURA DO PACIENTE", margin, yPos);
  yPos += 5;

  // Caixa para assinatura do paciente
  doc.setDrawColor(...COLORS.border);
  doc.setLineWidth(0.5);
  doc.rect(margin, yPos, signatureWidth, signatureHeight);

  // Adicionar assinatura do paciente se existir
  if (data.assinaturaData && data.assinaturaData.startsWith('data:image')) {
    try {
      const imgFormat = data.assinaturaData.includes('image/png') ? 'PNG' : 'JPEG';
      doc.addImage(data.assinaturaData, imgFormat, margin + 5, yPos + 2, signatureWidth - 10, signatureHeight - 8);
    } catch (e) {
      console.error("Erro ao adicionar assinatura do paciente:", e);
      doc.setFontSize(8);
      doc.setTextColor(...COLORS.textLight);
      doc.text("Assinatura não disponível", margin + signatureWidth / 2, yPos + signatureHeight / 2, { align: "center" });
    }
  } else {
    doc.setFontSize(8);
    doc.setTextColor(...COLORS.textLight);
    doc.text("Assinatura não fornecida", margin + signatureWidth / 2, yPos + signatureHeight / 2, { align: "center" });
  }

  // Linha para nome do paciente abaixo da assinatura
  const patientSignatureY = yPos + signatureHeight + 5;
  doc.setDrawColor(...COLORS.text);
  doc.setLineWidth(0.3);
  doc.line(margin, patientSignatureY, margin + signatureWidth, patientSignatureY);
  
  doc.setFontSize(8);
  doc.setTextColor(...COLORS.textLight);
  doc.text("Nome: " + (data.nome || '_______________________'), margin, patientSignatureY + 5);

  // ===== Assinatura do Técnico (Direita) =====
  const techSignatureX = margin + signatureWidth + 20;
  
  doc.setFontSize(9);
  doc.setFont("helvetica", "bold");
  doc.setTextColor(...COLORS.primary);
  doc.text("ASSINATURA DO TÉCNICO DE IMAGEM", techSignatureX, yPos - 5);

  // Caixa para assinatura do técnico
  doc.setDrawColor(...COLORS.border);
  doc.setLineWidth(0.5);
  doc.rect(techSignatureX, yPos, signatureWidth, signatureHeight);

  // Espaço em branco para assinatura manual do técnico
  doc.setFontSize(8);
  doc.setTextColor(...COLORS.textLight);
  doc.text("(Assinatura manual)", techSignatureX + signatureWidth / 2, yPos + signatureHeight / 2, { align: "center" });

  // Linha para nome do técnico abaixo da assinatura
  doc.setDrawColor(...COLORS.text);
  doc.setLineWidth(0.3);
  doc.line(techSignatureX, patientSignatureY, techSignatureX + signatureWidth, patientSignatureY);
  
  doc.setFontSize(8);
  doc.setTextColor(...COLORS.textLight);
  doc.text("Nome: _______________________", techSignatureX, patientSignatureY + 5);
  doc.text("COREN/CRM: _________________", techSignatureX, patientSignatureY + 10);

  // ========== RODAPÉ ==========
  yPos = pageHeight - 15;
  
  doc.setDrawColor(...COLORS.border);
  doc.setLineWidth(0.3);
  doc.line(margin, yPos - 5, pageWidth - margin, yPos - 5);
  
  doc.setFontSize(7);
  doc.setTextColor(...COLORS.textLight);
  doc.setFont("helvetica", "italic");
  doc.text("IMAGO Diagnóstico por Imagem - Documento gerado automaticamente pelo sistema de questionário clínico.", pageWidth / 2, yPos, { align: "center" });

  return doc.output('blob');
}
