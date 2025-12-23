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
  const isDensitometria = tipoExame === 'densitometria';
  const isMamografia = tipoExame === 'mamografia';
  const isFeminino = data.sexo === 'feminino';
  
  const sexoLabel = data.sexo === 'masculino' 
    ? 'Masculino' 
    : data.sexo === 'feminino' 
    ? 'Feminino' 
    : '-';

  const tipoExameLabel = tipoExame ? TIPO_EXAME_LABELS[tipoExame] : '-';

  // Determinar quais campos de segurança mostrar baseado no tipo de exame
  const showContraindicacao = tipoExame === 'tomografia' || tipoExame === 'ressonancia';
  const showExameAnterior = tipoExame === 'tomografia' || tipoExame === 'ressonancia';
  const showAlergia = tipoExame === 'tomografia' || tipoExame === 'ressonancia';

  // Novos campos específicos de Tomografia (Segurança)
  const showMetformina = tipoExame === 'tomografia';
  const showCirurgiaRenal = tipoExame === 'tomografia';
  const showDoencaRenal = tipoExame === 'tomografia';

  // Novos campos específicos de Tomografia e Ressonância (Clínicas)
  const showTraumaRegiao = tipoExame === 'tomografia' || tipoExame === 'ressonancia';
  const showCirurgiaCorpo = tipoExame === 'tomografia' || tipoExame === 'ressonancia';
  const showHistoricoCancer = tipoExame === 'tomografia' || tipoExame === 'ressonancia';
  const showExamesRelacionados = tipoExame === 'ressonancia';

  // Labels dinâmicos para exame anterior
  const exameAnteriorLabel = tipoExame === 'ressonancia' 
    ? 'Ressonância anterior (12 meses)' 
    : 'Tomografia anterior (12 meses)';

  // Perguntas clínicas específicas por sexo e tipo
  const showAmamentando = data.sexo === 'feminino' && tipoExame === 'tomografia';
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
          {/* Questões de Segurança - Ressonância Magnética */}
          {tipoExame === 'ressonancia' && (
            <>
              <InfoRow 
                label="Está grávida ou suspeita" 
                value={formatBoolean(data.rmGravida)} 
                highlight={data.rmGravida === true}
              />
              <InfoRow 
                label="Está amamentando" 
                value={formatBoolean(data.rmAmamentando)} 
              />
              <InfoRow 
                label="Implante medicamentoso" 
                value={formatBoolean(data.rmImplanteMedicamentoso)} 
                highlight={data.rmImplanteMedicamentoso === true}
              />
              <InfoRow 
                label="Marcapasso ou desfibrilador" 
                value={formatBoolean(data.rmMarcapasso)} 
                highlight={data.rmMarcapasso === true}
              />
              <InfoRow 
                label="Fragmento metálico/projétil" 
                value={formatBoolean(data.rmFragmentoMetalico)} 
                highlight={data.rmFragmentoMetalico === true}
              />
              <InfoRow 
                label="Eletroestimulador implantado" 
                value={formatBoolean(data.rmEletroestimulador)} 
                highlight={data.rmEletroestimulador === true}
              />
              <InfoRow 
                label="Clipe de aneurisma" 
                value={formatBoolean(data.rmClipeAneurisma)} 
                highlight={data.rmClipeAneurisma === true}
              />
              <InfoRow 
                label="Expansor tecidual" 
                value={formatBoolean(data.rmExpansorTecidual)} 
                highlight={data.rmExpansorTecidual === true}
              />
              <InfoRow 
                label="Clipe gástrico/esofágico/pílula câmera" 
                value={formatBoolean(data.rmClipeGastrico)} 
                highlight={data.rmClipeGastrico === true}
              />
              <InfoRow 
                label="Implante coclear/eletrônico" 
                value={formatBoolean(data.rmImplanteCoclear)} 
                highlight={data.rmImplanteCoclear === true}
              />
              <InfoRow 
                label="Lesão de olho por metal" 
                value={formatBoolean(data.rmLesaoOlhoMetal)} 
                highlight={data.rmLesaoOlhoMetal === true}
              />
              <InfoRow 
                label="Tatuagem há menos de 15 dias" 
                value={formatBoolean(data.rmTatuagemRecente)} 
                highlight={data.rmTatuagemRecente === true}
              />
              <InfoRow 
                label="Cirurgia renal" 
                value={formatBoolean(data.rmCirurgiaRenal)} 
                highlight={data.rmCirurgiaRenal === true}
              />
              <InfoRow 
                label="Doença renal" 
                value={formatBoolean(data.rmDoencaRenal)} 
                highlight={data.rmDoencaRenal === true}
              />
              <InfoRow 
                label="Alergia a contraste RM" 
                value={formatBoolean(data.rmAlergiaContraste)} 
                highlight={data.rmAlergiaContraste === true}
              />
            </>
          )}
          {/* Questões de Segurança - Tomografia Computadorizada */}
          {tipoExame === 'tomografia' && (
            <>
              {data.sexo === 'feminino' && (
                <>
                  <InfoRow 
                    label="Possibilidade de gravidez" 
                    value={formatBoolean(data.tcGravida)} 
                    highlight={data.tcGravida === true}
                  />
                  <InfoRow 
                    label="Está amamentando" 
                    value={formatBoolean(data.tcAmamentando)} 
                  />
                </>
              )}
              <InfoRow 
                label="Uso de metformina" 
                value={formatBoolean(data.tcUsaMetformina)} 
              />
              <InfoRow 
                label="Marcapasso ou desfibrilador" 
                value={formatBoolean(data.tcMarcapasso)} 
                highlight={data.tcMarcapasso === true}
              />
              <InfoRow 
                label="Alergia ao contraste de TC" 
                value={formatBoolean(data.tcAlergiaContraste)} 
                highlight={data.tcAlergiaContraste === true}
              />
              <InfoRow 
                label="Cirurgia renal" 
                value={formatBoolean(data.tcCirurgiaRenal)} 
                highlight={data.tcCirurgiaRenal === true}
              />
              <InfoRow 
                label="Doença renal" 
                value={formatBoolean(data.tcDoencaRenal)} 
                highlight={data.tcDoencaRenal === true}
              />
            </>
          )}
          {/* Campos de Segurança Densitometria */}
          {isDensitometria && (
            <>
              <InfoRow 
                label="Exame contraste/bário recente" 
                value={formatBoolean(data.exameContrasteRecente)} 
                highlight={data.exameContrasteRecente === true}
              />
              <InfoRow 
                label="Fraturou osso (5 anos)" 
                value={formatBoolean(data.fraturouOsso)} 
                highlight={data.fraturouOsso === true}
              />
              {data.fraturouOsso && data.fraturouOssoDetalhes && (
                <InfoRow label="Detalhes" value={data.fraturouOssoDetalhes} />
              )}
              <InfoRow 
                label="Perdeu mais de 3cm de altura" 
                value={formatBoolean(data.perdeuAltura)} 
                highlight={data.perdeuAltura === true}
              />
              <InfoRow 
                label="Perda óssea em radiografia" 
                value={formatBoolean(data.perdaOsseaRadiografia)} 
                highlight={data.perdaOsseaRadiografia === true}
              />
              <InfoRow 
                label="Cifose dorsal" 
                value={formatBoolean(data.cifoseDorsal)} 
                highlight={data.cifoseDorsal === true}
              />
              <InfoRow 
                label="Mais de uma queda (12 meses)" 
                value={formatBoolean(data.quedas12Meses)} 
                highlight={data.quedas12Meses === true}
              />
              <InfoRow 
                label="Parente com osteoporose" 
                value={formatBoolean(data.parenteOsteoporose)} 
                highlight={data.parenteOsteoporose === true}
              />
              {data.parenteOsteoporose && data.parenteOsteoporoseDetalhes && (
                <InfoRow label="Qual parente" value={data.parenteOsteoporoseDetalhes} />
              )}
            </>
          )}
        </SectionCard>

        {/* Questões Clínicas */}
        <SectionCard title="Questões Clínicas" icon={Stethoscope} onEdit={() => onEditStep(4)}>
          <InfoRow label={isDensitometria ? "Motivo (Densitometria)" : "Motivo do Exame"} value={data.motivoExame || '-'} />
          {/* Campos Mamografia */}
          {isMamografia && (
            <>
              <InfoRow label="Exame anterior" value={formatBoolean(data.mamoExameAnterior)} />
              {data.mamoExameAnterior && data.mamoExameAnteriorDetalhes && (
                <InfoRow label="Quando realizou" value={data.mamoExameAnteriorDetalhes} />
              )}
              <InfoRow label="Última menstruação" value={data.mamoUltimaMenstruacao || '-'} />
              <InfoRow label="Na menopausa" value={formatBoolean(data.mamoMenopausa)} />
              {data.mamoMenopausa && data.mamoMenopausaDetalhes && (
                <InfoRow label="Idade menopausa" value={data.mamoMenopausaDetalhes} />
              )}
              <InfoRow label="Usa hormônios" value={formatBoolean(data.mamoUsaHormonios)} />
              <InfoRow label="Tem filhos" value={formatBoolean(data.mamoTemFilhos)} />
              {data.mamoTemFilhos && data.mamoTemFilhosDetalhes && (
                <InfoRow label="Amamentação" value={data.mamoTemFilhosDetalhes} />
              )}
              <InfoRow label="Problema nas mamas" value={formatBoolean(data.mamoProblemaMamas)} highlight={data.mamoProblemaMamas === true} />
              {data.mamoProblemaMamas && data.mamoProblemaMamasDetalhes && (
                <InfoRow label="Detalhes problema" value={data.mamoProblemaMamasDetalhes} />
              )}
              <InfoRow label="Cirurgia nas mamas" value={formatBoolean(data.mamoCirurgiaMamas)} />
              {data.mamoCirurgiaMamas && data.mamoCirurgiaMamasDetalhes && (
                <InfoRow label="Detalhes cirurgia" value={data.mamoCirurgiaMamasDetalhes} />
              )}
              <InfoRow label="Ultrassonografia mama" value={formatBoolean(data.mamoUltrassonografia)} />
              {data.mamoUltrassonografia && data.mamoUltrassonografiaDetalhes && (
                <InfoRow label="Quando realizou" value={data.mamoUltrassonografiaDetalhes} />
              )}
              <InfoRow label="Histórico familiar câncer mama/ovário" value={formatBoolean(data.mamoHistoricoFamiliar)} highlight={data.mamoHistoricoFamiliar === true} />
              {data.mamoHistoricoFamiliar && data.mamoHistoricoFamiliarDetalhes && (
                <InfoRow label="Quais parentes" value={data.mamoHistoricoFamiliarDetalhes} />
              )}
              <InfoRow label="Radioterapia mama" value={formatBoolean(data.mamoRadioterapia)} highlight={data.mamoRadioterapia === true} />
              {data.mamoRadioterapia && data.mamoRadioterapiaDetalhes && (
                <InfoRow label="Ano radioterapia" value={data.mamoRadioterapiaDetalhes} />
              )}
            </>
          )}
          {showTraumaRegiao && (
            <InfoRow 
              label="Trauma na região" 
              value={formatBoolean(data.traumaRegiao)} 
              highlight={data.traumaRegiao === true}
            />
          )}
          {showCirurgiaCorpo && (
            <>
              <InfoRow 
                label="Cirurgia no corpo" 
                value={formatBoolean(data.cirurgiaCorpo)} 
              />
              {data.cirurgiaCorpo && data.cirurgiaCorpoDetalhes && (
                <InfoRow label="Detalhes" value={data.cirurgiaCorpoDetalhes} />
              )}
            </>
          )}
          {showHistoricoCancer && (
            <>
              <InfoRow 
                label="Histórico de câncer" 
                value={formatBoolean(data.historicoCancer)} 
                highlight={data.historicoCancer === true}
              />
              {data.historicoCancer && data.historicoCancerDetalhes && (
                <InfoRow label="Detalhes" value={data.historicoCancerDetalhes} />
              )}
            </>
          )}
          {showExamesRelacionados && (
            <>
              <InfoRow 
                label="Exames relacionados" 
                value={formatBoolean(data.examesRelacionados)} 
              />
              {data.examesRelacionados && data.examesRelacionadosDetalhes && (
                <InfoRow label="Detalhes" value={data.examesRelacionadosDetalhes} />
              )}
            </>
          )}
          {/* Campos Clínicos Densitometria */}
          {isDensitometria && (
            <>
              <InfoRow label="Osteoporose" value={formatBoolean(data.temOsteoporose)} highlight={data.temOsteoporose === true} />
              <InfoRow label="Doença na tireoide" value={formatBoolean(data.doencaTireoide)} highlight={data.doencaTireoide === true} />
              {data.doencaTireoide && data.doencaTireoideDetalhes && (
                <InfoRow label="Detalhes tireoide" value={data.doencaTireoideDetalhes} />
              )}
              <InfoRow label="Doença intestinal crônica" value={formatBoolean(data.doencaIntestinal)} highlight={data.doencaIntestinal === true} />
              {data.doencaIntestinal && data.doencaIntestinalDetalhes && (
                <InfoRow label="Detalhes intestinal" value={data.doencaIntestinalDetalhes} />
              )}
              <InfoRow label="Hiperparatiroidismo" value={formatBoolean(data.temHiperparatiroidismo)} highlight={data.temHiperparatiroidismo === true} />
              <InfoRow label="Doença de Paget" value={formatBoolean(data.temDoencaPaget)} highlight={data.temDoencaPaget === true} />
              <InfoRow label="Má absorção de cálcio" value={formatBoolean(data.maAbsorcaoCalcio)} highlight={data.maAbsorcaoCalcio === true} />
              <InfoRow label="Osteomalácia" value={formatBoolean(data.temOsteomalacia)} highlight={data.temOsteomalacia === true} />
              <InfoRow label="Síndrome de Cushing" value={formatBoolean(data.temSindromeCushing)} highlight={data.temSindromeCushing === true} />
              <InfoRow label="Deficiência vitamina D" value={formatBoolean(data.deficienciaVitaminaD)} highlight={data.deficienciaVitaminaD === true} />
              <InfoRow label="Disfunção renal crônica" value={formatBoolean(data.disfuncaoRenalCronica)} highlight={data.disfuncaoRenalCronica === true} />
              <InfoRow label="Usa medicação regular" value={formatBoolean(data.usaMedicacaoRegular)} />
              {data.usaMedicacaoRegular && data.usaMedicacaoRegularDetalhes && (
                <InfoRow label="Medicações" value={data.usaMedicacaoRegularDetalhes} />
              )}
              {/* Campos Densitometria Feminino */}
              {isFeminino && (
                <>
                  <InfoRow label="Passou pela menopausa" value={formatBoolean(data.passouMenopausa)} />
                  {data.passouMenopausa && data.passouMenopausaDetalhes && (
                    <InfoRow label="Detalhes menopausa" value={data.passouMenopausaDetalhes} />
                  )}
                  <InfoRow label="Ciclos irregulares/perimenopausa" value={formatBoolean(data.ciclosIrregulares)} />
                  <InfoRow label="Câncer de mama" value={formatBoolean(data.teveCancerMamaDensi)} highlight={data.teveCancerMamaDensi === true} />
                  <InfoRow label="Histerectomia" value={formatBoolean(data.fezHisterectomia)} />
                  {data.fezHisterectomia && data.fezHisterectomiaDetalhes && (
                    <InfoRow label="Detalhes histerectomia" value={data.fezHisterectomiaDetalhes} />
                  )}
                  <InfoRow label="Retirou ovários" value={formatBoolean(data.retirouOvarios)} />
                </>
              )}
            </>
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