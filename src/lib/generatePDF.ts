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
  let yPos = 15;

  const isDensitometria = data.tipoExame === 'densitometria';
  const isMamografia = data.tipoExame === 'mamografia';
  const isTomografia = data.tipoExame === 'tomografia';
  const isRessonancia = data.tipoExame === 'ressonancia';
  const isFeminino = data.sexo === 'feminino';

  // Função para adicionar texto
  const addText = (text: string, x: number, y: number, fontSize: number = 10, isBold: boolean = false, color: [number, number, number] = COLORS.text) => {
    doc.setFontSize(fontSize);
    doc.setFont("helvetica", isBold ? "bold" : "normal");
    doc.setTextColor(...color);
    doc.text(text, x, y);
  };

  // Adiciona seção com título
  const addSection = (title: string, y: number): number => {
    const textWidth = doc.getTextWidth(title) + 10;
    doc.setFillColor(...COLORS.primary);
    doc.roundedRect(margin, y - 5, textWidth, 8, 2, 2, 'F');
    
    doc.setFontSize(9);
    doc.setFont("helvetica", "bold");
    doc.setTextColor(...COLORS.white);
    doc.text(title, margin + 5, y);
    return y + 10;
  };

  // Adiciona uma linha de dados compacta
  const addCompactDataRow = (label: string, value: string, x: number, y: number, width: number, isHighlight: boolean = false): number => {
    doc.setFillColor(...COLORS.background);
    doc.rect(x, y - 3.5, width, 6, 'F');
    
    doc.setFontSize(7);
    doc.setFont("helvetica", "normal");
    doc.setTextColor(...COLORS.textLight);
    
    // Truncar label se muito longo
    const maxLabelWidth = width * 0.55;
    let displayLabel = label;
    while (doc.getTextWidth(displayLabel) > maxLabelWidth && displayLabel.length > 3) {
      displayLabel = displayLabel.slice(0, -4) + '...';
    }
    doc.text(displayLabel, x + 2, y);
    
    doc.setTextColor(isHighlight ? 180 : COLORS.text[0], isHighlight ? 50 : COLORS.text[1], isHighlight ? 50 : COLORS.text[2]);
    doc.setFont("helvetica", isHighlight ? "bold" : "normal");
    
    // Truncar value se muito longo
    const maxValueWidth = width * 0.4;
    let displayValue = value;
    while (doc.getTextWidth(displayValue) > maxValueWidth && displayValue.length > 3) {
      displayValue = displayValue.slice(0, -4) + '...';
    }
    doc.text(displayValue, x + width - 2, y, { align: "right" });
    
    return y + 6;
  };

  // Adiciona dados em duas colunas
  const addTwoColumnData = (items: DataRowItem[], startY: number): number => {
    const columnWidth = (pageWidth - margin * 2 - 10) / 2;
    const leftX = margin;
    const rightX = margin + columnWidth + 10;
    
    let leftY = startY;
    let rightY = startY;
    
    items.forEach((item, index) => {
      if (index % 2 === 0) {
        leftY = addCompactDataRow(item.label, item.value, leftX, leftY, columnWidth, item.isHighlight);
      } else {
        rightY = addCompactDataRow(item.label, item.value, rightX, rightY, columnWidth, item.isHighlight);
      }
    });
    
    return Math.max(leftY, rightY);
  };

  // ========== CABEÇALHO (PÁGINA 1) ==========
  const logoWidth = 48;
  const logoHeight = 14;
  try {
    doc.addImage(imagoLogo, 'JPEG', margin, yPos, logoWidth, logoHeight, undefined, 'FAST');
  } catch (e) {
    doc.setFontSize(18);
    doc.setFont("helvetica", "bold");
    doc.setTextColor(...COLORS.primary);
    doc.text("IMAGO", margin, yPos + 8);
    doc.setFontSize(6);
    doc.setFont("helvetica", "normal");
    doc.text("DIAGNÓSTICO POR IMAGEM", margin, yPos + 11);
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
  yPos += 8;

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
    { label: "Data de Nascimento", value: formatDate(data.dataNascimento) },
    { label: "Sexo", value: sexoLabel },
    { label: "Peso", value: data.peso ? `${data.peso} kg` : '-' },
    { label: "Altura", value: data.altura ? `${data.altura} cm` : '-' },
    { label: "Data do Exame", value: formatDate(data.dataExame) },
  ];

  yPos = addTwoColumnData(dadosPessoaisItems, yPos);
  yPos += 5;

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
    segurancaItems.push({ label: "Clipe de aneurisma na cabeça", value: formatBoolean(data.rmClipeAneurisma), isHighlight: data.rmClipeAneurisma === true });
    segurancaItems.push({ label: "Expansor tecidual", value: formatBoolean(data.rmExpansorTecidual), isHighlight: data.rmExpansorTecidual === true });
    segurancaItems.push({ label: "Clipe gástrico/esofágico", value: formatBoolean(data.rmClipeGastrico), isHighlight: data.rmClipeGastrico === true });
    segurancaItems.push({ label: "Implante coclear/eletrônico", value: formatBoolean(data.rmImplanteCoclear), isHighlight: data.rmImplanteCoclear === true });
    segurancaItems.push({ label: "Lesão de olho por metal", value: formatBoolean(data.rmLesaoOlhoMetal), isHighlight: data.rmLesaoOlhoMetal === true });
    segurancaItems.push({ label: "Tatuagem recente (<15 dias)", value: formatBoolean(data.rmTatuagemRecente), isHighlight: data.rmTatuagemRecente === true });
    segurancaItems.push({ label: "Cirurgia renal", value: formatBoolean(data.rmCirurgiaRenal), isHighlight: data.rmCirurgiaRenal === true });
    segurancaItems.push({ label: "Doença renal", value: formatBoolean(data.rmDoencaRenal), isHighlight: data.rmDoencaRenal === true });
    segurancaItems.push({ label: "Alergia ao contraste de RM", value: formatBoolean(data.rmAlergiaContraste), isHighlight: data.rmAlergiaContraste === true });
  }

  // Campos segurança para Tomografia Computadorizada
  if (isTomografia) {
    if (isFeminino) {
      segurancaItems.push({ label: "Possibilidade de gravidez", value: formatBoolean(data.tcGravida), isHighlight: data.tcGravida === true });
      segurancaItems.push({ label: "Amamentando", value: formatBoolean(data.tcAmamentando) });
    }
    segurancaItems.push({ label: "Uso de metformina", value: formatBoolean(data.tcUsaMetformina) });
    segurancaItems.push({ label: "Marcapasso/Desfibrilador", value: formatBoolean(data.tcMarcapasso), isHighlight: data.tcMarcapasso === true });
    segurancaItems.push({ label: "Alergia ao contraste de TC", value: formatBoolean(data.tcAlergiaContraste), isHighlight: data.tcAlergiaContraste === true });
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
    segurancaItems.push({ label: "Exame contraste/bário recente", value: formatBoolean(data.exameContrasteRecente), isHighlight: data.exameContrasteRecente === true });
    segurancaItems.push({ label: "Fraturou osso (5 anos)", value: formatBoolean(data.fraturouOsso), isHighlight: data.fraturouOsso === true });
    if (data.fraturouOsso && data.fraturouOssoDetalhes) {
      segurancaItems.push({ label: "Detalhes da fratura", value: data.fraturouOssoDetalhes });
    }
    segurancaItems.push({ label: "Perdeu mais de 3cm altura", value: formatBoolean(data.perdeuAltura), isHighlight: data.perdeuAltura === true });
    segurancaItems.push({ label: "Perda óssea em radiografia", value: formatBoolean(data.perdaOsseaRadiografia), isHighlight: data.perdaOsseaRadiografia === true });
    segurancaItems.push({ label: "Cifose dorsal", value: formatBoolean(data.cifoseDorsal), isHighlight: data.cifoseDorsal === true });
    segurancaItems.push({ label: "Mais de uma queda (12m)", value: formatBoolean(data.quedas12Meses), isHighlight: data.quedas12Meses === true });
    segurancaItems.push({ label: "Parente com osteoporose", value: formatBoolean(data.parenteOsteoporose), isHighlight: data.parenteOsteoporose === true });
    if (data.parenteOsteoporose && data.parenteOsteoporoseDetalhes) {
      segurancaItems.push({ label: "Qual parente", value: data.parenteOsteoporoseDetalhes });
    }
  }

  if (segurancaItems.length > 0) {
    yPos = addTwoColumnData(segurancaItems, yPos);
  }
  yPos += 5;

  // ========== QUESTÕES CLÍNICAS ==========
  yPos = addSection("QUESTÕES CLÍNICAS", yPos);

  const clinicasItems: DataRowItem[] = [];

  // Regiões do exame para Tomografia e Ressonância
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

  clinicasItems.push({ label: isDensitometria ? "Motivo (Densitometria)" : "Motivo do Exame", value: data.motivoExame || '-' });
  
  // Campos específicos de Mamografia
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
    clinicasItems.push({ label: "Hist. familiar câncer mama/ovário", value: formatBoolean(data.mamoHistoricoFamiliar), isHighlight: data.mamoHistoricoFamiliar === true });
    if (data.mamoHistoricoFamiliar && data.mamoHistoricoFamiliarDetalhes) {
      clinicasItems.push({ label: "Quais parentes", value: data.mamoHistoricoFamiliarDetalhes });
    }
    clinicasItems.push({ label: "Radioterapia mama", value: formatBoolean(data.mamoRadioterapia), isHighlight: data.mamoRadioterapia === true });
    if (data.mamoRadioterapia && data.mamoRadioterapiaDetalhes) {
      clinicasItems.push({ label: "Ano radioterapia", value: data.mamoRadioterapiaDetalhes });
    }
  }
  
  // Campos específicos de Tomografia e Ressonância (Clínicas)
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
  
  // Campo específico de Ressonância
  if (isRessonancia) {
    clinicasItems.push({ label: "Exames relacionados", value: formatBoolean(data.examesRelacionados) });
    if (data.examesRelacionados && data.examesRelacionadosDetalhes) {
      clinicasItems.push({ label: "Detalhes exames", value: data.examesRelacionadosDetalhes });
    }
  }

  // Campos específicos de Densitometria (Clínicas)
  if (isDensitometria) {
    clinicasItems.push({ label: "Osteoporose", value: formatBoolean(data.temOsteoporose), isHighlight: data.temOsteoporose === true });
    clinicasItems.push({ label: "Doença na tireoide", value: formatBoolean(data.doencaTireoide), isHighlight: data.doencaTireoide === true });
    if (data.doencaTireoide && data.doencaTireoideDetalhes) {
      clinicasItems.push({ label: "Detalhes tireoide", value: data.doencaTireoideDetalhes });
    }
    clinicasItems.push({ label: "Doença intestinal crônica", value: formatBoolean(data.doencaIntestinal), isHighlight: data.doencaIntestinal === true });
    if (data.doencaIntestinal && data.doencaIntestinalDetalhes) {
      clinicasItems.push({ label: "Detalhes intestinal", value: data.doencaIntestinalDetalhes });
    }
    clinicasItems.push({ label: "Hiperparatiroidismo", value: formatBoolean(data.temHiperparatiroidismo), isHighlight: data.temHiperparatiroidismo === true });
    clinicasItems.push({ label: "Doença de Paget", value: formatBoolean(data.temDoencaPaget), isHighlight: data.temDoencaPaget === true });
    clinicasItems.push({ label: "Má absorção de cálcio", value: formatBoolean(data.maAbsorcaoCalcio), isHighlight: data.maAbsorcaoCalcio === true });
    clinicasItems.push({ label: "Osteomalácia", value: formatBoolean(data.temOsteomalacia), isHighlight: data.temOsteomalacia === true });
    clinicasItems.push({ label: "Síndrome de Cushing", value: formatBoolean(data.temSindromeCushing), isHighlight: data.temSindromeCushing === true });
    clinicasItems.push({ label: "Deficiência vitamina D", value: formatBoolean(data.deficienciaVitaminaD), isHighlight: data.deficienciaVitaminaD === true });
    clinicasItems.push({ label: "Disfunção renal crônica", value: formatBoolean(data.disfuncaoRenalCronica), isHighlight: data.disfuncaoRenalCronica === true });
    clinicasItems.push({ label: "Usa medicação regular", value: formatBoolean(data.usaMedicacaoRegular) });
    if (data.usaMedicacaoRegular && data.usaMedicacaoRegularDetalhes) {
      clinicasItems.push({ label: "Medicações", value: data.usaMedicacaoRegularDetalhes });
    }

    // Campos Densitometria Feminino
    if (isFeminino) {
      clinicasItems.push({ label: "Passou pela menopausa", value: formatBoolean(data.passouMenopausa) });
      if (data.passouMenopausa && data.passouMenopausaDetalhes) {
        clinicasItems.push({ label: "Detalhes menopausa", value: data.passouMenopausaDetalhes });
      }
      clinicasItems.push({ label: "Ciclos irregulares/perimenopausa", value: formatBoolean(data.ciclosIrregulares) });
      clinicasItems.push({ label: "Câncer de mama", value: formatBoolean(data.teveCancerMamaDensi), isHighlight: data.teveCancerMamaDensi === true });
      clinicasItems.push({ label: "Histerectomia", value: formatBoolean(data.fezHisterectomia) });
      if (data.fezHisterectomia && data.fezHisterectomiaDetalhes) {
        clinicasItems.push({ label: "Detalhes histerectomia", value: data.fezHisterectomiaDetalhes });
      }
      clinicasItems.push({ label: "Retirou ovários", value: formatBoolean(data.retirouOvarios) });
    }
  }
  
  // Campos masculinos para Tomografia e Ressonância
  if (data.sexo === 'masculino' && (isTomografia || isRessonancia)) {
    clinicasItems.push({ label: "Problemas na próstata", value: formatBoolean(data.problemaProstata), isHighlight: data.problemaProstata === true });
    clinicasItems.push({ label: "Dificuldades urinárias", value: formatBoolean(data.dificuldadeUrinaria), isHighlight: data.dificuldadeUrinaria === true });
  }

  if (clinicasItems.length > 0) {
    yPos = addTwoColumnData(clinicasItems, yPos);
  }

  // Rodapé da primeira página
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
    doc.addImage(imagoLogo, 'JPEG', margin, yPos, logoWidth, logoHeight, undefined, 'FAST');
  } catch (e) {
    doc.setFontSize(18);
    doc.setFont("helvetica", "bold");
    doc.setTextColor(...COLORS.primary);
    doc.text("IMAGO", margin, yPos + 8);
  }

  // Badge "TERMO DE CONSENTIMENTO"
  const termoLabel = "TERMO DE CONSENTIMENTO";
  const termoBadgeWidth = doc.getTextWidth(termoLabel) + 20;
  const termoBadgeX = pageWidth - margin - termoBadgeWidth;
  
  doc.setFillColor(...COLORS.primary);
  doc.roundedRect(termoBadgeX, yPos + 2, termoBadgeWidth, 10, 5, 5, 'F');
  
  doc.setFontSize(10);
  doc.setFont("helvetica", "bold");
  doc.setTextColor(...COLORS.white);
  doc.text(termoLabel, termoBadgeX + termoBadgeWidth / 2, yPos + 9, { align: "center" });
  
  yPos += 25;

  // Linha divisória
  doc.setDrawColor(...COLORS.primary);
  doc.setLineWidth(1);
  doc.line(margin, yPos, pageWidth - margin, yPos);
  yPos += 15;

  // Informações do paciente (resumido)
  doc.setFontSize(10);
  doc.setFont("helvetica", "bold");
  doc.setTextColor(...COLORS.text);
  doc.text(`Paciente: ${data.nome || '-'}`, margin, yPos);
  yPos += 6;
  doc.setFont("helvetica", "normal");
  doc.setFontSize(9);
  doc.text(`CPF: ${data.cpf || '-'}    |    Exame: ${examLabel}    |    Data: ${formatDate(data.dataExame)}`, margin, yPos);
  yPos += 15;

  // Seção de consentimento
  yPos = addSection("DECLARAÇÃO DE CONSENTIMENTO", yPos);
  yPos += 5;

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
    const lines = doc.splitTextToSize(`• ${texto}`, pageWidth - margin * 2 - 10);
    lines.forEach((line: string) => {
      doc.text(line, margin + 5, yPos);
      yPos += 5;
    });
    yPos += 3;
  });

  yPos += 10;

  // Campos de aceite
  doc.setFillColor(...COLORS.background);
  doc.rect(margin, yPos - 3, pageWidth - margin * 2, 14, 'F');
  
  doc.setFontSize(9);
  doc.setFont("helvetica", "normal");
  doc.setTextColor(...COLORS.textLight);
  doc.text("Aceita os riscos do exame:", margin + 5, yPos + 3);
  doc.setFont("helvetica", "bold");
  doc.setTextColor(...COLORS.text);
  doc.text(formatBoolean(data.aceitaRiscos), pageWidth - margin - 5, yPos + 3, { align: "right" });
  
  yPos += 7;
  doc.setFont("helvetica", "normal");
  doc.setTextColor(...COLORS.textLight);
  doc.text("Autoriza compartilhamento de dados para fins médicos:", margin + 5, yPos + 3);
  doc.setFont("helvetica", "bold");
  doc.setTextColor(...COLORS.text);
  doc.text(formatBoolean(data.aceitaCompartilhamento), pageWidth - margin - 5, yPos + 3, { align: "right" });
  
  yPos += 25;

  // ========== ASSINATURAS ==========
  yPos = addSection("ASSINATURAS", yPos);
  yPos += 10;

  const signatureWidth = (pageWidth - margin * 2 - 20) / 2;
  const signatureHeight = 50;

  // ===== Assinatura do Paciente (Esquerda) =====
  doc.setFontSize(10);
  doc.setFont("helvetica", "bold");
  doc.setTextColor(...COLORS.primary);
  doc.text("ASSINATURA DO PACIENTE", margin, yPos);
  yPos += 8;

  // Caixa para assinatura do paciente
  doc.setDrawColor(...COLORS.border);
  doc.setLineWidth(0.5);
  doc.rect(margin, yPos, signatureWidth, signatureHeight);

  // Adicionar assinatura do paciente se existir
  if (data.assinaturaData && data.assinaturaData.startsWith('data:image')) {
    try {
      const imgFormat = data.assinaturaData.includes('image/png') ? 'PNG' : 'JPEG';
      doc.addImage(data.assinaturaData, imgFormat, margin + 5, yPos + 5, signatureWidth - 10, signatureHeight - 15);
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

  // Linha para nome do paciente
  const patientSignatureY = yPos + signatureHeight + 8;
  doc.setDrawColor(...COLORS.text);
  doc.setLineWidth(0.3);
  doc.line(margin, patientSignatureY, margin + signatureWidth, patientSignatureY);
  
  doc.setFontSize(9);
  doc.setTextColor(...COLORS.textLight);
  doc.text("Nome: " + (data.nome || '_______________________'), margin, patientSignatureY + 6);

  // ===== Assinatura do Técnico (Direita) =====
  const techSignatureX = margin + signatureWidth + 20;
  
  doc.setFontSize(10);
  doc.setFont("helvetica", "bold");
  doc.setTextColor(...COLORS.primary);
  doc.text("ASSINATURA DO TÉCNICO", techSignatureX, yPos - 8);

  // Caixa para assinatura do técnico
  doc.setDrawColor(...COLORS.border);
  doc.setLineWidth(0.5);
  doc.rect(techSignatureX, yPos, signatureWidth, signatureHeight);

  // Espaço em branco para assinatura manual
  doc.setFontSize(8);
  doc.setTextColor(...COLORS.textLight);
  doc.text("(Assinatura manual)", techSignatureX + signatureWidth / 2, yPos + signatureHeight / 2, { align: "center" });

  // Linha para nome do técnico
  doc.setDrawColor(...COLORS.text);
  doc.setLineWidth(0.3);
  doc.line(techSignatureX, patientSignatureY, techSignatureX + signatureWidth, patientSignatureY);
  
  doc.setFontSize(9);
  doc.setTextColor(...COLORS.textLight);
  doc.text("Nome: _______________________", techSignatureX, patientSignatureY + 6);
  doc.text("COREN/CRM: _________________", techSignatureX, patientSignatureY + 12);

  // Data e local
  yPos = patientSignatureY + 30;
  doc.setFontSize(9);
  doc.setTextColor(...COLORS.text);
  doc.setFont("helvetica", "normal");
  doc.text(`Local: _________________________________, Data: ${currentDate}`, margin, yPos);

  // Rodapé da página 2
  doc.setDrawColor(...COLORS.border);
  doc.setLineWidth(0.3);
  doc.line(margin, pageHeight - 15, pageWidth - margin, pageHeight - 15);
  
  doc.setFontSize(7);
  doc.setTextColor(...COLORS.textLight);
  doc.setFont("helvetica", "italic");
  doc.text("IMAGO Diagnóstico por Imagem - Página 2 de 2", pageWidth / 2, pageHeight - 10, { align: "center" });

  return doc.output('blob');
}
