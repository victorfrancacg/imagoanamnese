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
  primary: [59, 100, 143] as [number, number, number],
  primaryDark: [47, 79, 114] as [number, number, number],
  text: [51, 51, 51] as [number, number, number],
  textLight: [120, 120, 120] as [number, number, number],
  border: [200, 210, 220] as [number, number, number],
  background: [245, 248, 250] as [number, number, number],
  white: [255, 255, 255] as [number, number, number],
};

interface DataRowItem {
  label: string;
  value: string;
  isHighlight?: boolean;
}

export function generateQuestionnairePDF(data: QuestionnaireData): Blob {
  const doc = new jsPDF();
  const pageWidth = doc.internal.pageSize.getWidth();
  const pageHeight = doc.internal.pageSize.getHeight();
  const margin = 15;
  const contentWidth = pageWidth - margin * 2;
  let yPos = 15;

  const isDensitometria = data.tipoExame === 'densitometria';
  const isMamografia = data.tipoExame === 'mamografia';
  const isTomografia = data.tipoExame === 'tomografia';
  const isRessonancia = data.tipoExame === 'ressonancia';
  const isFeminino = data.sexo === 'feminino';

  // Função para verificar quebra de página
  const checkPageBreak = (requiredSpace: number): boolean => {
    if (yPos + requiredSpace > pageHeight - 25) {
      // Adiciona rodapé antes de quebrar
      doc.setDrawColor(...COLORS.border);
      doc.setLineWidth(0.3);
      doc.line(margin, pageHeight - 15, pageWidth - margin, pageHeight - 15);
      doc.setFontSize(7);
      doc.setTextColor(...COLORS.textLight);
      doc.setFont("helvetica", "italic");
      doc.text("IMAGO Diagnóstico por Imagem", pageWidth / 2, pageHeight - 10, { align: "center" });
      
      doc.addPage();
      yPos = 20;
      return true;
    }
    return false;
  };

  // Adiciona seção com título centralizado
  const addSection = (title: string, y: number): number => {
    checkPageBreak(20);
    doc.setFillColor(...COLORS.primary);
    doc.roundedRect(margin, y - 5, contentWidth, 8, 2, 2, 'F');
    
    doc.setFontSize(9);
    doc.setFont("helvetica", "bold");
    doc.setTextColor(...COLORS.white);
    doc.text(title, pageWidth / 2, y, { align: "center" });
    return y + 12;
  };

  // Adiciona uma linha de dados compacta
  const addCompactDataRow = (label: string, value: string, x: number, y: number, width: number, isHighlight: boolean = false): number => {
    doc.setFillColor(...COLORS.background);
    doc.roundedRect(x, y - 4, width, 7, 1, 1, 'F');
    
    doc.setFontSize(8);
    doc.setFont("helvetica", "normal");
    doc.setTextColor(...COLORS.textLight);
    
    // Label à esquerda
    const maxLabelWidth = width * 0.6;
    let displayLabel = label;
    while (doc.getTextWidth(displayLabel) > maxLabelWidth && displayLabel.length > 3) {
      displayLabel = displayLabel.slice(0, -4) + '...';
    }
    doc.text(displayLabel, x + 3, y);
    
    // Value à direita
    doc.setTextColor(isHighlight ? 180 : COLORS.text[0], isHighlight ? 50 : COLORS.text[1], isHighlight ? 50 : COLORS.text[2]);
    doc.setFont("helvetica", isHighlight ? "bold" : "normal");
    
    const maxValueWidth = width * 0.35;
    let displayValue = value;
    while (doc.getTextWidth(displayValue) > maxValueWidth && displayValue.length > 3) {
      displayValue = displayValue.slice(0, -4) + '...';
    }
    doc.text(displayValue, x + width - 3, y, { align: "right" });
    
    return y + 8;
  };

  // Adiciona dados em duas colunas com melhor alinhamento
  const addTwoColumnData = (items: DataRowItem[], startY: number): number => {
    const gap = 8;
    const columnWidth = (contentWidth - gap) / 2;
    const leftX = margin;
    const rightX = margin + columnWidth + gap;
    
    let currentY = startY;
    
    for (let i = 0; i < items.length; i += 2) {
      checkPageBreak(10);
      
      // Coluna esquerda
      if (items[i]) {
        addCompactDataRow(items[i].label, items[i].value, leftX, currentY, columnWidth, items[i].isHighlight);
      }
      
      // Coluna direita
      if (items[i + 1]) {
        addCompactDataRow(items[i + 1].label, items[i + 1].value, rightX, currentY, columnWidth, items[i + 1].isHighlight);
      }
      
      currentY += 8;
    }
    
    return currentY;
  };

  // ========== CABEÇALHO ==========
  const logoWidth = 45;
  const logoHeight = 13;
  
  try {
    doc.addImage(imagoLogo, 'PNG', margin, yPos, logoWidth, logoHeight, undefined, 'FAST');
  } catch (e) {
    doc.setFontSize(16);
    doc.setFont("helvetica", "bold");
    doc.setTextColor(...COLORS.primary);
    doc.text("IMAGO", margin, yPos + 9);
  }

  // Badge do tipo de exame (alinhado à direita)
  const examTypeLabels: Record<string, string> = {
    'tomografia': 'TOMOGRAFIA',
    'ressonancia': 'RESSONÂNCIA',
    'densitometria': 'DENSITOMETRIA',
    'mamografia': 'MAMOGRAFIA',
  };
  const examLabel = examTypeLabels[data.tipoExame] || 'EXAME';
  
  doc.setFontSize(10);
  const badgeTextWidth = doc.getTextWidth(examLabel);
  const badgePadding = 16;
  const badgeWidth = badgeTextWidth + badgePadding;
  const badgeX = pageWidth - margin - badgeWidth;
  const badgeY = yPos + 2;
  
  doc.setFillColor(...COLORS.primary);
  doc.roundedRect(badgeX, badgeY, badgeWidth, 10, 3, 3, 'F');
  
  doc.setFont("helvetica", "bold");
  doc.setTextColor(...COLORS.white);
  doc.text(examLabel, badgeX + badgeWidth / 2, badgeY + 7, { align: "center" });
  
  yPos += logoHeight + 8;

  // Linha divisória
  doc.setDrawColor(...COLORS.primary);
  doc.setLineWidth(0.8);
  doc.line(margin, yPos, pageWidth - margin, yPos);
  yPos += 8;

  // Data e hora do documento
  const now = new Date();
  const currentDate = now.toLocaleDateString('pt-BR');
  const currentTime = now.toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' });
  doc.setFontSize(8);
  doc.setTextColor(...COLORS.textLight);
  doc.setFont("helvetica", "normal");
  doc.text(`Gerado em: ${currentDate} às ${currentTime}`, pageWidth - margin, yPos, { align: "right" });
  yPos += 10;

  // ========== DADOS PESSOAIS ==========
  yPos = addSection("DADOS PESSOAIS", yPos);

  const sexoLabel = data.sexo === 'masculino' 
    ? 'Masculino' 
    : data.sexo === 'feminino' 
    ? 'Feminino' 
    : '-';

  const dadosPessoaisItems: DataRowItem[] = [
    { label: "Nome do Paciente", value: data.nome || '-' },
    { label: "CPF", value: data.cpf || '-' },
    { label: "Telefone", value: data.telefone || '-' },
    { label: "Data de Nascimento", value: formatDate(data.dataNascimento) },
    { label: "Sexo", value: sexoLabel },
    { label: "Peso", value: data.peso ? `${data.peso} kg` : '-' },
    { label: "Altura", value: data.altura ? `${data.altura} cm` : '-' },
    { label: "Data do Exame", value: formatDate(data.dataExame) },
    { label: "Tipo de Exame", value: examTypeLabels[data.tipoExame] || '-' },
  ];

  yPos = addTwoColumnData(dadosPessoaisItems, yPos);
  yPos += 8;

  // ========== QUESTÕES DE SEGURANÇA ==========
  yPos = addSection("QUESTÕES DE SEGURANÇA", yPos);

  const segurancaItems: DataRowItem[] = [];

  // Campos segurança para Ressonância Magnética
  if (isRessonancia) {
    if (isFeminino) {
      segurancaItems.push({ label: "Gravidez", value: formatBoolean(data.rmGravida), isHighlight: data.rmGravida === true });
      segurancaItems.push({ label: "Amamentando", value: formatBoolean(data.rmAmamentando) });
    }
    segurancaItems.push({ label: "Implante medicamentoso", value: formatBoolean(data.rmImplanteMedicamentoso), isHighlight: data.rmImplanteMedicamentoso === true });
    segurancaItems.push({ label: "Marcapasso/Desfibrilador", value: formatBoolean(data.rmMarcapasso), isHighlight: data.rmMarcapasso === true });
    segurancaItems.push({ label: "Fragmento metálico/Projétil", value: formatBoolean(data.rmFragmentoMetalico), isHighlight: data.rmFragmentoMetalico === true });
    segurancaItems.push({ label: "Eletroestimulador implantado", value: formatBoolean(data.rmEletroestimulador), isHighlight: data.rmEletroestimulador === true });
    segurancaItems.push({ label: "Clipe de aneurisma", value: formatBoolean(data.rmClipeAneurisma), isHighlight: data.rmClipeAneurisma === true });
    segurancaItems.push({ label: "Expansor tecidual", value: formatBoolean(data.rmExpansorTecidual), isHighlight: data.rmExpansorTecidual === true });
    segurancaItems.push({ label: "Clipe gástrico/esofágico", value: formatBoolean(data.rmClipeGastrico), isHighlight: data.rmClipeGastrico === true });
    segurancaItems.push({ label: "Implante coclear/eletrônico", value: formatBoolean(data.rmImplanteCoclear), isHighlight: data.rmImplanteCoclear === true });
    segurancaItems.push({ label: "Lesão ocular por metal", value: formatBoolean(data.rmLesaoOlhoMetal), isHighlight: data.rmLesaoOlhoMetal === true });
    segurancaItems.push({ label: "Tatuagem recente (<15 dias)", value: formatBoolean(data.rmTatuagemRecente), isHighlight: data.rmTatuagemRecente === true });
    segurancaItems.push({ label: "Cirurgia renal", value: formatBoolean(data.rmCirurgiaRenal), isHighlight: data.rmCirurgiaRenal === true });
    segurancaItems.push({ label: "Doença renal", value: formatBoolean(data.rmDoencaRenal), isHighlight: data.rmDoencaRenal === true });
    segurancaItems.push({ label: "Alergia ao contraste RM", value: formatBoolean(data.rmAlergiaContraste), isHighlight: data.rmAlergiaContraste === true });
  }

  // Campos segurança para Tomografia
  if (isTomografia) {
    if (isFeminino) {
      segurancaItems.push({ label: "Possibilidade de gravidez", value: formatBoolean(data.tcGravida), isHighlight: data.tcGravida === true });
      segurancaItems.push({ label: "Amamentando", value: formatBoolean(data.tcAmamentando) });
    }
    segurancaItems.push({ label: "Uso de metformina", value: formatBoolean(data.tcUsaMetformina) });
    segurancaItems.push({ label: "Marcapasso/Desfibrilador", value: formatBoolean(data.tcMarcapasso), isHighlight: data.tcMarcapasso === true });
    segurancaItems.push({ label: "Alergia ao contraste TC", value: formatBoolean(data.tcAlergiaContraste), isHighlight: data.tcAlergiaContraste === true });
    segurancaItems.push({ label: "Cirurgia renal", value: formatBoolean(data.tcCirurgiaRenal), isHighlight: data.tcCirurgiaRenal === true });
    segurancaItems.push({ label: "Doença renal", value: formatBoolean(data.tcDoencaRenal), isHighlight: data.tcDoencaRenal === true });
  }

  // Mamografia
  if (isMamografia && isFeminino) {
    segurancaItems.push({ label: "Gravidez", value: formatBoolean(data.gravida), isHighlight: data.gravida === true });
  }

  // Densitometria
  if (isDensitometria) {
    if (isFeminino) {
      segurancaItems.push({ label: "Gravidez", value: formatBoolean(data.gravida), isHighlight: data.gravida === true });
    }
    segurancaItems.push({ label: "Exame contraste recente", value: formatBoolean(data.exameContrasteRecente), isHighlight: data.exameContrasteRecente === true });
    segurancaItems.push({ label: "Fraturou osso (5 anos)", value: formatBoolean(data.fraturouOsso), isHighlight: data.fraturouOsso === true });
    if (data.fraturouOsso && data.fraturouOssoDetalhes) {
      segurancaItems.push({ label: "Detalhes da fratura", value: data.fraturouOssoDetalhes });
    }
    segurancaItems.push({ label: "Perdeu +3cm altura", value: formatBoolean(data.perdeuAltura), isHighlight: data.perdeuAltura === true });
    segurancaItems.push({ label: "Perda óssea radiografia", value: formatBoolean(data.perdaOsseaRadiografia), isHighlight: data.perdaOsseaRadiografia === true });
    segurancaItems.push({ label: "Cifose dorsal", value: formatBoolean(data.cifoseDorsal), isHighlight: data.cifoseDorsal === true });
    segurancaItems.push({ label: "Quedas (últimos 12m)", value: formatBoolean(data.quedas12Meses), isHighlight: data.quedas12Meses === true });
    segurancaItems.push({ label: "Parente com osteoporose", value: formatBoolean(data.parenteOsteoporose), isHighlight: data.parenteOsteoporose === true });
    if (data.parenteOsteoporose && data.parenteOsteoporoseDetalhes) {
      segurancaItems.push({ label: "Qual parente", value: data.parenteOsteoporoseDetalhes });
    }
  }

  if (segurancaItems.length > 0) {
    yPos = addTwoColumnData(segurancaItems, yPos);
  } else {
    doc.setFontSize(8);
    doc.setTextColor(...COLORS.textLight);
    doc.text("Nenhuma questão de segurança aplicável", margin, yPos);
    yPos += 8;
  }
  yPos += 8;

  // ========== QUESTÕES CLÍNICAS ==========
  yPos = addSection("QUESTÕES CLÍNICAS", yPos);

  const clinicasItems: DataRowItem[] = [];

  // Regiões do exame
  if (isTomografia || isRessonancia) {
    const regioesLabels: Record<string, string> = {
      cabeca: 'Cabeça',
      pescoco: 'Pescoço',
      tronco: 'Tronco',
      membros_superiores: 'Membros Sup.',
      membros_inferiores: 'Membros Inf.',
    };
    const regioesFormatted = data.regioesExame && data.regioesExame.length > 0
      ? data.regioesExame.map(r => regioesLabels[r] || r).join(', ')
      : '-';
    clinicasItems.push({ label: "Regiões do exame", value: regioesFormatted });
  }

  clinicasItems.push({ label: "Motivo do Exame", value: data.motivoExame || '-' });
  
  // Campos Mamografia
  if (isMamografia) {
    clinicasItems.push({ label: "Exame anterior", value: formatBoolean(data.mamoExameAnterior) });
    if (data.mamoExameAnterior && data.mamoExameAnteriorDetalhes) {
      clinicasItems.push({ label: "Quando realizou", value: data.mamoExameAnteriorDetalhes });
    }
    clinicasItems.push({ label: "Última menstruação", value: data.mamoUltimaMenstruacao || '-' });
    clinicasItems.push({ label: "Na menopausa", value: formatBoolean(data.mamoMenopausa) });
    if (data.mamoMenopausa && data.mamoMenopausaDetalhes) {
      clinicasItems.push({ label: "Idade menopausa", value: data.mamoMenopausaDetalhes });
    }
    clinicasItems.push({ label: "Usa hormônios", value: formatBoolean(data.mamoUsaHormonios) });
    clinicasItems.push({ label: "Tem filhos", value: formatBoolean(data.mamoTemFilhos) });
    if (data.mamoTemFilhos && data.mamoTemFilhosDetalhes) {
      clinicasItems.push({ label: "Amamentação", value: data.mamoTemFilhosDetalhes });
    }
    clinicasItems.push({ label: "Problema nas mamas", value: formatBoolean(data.mamoProblemaMamas), isHighlight: data.mamoProblemaMamas === true });
    if (data.mamoProblemaMamas && data.mamoProblemaMamasDetalhes) {
      clinicasItems.push({ label: "Detalhes problema", value: data.mamoProblemaMamasDetalhes });
    }
    clinicasItems.push({ label: "Cirurgia nas mamas", value: formatBoolean(data.mamoCirurgiaMamas) });
    if (data.mamoCirurgiaMamas && data.mamoCirurgiaMamasDetalhes) {
      clinicasItems.push({ label: "Detalhes cirurgia", value: data.mamoCirurgiaMamasDetalhes });
    }
    clinicasItems.push({ label: "Ultrassonografia mama", value: formatBoolean(data.mamoUltrassonografia) });
    if (data.mamoUltrassonografia && data.mamoUltrassonografiaDetalhes) {
      clinicasItems.push({ label: "Quando realizou", value: data.mamoUltrassonografiaDetalhes });
    }
    clinicasItems.push({ label: "Hist. familiar câncer", value: formatBoolean(data.mamoHistoricoFamiliar), isHighlight: data.mamoHistoricoFamiliar === true });
    if (data.mamoHistoricoFamiliar && data.mamoHistoricoFamiliarDetalhes) {
      clinicasItems.push({ label: "Quais parentes", value: data.mamoHistoricoFamiliarDetalhes });
    }
    clinicasItems.push({ label: "Radioterapia mama", value: formatBoolean(data.mamoRadioterapia), isHighlight: data.mamoRadioterapia === true });
    if (data.mamoRadioterapia && data.mamoRadioterapiaDetalhes) {
      clinicasItems.push({ label: "Ano radioterapia", value: data.mamoRadioterapiaDetalhes });
    }
  }
  
  // Campos Tomografia e Ressonância
  if (isTomografia || isRessonancia) {
    clinicasItems.push({ label: "Trauma na região", value: formatBoolean(data.traumaRegiao), isHighlight: data.traumaRegiao === true });
    clinicasItems.push({ label: "Cirurgia no corpo", value: formatBoolean(data.cirurgiaCorpo) });
    if (data.cirurgiaCorpo && data.cirurgiaCorpoDetalhes) {
      clinicasItems.push({ label: "Detalhes cirurgia", value: data.cirurgiaCorpoDetalhes });
    }
    clinicasItems.push({ label: "Histórico de câncer", value: formatBoolean(data.historicoCancer), isHighlight: data.historicoCancer === true });
    if (data.historicoCancer && data.historicoCancerDetalhes) {
      clinicasItems.push({ label: "Detalhes câncer", value: data.historicoCancerDetalhes });
    }
  }
  
  // Ressonância específico
  if (isRessonancia) {
    clinicasItems.push({ label: "Exames relacionados", value: formatBoolean(data.examesRelacionados) });
    if (data.examesRelacionados && data.examesRelacionadosDetalhes) {
      clinicasItems.push({ label: "Detalhes exames", value: data.examesRelacionadosDetalhes });
    }
  }

  // Densitometria
  if (isDensitometria) {
    clinicasItems.push({ label: "Osteoporose", value: formatBoolean(data.temOsteoporose), isHighlight: data.temOsteoporose === true });
    clinicasItems.push({ label: "Doença na tireoide", value: formatBoolean(data.doencaTireoide), isHighlight: data.doencaTireoide === true });
    if (data.doencaTireoide && data.doencaTireoideDetalhes) {
      clinicasItems.push({ label: "Detalhes tireoide", value: data.doencaTireoideDetalhes });
    }
    clinicasItems.push({ label: "Doença intestinal", value: formatBoolean(data.doencaIntestinal), isHighlight: data.doencaIntestinal === true });
    if (data.doencaIntestinal && data.doencaIntestinalDetalhes) {
      clinicasItems.push({ label: "Detalhes intestinal", value: data.doencaIntestinalDetalhes });
    }
    clinicasItems.push({ label: "Hiperparatiroidismo", value: formatBoolean(data.temHiperparatiroidismo), isHighlight: data.temHiperparatiroidismo === true });
    clinicasItems.push({ label: "Doença de Paget", value: formatBoolean(data.temDoencaPaget), isHighlight: data.temDoencaPaget === true });
    clinicasItems.push({ label: "Má absorção cálcio", value: formatBoolean(data.maAbsorcaoCalcio), isHighlight: data.maAbsorcaoCalcio === true });
    clinicasItems.push({ label: "Osteomalácia", value: formatBoolean(data.temOsteomalacia), isHighlight: data.temOsteomalacia === true });
    clinicasItems.push({ label: "Síndrome de Cushing", value: formatBoolean(data.temSindromeCushing), isHighlight: data.temSindromeCushing === true });
    clinicasItems.push({ label: "Deficiência vit. D", value: formatBoolean(data.deficienciaVitaminaD), isHighlight: data.deficienciaVitaminaD === true });
    clinicasItems.push({ label: "Disfunção renal crônica", value: formatBoolean(data.disfuncaoRenalCronica), isHighlight: data.disfuncaoRenalCronica === true });
    clinicasItems.push({ label: "Usa medicação regular", value: formatBoolean(data.usaMedicacaoRegular) });
    if (data.usaMedicacaoRegular && data.usaMedicacaoRegularDetalhes) {
      clinicasItems.push({ label: "Medicações", value: data.usaMedicacaoRegularDetalhes });
    }

    // Campos femininos Densitometria
    if (isFeminino) {
      clinicasItems.push({ label: "Passou pela menopausa", value: formatBoolean(data.passouMenopausa) });
      if (data.passouMenopausa && data.passouMenopausaDetalhes) {
        clinicasItems.push({ label: "Detalhes menopausa", value: data.passouMenopausaDetalhes });
      }
      clinicasItems.push({ label: "Ciclos irregulares", value: formatBoolean(data.ciclosIrregulares) });
      clinicasItems.push({ label: "Câncer de mama", value: formatBoolean(data.teveCancerMamaDensi), isHighlight: data.teveCancerMamaDensi === true });
      clinicasItems.push({ label: "Histerectomia", value: formatBoolean(data.fezHisterectomia) });
      if (data.fezHisterectomia && data.fezHisterectomiaDetalhes) {
        clinicasItems.push({ label: "Detalhes histerectomia", value: data.fezHisterectomiaDetalhes });
      }
      clinicasItems.push({ label: "Retirou ovários", value: formatBoolean(data.retirouOvarios) });
    }
  }
  
  // Campos masculinos
  if (data.sexo === 'masculino' && (isTomografia || isRessonancia)) {
    clinicasItems.push({ label: "Problemas na próstata", value: formatBoolean(data.problemaProstata), isHighlight: data.problemaProstata === true });
    clinicasItems.push({ label: "Dificuldades urinárias", value: formatBoolean(data.dificuldadeUrinaria), isHighlight: data.dificuldadeUrinaria === true });
  }

  if (clinicasItems.length > 0) {
    yPos = addTwoColumnData(clinicasItems, yPos);
  }

  // Rodapé da página 1
  doc.setDrawColor(...COLORS.border);
  doc.setLineWidth(0.3);
  doc.line(margin, pageHeight - 15, pageWidth - margin, pageHeight - 15);
  
  doc.setFontSize(7);
  doc.setTextColor(...COLORS.textLight);
  doc.setFont("helvetica", "italic");
  doc.text("IMAGO Diagnóstico por Imagem - Página 1 de 2", pageWidth / 2, pageHeight - 10, { align: "center" });

  // ========== PÁGINA 2 - TERMO DE CONSENTIMENTO ==========
  doc.addPage();
  yPos = 15;

  // Cabeçalho da página 2
  try {
    doc.addImage(imagoLogo, 'PNG', margin, yPos, logoWidth, logoHeight, undefined, 'FAST');
  } catch (e) {
    doc.setFontSize(16);
    doc.setFont("helvetica", "bold");
    doc.setTextColor(...COLORS.primary);
    doc.text("IMAGO", margin, yPos + 9);
  }

  // Badge "TERMO DE CONSENTIMENTO"
  const termoLabel = "CONSENTIMENTO";
  doc.setFontSize(10);
  const termoBadgeWidth = doc.getTextWidth(termoLabel) + badgePadding;
  const termoBadgeX = pageWidth - margin - termoBadgeWidth;
  
  doc.setFillColor(...COLORS.primary);
  doc.roundedRect(termoBadgeX, yPos + 2, termoBadgeWidth, 10, 3, 3, 'F');
  
  doc.setFont("helvetica", "bold");
  doc.setTextColor(...COLORS.white);
  doc.text(termoLabel, termoBadgeX + termoBadgeWidth / 2, yPos + 9, { align: "center" });
  
  yPos += logoHeight + 8;

  // Linha divisória
  doc.setDrawColor(...COLORS.primary);
  doc.setLineWidth(0.8);
  doc.line(margin, yPos, pageWidth - margin, yPos);
  yPos += 12;

  // Resumo do paciente
  doc.setFillColor(...COLORS.background);
  doc.roundedRect(margin, yPos - 4, contentWidth, 18, 2, 2, 'F');
  
  doc.setFontSize(9);
  doc.setFont("helvetica", "bold");
  doc.setTextColor(...COLORS.text);
  doc.text(`Paciente: ${data.nome || '-'}`, margin + 5, yPos + 2);
  
  doc.setFont("helvetica", "normal");
  doc.setFontSize(8);
  doc.setTextColor(...COLORS.textLight);
  doc.text(`CPF: ${data.cpf || '-'}`, margin + 5, yPos + 9);
  doc.text(`Exame: ${examTypeLabels[data.tipoExame] || '-'}`, margin + 70, yPos + 9);
  doc.text(`Data: ${formatDate(data.dataExame)}`, margin + 130, yPos + 9);
  
  yPos += 22;

  // Seção de declaração
  yPos = addSection("DECLARAÇÃO DE CONSENTIMENTO", yPos);

  // Texto do termo
  doc.setFontSize(9);
  doc.setFont("helvetica", "normal");
  doc.setTextColor(...COLORS.text);
  
  const termoTexto = [
    "Declaro que fui informado(a) sobre o procedimento do exame, seus benefícios e possíveis riscos.",
    "Autorizo a realização do exame de imagem conforme indicação médica.",
    "Confirmo que todas as informações fornecidas neste questionário são verdadeiras e completas.",
    "Estou ciente de que a omissão ou falsidade de informações pode comprometer a segurança do exame.",
  ];

  termoTexto.forEach(texto => {
    const lines = doc.splitTextToSize(`• ${texto}`, contentWidth - 10);
    lines.forEach((line: string) => {
      doc.text(line, margin + 5, yPos);
      yPos += 5;
    });
    yPos += 2;
  });

  yPos += 8;

  // Campos de aceite
  doc.setFillColor(...COLORS.background);
  doc.roundedRect(margin, yPos - 4, contentWidth, 20, 2, 2, 'F');
  
  doc.setFontSize(9);
  doc.setFont("helvetica", "normal");
  doc.setTextColor(...COLORS.textLight);
  doc.text("Aceita os riscos do exame:", margin + 5, yPos + 2);
  doc.setFont("helvetica", "bold");
  doc.setTextColor(data.aceitaRiscos ? 34 : 180, data.aceitaRiscos ? 139 : 50, data.aceitaRiscos ? 34 : 50);
  doc.text(formatBoolean(data.aceitaRiscos), pageWidth - margin - 5, yPos + 2, { align: "right" });
  
  doc.setFont("helvetica", "normal");
  doc.setTextColor(...COLORS.textLight);
  doc.text("Aceita Termo LGPD:", margin + 5, yPos + 10);
  doc.setFont("helvetica", "bold");
  doc.setTextColor(data.aceitaCompartilhamento ? 34 : 180, data.aceitaCompartilhamento ? 139 : 50, data.aceitaCompartilhamento ? 34 : 50);
  doc.text(formatBoolean(data.aceitaCompartilhamento), pageWidth - margin - 5, yPos + 10, { align: "right" });
  
  yPos += 30;

  // ========== ASSINATURAS ==========
  yPos = addSection("ASSINATURAS", yPos);

  const signatureGap = 15;
  const signatureWidth = (contentWidth - signatureGap) / 2;
  const signatureHeight = 45;
  const leftSignX = margin;
  const rightSignX = margin + signatureWidth + signatureGap;

  // Título assinatura do paciente
  doc.setFontSize(9);
  doc.setFont("helvetica", "bold");
  doc.setTextColor(...COLORS.primary);
  doc.text("ASSINATURA DO PACIENTE", leftSignX, yPos);
  
  // Título assinatura do técnico
  doc.text("ASSINATURA DO TÉCNICO", rightSignX, yPos);
  
  yPos += 5;

  // Caixa assinatura paciente
  doc.setDrawColor(...COLORS.border);
  doc.setLineWidth(0.5);
  doc.setFillColor(...COLORS.white);
  doc.roundedRect(leftSignX, yPos, signatureWidth, signatureHeight, 2, 2, 'FD');

  // Adicionar assinatura do paciente
  if (data.assinaturaData && data.assinaturaData.startsWith('data:image')) {
    try {
      const imgFormat = data.assinaturaData.includes('image/png') ? 'PNG' : 'JPEG';
      doc.addImage(data.assinaturaData, imgFormat, leftSignX + 3, yPos + 3, signatureWidth - 6, signatureHeight - 10);
    } catch (e) {
      doc.setFontSize(8);
      doc.setTextColor(...COLORS.textLight);
      doc.text("Assinatura não disponível", leftSignX + signatureWidth / 2, yPos + signatureHeight / 2, { align: "center" });
    }
  } else {
    doc.setFontSize(8);
    doc.setTextColor(...COLORS.textLight);
    doc.text("Assinatura não fornecida", leftSignX + signatureWidth / 2, yPos + signatureHeight / 2, { align: "center" });
  }

  // Caixa assinatura técnico
  doc.setDrawColor(...COLORS.border);
  doc.roundedRect(rightSignX, yPos, signatureWidth, signatureHeight, 2, 2, 'FD');
  doc.setFontSize(8);
  doc.setTextColor(...COLORS.textLight);
  doc.text("(Assinatura manual)", rightSignX + signatureWidth / 2, yPos + signatureHeight / 2, { align: "center" });

  yPos += signatureHeight + 5;

  // Linha nome paciente
  doc.setDrawColor(...COLORS.text);
  doc.setLineWidth(0.3);
  doc.line(leftSignX, yPos, leftSignX + signatureWidth, yPos);
  
  doc.setFontSize(8);
  doc.setTextColor(...COLORS.textLight);
  doc.text(`Nome: ${data.nome || '_________________________'}`, leftSignX, yPos + 5);

  // Linha nome técnico
  doc.line(rightSignX, yPos, rightSignX + signatureWidth, yPos);
  doc.text("Nome: _________________________", rightSignX, yPos + 5);
  doc.text("COREN/CRM: ___________________", rightSignX, yPos + 11);

  yPos += 20;

  // Data e local
  doc.setFontSize(9);
  doc.setTextColor(...COLORS.text);
  doc.setFont("helvetica", "normal");
  doc.text(`Local: _________________________________, Data: ${currentDate}`, margin, yPos);

  // Rodapé página 2
  doc.setDrawColor(...COLORS.border);
  doc.setLineWidth(0.3);
  doc.line(margin, pageHeight - 15, pageWidth - margin, pageHeight - 15);
  
  doc.setFontSize(7);
  doc.setTextColor(...COLORS.textLight);
  doc.setFont("helvetica", "italic");
  doc.text("IMAGO Diagnóstico por Imagem - Página 2 de 2", pageWidth / 2, pageHeight - 10, { align: "center" });

  return doc.output('blob');
}
