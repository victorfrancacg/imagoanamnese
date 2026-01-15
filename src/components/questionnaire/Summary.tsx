import { QuestionnaireData } from "@/types/questionnaire";
import { Button } from "@/components/ui/button";
import { CheckCircle2, User, Shield, Stethoscope, FileCheck, RotateCcw } from "lucide-react";
import { formatCpf } from "@/lib/utils";

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

function formatDate(dateString: string): string {
  if (!dateString) return '-';
  const [year, month, day] = dateString.split('-');
  return `${day}/${month}/${year}`;
}

function SummarySection({ title, icon: Icon, children }: { title: string; icon: React.ElementType; children: React.ReactNode }) {
  return (
    <div className="space-y-2 sm:space-y-3">
      <h3 className="flex items-center gap-2 text-base sm:text-lg font-semibold text-foreground">
        <Icon className="w-4 h-4 sm:w-5 sm:h-5 text-primary flex-shrink-0" />
        {title}
      </h3>
      <div className="pl-5 sm:pl-7 space-y-1 sm:space-y-2">
        {children}
      </div>
    </div>
  );
}

function SummaryItem({ label, value, highlight }: { label: string; value: string; highlight?: boolean }) {
  return (
    <div className="flex flex-col xs:flex-row xs:flex-wrap xs:justify-between gap-0.5 xs:gap-2 py-1.5 sm:py-2 border-b border-border/50 last:border-0">
      <span className="text-xs sm:text-sm text-muted-foreground flex-shrink-0">{label}</span>
      <span className={`text-sm sm:text-base font-medium break-words overflow-wrap-anywhere max-w-full ${highlight ? 'text-warning' : 'text-foreground'}`}>{value}</span>
    </div>
  );
}

function getExamTypeLabel(tipoExame: string): string {
  const labels: Record<string, string> = {
    'tomografia': 'Tomografia Computadorizada',
    'ressonancia': 'Ressonância Magnética',
    'densitometria': 'Densitometria',
    'mamografia': 'Mamografia',
  };
  return labels[tipoExame] || tipoExame;
}

export function Summary({ data, onReset, savedId }: SummaryProps) {
  const sexoLabel = data.sexo === 'masculino' 
    ? 'Masculino' 
    : data.sexo === 'feminino' 
    ? 'Feminino' 
    : '-';

  const sintomasLabel = data.sintomas.length > 0
    ? data.sintomas.map(s => s === 'outros' && data.sintomasOutros 
        ? `Outros: ${data.sintomasOutros}` 
        : SINTOMAS_LABELS[s] || s).join(', ')
    : 'Nenhum sintoma selecionado';

  const isRessonancia = data.tipoExame === 'ressonancia';
  const isTomografia = data.tipoExame === 'tomografia';
  const isDensitometria = data.tipoExame === 'densitometria';
  const isFeminino = data.sexo === 'feminino';

  return (
    <div className="w-full max-w-2xl mx-auto animate-slide-up">
      {/* Success Message */}
      <div className="text-center mb-6 sm:mb-8">
        <div className="inline-flex items-center justify-center w-16 h-16 sm:w-20 sm:h-20 rounded-full bg-success/10 mb-3 sm:mb-4">
          <CheckCircle2 className="w-8 h-8 sm:w-10 sm:h-10 text-success" />
        </div>
        <h1 className="text-xl sm:text-2xl font-bold text-foreground mb-1.5 sm:mb-2">
          Questionário Preenchido com Sucesso!
        </h1>
        <p className="text-sm sm:text-base text-muted-foreground px-2">
          Você preencheu com sucesso o questionário de anamnese para o exame de {getExamTypeLabel(data.tipoExame)}.
        </p>
      </div>

      {/* Summary Card */}
      <div className="bg-card rounded-xl sm:rounded-2xl p-4 sm:p-6 md:p-8 shadow-lg space-y-6 sm:space-y-8">
        <h2 className="text-lg sm:text-xl font-semibold text-center text-foreground border-b border-border pb-3 sm:pb-4">
          Resumo das Respostas
        </h2>

        <SummarySection title="Dados Pessoais" icon={User}>
          <SummaryItem label="Nome" value={data.nome || '-'} />
          <SummaryItem label="CPF" value={formatCpf(data.cpf) || '-'} />
          <SummaryItem label="Data de Nascimento" value={formatDate(data.dataNascimento)} />
          <SummaryItem label="Sexo" value={sexoLabel} />
          <SummaryItem label="Peso" value={data.peso ? `${data.peso} kg` : '-'} />
          <SummaryItem label="Altura" value={data.altura ? `${data.altura} cm` : '-'} />
          <SummaryItem label="Tipo do Exame" value={getExamTypeLabel(data.tipoExame)} />
          <SummaryItem label="Data do Exame" value={formatDate(data.dataExame)} />
        </SummarySection>

        <SummarySection title="Questões de Segurança" icon={Shield}>
          {/* Ressonância Magnética */}
          {isRessonancia && (
            <>
              {isFeminino && (
                <>
                  <SummaryItem 
                    label="Gravidez" 
                    value={formatBoolean(data.rmGravida)} 
                    highlight={data.rmGravida === true}
                  />
                  <SummaryItem 
                    label="Amamentando" 
                    value={formatBoolean(data.rmAmamentando)} 
                  />
                </>
              )}
              <SummaryItem 
                label="Implante medicamentoso" 
                value={formatBoolean(data.rmImplanteMedicamentoso)} 
                highlight={data.rmImplanteMedicamentoso === true}
              />
              <SummaryItem 
                label="Marcapasso/Desfibrilador" 
                value={formatBoolean(data.rmMarcapasso)} 
                highlight={data.rmMarcapasso === true}
              />
              <SummaryItem 
                label="Fragmento metálico/Projétil" 
                value={formatBoolean(data.rmFragmentoMetalico)} 
                highlight={data.rmFragmentoMetalico === true}
              />
              <SummaryItem 
                label="Eletroestimulador implantado" 
                value={formatBoolean(data.rmEletroestimulador)} 
                highlight={data.rmEletroestimulador === true}
              />
              <SummaryItem 
                label="Clipe de aneurisma na cabeça" 
                value={formatBoolean(data.rmClipeAneurisma)} 
                highlight={data.rmClipeAneurisma === true}
              />
              <SummaryItem 
                label="Expansor tecidual" 
                value={formatBoolean(data.rmExpansorTecidual)} 
                highlight={data.rmExpansorTecidual === true}
              />
              <SummaryItem 
                label="Clipe gástrico/esofágico/microcâmera" 
                value={formatBoolean(data.rmClipeGastrico)} 
                highlight={data.rmClipeGastrico === true}
              />
              <SummaryItem 
                label="Implante coclear/eletrônico" 
                value={formatBoolean(data.rmImplanteCoclear)} 
                highlight={data.rmImplanteCoclear === true}
              />
              <SummaryItem 
                label="Lesão de olho por metal" 
                value={formatBoolean(data.rmLesaoOlhoMetal)} 
                highlight={data.rmLesaoOlhoMetal === true}
              />
              <SummaryItem 
                label="Tatuagem recente (menos de 15 dias)" 
                value={formatBoolean(data.rmTatuagemRecente)} 
                highlight={data.rmTatuagemRecente === true}
              />
              <SummaryItem 
                label="Cirurgia renal" 
                value={formatBoolean(data.rmCirurgiaRenal)} 
                highlight={data.rmCirurgiaRenal === true}
              />
              <SummaryItem 
                label="Doença renal" 
                value={formatBoolean(data.rmDoencaRenal)} 
                highlight={data.rmDoencaRenal === true}
              />
              <SummaryItem 
                label="Alergia ao contraste de RM" 
                value={formatBoolean(data.rmAlergiaContraste)} 
                highlight={data.rmAlergiaContraste === true}
              />
            </>
          )}

          {/* Tomografia Computadorizada */}
          {isTomografia && (
            <>
              {isFeminino && (
                <>
                  <SummaryItem 
                    label="Possibilidade de gravidez" 
                    value={formatBoolean(data.tcGravida)} 
                    highlight={data.tcGravida === true}
                  />
                  <SummaryItem 
                    label="Amamentando" 
                    value={formatBoolean(data.tcAmamentando)} 
                  />
                </>
              )}
              <SummaryItem 
                label="Uso de metformina" 
                value={formatBoolean(data.tcUsaMetformina)} 
              />
              <SummaryItem 
                label="Marcapasso ou desfibrilador" 
                value={formatBoolean(data.tcMarcapasso)} 
                highlight={data.tcMarcapasso === true}
              />
              <SummaryItem 
                label="Alergia ao contraste de TC" 
                value={formatBoolean(data.tcAlergiaContraste)} 
                highlight={data.tcAlergiaContraste === true}
              />
              <SummaryItem 
                label="Cirurgia renal" 
                value={formatBoolean(data.tcCirurgiaRenal)} 
                highlight={data.tcCirurgiaRenal === true}
              />
              <SummaryItem 
                label="Doença renal" 
                value={formatBoolean(data.tcDoencaRenal)} 
                highlight={data.tcDoencaRenal === true}
              />
            </>
          )}

          {/* Densitometria */}
          {isDensitometria && (
            <>
              {isFeminino && (
                <SummaryItem 
                  label="Gravidez" 
                  value={formatBoolean(data.gravida)} 
                  highlight={data.gravida === true}
                />
              )}
              <SummaryItem 
                label="Exame contraste/bário recente" 
                value={formatBoolean(data.exameContrasteRecente)} 
                highlight={data.exameContrasteRecente === true}
              />
              <SummaryItem 
                label="Fraturou osso (5 anos)" 
                value={formatBoolean(data.fraturouOsso)} 
                highlight={data.fraturouOsso === true}
              />
              {data.fraturouOsso && data.fraturouOssoDetalhes && (
                <SummaryItem label="Detalhes da fratura" value={data.fraturouOssoDetalhes} />
              )}
              <SummaryItem 
                label="Perdeu mais de 3cm de altura" 
                value={formatBoolean(data.perdeuAltura)} 
                highlight={data.perdeuAltura === true}
              />
              <SummaryItem 
                label="Perda óssea em radiografia" 
                value={formatBoolean(data.perdaOsseaRadiografia)} 
                highlight={data.perdaOsseaRadiografia === true}
              />
              <SummaryItem 
                label="Cifose dorsal" 
                value={formatBoolean(data.cifoseDorsal)} 
                highlight={data.cifoseDorsal === true}
              />
              <SummaryItem 
                label="Mais de uma queda (12 meses)" 
                value={formatBoolean(data.quedas12Meses)} 
                highlight={data.quedas12Meses === true}
              />
              <SummaryItem 
                label="Parente com osteoporose" 
                value={formatBoolean(data.parenteOsteoporose)} 
                highlight={data.parenteOsteoporose === true}
              />
              {data.parenteOsteoporose && data.parenteOsteoporoseDetalhes && (
                <SummaryItem label="Qual parente" value={data.parenteOsteoporoseDetalhes} />
              )}
            </>
          )}

          {/* Mamografia */}
          {data.tipoExame === 'mamografia' && isFeminino && (
            <SummaryItem 
              label="Gravidez" 
              value={formatBoolean(data.gravida)} 
              highlight={data.gravida === true}
            />
          )}
        </SummarySection>

        <SummarySection title="Questões Clínicas" icon={Stethoscope}>
          <SummaryItem label="Motivo do Exame" value={data.motivoExame || '-'} />

          {/* Questões clínicas genéricas (não densitometria) */}
          {!isDensitometria && (
            <>
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
            </>
          )}

          {/* Questões clínicas específicas de densitometria */}
          {isDensitometria && (
            <>
              <SummaryItem
                label="Tem osteoporose"
                value={formatBoolean(data.temOsteoporose)}
                highlight={data.temOsteoporose === true}
              />
              <SummaryItem
                label="Doença da tireoide"
                value={formatBoolean(data.doencaTireoide)}
                highlight={data.doencaTireoide === true}
              />
              {data.doencaTireoide && data.doencaTireoideDetalhes && (
                <SummaryItem label="Detalhes (tireoide)" value={data.doencaTireoideDetalhes} />
              )}
              <SummaryItem
                label="Doença intestinal (Crohn, celíaca)"
                value={formatBoolean(data.doencaIntestinal)}
                highlight={data.doencaIntestinal === true}
              />
              {data.doencaIntestinal && data.doencaIntestinalDetalhes && (
                <SummaryItem label="Detalhes (intestinal)" value={data.doencaIntestinalDetalhes} />
              )}
              <SummaryItem
                label="Hiperparatireoidismo"
                value={formatBoolean(data.temHiperparatiroidismo)}
                highlight={data.temHiperparatiroidismo === true}
              />
              <SummaryItem
                label="Doença de Paget"
                value={formatBoolean(data.temDoencaPaget)}
                highlight={data.temDoencaPaget === true}
              />
              <SummaryItem
                label="Má absorção de cálcio"
                value={formatBoolean(data.maAbsorcaoCalcio)}
                highlight={data.maAbsorcaoCalcio === true}
              />
              <SummaryItem
                label="Osteomalacia"
                value={formatBoolean(data.temOsteomalacia)}
                highlight={data.temOsteomalacia === true}
              />
              <SummaryItem
                label="Síndrome de Cushing"
                value={formatBoolean(data.temSindromeCushing)}
                highlight={data.temSindromeCushing === true}
              />
              <SummaryItem
                label="Deficiência de vitamina D"
                value={formatBoolean(data.deficienciaVitaminaD)}
                highlight={data.deficienciaVitaminaD === true}
              />
              <SummaryItem
                label="Disfunção renal crônica"
                value={formatBoolean(data.disfuncaoRenalCronica)}
                highlight={data.disfuncaoRenalCronica === true}
              />
              <SummaryItem
                label="Usa medicação regular"
                value={formatBoolean(data.usaMedicacaoRegular)}
              />
              {data.usaMedicacaoRegular && data.usaMedicacaoRegularDetalhes && (
                <SummaryItem label="Detalhes (medicação)" value={data.usaMedicacaoRegularDetalhes} />
              )}

              {/* Questões femininas específicas de densitometria */}
              {isFeminino && (
                <>
                  <SummaryItem
                    label="Ciclos menstruais irregulares"
                    value={formatBoolean(data.ciclosIrregulares)}
                    highlight={data.ciclosIrregulares === true}
                  />
                  <SummaryItem
                    label="Retirou ovários"
                    value={formatBoolean(data.retirouOvarios)}
                    highlight={data.retirouOvarios === true}
                  />
                  <SummaryItem
                    label="Teve câncer de mama"
                    value={formatBoolean(data.teveCancerMamaDensi)}
                    highlight={data.teveCancerMamaDensi === true}
                  />
                  <SummaryItem
                    label="Passou pela menopausa"
                    value={formatBoolean(data.passouMenopausa)}
                  />
                  {data.passouMenopausa && data.passouMenopausaDetalhes && (
                    <SummaryItem label="Detalhes (menopausa)" value={data.passouMenopausaDetalhes} />
                  )}
                  <SummaryItem
                    label="Fez histerectomia"
                    value={formatBoolean(data.fezHisterectomia)}
                    highlight={data.fezHisterectomia === true}
                  />
                  {data.fezHisterectomia && data.fezHisterectomiaDetalhes && (
                    <SummaryItem label="Detalhes (histerectomia)" value={data.fezHisterectomiaDetalhes} />
                  )}
                </>
              )}
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
      <div className="flex flex-col sm:flex-row gap-3 sm:gap-4 mt-6 sm:mt-8 justify-center">
        <Button
          variant="outline"
          onClick={onReset}
          className="flex items-center justify-center gap-2 h-10 sm:h-11"
        >
          <RotateCcw className="w-4 h-4" />
          Novo Questionário
        </Button>
      </div>
    </div>
  );
}
