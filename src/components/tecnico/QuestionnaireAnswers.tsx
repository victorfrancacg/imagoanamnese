import { Badge } from '@/components/ui/badge';
import type { Tables } from '@/integrations/supabase/types';

type Questionario = Tables<'questionarios'>;

interface QuestionItemProps {
  label: string;
  value: boolean | 'nao_sei' | null | undefined;
  warning?: boolean;
}

const QuestionItem = ({ label, value, warning = false }: QuestionItemProps) => {
  if (value === null || value === undefined) return null;

  const isUnknown = value === 'nao_sei';
  const displayText = isUnknown ? 'Não sei' : (value ? 'Sim' : 'Não');

  return (
    <div className="flex justify-between items-center py-2 border-b">
      <span className="text-sm text-muted-foreground">{label}</span>
      <Badge
        variant={isUnknown ? 'outline' : (warning && value === true ? 'destructive' : value === true ? 'default' : 'secondary')}
      >
        {displayText}
      </Badge>
    </div>
  );
};

const DetailItem = ({ label, value }: { label: string; value: string | null | undefined }) => {
  if (!value) return null;

  return (
    <div className="pl-4 py-2 border-b bg-muted/30 overflow-hidden">
      <span className="text-xs text-muted-foreground">{label}:</span>
      <p className="text-sm mt-1 break-words whitespace-pre-wrap" style={{ wordBreak: 'break-word' }}>{value}</p>
    </div>
  );
};

const ArrayItem = ({ label, value }: { label: string; value: string[] | null | undefined }) => {
  if (!value || value.length === 0) return null;

  return (
    <div className="py-2 border-b">
      <span className="text-sm text-muted-foreground">{label}:</span>
      <div className="flex flex-wrap gap-2 mt-2">
        {value.map((item, index) => (
          <Badge key={index} variant="outline">{item}</Badge>
        ))}
      </div>
    </div>
  );
};

interface QuestionnaireAnswersProps {
  questionario: Questionario;
}

export function QuestionnaireAnswers({ questionario }: QuestionnaireAnswersProps) {
  const respostas = questionario.respostas_completas;
  const tipoExame = questionario.tipo_exame;

  // Todos os questionários devem ter respostas_completas após a migração
  if (!respostas) {
    return (
      <div className="p-4 bg-yellow-50 border border-yellow-200 rounded-md">
        <p className="text-sm text-yellow-800">
          Erro: Questionário sem dados completos. Este registro pode estar corrompido.
        </p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Questões de Segurança */}
      <div>
        <h3 className="font-semibold mb-3 text-lg">Questões de Segurança</h3>
        <SecurityQuestions
          tipoExame={tipoExame}
          respostas={respostas.seguranca}
          questionario={questionario}
        />
      </div>

      {/* Questões Clínicas */}
      <div>
        <h3 className="font-semibold mb-3 text-lg">Questões Clínicas</h3>
        <ClinicalQuestions
          tipoExame={tipoExame}
          respostas={respostas.clinicas}
          questionario={questionario}
        />
      </div>

      {/* Consentimento */}
      <div>
        <h3 className="font-semibold mb-3 text-lg">Consentimento</h3>
        <ConsentQuestions respostas={respostas.consentimento} tipoExame={tipoExame} />
      </div>
    </div>
  );
}

function SecurityQuestions({ tipoExame, respostas, questionario }: any) {
  if (tipoExame === 'ressonancia') {
    return (
      <>
        <QuestionItem label="Grávida?" value={respostas.rmGravida} warning />
        <QuestionItem label="Amamentando?" value={respostas.rmAmamentando} />
        <QuestionItem label="Implante medicamentoso?" value={respostas.rmImplanteMedicamentoso} warning />
        <QuestionItem label="Marcapasso/Desfibrilador?" value={respostas.rmMarcapasso} warning />
        <QuestionItem label="Fragmento metálico?" value={respostas.rmFragmentoMetalico} warning />
        <QuestionItem label="Eletroestimulador implantado?" value={respostas.rmEletroestimulador} warning />
        <QuestionItem label="Clipe de aneurisma?" value={respostas.rmClipeAneurisma} warning />
        <QuestionItem label="Expansor tecidual?" value={respostas.rmExpansorTecidual} warning />
        <QuestionItem label="Clipe gástrico?" value={respostas.rmClipeGastrico} warning />
        <QuestionItem label="Implante coclear?" value={respostas.rmImplanteCoclear} warning />
        <QuestionItem label="Lesão no olho por metal?" value={respostas.rmLesaoOlhoMetal} warning />
        <QuestionItem label="Tatuagem recente (<15 dias)?" value={respostas.rmTatuagemRecente} />
        <QuestionItem label="Cirurgia renal?" value={respostas.rmCirurgiaRenal} />
        <QuestionItem label="Doença renal?" value={respostas.rmDoencaRenal} />
        <QuestionItem label="Alergia a contraste de RM?" value={respostas.rmAlergiaContraste} warning />
      </>
    );
  }

  if (tipoExame === 'tomografia') {
    return (
      <>
        <QuestionItem label="Possibilidade de gravidez?" value={respostas.tcGravida} warning />
        <QuestionItem label="Amamentando?" value={respostas.tcAmamentando} />
        <QuestionItem label="Usa metformina?" value={respostas.tcUsaMetformina} />
        <QuestionItem label="Marcapasso/Desfibrilador?" value={respostas.tcMarcapasso} warning />
        <QuestionItem label="Alergia a contraste de TC?" value={respostas.tcAlergiaContraste} warning />
        <QuestionItem label="Cirurgia renal?" value={respostas.tcCirurgiaRenal} />
        <QuestionItem label="Doença renal?" value={respostas.tcDoencaRenal} />
      </>
    );
  }

  if (tipoExame === 'mamografia') {
    return <QuestionItem label="Grávida?" value={respostas.gravida} warning />;
  }

  if (tipoExame === 'densitometria') {
    return (
      <>
        <QuestionItem label="Grávida?" value={respostas.gravida} warning />
        <QuestionItem label="Exame com contraste recente?" value={respostas.exameContrasteRecente} />
        <QuestionItem label="Fraturou osso nos últimos 5 anos?" value={respostas.fraturouOsso} />
        <DetailItem label="Detalhes da fratura" value={respostas.fraturouOssoDetalhes} />
        <QuestionItem label="Perdeu >3cm de altura?" value={respostas.perdeuAltura} />
        <QuestionItem label="Perda óssea em radiografia?" value={respostas.perdaOsseaRadiografia} />
        <QuestionItem label="Cifose dorsal?" value={respostas.cifoseDorsal} />
        <QuestionItem label="Quedas nos últimos 12 meses?" value={respostas.quedas12Meses} />
        <QuestionItem label="Parente com osteoporose?" value={respostas.parenteOsteoporose} />
        <DetailItem label="Qual parente" value={respostas.parenteOsteoporoseDetalhes} />
      </>
    );
  }

  // Sem tipo de exame reconhecido - sem questões de segurança
  return (
    <p className="text-sm text-muted-foreground">Nenhuma questão de segurança para este tipo de exame.</p>
  );
}

function ClinicalQuestions({ tipoExame, respostas, questionario }: any) {
  return (
    <>
      <DetailItem label="Motivo do exame" value={respostas.motivoExame} />

      {(tipoExame === 'tomografia' || tipoExame === 'ressonancia') && (
        <>
          <ArrayItem label="Regiões do exame" value={respostas.regioesExame} />
          <QuestionItem label="Trauma na região?" value={respostas.traumaRegiao} />
          <QuestionItem label="Cirurgia no corpo?" value={respostas.cirurgiaCorpo} />
          <DetailItem label="Detalhes da cirurgia" value={respostas.cirurgiaCorpoDetalhes} />
          <QuestionItem label="Histórico de câncer?" value={respostas.historicoCancer} />
          <DetailItem label="Localização do câncer" value={respostas.historicoCancerDetalhes} />
          {tipoExame === 'ressonancia' && (
            <>
              <QuestionItem label="Exames relacionados?" value={respostas.examesRelacionados} />
              <DetailItem label="Detalhes dos exames" value={respostas.examesRelacionadosDetalhes} />
            </>
          )}
          <QuestionItem label="Problema de próstata?" value={respostas.problemaProstata} />
          <QuestionItem label="Dificuldade urinária?" value={respostas.dificuldadeUrinaria} />
        </>
      )}

      {tipoExame === 'mamografia' && (
        <>
          <QuestionItem label="Exame anterior?" value={respostas.mamoExameAnterior} />
          <DetailItem label="Quando foi realizado" value={respostas.mamoExameAnteriorDetalhes} />
          <DetailItem label="Última menstruação" value={respostas.mamoUltimaMenstruacao} />
          <QuestionItem label="Menopausa?" value={respostas.mamoMenopausa} />
          <DetailItem label="Idade da menopausa" value={respostas.mamoMenopausaDetalhes} />
          <QuestionItem label="Usa hormônios?" value={respostas.mamoUsaHormonios} />
          <QuestionItem label="Tem filhos?" value={respostas.mamoTemFilhos} />
          <DetailItem label="Informações sobre amamentação" value={respostas.mamoTemFilhosDetalhes} />
          <QuestionItem label="Problema nas mamas?" value={respostas.mamoProblemaMamas} />
          <DetailItem label="Detalhes do problema" value={respostas.mamoProblemaMamasDetalhes} />
          <QuestionItem label="Cirurgia nas mamas?" value={respostas.mamoCirurgiaMamas} />
          <DetailItem label="Detalhes da cirurgia" value={respostas.mamoCirurgiaMamasDetalhes} />
          <QuestionItem label="Ultrassonografia?" value={respostas.mamoUltrassonografia} />
          <DetailItem label="Quando foi realizada" value={respostas.mamoUltrassonografiaDetalhes} />
          <QuestionItem label="Histórico familiar de câncer?" value={respostas.mamoHistoricoFamiliar} />
          <DetailItem label="Quais parentes" value={respostas.mamoHistoricoFamiliarDetalhes} />
          <QuestionItem label="Radioterapia?" value={respostas.mamoRadioterapia} />
          <DetailItem label="Ano da radioterapia" value={respostas.mamoRadioterapiaDetalhes} />
        </>
      )}

      {tipoExame === 'densitometria' && (
        <>
          <QuestionItem label="Tem osteoporose?" value={respostas.temOsteoporose} />
          <QuestionItem label="Doença de tireoide?" value={respostas.doencaTireoide} />
          <DetailItem label="Detalhes da doença" value={respostas.doencaTireoideDetalhes} />
          <QuestionItem label="Doença intestinal crônica?" value={respostas.doencaIntestinal} />
          <DetailItem label="Detalhes da doença" value={respostas.doencaIntestinalDetalhes} />
          <QuestionItem label="Hiperparatiroidismo?" value={respostas.temHiperparatiroidismo} />
          <QuestionItem label="Doença de Paget?" value={respostas.temDoencaPaget} />
          <QuestionItem label="Má absorção de cálcio?" value={respostas.maAbsorcaoCalcio} />
          <QuestionItem label="Osteomalacia?" value={respostas.temOsteomalacia} />
          <QuestionItem label="Síndrome de Cushing?" value={respostas.temSindromeCushing} />
          <QuestionItem label="Deficiência de vitamina D?" value={respostas.deficienciaVitaminaD} />
          <QuestionItem label="Disfunção renal crônica?" value={respostas.disfuncaoRenalCronica} />
          <QuestionItem label="Usa medicação regular?" value={respostas.usaMedicacaoRegular} />
          <DetailItem label="Lista de medicações" value={respostas.usaMedicacaoRegularDetalhes} />
          <QuestionItem label="Passou pela menopausa?" value={respostas.passouMenopausa} />
          <DetailItem label="Detalhes da menopausa" value={respostas.passouMenopausaDetalhes} />
          <QuestionItem label="Ciclos irregulares?" value={respostas.ciclosIrregulares} />
          <QuestionItem label="Teve câncer de mama?" value={respostas.teveCancerMamaDensi} />
          <QuestionItem label="Fez histerectomia?" value={respostas.fezHisterectomia} />
          <DetailItem label="Idade da histerectomia" value={respostas.fezHisterectomiaDetalhes} />
          <QuestionItem label="Retirou ovários?" value={respostas.retirouOvarios} />
        </>
      )}

      <ArrayItem label="Sintomas" value={respostas.clinicas?.sintomas} />
      <DetailItem label="Outros sintomas" value={respostas.clinicas?.sintomasOutros} />
      <QuestionItem label="Câncer de mama?" value={respostas.clinicas?.cancerMama} />
    </>
  );
}

function ConsentQuestions({ respostas, tipoExame }: any) {
  console.log('[DEBUG ConsentQuestions]', { tipoExame, respostas });
  return (
    <>
      <QuestionItem label="Aceita os riscos do procedimento?" value={respostas.aceitaRiscos} />
      {tipoExame === 'ressonancia' && (
        <QuestionItem label="Autoriza uso de contraste (gadolínio)?" value={respostas.rmAceitaContraste} />
      )}
      {tipoExame === 'tomografia' && (
        <QuestionItem label="Autoriza uso de contraste iodado?" value={respostas.tcAceitaContraste} />
      )}
      <QuestionItem label="Aceita compartilhamento de dados?" value={respostas.aceitaCompartilhamento} />
      <QuestionItem label="Assinatura fornecida?" value={!!respostas.assinaturaData} />
    </>
  );
}
