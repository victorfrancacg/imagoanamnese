import { QuestionCard } from "../QuestionCard";
import { NavigationButtons } from "../NavigationButtons";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Checkbox } from "@/components/ui/checkbox";
import { Input } from "@/components/ui/input";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { QuestionnaireData } from "@/types/questionnaire";

// Componente reutilizável para perguntas Sim/Não/Não sei
function YesNoQuestion({
  id,
  label,
  value,
  onChange,
  showUnknownOption = true,
  unknownLabel = "Não sei",
  children,
}: {
  id: string;
  label: string;
  value: boolean | 'nao_sei' | null;
  onChange: (value: boolean | 'nao_sei') => void;
  showUnknownOption?: boolean;
  unknownLabel?: string;
  children?: React.ReactNode;
}) {
  const getRadioValue = () => {
    if (value === null) return '';
    if (value === 'nao_sei') return 'nao_sei';
    return value ? 'sim' : 'nao';
  };

  const handleChange = (v: string) => {
    if (v === 'sim') onChange(true);
    else if (v === 'nao') onChange(false);
    else if (v === 'nao_sei') onChange('nao_sei');
  };

  return (
    <div className="space-y-3 animate-fade-in">
      <Label className="text-base font-medium">{label}</Label>
      <RadioGroup
        value={getRadioValue()}
        onValueChange={handleChange}
        className="flex flex-wrap gap-2 sm:gap-4"
      >
        <label className="flex items-center space-x-2 p-3 rounded-lg border border-border hover:bg-accent/50 transition-colors cursor-pointer flex-1 min-w-[80px]">
          <RadioGroupItem value="sim" id={`${id}-sim`} />
          <span>Sim</span>
        </label>
        <label className="flex items-center space-x-2 p-3 rounded-lg border border-border hover:bg-accent/50 transition-colors cursor-pointer flex-1 min-w-[80px]">
          <RadioGroupItem value="nao" id={`${id}-nao`} />
          <span>Não</span>
        </label>
        {showUnknownOption && (
          <label className="flex items-center space-x-2 p-3 rounded-lg border border-border hover:bg-accent/50 transition-colors cursor-pointer flex-1 min-w-[80px]">
            <RadioGroupItem value="nao_sei" id={`${id}-nao_sei`} />
            <span>{unknownLabel}</span>
          </label>
        )}
      </RadioGroup>
      {children}
    </div>
  );
}

interface ClinicasStepProps {
  data: QuestionnaireData;
  updateData: (updates: Partial<QuestionnaireData>) => void;
  onNext: () => void;
  onBack: () => void;
}


export function ClinicasStep({ data, updateData, onNext, onBack }: ClinicasStepProps) {
  const tipoExame = data.tipoExame;
  const isFeminino = data.sexo === 'feminino';
  const isMasculino = data.sexo === 'masculino';
  const isDensitometria = tipoExame === 'densitometria';
  const isMamografia = tipoExame === 'mamografia';
  const isTomografiaOuRessonancia = tipoExame === 'tomografia' || tipoExame === 'ressonancia';

  // Regiões disponíveis para seleção
  const regioesDisponiveis = [
    { id: 'cabeca', label: 'Cabeça' },
    { id: 'pescoco', label: 'Pescoço' },
    { id: 'tronco', label: 'Tronco' },
    { id: 'membros_superiores', label: 'Membros Superiores' },
    { id: 'membros_inferiores', label: 'Membros Inferiores' },
  ];

  const handleRegiaoChange = (regiaoId: string, checked: boolean) => {
    const currentRegioes = data.regioesExame || [];
    if (checked) {
      updateData({ regioesExame: [...currentRegioes, regiaoId] });
    } else {
      updateData({ regioesExame: currentRegioes.filter(r => r !== regiaoId) });
    }
  };

  // Novas perguntas específicas para Tomografia e Ressonância
  const showTraumaRegiao = tipoExame === 'tomografia' || tipoExame === 'ressonancia';
  const showCirurgiaCorpo = tipoExame === 'tomografia' || tipoExame === 'ressonancia';
  const showHistoricoCancer = tipoExame === 'tomografia' || tipoExame === 'ressonancia';
  const showExamesRelacionados = tipoExame === 'ressonancia';

  // Perguntas específicas por sexo e tipo de exame
  const showAmamentando = isFeminino && tipoExame === 'tomografia';
  const showProstata = isMasculino && (tipoExame === 'tomografia' || tipoExame === 'ressonancia');
  const showDificuldadeUrinaria = isMasculino && (tipoExame === 'tomografia' || tipoExame === 'ressonancia');

  // Validação das regiões (obrigatória para TC e RM)
  const regioesValid = !isTomografiaOuRessonancia || (data.regioesExame && data.regioesExame.length > 0);

  // Validate required fields
  const baseValid = data.motivoExame.trim() !== '';
  const amamentandoValid = !showAmamentando || data.amamentando !== null;
  const masculinoValid = !showProstata || data.problemaProstata !== null;
  const urinariaValid = !showDificuldadeUrinaria || data.dificuldadeUrinaria !== null;
  
  // Validações específicas para Tomografia e Ressonância
  const traumaValid = !showTraumaRegiao || data.traumaRegiao !== null;
  const cirurgiaCorpoValid = !showCirurgiaCorpo || data.cirurgiaCorpo !== null;
  const cirurgiaCorpoDetalhesValid = data.cirurgiaCorpo !== true || (data.cirurgiaCorpoDetalhes?.trim() ?? '') !== '';
  const historicoCancerValid = !showHistoricoCancer || data.historicoCancer !== null;
  const historicoCancerDetalhesValid = data.historicoCancer !== true || (data.historicoCancerDetalhes?.trim() ?? '') !== '';
  const examesRelacionadosValid = !showExamesRelacionados || data.examesRelacionados !== null;
  const examesRelacionadosDetalhesValid = data.examesRelacionados !== true || (data.examesRelacionadosDetalhes?.trim() ?? '') !== '';

  // Validações Densitometria
  const densitometriaValid = !isDensitometria || (
    data.temOsteoporose !== null &&
    data.doencaTireoide !== null &&
    (data.doencaTireoide !== true || (data.doencaTireoideDetalhes?.trim() ?? '') !== '') &&
    data.doencaIntestinal !== null &&
    (data.doencaIntestinal !== true || (data.doencaIntestinalDetalhes?.trim() ?? '') !== '') &&
    data.temHiperparatiroidismo !== null &&
    data.temDoencaPaget !== null &&
    data.maAbsorcaoCalcio !== null &&
    data.temOsteomalacia !== null &&
    data.temSindromeCushing !== null &&
    data.deficienciaVitaminaD !== null &&
    data.disfuncaoRenalCronica !== null &&
    data.usaMedicacaoRegular !== null &&
    (data.usaMedicacaoRegular !== true || (data.usaMedicacaoRegularDetalhes?.trim() ?? '') !== '')
  );

  // Validações Densitometria Feminino
  const densitometriaFemininoValid = !(isDensitometria && isFeminino) || (
    data.passouMenopausa !== null &&
    (data.passouMenopausa !== true || (data.passouMenopausaDetalhes?.trim() ?? '') !== '') &&
    data.ciclosIrregulares !== null &&
    data.teveCancerMamaDensi !== null &&
    data.fezHisterectomia !== null &&
    (data.fezHisterectomia !== true || (data.fezHisterectomiaDetalhes?.trim() ?? '') !== '') &&
    data.retirouOvarios !== null
  );

  // Validações Mamografia
  const mamografiaValid = !isMamografia || (
    data.mamoExameAnterior !== null &&
    (data.mamoExameAnterior !== true || (data.mamoExameAnteriorDetalhes?.trim() ?? '') !== '') &&
    data.mamoUltimaMenstruacao.trim() !== '' &&
    data.mamoMenopausa !== null &&
    (data.mamoMenopausa !== true || (data.mamoMenopausaDetalhes?.trim() ?? '') !== '') &&
    data.mamoUsaHormonios !== null &&
    data.mamoTemFilhos !== null &&
    (data.mamoTemFilhos !== true || (data.mamoTemFilhosDetalhes?.trim() ?? '') !== '') &&
    data.mamoProblemaMamas !== null &&
    (data.mamoProblemaMamas !== true || (data.mamoProblemaMamasDetalhes?.trim() ?? '') !== '') &&
    data.mamoCirurgiaMamas !== null &&
    (data.mamoCirurgiaMamas !== true || (data.mamoCirurgiaMamasDetalhes?.trim() ?? '') !== '') &&
    data.mamoUltrassonografia !== null &&
    (data.mamoUltrassonografia !== true || (data.mamoUltrassonografiaDetalhes?.trim() ?? '') !== '') &&
    data.mamoHistoricoFamiliar !== null &&
    (data.mamoHistoricoFamiliar !== true || (data.mamoHistoricoFamiliarDetalhes?.trim() ?? '') !== '') &&
    data.mamoRadioterapia !== null &&
    (data.mamoRadioterapia !== true || (data.mamoRadioterapiaDetalhes?.trim() ?? '') !== '')
  );
  
  const canProceed = baseValid && amamentandoValid && masculinoValid && urinariaValid && 
                     traumaValid && cirurgiaCorpoValid && cirurgiaCorpoDetalhesValid && historicoCancerValid && historicoCancerDetalhesValid &&
                     examesRelacionadosValid && examesRelacionadosDetalhesValid && densitometriaValid && densitometriaFemininoValid && mamografiaValid && regioesValid;

  const getMotivoLabel = () => {
    if (tipoExame === 'densitometria') {
      return 'Por que seu médico solicitou esse exame de Densitometria?';
    }
    if (tipoExame === 'mamografia') {
      return 'Motivo do exame de Mamografia';
    }
    return 'Motivo do Exame';
  };

  const getMotivoPlaceholder = () => {
    switch (tipoExame) {
      case 'tomografia':
        return 'Descreva o motivo da consulta, sintomas ou razões específicas para a realização da tomografia';
      case 'ressonancia':
        return 'Descreva o motivo da consulta, sintomas ou razões específicas para a realização da ressonância';
      case 'densitometria':
        return 'Descreva o motivo pelo qual seu médico solicitou este exame';
      case 'mamografia':
        return 'Descreva o motivo da consulta, como exame de rotina, investigação de sintomas, etc.';
      default:
        return 'Descreva o motivo da consulta';
    }
  };

  return (
    <QuestionCard
      title={`Questões Clínicas para o exame de ${
        tipoExame === 'tomografia' ? 'Tomografia Computadorizada' :
        tipoExame === 'ressonancia' ? 'Ressonância Magnética' :
        tipoExame === 'mamografia' ? 'Mamografia' : 'Densitometria'
      }`}
      subtitle="Informações sobre o motivo do exame"
    >
      <div className="space-y-6 sm:space-y-8">
        {/* Bloco de Regiões do Exame - Apenas para Tomografia e Ressonância */}
        {isTomografiaOuRessonancia && (
          <div className="space-y-3 sm:space-y-4 p-3 sm:p-4 rounded-lg bg-accent/30 border border-border animate-fade-in">
            <Label className="text-sm sm:text-base font-medium">
              Regiões submetidas ao exame de {tipoExame === 'ressonancia' ? 'Ressonância Magnética' : 'Tomografia Computadorizada'} <span className="text-destructive">*</span>
            </Label>
            <p className="text-xs sm:text-sm text-muted-foreground">
              Selecione todas as regiões do corpo que serão examinadas:
            </p>
            <div className="grid grid-cols-1 xs:grid-cols-2 md:grid-cols-3 gap-2 sm:gap-3">
              {regioesDisponiveis.map((regiao) => (
                <label
                  key={regiao.id}
                  className="flex items-center space-x-2 sm:space-x-3 p-2.5 sm:p-3 rounded-lg border border-border hover:bg-accent/50 transition-colors cursor-pointer"
                >
                  <Checkbox
                    id={`regiao-${regiao.id}`}
                    checked={(data.regioesExame || []).includes(regiao.id)}
                    onCheckedChange={(checked) => handleRegiaoChange(regiao.id, checked as boolean)}
                  />
                  <span className="font-normal text-sm sm:text-base">
                    {regiao.label}
                  </span>
                </label>
              ))}
            </div>
          </div>
        )}

        <div className="space-y-2 sm:space-y-3">
          <Label htmlFor="motivo" className="text-sm sm:text-base font-medium">
            {getMotivoLabel()}
          </Label>
          <Textarea
            id="motivo"
            placeholder={getMotivoPlaceholder()}
            value={data.motivoExame}
            onChange={(e) => updateData({ motivoExame: e.target.value })}
            className="min-h-[100px] sm:min-h-[120px] text-sm sm:text-base"
          />
        </div>

        {/* Perguntas específicas para Mamografia */}
        {isMamografia && (
          <>
            <YesNoQuestion
              id="mamo-anterior"
              label="Já realizou este exame anteriormente? Se sim, quando?"
              value={data.mamoExameAnterior}
              onChange={(v) => updateData({ mamoExameAnterior: v })}
              unknownLabel="Não lembro"
            >
              {data.mamoExameAnterior === true && (
                <Input
                  type="text"
                  placeholder="Por favor, informe quando realizou"
                  value={data.mamoExameAnteriorDetalhes ?? ''}
                  onChange={(e) => updateData({ mamoExameAnteriorDetalhes: e.target.value })}
                  className="mt-3 animate-fade-in h-12 text-base"
                />
              )}
            </YesNoQuestion>

            <div className="space-y-3 animate-fade-in">
              <Label className="text-base font-medium">
                Em qual data foi sua última menstruação?
              </Label>
              <Input
                type="text"
                placeholder="Ex: 15/12/2024 ou há 2 semanas"
                value={data.mamoUltimaMenstruacao}
                onChange={(e) => updateData({ mamoUltimaMenstruacao: e.target.value })}
                className="h-12 text-base"
              />
            </div>

            <YesNoQuestion
              id="mamo-menopausa"
              label="Está na menopausa? Se sim, entrou com que idade?"
              value={data.mamoMenopausa}
              onChange={(v) => updateData({ mamoMenopausa: v })}
            >
              {data.mamoMenopausa === true && (
                <Input
                  type="text"
                  placeholder="Por favor, informe a idade"
                  value={data.mamoMenopausaDetalhes ?? ''}
                  onChange={(e) => updateData({ mamoMenopausaDetalhes: e.target.value })}
                  className="mt-3 animate-fade-in h-12 text-base"
                />
              )}
            </YesNoQuestion>

            <YesNoQuestion
              id="mamo-hormonios"
              label="Faz uso de hormônios?"
              value={data.mamoUsaHormonios}
              onChange={(v) => updateData({ mamoUsaHormonios: v })}
            />

            <YesNoQuestion
              id="mamo-filhos"
              label="Você tem filhos? Se sim, amamentou?"
              value={data.mamoTemFilhos}
              onChange={(v) => updateData({ mamoTemFilhos: v })}
            >
              {data.mamoTemFilhos === true && (
                <Input
                  type="text"
                  placeholder="Amamentou? Por quanto tempo?"
                  value={data.mamoTemFilhosDetalhes ?? ''}
                  onChange={(e) => updateData({ mamoTemFilhosDetalhes: e.target.value })}
                  className="mt-3 animate-fade-in h-12 text-base"
                />
              )}
            </YesNoQuestion>

            <YesNoQuestion
              id="mamo-problema"
              label="Você já teve ou tem algum problema nas mamas? Se sim, em qual?"
              value={data.mamoProblemaMamas}
              onChange={(v) => updateData({ mamoProblemaMamas: v })}
            >
              {data.mamoProblemaMamas === true && (
                <Textarea
                  placeholder="Por favor, descreva o problema e em qual mama"
                  value={data.mamoProblemaMamasDetalhes ?? ''}
                  onChange={(e) => updateData({ mamoProblemaMamasDetalhes: e.target.value })}
                  className="mt-3 animate-fade-in"
                />
              )}
            </YesNoQuestion>

            <YesNoQuestion
              id="mamo-cirurgia"
              label="Já realizou alguma cirurgia nas mamas? Se sim, qual?"
              value={data.mamoCirurgiaMamas}
              onChange={(v) => updateData({ mamoCirurgiaMamas: v })}
              unknownLabel="Não lembro"
            >
              {data.mamoCirurgiaMamas === true && (
                <Textarea
                  placeholder="Por favor, descreva qual cirurgia"
                  value={data.mamoCirurgiaMamasDetalhes ?? ''}
                  onChange={(e) => updateData({ mamoCirurgiaMamasDetalhes: e.target.value })}
                  className="mt-3 animate-fade-in"
                />
              )}
            </YesNoQuestion>

            <YesNoQuestion
              id="mamo-ultra"
              label="Já realizou ultrassonografia de mama? Se sim, quando?"
              value={data.mamoUltrassonografia}
              onChange={(v) => updateData({ mamoUltrassonografia: v })}
              unknownLabel="Não lembro"
            >
              {data.mamoUltrassonografia === true && (
                <Input
                  type="text"
                  placeholder="Por favor, informe quando realizou"
                  value={data.mamoUltrassonografiaDetalhes ?? ''}
                  onChange={(e) => updateData({ mamoUltrassonografiaDetalhes: e.target.value })}
                  className="mt-3 animate-fade-in h-12 text-base"
                />
              )}
            </YesNoQuestion>

            <YesNoQuestion
              id="mamo-historico"
              label="Há histórico familiar de câncer de mama ou de câncer de ovário? Se sim, qual ou quais parentes?"
              value={data.mamoHistoricoFamiliar}
              onChange={(v) => updateData({ mamoHistoricoFamiliar: v })}
            >
              {data.mamoHistoricoFamiliar === true && (
                <Textarea
                  placeholder="Por favor, informe quais parentes"
                  value={data.mamoHistoricoFamiliarDetalhes ?? ''}
                  onChange={(e) => updateData({ mamoHistoricoFamiliarDetalhes: e.target.value })}
                  className="mt-3 animate-fade-in"
                />
              )}
            </YesNoQuestion>

            <YesNoQuestion
              id="mamo-radio"
              label="Já fez radioterapia na mama? Se sim, em que ano?"
              value={data.mamoRadioterapia}
              onChange={(v) => updateData({ mamoRadioterapia: v })}
              unknownLabel="Não lembro"
            >
              {data.mamoRadioterapia === true && (
                <Input
                  type="text"
                  placeholder="Por favor, informe o ano"
                  value={data.mamoRadioterapiaDetalhes ?? ''}
                  onChange={(e) => updateData({ mamoRadioterapiaDetalhes: e.target.value })}
                  className="mt-3 animate-fade-in h-12 text-base"
                />
              )}
            </YesNoQuestion>
          </>
        )}

        {/* Perguntas específicas para Tomografia e Ressonância */}
        {showTraumaRegiao && (
          <YesNoQuestion
            id="trauma"
            label="Sofreu algum trauma na região a ser examinada?"
            value={data.traumaRegiao}
            onChange={(v) => updateData({ traumaRegiao: v })}
            unknownLabel="Não lembro"
          />
        )}

        {showCirurgiaCorpo && (
          <YesNoQuestion
            id="cirurgia-corpo"
            label="Já fez alguma cirurgia em qualquer lugar do corpo? Se sim, qual?"
            value={data.cirurgiaCorpo}
            onChange={(v) => updateData({ cirurgiaCorpo: v })}
            unknownLabel="Não lembro"
          >
            {data.cirurgiaCorpo === true && (
              <Textarea
                placeholder="Por favor, descreva qual cirurgia"
                value={data.cirurgiaCorpoDetalhes ?? ''}
                onChange={(e) => updateData({ cirurgiaCorpoDetalhes: e.target.value })}
                className="mt-3 animate-fade-in"
              />
            )}
          </YesNoQuestion>
        )}

        {showHistoricoCancer && (
          <YesNoQuestion
            id="historico-cancer"
            label="Tem histórico de câncer? Se sim, em qual local?"
            value={data.historicoCancer}
            onChange={(v) => updateData({ historicoCancer: v })}
          >
            {data.historicoCancer === true && (
              <Textarea
                placeholder="Por favor, descreva em qual local"
                value={data.historicoCancerDetalhes ?? ''}
                onChange={(e) => updateData({ historicoCancerDetalhes: e.target.value })}
                className="mt-3 animate-fade-in"
              />
            )}
          </YesNoQuestion>
        )}

        {showExamesRelacionados && (
          <YesNoQuestion
            id="exames-relacionados"
            label="Tem exames relacionados à doença atual? Se sim, quais?"
            value={data.examesRelacionados}
            onChange={(v) => updateData({ examesRelacionados: v })}
          >
            {data.examesRelacionados === true && (
              <Textarea
                placeholder="Por favor, descreva quais exames"
                value={data.examesRelacionadosDetalhes ?? ''}
                onChange={(e) => updateData({ examesRelacionadosDetalhes: e.target.value })}
                className="mt-3 animate-fade-in"
              />
            )}
          </YesNoQuestion>
        )}

        {/* Perguntas específicas para Densitometria */}
        {isDensitometria && (
          <>
            <YesNoQuestion
              id="osteoporose"
              label="Tem osteoporose?"
              value={data.temOsteoporose}
              onChange={(v) => updateData({ temOsteoporose: v })}
            />

            <YesNoQuestion
              id="tireoide"
              label="Tem doença na tireoide? Se sim, qual?"
              value={data.doencaTireoide}
              onChange={(v) => updateData({ doencaTireoide: v })}
            >
              {data.doencaTireoide === true && (
                <Textarea
                  placeholder="Por favor, descreva qual doença"
                  value={data.doencaTireoideDetalhes ?? ''}
                  onChange={(e) => updateData({ doencaTireoideDetalhes: e.target.value })}
                  className="mt-3 animate-fade-in"
                />
              )}
            </YesNoQuestion>

            <YesNoQuestion
              id="intestinal"
              label="Tem doença intestinal crônica? Se sim, qual?"
              value={data.doencaIntestinal}
              onChange={(v) => updateData({ doencaIntestinal: v })}
            >
              {data.doencaIntestinal === true && (
                <Textarea
                  placeholder="Por favor, descreva qual doença"
                  value={data.doencaIntestinalDetalhes ?? ''}
                  onChange={(e) => updateData({ doencaIntestinalDetalhes: e.target.value })}
                  className="mt-3 animate-fade-in"
                />
              )}
            </YesNoQuestion>

            <YesNoQuestion
              id="hiperpara"
              label="Tem hiperparatiroidismo?"
              value={data.temHiperparatiroidismo}
              onChange={(v) => updateData({ temHiperparatiroidismo: v })}
            />

            <YesNoQuestion
              id="paget"
              label="Tem doença de Paget?"
              value={data.temDoencaPaget}
              onChange={(v) => updateData({ temDoencaPaget: v })}
            />

            <YesNoQuestion
              id="calcio"
              label="Possui má absorção de cálcio?"
              value={data.maAbsorcaoCalcio}
              onChange={(v) => updateData({ maAbsorcaoCalcio: v })}
            />

            <YesNoQuestion
              id="osteomalacia"
              label="Tem osteomalácia?"
              value={data.temOsteomalacia}
              onChange={(v) => updateData({ temOsteomalacia: v })}
            />

            <YesNoQuestion
              id="cushing"
              label="Tem síndrome de Cushing?"
              value={data.temSindromeCushing}
              onChange={(v) => updateData({ temSindromeCushing: v })}
            />

            <YesNoQuestion
              id="vitaminad"
              label="Possui deficiência de vitamina D?"
              value={data.deficienciaVitaminaD}
              onChange={(v) => updateData({ deficienciaVitaminaD: v })}
            />

            <YesNoQuestion
              id="disfuncao-renal"
              label="Possui disfunção renal crônica?"
              value={data.disfuncaoRenalCronica}
              onChange={(v) => updateData({ disfuncaoRenalCronica: v })}
            />

            <YesNoQuestion
              id="medicacao"
              label="Faz uso de alguma medicação regularmente? Se sim, qual?"
              value={data.usaMedicacaoRegular}
              onChange={(v) => updateData({ usaMedicacaoRegular: v })}
            >
              {data.usaMedicacaoRegular === true && (
                <Textarea
                  placeholder="Por favor, descreva quais medicações"
                  value={data.usaMedicacaoRegularDetalhes ?? ''}
                  onChange={(e) => updateData({ usaMedicacaoRegularDetalhes: e.target.value })}
                  className="mt-3 animate-fade-in"
                />
              )}
            </YesNoQuestion>

            {/* Perguntas específicas para Densitometria - Feminino */}
            {isFeminino && (
              <div className="space-y-6 pt-4 border-t border-border animate-fade-in">
                <YesNoQuestion
                  id="menopausa"
                  label="Já passou pela menopausa? Se sim, com que idade e seus ciclos foram sempre irregulares?"
                  value={data.passouMenopausa}
                  onChange={(v) => updateData({ passouMenopausa: v })}
                >
                  {data.passouMenopausa === true && (
                    <Textarea
                      placeholder="Por favor, informe a idade e se os ciclos foram irregulares"
                      value={data.passouMenopausaDetalhes ?? ''}
                      onChange={(e) => updateData({ passouMenopausaDetalhes: e.target.value })}
                      className="mt-3 animate-fade-in"
                    />
                  )}
                </YesNoQuestion>

                <YesNoQuestion
                  id="ciclos"
                  label="Seus ciclos são/estão irregulares e acredita que possa estar na perimenopausa?"
                  value={data.ciclosIrregulares}
                  onChange={(v) => updateData({ ciclosIrregulares: v })}
                />

                <YesNoQuestion
                  id="cancer-mama-densi"
                  label="Já teve câncer de mama?"
                  value={data.teveCancerMamaDensi}
                  onChange={(v) => updateData({ teveCancerMamaDensi: v })}
                />

                <YesNoQuestion
                  id="histerectomia"
                  label="Já fez histerectomia (remoção do útero)? Se sim, com qual idade?"
                  value={data.fezHisterectomia}
                  onChange={(v) => updateData({ fezHisterectomia: v })}
                  unknownLabel="Não lembro"
                >
                  {data.fezHisterectomia === true && (
                    <Textarea
                      placeholder="Por favor, informe com qual idade"
                      value={data.fezHisterectomiaDetalhes ?? ''}
                      onChange={(e) => updateData({ fezHisterectomiaDetalhes: e.target.value })}
                      className="mt-3 animate-fade-in"
                    />
                  )}
                </YesNoQuestion>

                <YesNoQuestion
                  id="ovarios"
                  label="Retirou ovários?"
                  value={data.retirouOvarios}
                  onChange={(v) => updateData({ retirouOvarios: v })}
                  unknownLabel="Não lembro"
                />
              </div>
            )}
          </>
        )}

        {/* Perguntas específicas para mulheres (tomografia) */}
        {showAmamentando && !isDensitometria && !isMamografia && (
          <div className="space-y-6 pt-4 border-t border-border animate-fade-in">
            <YesNoQuestion
              id="amamentando"
              label="Você está em período de amamentação?"
              value={data.amamentando}
              onChange={(v) => updateData({ amamentando: v })}
            />
          </div>
        )}

        {/* Perguntas específicas para homens */}
        {(showProstata || showDificuldadeUrinaria) && (
          <div className="space-y-6 pt-4 border-t border-border animate-fade-in">
            {showProstata && (
              <YesNoQuestion
                id="prostata"
                label="Você tem histórico de problemas na próstata?"
                value={data.problemaProstata}
                onChange={(v) => updateData({ problemaProstata: v })}
              />
            )}

            {showDificuldadeUrinaria && (
              <YesNoQuestion
                id="urinaria"
                label="Você tem dificuldades urinárias ou histórico de infecção urinária?"
                value={data.dificuldadeUrinaria}
                onChange={(v) => updateData({ dificuldadeUrinaria: v })}
              />
            )}
          </div>
        )}
      </div>

      <NavigationButtons
        onBack={onBack}
        onNext={onNext}
        disabled={!canProceed}
      />
    </QuestionCard>
  );
}