import { QuestionCard } from "../QuestionCard";
import { NavigationButtons } from "../NavigationButtons";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Checkbox } from "@/components/ui/checkbox";
import { Input } from "@/components/ui/input";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { QuestionnaireData } from "@/types/questionnaire";

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

  // Novas perguntas específicas para Tomografia e Ressonância
  const showTraumaRegiao = tipoExame === 'tomografia' || tipoExame === 'ressonancia';
  const showCirurgiaCorpo = tipoExame === 'tomografia' || tipoExame === 'ressonancia';
  const showHistoricoCancer = tipoExame === 'tomografia' || tipoExame === 'ressonancia';
  const showExamesRelacionados = tipoExame === 'ressonancia';

  // Perguntas específicas por sexo e tipo de exame
  const showAmamentando = isFeminino && tipoExame === 'tomografia';
  const showProstata = isMasculino && (tipoExame === 'tomografia' || tipoExame === 'ressonancia');
  const showDificuldadeUrinaria = isMasculino && (tipoExame === 'tomografia' || tipoExame === 'ressonancia');

  // Validate required fields
  const baseValid = data.motivoExame.trim() !== '';
  const amamentandoValid = !showAmamentando || data.amamentando !== null;
  const masculinoValid = !showProstata || data.problemaProstata !== null;
  const urinariaValid = !showDificuldadeUrinaria || data.dificuldadeUrinaria !== null;
  
  // Validações específicas para Tomografia e Ressonância
  const traumaValid = !showTraumaRegiao || data.traumaRegiao !== null;
  const cirurgiaCorpoValid = !showCirurgiaCorpo || data.cirurgiaCorpo !== null;
  const cirurgiaCorpoDetalhesValid = !data.cirurgiaCorpo || (data.cirurgiaCorpoDetalhes?.trim() ?? '') !== '';
  const historicoCancerValid = !showHistoricoCancer || data.historicoCancer !== null;
  const historicoCancerDetalhesValid = !data.historicoCancer || (data.historicoCancerDetalhes?.trim() ?? '') !== '';
  const examesRelacionadosValid = !showExamesRelacionados || data.examesRelacionados !== null;
  const examesRelacionadosDetalhesValid = !data.examesRelacionados || (data.examesRelacionadosDetalhes?.trim() ?? '') !== '';

  // Validações Densitometria
  const densitometriaValid = !isDensitometria || (
    data.temOsteoporose !== null &&
    data.doencaTireoide !== null &&
    (!data.doencaTireoide || (data.doencaTireoideDetalhes?.trim() ?? '') !== '') &&
    data.doencaIntestinal !== null &&
    (!data.doencaIntestinal || (data.doencaIntestinalDetalhes?.trim() ?? '') !== '') &&
    data.temHiperparatiroidismo !== null &&
    data.temDoencaPaget !== null &&
    data.maAbsorcaoCalcio !== null &&
    data.temOsteomalacia !== null &&
    data.temSindromeCushing !== null &&
    data.deficienciaVitaminaD !== null &&
    data.disfuncaoRenalCronica !== null &&
    data.usaMedicacaoRegular !== null &&
    (!data.usaMedicacaoRegular || (data.usaMedicacaoRegularDetalhes?.trim() ?? '') !== '')
  );

  // Validações Densitometria Feminino
  const densitometriaFemininoValid = !(isDensitometria && isFeminino) || (
    data.passouMenopausa !== null &&
    (!data.passouMenopausa || (data.passouMenopausaDetalhes?.trim() ?? '') !== '') &&
    data.ciclosIrregulares !== null &&
    data.teveCancerMamaDensi !== null &&
    data.fezHisterectomia !== null &&
    (!data.fezHisterectomia || (data.fezHisterectomiaDetalhes?.trim() ?? '') !== '') &&
    data.retirouOvarios !== null
  );

  // Validações Mamografia
  const mamografiaValid = !isMamografia || (
    data.mamoExameAnterior !== null &&
    (!data.mamoExameAnterior || (data.mamoExameAnteriorDetalhes?.trim() ?? '') !== '') &&
    data.mamoUltimaMenstruacao.trim() !== '' &&
    data.mamoMenopausa !== null &&
    (!data.mamoMenopausa || (data.mamoMenopausaDetalhes?.trim() ?? '') !== '') &&
    data.mamoUsaHormonios !== null &&
    data.mamoTemFilhos !== null &&
    (!data.mamoTemFilhos || (data.mamoTemFilhosDetalhes?.trim() ?? '') !== '') &&
    data.mamoProblemaMamas !== null &&
    (!data.mamoProblemaMamas || (data.mamoProblemaMamasDetalhes?.trim() ?? '') !== '') &&
    data.mamoCirurgiaMamas !== null &&
    (!data.mamoCirurgiaMamas || (data.mamoCirurgiaMamasDetalhes?.trim() ?? '') !== '') &&
    data.mamoUltrassonografia !== null &&
    (!data.mamoUltrassonografia || (data.mamoUltrassonografiaDetalhes?.trim() ?? '') !== '') &&
    data.mamoHistoricoFamiliar !== null &&
    (!data.mamoHistoricoFamiliar || (data.mamoHistoricoFamiliarDetalhes?.trim() ?? '') !== '') &&
    data.mamoRadioterapia !== null &&
    (!data.mamoRadioterapia || (data.mamoRadioterapiaDetalhes?.trim() ?? '') !== '')
  );
  
  const canProceed = baseValid && amamentandoValid && masculinoValid && urinariaValid && 
                     traumaValid && cirurgiaCorpoValid && cirurgiaCorpoDetalhesValid && historicoCancerValid && historicoCancerDetalhesValid &&
                     examesRelacionadosValid && examesRelacionadosDetalhesValid && densitometriaValid && densitometriaFemininoValid && mamografiaValid;

  const getMotivoLabel = () => {
    if (tipoExame === 'densitometria') {
      return 'Por que seu médico solicitou esse exame de Densitometria?';
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
      title="Questões Clínicas"
      subtitle="Informações sobre o motivo do exame"
    >
      <div className="space-y-8">
        <div className="space-y-3">
          <Label htmlFor="motivo" className="text-base font-medium">
            {getMotivoLabel()}
          </Label>
          <Textarea
            id="motivo"
            placeholder={getMotivoPlaceholder()}
            value={data.motivoExame}
            onChange={(e) => updateData({ motivoExame: e.target.value })}
            className="min-h-[120px]"
          />
        </div>

        {/* Perguntas específicas para Mamografia */}
        {isMamografia && (
          <>
            <div className="space-y-3 animate-fade-in">
              <Label className="text-base font-medium">
                Já realizou este exame anteriormente? Se sim, quando?
              </Label>
              <RadioGroup
                value={data.mamoExameAnterior === null ? '' : data.mamoExameAnterior ? 'sim' : 'nao'}
                onValueChange={(value) => updateData({ mamoExameAnterior: value === 'sim' })}
                className="flex gap-4"
              >
                <div className="flex items-center space-x-2 p-3 rounded-lg border border-border hover:bg-accent/50 transition-colors cursor-pointer flex-1">
                  <RadioGroupItem value="sim" id="mamo-anterior-sim" />
                  <Label htmlFor="mamo-anterior-sim" className="cursor-pointer">Sim</Label>
                </div>
                <div className="flex items-center space-x-2 p-3 rounded-lg border border-border hover:bg-accent/50 transition-colors cursor-pointer flex-1">
                  <RadioGroupItem value="nao" id="mamo-anterior-nao" />
                  <Label htmlFor="mamo-anterior-nao" className="cursor-pointer">Não</Label>
                </div>
              </RadioGroup>
              {data.mamoExameAnterior && (
                <Input
                  type="text"
                  placeholder="Por favor, informe quando realizou"
                  value={data.mamoExameAnteriorDetalhes ?? ''}
                  onChange={(e) => updateData({ mamoExameAnteriorDetalhes: e.target.value })}
                  className="mt-3 animate-fade-in h-12 text-base"
                />
              )}
            </div>

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

            <div className="space-y-3 animate-fade-in">
              <Label className="text-base font-medium">
                Está na menopausa? Se sim, entrou com que idade?
              </Label>
              <RadioGroup
                value={data.mamoMenopausa === null ? '' : data.mamoMenopausa ? 'sim' : 'nao'}
                onValueChange={(value) => updateData({ mamoMenopausa: value === 'sim' })}
                className="flex gap-4"
              >
                <div className="flex items-center space-x-2 p-3 rounded-lg border border-border hover:bg-accent/50 transition-colors cursor-pointer flex-1">
                  <RadioGroupItem value="sim" id="mamo-menopausa-sim" />
                  <Label htmlFor="mamo-menopausa-sim" className="cursor-pointer">Sim</Label>
                </div>
                <div className="flex items-center space-x-2 p-3 rounded-lg border border-border hover:bg-accent/50 transition-colors cursor-pointer flex-1">
                  <RadioGroupItem value="nao" id="mamo-menopausa-nao" />
                  <Label htmlFor="mamo-menopausa-nao" className="cursor-pointer">Não</Label>
                </div>
              </RadioGroup>
              {data.mamoMenopausa && (
                <Input
                  type="text"
                  placeholder="Por favor, informe a idade"
                  value={data.mamoMenopausaDetalhes ?? ''}
                  onChange={(e) => updateData({ mamoMenopausaDetalhes: e.target.value })}
                  className="mt-3 animate-fade-in h-12 text-base"
                />
              )}
            </div>

            <div className="space-y-3 animate-fade-in">
              <Label className="text-base font-medium">Faz uso de hormônios?</Label>
              <RadioGroup
                value={data.mamoUsaHormonios === null ? '' : data.mamoUsaHormonios ? 'sim' : 'nao'}
                onValueChange={(value) => updateData({ mamoUsaHormonios: value === 'sim' })}
                className="flex gap-4"
              >
                <div className="flex items-center space-x-2 p-3 rounded-lg border border-border hover:bg-accent/50 transition-colors cursor-pointer flex-1">
                  <RadioGroupItem value="sim" id="mamo-hormonios-sim" />
                  <Label htmlFor="mamo-hormonios-sim" className="cursor-pointer">Sim</Label>
                </div>
                <div className="flex items-center space-x-2 p-3 rounded-lg border border-border hover:bg-accent/50 transition-colors cursor-pointer flex-1">
                  <RadioGroupItem value="nao" id="mamo-hormonios-nao" />
                  <Label htmlFor="mamo-hormonios-nao" className="cursor-pointer">Não</Label>
                </div>
              </RadioGroup>
            </div>

            <div className="space-y-3 animate-fade-in">
              <Label className="text-base font-medium">
                Você tem filhos? Se sim, amamentou?
              </Label>
              <RadioGroup
                value={data.mamoTemFilhos === null ? '' : data.mamoTemFilhos ? 'sim' : 'nao'}
                onValueChange={(value) => updateData({ mamoTemFilhos: value === 'sim' })}
                className="flex gap-4"
              >
                <div className="flex items-center space-x-2 p-3 rounded-lg border border-border hover:bg-accent/50 transition-colors cursor-pointer flex-1">
                  <RadioGroupItem value="sim" id="mamo-filhos-sim" />
                  <Label htmlFor="mamo-filhos-sim" className="cursor-pointer">Sim</Label>
                </div>
                <div className="flex items-center space-x-2 p-3 rounded-lg border border-border hover:bg-accent/50 transition-colors cursor-pointer flex-1">
                  <RadioGroupItem value="nao" id="mamo-filhos-nao" />
                  <Label htmlFor="mamo-filhos-nao" className="cursor-pointer">Não</Label>
                </div>
              </RadioGroup>
              {data.mamoTemFilhos && (
                <Input
                  type="text"
                  placeholder="Amamentou? Por quanto tempo?"
                  value={data.mamoTemFilhosDetalhes ?? ''}
                  onChange={(e) => updateData({ mamoTemFilhosDetalhes: e.target.value })}
                  className="mt-3 animate-fade-in h-12 text-base"
                />
              )}
            </div>

            <div className="space-y-3 animate-fade-in">
              <Label className="text-base font-medium">
                Você já teve ou tem algum problema nas mamas? Se sim, em qual?
              </Label>
              <RadioGroup
                value={data.mamoProblemaMamas === null ? '' : data.mamoProblemaMamas ? 'sim' : 'nao'}
                onValueChange={(value) => updateData({ mamoProblemaMamas: value === 'sim' })}
                className="flex gap-4"
              >
                <div className="flex items-center space-x-2 p-3 rounded-lg border border-border hover:bg-accent/50 transition-colors cursor-pointer flex-1">
                  <RadioGroupItem value="sim" id="mamo-problema-sim" />
                  <Label htmlFor="mamo-problema-sim" className="cursor-pointer">Sim</Label>
                </div>
                <div className="flex items-center space-x-2 p-3 rounded-lg border border-border hover:bg-accent/50 transition-colors cursor-pointer flex-1">
                  <RadioGroupItem value="nao" id="mamo-problema-nao" />
                  <Label htmlFor="mamo-problema-nao" className="cursor-pointer">Não</Label>
                </div>
              </RadioGroup>
              {data.mamoProblemaMamas && (
                <Textarea
                  placeholder="Por favor, descreva o problema e em qual mama"
                  value={data.mamoProblemaMamasDetalhes ?? ''}
                  onChange={(e) => updateData({ mamoProblemaMamasDetalhes: e.target.value })}
                  className="mt-3 animate-fade-in"
                />
              )}
            </div>

            <div className="space-y-3 animate-fade-in">
              <Label className="text-base font-medium">
                Já realizou alguma cirurgia nas mamas? Se sim, qual?
              </Label>
              <RadioGroup
                value={data.mamoCirurgiaMamas === null ? '' : data.mamoCirurgiaMamas ? 'sim' : 'nao'}
                onValueChange={(value) => updateData({ mamoCirurgiaMamas: value === 'sim' })}
                className="flex gap-4"
              >
                <div className="flex items-center space-x-2 p-3 rounded-lg border border-border hover:bg-accent/50 transition-colors cursor-pointer flex-1">
                  <RadioGroupItem value="sim" id="mamo-cirurgia-sim" />
                  <Label htmlFor="mamo-cirurgia-sim" className="cursor-pointer">Sim</Label>
                </div>
                <div className="flex items-center space-x-2 p-3 rounded-lg border border-border hover:bg-accent/50 transition-colors cursor-pointer flex-1">
                  <RadioGroupItem value="nao" id="mamo-cirurgia-nao" />
                  <Label htmlFor="mamo-cirurgia-nao" className="cursor-pointer">Não</Label>
                </div>
              </RadioGroup>
              {data.mamoCirurgiaMamas && (
                <Textarea
                  placeholder="Por favor, descreva qual cirurgia"
                  value={data.mamoCirurgiaMamasDetalhes ?? ''}
                  onChange={(e) => updateData({ mamoCirurgiaMamasDetalhes: e.target.value })}
                  className="mt-3 animate-fade-in"
                />
              )}
            </div>

            <div className="space-y-3 animate-fade-in">
              <Label className="text-base font-medium">
                Já realizou ultrassonografia de mama? Se sim, quando?
              </Label>
              <RadioGroup
                value={data.mamoUltrassonografia === null ? '' : data.mamoUltrassonografia ? 'sim' : 'nao'}
                onValueChange={(value) => updateData({ mamoUltrassonografia: value === 'sim' })}
                className="flex gap-4"
              >
                <div className="flex items-center space-x-2 p-3 rounded-lg border border-border hover:bg-accent/50 transition-colors cursor-pointer flex-1">
                  <RadioGroupItem value="sim" id="mamo-ultra-sim" />
                  <Label htmlFor="mamo-ultra-sim" className="cursor-pointer">Sim</Label>
                </div>
                <div className="flex items-center space-x-2 p-3 rounded-lg border border-border hover:bg-accent/50 transition-colors cursor-pointer flex-1">
                  <RadioGroupItem value="nao" id="mamo-ultra-nao" />
                  <Label htmlFor="mamo-ultra-nao" className="cursor-pointer">Não</Label>
                </div>
              </RadioGroup>
              {data.mamoUltrassonografia && (
                <Input
                  type="text"
                  placeholder="Por favor, informe quando realizou"
                  value={data.mamoUltrassonografiaDetalhes ?? ''}
                  onChange={(e) => updateData({ mamoUltrassonografiaDetalhes: e.target.value })}
                  className="mt-3 animate-fade-in h-12 text-base"
                />
              )}
            </div>

            <div className="space-y-3 animate-fade-in">
              <Label className="text-base font-medium">
                Há histórico familiar de câncer de mama ou de câncer de ovário? Se sim, qual ou quais parentes?
              </Label>
              <RadioGroup
                value={data.mamoHistoricoFamiliar === null ? '' : data.mamoHistoricoFamiliar ? 'sim' : 'nao'}
                onValueChange={(value) => updateData({ mamoHistoricoFamiliar: value === 'sim' })}
                className="flex gap-4"
              >
                <div className="flex items-center space-x-2 p-3 rounded-lg border border-border hover:bg-accent/50 transition-colors cursor-pointer flex-1">
                  <RadioGroupItem value="sim" id="mamo-historico-sim" />
                  <Label htmlFor="mamo-historico-sim" className="cursor-pointer">Sim</Label>
                </div>
                <div className="flex items-center space-x-2 p-3 rounded-lg border border-border hover:bg-accent/50 transition-colors cursor-pointer flex-1">
                  <RadioGroupItem value="nao" id="mamo-historico-nao" />
                  <Label htmlFor="mamo-historico-nao" className="cursor-pointer">Não</Label>
                </div>
              </RadioGroup>
              {data.mamoHistoricoFamiliar && (
                <Textarea
                  placeholder="Por favor, informe quais parentes"
                  value={data.mamoHistoricoFamiliarDetalhes ?? ''}
                  onChange={(e) => updateData({ mamoHistoricoFamiliarDetalhes: e.target.value })}
                  className="mt-3 animate-fade-in"
                />
              )}
            </div>

            <div className="space-y-3 animate-fade-in">
              <Label className="text-base font-medium">
                Já fez radioterapia na mama? Se sim, em que ano?
              </Label>
              <RadioGroup
                value={data.mamoRadioterapia === null ? '' : data.mamoRadioterapia ? 'sim' : 'nao'}
                onValueChange={(value) => updateData({ mamoRadioterapia: value === 'sim' })}
                className="flex gap-4"
              >
                <div className="flex items-center space-x-2 p-3 rounded-lg border border-border hover:bg-accent/50 transition-colors cursor-pointer flex-1">
                  <RadioGroupItem value="sim" id="mamo-radio-sim" />
                  <Label htmlFor="mamo-radio-sim" className="cursor-pointer">Sim</Label>
                </div>
                <div className="flex items-center space-x-2 p-3 rounded-lg border border-border hover:bg-accent/50 transition-colors cursor-pointer flex-1">
                  <RadioGroupItem value="nao" id="mamo-radio-nao" />
                  <Label htmlFor="mamo-radio-nao" className="cursor-pointer">Não</Label>
                </div>
              </RadioGroup>
              {data.mamoRadioterapia && (
                <Input
                  type="text"
                  placeholder="Por favor, informe o ano"
                  value={data.mamoRadioterapiaDetalhes ?? ''}
                  onChange={(e) => updateData({ mamoRadioterapiaDetalhes: e.target.value })}
                  className="mt-3 animate-fade-in h-12 text-base"
                />
              )}
            </div>
          </>
        )}

        {/* Perguntas específicas para Tomografia e Ressonância */}
        {showTraumaRegiao && (
          <div className="space-y-3 animate-fade-in">
            <Label className="text-base font-medium">
              Sofreu algum trauma na região a ser examinada?
            </Label>
            <RadioGroup
              value={data.traumaRegiao === null ? '' : data.traumaRegiao ? 'sim' : 'nao'}
              onValueChange={(value) => updateData({ traumaRegiao: value === 'sim' })}
              className="flex gap-4"
            >
              <div className="flex items-center space-x-2 p-3 rounded-lg border border-border hover:bg-accent/50 transition-colors cursor-pointer flex-1">
                <RadioGroupItem value="sim" id="trauma-sim" />
                <Label htmlFor="trauma-sim" className="cursor-pointer">Sim</Label>
              </div>
              <div className="flex items-center space-x-2 p-3 rounded-lg border border-border hover:bg-accent/50 transition-colors cursor-pointer flex-1">
                <RadioGroupItem value="nao" id="trauma-nao" />
                <Label htmlFor="trauma-nao" className="cursor-pointer">Não</Label>
              </div>
            </RadioGroup>
          </div>
        )}

        {showCirurgiaCorpo && (
          <div className="space-y-3 animate-fade-in">
            <Label className="text-base font-medium">
              Já fez alguma cirurgia em qualquer lugar do corpo? Se sim, qual?
            </Label>
            <RadioGroup
              value={data.cirurgiaCorpo === null ? '' : data.cirurgiaCorpo ? 'sim' : 'nao'}
              onValueChange={(value) => updateData({ cirurgiaCorpo: value === 'sim' })}
              className="flex gap-4"
            >
              <div className="flex items-center space-x-2 p-3 rounded-lg border border-border hover:bg-accent/50 transition-colors cursor-pointer flex-1">
                <RadioGroupItem value="sim" id="cirurgia-corpo-sim" />
                <Label htmlFor="cirurgia-corpo-sim" className="cursor-pointer">Sim</Label>
              </div>
              <div className="flex items-center space-x-2 p-3 rounded-lg border border-border hover:bg-accent/50 transition-colors cursor-pointer flex-1">
                <RadioGroupItem value="nao" id="cirurgia-corpo-nao" />
                <Label htmlFor="cirurgia-corpo-nao" className="cursor-pointer">Não</Label>
              </div>
            </RadioGroup>
            {data.cirurgiaCorpo && (
              <Textarea
                placeholder="Por favor, descreva qual cirurgia"
                value={data.cirurgiaCorpoDetalhes ?? ''}
                onChange={(e) => updateData({ cirurgiaCorpoDetalhes: e.target.value })}
                className="mt-3 animate-fade-in"
              />
            )}
          </div>
        )}

        {showHistoricoCancer && (
          <div className="space-y-3 animate-fade-in">
            <Label className="text-base font-medium">
              Tem histórico de câncer? Se sim, em qual local?
            </Label>
            <RadioGroup
              value={data.historicoCancer === null ? '' : data.historicoCancer ? 'sim' : 'nao'}
              onValueChange={(value) => updateData({ historicoCancer: value === 'sim' })}
              className="flex gap-4"
            >
              <div className="flex items-center space-x-2 p-3 rounded-lg border border-border hover:bg-accent/50 transition-colors cursor-pointer flex-1">
                <RadioGroupItem value="sim" id="historico-cancer-sim" />
                <Label htmlFor="historico-cancer-sim" className="cursor-pointer">Sim</Label>
              </div>
              <div className="flex items-center space-x-2 p-3 rounded-lg border border-border hover:bg-accent/50 transition-colors cursor-pointer flex-1">
                <RadioGroupItem value="nao" id="historico-cancer-nao" />
                <Label htmlFor="historico-cancer-nao" className="cursor-pointer">Não</Label>
              </div>
            </RadioGroup>
            {data.historicoCancer && (
              <Textarea
                placeholder="Por favor, descreva em qual local"
                value={data.historicoCancerDetalhes ?? ''}
                onChange={(e) => updateData({ historicoCancerDetalhes: e.target.value })}
                className="mt-3 animate-fade-in"
              />
            )}
          </div>
        )}

        {showExamesRelacionados && (
          <div className="space-y-3 animate-fade-in">
            <Label className="text-base font-medium">
              Tem exames relacionados à doença atual? Se sim, quais?
            </Label>
            <RadioGroup
              value={data.examesRelacionados === null ? '' : data.examesRelacionados ? 'sim' : 'nao'}
              onValueChange={(value) => updateData({ examesRelacionados: value === 'sim' })}
              className="flex gap-4"
            >
              <div className="flex items-center space-x-2 p-3 rounded-lg border border-border hover:bg-accent/50 transition-colors cursor-pointer flex-1">
                <RadioGroupItem value="sim" id="exames-relacionados-sim" />
                <Label htmlFor="exames-relacionados-sim" className="cursor-pointer">Sim</Label>
              </div>
              <div className="flex items-center space-x-2 p-3 rounded-lg border border-border hover:bg-accent/50 transition-colors cursor-pointer flex-1">
                <RadioGroupItem value="nao" id="exames-relacionados-nao" />
                <Label htmlFor="exames-relacionados-nao" className="cursor-pointer">Não</Label>
              </div>
            </RadioGroup>
            {data.examesRelacionados && (
              <Textarea
                placeholder="Por favor, descreva quais exames"
                value={data.examesRelacionadosDetalhes ?? ''}
                onChange={(e) => updateData({ examesRelacionadosDetalhes: e.target.value })}
                className="mt-3 animate-fade-in"
              />
            )}
          </div>
        )}

        {/* Perguntas específicas para Densitometria */}
        {isDensitometria && (
          <>
            <div className="space-y-3 animate-fade-in">
              <Label className="text-base font-medium">Tem osteoporose?</Label>
              <RadioGroup
                value={data.temOsteoporose === null ? '' : data.temOsteoporose ? 'sim' : 'nao'}
                onValueChange={(value) => updateData({ temOsteoporose: value === 'sim' })}
                className="flex gap-4"
              >
                <div className="flex items-center space-x-2 p-3 rounded-lg border border-border hover:bg-accent/50 transition-colors cursor-pointer flex-1">
                  <RadioGroupItem value="sim" id="osteoporose-sim" />
                  <Label htmlFor="osteoporose-sim" className="cursor-pointer">Sim</Label>
                </div>
                <div className="flex items-center space-x-2 p-3 rounded-lg border border-border hover:bg-accent/50 transition-colors cursor-pointer flex-1">
                  <RadioGroupItem value="nao" id="osteoporose-nao" />
                  <Label htmlFor="osteoporose-nao" className="cursor-pointer">Não</Label>
                </div>
              </RadioGroup>
            </div>

            <div className="space-y-3 animate-fade-in">
              <Label className="text-base font-medium">Tem doença na tireoide? Se sim, qual?</Label>
              <RadioGroup
                value={data.doencaTireoide === null ? '' : data.doencaTireoide ? 'sim' : 'nao'}
                onValueChange={(value) => updateData({ doencaTireoide: value === 'sim' })}
                className="flex gap-4"
              >
                <div className="flex items-center space-x-2 p-3 rounded-lg border border-border hover:bg-accent/50 transition-colors cursor-pointer flex-1">
                  <RadioGroupItem value="sim" id="tireoide-sim" />
                  <Label htmlFor="tireoide-sim" className="cursor-pointer">Sim</Label>
                </div>
                <div className="flex items-center space-x-2 p-3 rounded-lg border border-border hover:bg-accent/50 transition-colors cursor-pointer flex-1">
                  <RadioGroupItem value="nao" id="tireoide-nao" />
                  <Label htmlFor="tireoide-nao" className="cursor-pointer">Não</Label>
                </div>
              </RadioGroup>
              {data.doencaTireoide && (
                <Textarea
                  placeholder="Por favor, descreva qual doença"
                  value={data.doencaTireoideDetalhes ?? ''}
                  onChange={(e) => updateData({ doencaTireoideDetalhes: e.target.value })}
                  className="mt-3 animate-fade-in"
                />
              )}
            </div>

            <div className="space-y-3 animate-fade-in">
              <Label className="text-base font-medium">Tem doença intestinal crônica? Se sim, qual?</Label>
              <RadioGroup
                value={data.doencaIntestinal === null ? '' : data.doencaIntestinal ? 'sim' : 'nao'}
                onValueChange={(value) => updateData({ doencaIntestinal: value === 'sim' })}
                className="flex gap-4"
              >
                <div className="flex items-center space-x-2 p-3 rounded-lg border border-border hover:bg-accent/50 transition-colors cursor-pointer flex-1">
                  <RadioGroupItem value="sim" id="intestinal-sim" />
                  <Label htmlFor="intestinal-sim" className="cursor-pointer">Sim</Label>
                </div>
                <div className="flex items-center space-x-2 p-3 rounded-lg border border-border hover:bg-accent/50 transition-colors cursor-pointer flex-1">
                  <RadioGroupItem value="nao" id="intestinal-nao" />
                  <Label htmlFor="intestinal-nao" className="cursor-pointer">Não</Label>
                </div>
              </RadioGroup>
              {data.doencaIntestinal && (
                <Textarea
                  placeholder="Por favor, descreva qual doença"
                  value={data.doencaIntestinalDetalhes ?? ''}
                  onChange={(e) => updateData({ doencaIntestinalDetalhes: e.target.value })}
                  className="mt-3 animate-fade-in"
                />
              )}
            </div>

            <div className="space-y-3 animate-fade-in">
              <Label className="text-base font-medium">Tem hiperparatiroidismo?</Label>
              <RadioGroup
                value={data.temHiperparatiroidismo === null ? '' : data.temHiperparatiroidismo ? 'sim' : 'nao'}
                onValueChange={(value) => updateData({ temHiperparatiroidismo: value === 'sim' })}
                className="flex gap-4"
              >
                <div className="flex items-center space-x-2 p-3 rounded-lg border border-border hover:bg-accent/50 transition-colors cursor-pointer flex-1">
                  <RadioGroupItem value="sim" id="hiperpara-sim" />
                  <Label htmlFor="hiperpara-sim" className="cursor-pointer">Sim</Label>
                </div>
                <div className="flex items-center space-x-2 p-3 rounded-lg border border-border hover:bg-accent/50 transition-colors cursor-pointer flex-1">
                  <RadioGroupItem value="nao" id="hiperpara-nao" />
                  <Label htmlFor="hiperpara-nao" className="cursor-pointer">Não</Label>
                </div>
              </RadioGroup>
            </div>

            <div className="space-y-3 animate-fade-in">
              <Label className="text-base font-medium">Tem doença de Paget?</Label>
              <RadioGroup
                value={data.temDoencaPaget === null ? '' : data.temDoencaPaget ? 'sim' : 'nao'}
                onValueChange={(value) => updateData({ temDoencaPaget: value === 'sim' })}
                className="flex gap-4"
              >
                <div className="flex items-center space-x-2 p-3 rounded-lg border border-border hover:bg-accent/50 transition-colors cursor-pointer flex-1">
                  <RadioGroupItem value="sim" id="paget-sim" />
                  <Label htmlFor="paget-sim" className="cursor-pointer">Sim</Label>
                </div>
                <div className="flex items-center space-x-2 p-3 rounded-lg border border-border hover:bg-accent/50 transition-colors cursor-pointer flex-1">
                  <RadioGroupItem value="nao" id="paget-nao" />
                  <Label htmlFor="paget-nao" className="cursor-pointer">Não</Label>
                </div>
              </RadioGroup>
            </div>

            <div className="space-y-3 animate-fade-in">
              <Label className="text-base font-medium">Possui má absorção de cálcio?</Label>
              <RadioGroup
                value={data.maAbsorcaoCalcio === null ? '' : data.maAbsorcaoCalcio ? 'sim' : 'nao'}
                onValueChange={(value) => updateData({ maAbsorcaoCalcio: value === 'sim' })}
                className="flex gap-4"
              >
                <div className="flex items-center space-x-2 p-3 rounded-lg border border-border hover:bg-accent/50 transition-colors cursor-pointer flex-1">
                  <RadioGroupItem value="sim" id="calcio-sim" />
                  <Label htmlFor="calcio-sim" className="cursor-pointer">Sim</Label>
                </div>
                <div className="flex items-center space-x-2 p-3 rounded-lg border border-border hover:bg-accent/50 transition-colors cursor-pointer flex-1">
                  <RadioGroupItem value="nao" id="calcio-nao" />
                  <Label htmlFor="calcio-nao" className="cursor-pointer">Não</Label>
                </div>
              </RadioGroup>
            </div>

            <div className="space-y-3 animate-fade-in">
              <Label className="text-base font-medium">Tem osteomalácia?</Label>
              <RadioGroup
                value={data.temOsteomalacia === null ? '' : data.temOsteomalacia ? 'sim' : 'nao'}
                onValueChange={(value) => updateData({ temOsteomalacia: value === 'sim' })}
                className="flex gap-4"
              >
                <div className="flex items-center space-x-2 p-3 rounded-lg border border-border hover:bg-accent/50 transition-colors cursor-pointer flex-1">
                  <RadioGroupItem value="sim" id="osteomalacia-sim" />
                  <Label htmlFor="osteomalacia-sim" className="cursor-pointer">Sim</Label>
                </div>
                <div className="flex items-center space-x-2 p-3 rounded-lg border border-border hover:bg-accent/50 transition-colors cursor-pointer flex-1">
                  <RadioGroupItem value="nao" id="osteomalacia-nao" />
                  <Label htmlFor="osteomalacia-nao" className="cursor-pointer">Não</Label>
                </div>
              </RadioGroup>
            </div>

            <div className="space-y-3 animate-fade-in">
              <Label className="text-base font-medium">Tem síndrome de Cushing?</Label>
              <RadioGroup
                value={data.temSindromeCushing === null ? '' : data.temSindromeCushing ? 'sim' : 'nao'}
                onValueChange={(value) => updateData({ temSindromeCushing: value === 'sim' })}
                className="flex gap-4"
              >
                <div className="flex items-center space-x-2 p-3 rounded-lg border border-border hover:bg-accent/50 transition-colors cursor-pointer flex-1">
                  <RadioGroupItem value="sim" id="cushing-sim" />
                  <Label htmlFor="cushing-sim" className="cursor-pointer">Sim</Label>
                </div>
                <div className="flex items-center space-x-2 p-3 rounded-lg border border-border hover:bg-accent/50 transition-colors cursor-pointer flex-1">
                  <RadioGroupItem value="nao" id="cushing-nao" />
                  <Label htmlFor="cushing-nao" className="cursor-pointer">Não</Label>
                </div>
              </RadioGroup>
            </div>

            <div className="space-y-3 animate-fade-in">
              <Label className="text-base font-medium">Possui deficiência de vitamina D?</Label>
              <RadioGroup
                value={data.deficienciaVitaminaD === null ? '' : data.deficienciaVitaminaD ? 'sim' : 'nao'}
                onValueChange={(value) => updateData({ deficienciaVitaminaD: value === 'sim' })}
                className="flex gap-4"
              >
                <div className="flex items-center space-x-2 p-3 rounded-lg border border-border hover:bg-accent/50 transition-colors cursor-pointer flex-1">
                  <RadioGroupItem value="sim" id="vitaminad-sim" />
                  <Label htmlFor="vitaminad-sim" className="cursor-pointer">Sim</Label>
                </div>
                <div className="flex items-center space-x-2 p-3 rounded-lg border border-border hover:bg-accent/50 transition-colors cursor-pointer flex-1">
                  <RadioGroupItem value="nao" id="vitaminad-nao" />
                  <Label htmlFor="vitaminad-nao" className="cursor-pointer">Não</Label>
                </div>
              </RadioGroup>
            </div>

            <div className="space-y-3 animate-fade-in">
              <Label className="text-base font-medium">Possui disfunção renal crônica?</Label>
              <RadioGroup
                value={data.disfuncaoRenalCronica === null ? '' : data.disfuncaoRenalCronica ? 'sim' : 'nao'}
                onValueChange={(value) => updateData({ disfuncaoRenalCronica: value === 'sim' })}
                className="flex gap-4"
              >
                <div className="flex items-center space-x-2 p-3 rounded-lg border border-border hover:bg-accent/50 transition-colors cursor-pointer flex-1">
                  <RadioGroupItem value="sim" id="disfuncao-renal-sim" />
                  <Label htmlFor="disfuncao-renal-sim" className="cursor-pointer">Sim</Label>
                </div>
                <div className="flex items-center space-x-2 p-3 rounded-lg border border-border hover:bg-accent/50 transition-colors cursor-pointer flex-1">
                  <RadioGroupItem value="nao" id="disfuncao-renal-nao" />
                  <Label htmlFor="disfuncao-renal-nao" className="cursor-pointer">Não</Label>
                </div>
              </RadioGroup>
            </div>

            <div className="space-y-3 animate-fade-in">
              <Label className="text-base font-medium">Faz uso de alguma medicação regularmente? Se sim, qual?</Label>
              <RadioGroup
                value={data.usaMedicacaoRegular === null ? '' : data.usaMedicacaoRegular ? 'sim' : 'nao'}
                onValueChange={(value) => updateData({ usaMedicacaoRegular: value === 'sim' })}
                className="flex gap-4"
              >
                <div className="flex items-center space-x-2 p-3 rounded-lg border border-border hover:bg-accent/50 transition-colors cursor-pointer flex-1">
                  <RadioGroupItem value="sim" id="medicacao-sim" />
                  <Label htmlFor="medicacao-sim" className="cursor-pointer">Sim</Label>
                </div>
                <div className="flex items-center space-x-2 p-3 rounded-lg border border-border hover:bg-accent/50 transition-colors cursor-pointer flex-1">
                  <RadioGroupItem value="nao" id="medicacao-nao" />
                  <Label htmlFor="medicacao-nao" className="cursor-pointer">Não</Label>
                </div>
              </RadioGroup>
              {data.usaMedicacaoRegular && (
                <Textarea
                  placeholder="Por favor, descreva quais medicações"
                  value={data.usaMedicacaoRegularDetalhes ?? ''}
                  onChange={(e) => updateData({ usaMedicacaoRegularDetalhes: e.target.value })}
                  className="mt-3 animate-fade-in"
                />
              )}
            </div>

            {/* Perguntas específicas para Densitometria - Feminino */}
            {isFeminino && (
              <div className="space-y-6 pt-4 border-t border-border animate-fade-in">
                <div className="space-y-3">
                  <Label className="text-base font-medium">
                    Já passou pela menopausa? Se sim, com que idade e seus ciclos foram sempre irregulares?
                  </Label>
                  <RadioGroup
                    value={data.passouMenopausa === null ? '' : data.passouMenopausa ? 'sim' : 'nao'}
                    onValueChange={(value) => updateData({ passouMenopausa: value === 'sim' })}
                    className="flex gap-4"
                  >
                    <div className="flex items-center space-x-2 p-3 rounded-lg border border-border hover:bg-accent/50 transition-colors cursor-pointer flex-1">
                      <RadioGroupItem value="sim" id="menopausa-sim" />
                      <Label htmlFor="menopausa-sim" className="cursor-pointer">Sim</Label>
                    </div>
                    <div className="flex items-center space-x-2 p-3 rounded-lg border border-border hover:bg-accent/50 transition-colors cursor-pointer flex-1">
                      <RadioGroupItem value="nao" id="menopausa-nao" />
                      <Label htmlFor="menopausa-nao" className="cursor-pointer">Não</Label>
                    </div>
                  </RadioGroup>
                  {data.passouMenopausa && (
                    <Textarea
                      placeholder="Por favor, informe a idade e se os ciclos foram irregulares"
                      value={data.passouMenopausaDetalhes ?? ''}
                      onChange={(e) => updateData({ passouMenopausaDetalhes: e.target.value })}
                      className="mt-3 animate-fade-in"
                    />
                  )}
                </div>

                <div className="space-y-3">
                  <Label className="text-base font-medium">
                    Seus ciclos são/estão irregulares e acredita que possa estar na perimenopausa?
                  </Label>
                  <RadioGroup
                    value={data.ciclosIrregulares === null ? '' : data.ciclosIrregulares ? 'sim' : 'nao'}
                    onValueChange={(value) => updateData({ ciclosIrregulares: value === 'sim' })}
                    className="flex gap-4"
                  >
                    <div className="flex items-center space-x-2 p-3 rounded-lg border border-border hover:bg-accent/50 transition-colors cursor-pointer flex-1">
                      <RadioGroupItem value="sim" id="ciclos-sim" />
                      <Label htmlFor="ciclos-sim" className="cursor-pointer">Sim</Label>
                    </div>
                    <div className="flex items-center space-x-2 p-3 rounded-lg border border-border hover:bg-accent/50 transition-colors cursor-pointer flex-1">
                      <RadioGroupItem value="nao" id="ciclos-nao" />
                      <Label htmlFor="ciclos-nao" className="cursor-pointer">Não</Label>
                    </div>
                  </RadioGroup>
                </div>

                <div className="space-y-3">
                  <Label className="text-base font-medium">Já teve câncer de mama?</Label>
                  <RadioGroup
                    value={data.teveCancerMamaDensi === null ? '' : data.teveCancerMamaDensi ? 'sim' : 'nao'}
                    onValueChange={(value) => updateData({ teveCancerMamaDensi: value === 'sim' })}
                    className="flex gap-4"
                  >
                    <div className="flex items-center space-x-2 p-3 rounded-lg border border-border hover:bg-accent/50 transition-colors cursor-pointer flex-1">
                      <RadioGroupItem value="sim" id="cancer-mama-densi-sim" />
                      <Label htmlFor="cancer-mama-densi-sim" className="cursor-pointer">Sim</Label>
                    </div>
                    <div className="flex items-center space-x-2 p-3 rounded-lg border border-border hover:bg-accent/50 transition-colors cursor-pointer flex-1">
                      <RadioGroupItem value="nao" id="cancer-mama-densi-nao" />
                      <Label htmlFor="cancer-mama-densi-nao" className="cursor-pointer">Não</Label>
                    </div>
                  </RadioGroup>
                </div>

                <div className="space-y-3">
                  <Label className="text-base font-medium">
                    Já fez histerectomia (remoção do útero)? Se sim, com qual idade?
                  </Label>
                  <RadioGroup
                    value={data.fezHisterectomia === null ? '' : data.fezHisterectomia ? 'sim' : 'nao'}
                    onValueChange={(value) => updateData({ fezHisterectomia: value === 'sim' })}
                    className="flex gap-4"
                  >
                    <div className="flex items-center space-x-2 p-3 rounded-lg border border-border hover:bg-accent/50 transition-colors cursor-pointer flex-1">
                      <RadioGroupItem value="sim" id="histerectomia-sim" />
                      <Label htmlFor="histerectomia-sim" className="cursor-pointer">Sim</Label>
                    </div>
                    <div className="flex items-center space-x-2 p-3 rounded-lg border border-border hover:bg-accent/50 transition-colors cursor-pointer flex-1">
                      <RadioGroupItem value="nao" id="histerectomia-nao" />
                      <Label htmlFor="histerectomia-nao" className="cursor-pointer">Não</Label>
                    </div>
                  </RadioGroup>
                  {data.fezHisterectomia && (
                    <Textarea
                      placeholder="Por favor, informe com qual idade"
                      value={data.fezHisterectomiaDetalhes ?? ''}
                      onChange={(e) => updateData({ fezHisterectomiaDetalhes: e.target.value })}
                      className="mt-3 animate-fade-in"
                    />
                  )}
                </div>

                <div className="space-y-3">
                  <Label className="text-base font-medium">Retirou ovários?</Label>
                  <RadioGroup
                    value={data.retirouOvarios === null ? '' : data.retirouOvarios ? 'sim' : 'nao'}
                    onValueChange={(value) => updateData({ retirouOvarios: value === 'sim' })}
                    className="flex gap-4"
                  >
                    <div className="flex items-center space-x-2 p-3 rounded-lg border border-border hover:bg-accent/50 transition-colors cursor-pointer flex-1">
                      <RadioGroupItem value="sim" id="ovarios-sim" />
                      <Label htmlFor="ovarios-sim" className="cursor-pointer">Sim</Label>
                    </div>
                    <div className="flex items-center space-x-2 p-3 rounded-lg border border-border hover:bg-accent/50 transition-colors cursor-pointer flex-1">
                      <RadioGroupItem value="nao" id="ovarios-nao" />
                      <Label htmlFor="ovarios-nao" className="cursor-pointer">Não</Label>
                    </div>
                  </RadioGroup>
                </div>
              </div>
            )}
          </>
        )}

        {/* Perguntas específicas para mulheres (tomografia) */}
        {showAmamentando && !isDensitometria && !isMamografia && (
          <div className="space-y-6 pt-4 border-t border-border animate-fade-in">
            <div className="space-y-3">
              <Label className="text-base font-medium">
                Você está em período de amamentação?
              </Label>
              <RadioGroup
                value={data.amamentando === null ? '' : data.amamentando ? 'sim' : 'nao'}
                onValueChange={(value) => updateData({ amamentando: value === 'sim' })}
                className="flex gap-4"
              >
                <div className="flex items-center space-x-2 p-3 rounded-lg border border-border hover:bg-accent/50 transition-colors cursor-pointer flex-1">
                  <RadioGroupItem value="sim" id="amamentando-sim" />
                  <Label htmlFor="amamentando-sim" className="cursor-pointer">Sim</Label>
                </div>
                <div className="flex items-center space-x-2 p-3 rounded-lg border border-border hover:bg-accent/50 transition-colors cursor-pointer flex-1">
                  <RadioGroupItem value="nao" id="amamentando-nao" />
                  <Label htmlFor="amamentando-nao" className="cursor-pointer">Não</Label>
                </div>
              </RadioGroup>
            </div>
          </div>
        )}

        {/* Perguntas específicas para homens */}
        {(showProstata || showDificuldadeUrinaria) && (
          <div className="space-y-6 pt-4 border-t border-border animate-fade-in">
            {showProstata && (
              <div className="space-y-3">
                <Label className="text-base font-medium">
                  Você tem histórico de problemas na próstata?
                </Label>
                <RadioGroup
                  value={data.problemaProstata === null ? '' : data.problemaProstata ? 'sim' : 'nao'}
                  onValueChange={(value) => updateData({ problemaProstata: value === 'sim' })}
                  className="flex gap-4"
                >
                  <div className="flex items-center space-x-2 p-3 rounded-lg border border-border hover:bg-accent/50 transition-colors cursor-pointer flex-1">
                    <RadioGroupItem value="sim" id="prostata-sim" />
                    <Label htmlFor="prostata-sim" className="cursor-pointer">Sim</Label>
                  </div>
                  <div className="flex items-center space-x-2 p-3 rounded-lg border border-border hover:bg-accent/50 transition-colors cursor-pointer flex-1">
                    <RadioGroupItem value="nao" id="prostata-nao" />
                    <Label htmlFor="prostata-nao" className="cursor-pointer">Não</Label>
                  </div>
                </RadioGroup>
              </div>
            )}

            {showDificuldadeUrinaria && (
              <div className="space-y-3">
                <Label className="text-base font-medium">
                  Você tem dificuldades urinárias ou histórico de infecção urinária?
                </Label>
                <RadioGroup
                  value={data.dificuldadeUrinaria === null ? '' : data.dificuldadeUrinaria ? 'sim' : 'nao'}
                  onValueChange={(value) => updateData({ dificuldadeUrinaria: value === 'sim' })}
                  className="flex gap-4"
                >
                  <div className="flex items-center space-x-2 p-3 rounded-lg border border-border hover:bg-accent/50 transition-colors cursor-pointer flex-1">
                    <RadioGroupItem value="sim" id="urinaria-sim" />
                    <Label htmlFor="urinaria-sim" className="cursor-pointer">Sim</Label>
                  </div>
                  <div className="flex items-center space-x-2 p-3 rounded-lg border border-border hover:bg-accent/50 transition-colors cursor-pointer flex-1">
                    <RadioGroupItem value="nao" id="urinaria-nao" />
                    <Label htmlFor="urinaria-nao" className="cursor-pointer">Não</Label>
                  </div>
                </RadioGroup>
              </div>
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