import { QuestionCard } from "../QuestionCard";
import { NavigationButtons } from "../NavigationButtons";
import { Label } from "@/components/ui/label";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Textarea } from "@/components/ui/textarea";
import { QuestionnaireData } from "@/types/questionnaire";
import { AlertTriangle } from "lucide-react";

interface SegurancaStepProps {
  data: QuestionnaireData;
  updateData: (updates: Partial<QuestionnaireData>) => void;
  onNext: () => void;
  onBack: () => void;
}

// Componente reutilizável para perguntas Sim/Não/Não sei
function YesNoQuestion({
  id,
  label,
  value,
  onChange,
  showWarning = false,
  showUnknownOption = true,
  unknownLabel = "Não sei",
  children,
}: {
  id: string;
  label: string;
  value: boolean | 'nao_sei' | null;
  onChange: (value: boolean | 'nao_sei') => void;
  showWarning?: boolean;
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
    <div className="space-y-2 sm:space-y-3 animate-fade-in">
      <Label className="text-sm sm:text-base font-medium flex items-center gap-2">
        {showWarning && <AlertTriangle className="w-4 h-4 text-warning flex-shrink-0" />}
        <span>{label}</span>
      </Label>
      <RadioGroup
        value={getRadioValue()}
        onValueChange={handleChange}
        className="flex flex-wrap gap-2 sm:gap-4"
      >
        <label className="flex items-center space-x-2 p-2.5 sm:p-3 rounded-lg border border-border hover:bg-accent/50 transition-colors cursor-pointer flex-1 min-w-[80px]">
          <RadioGroupItem value="sim" id={`${id}-sim`} />
          <span className="text-sm sm:text-base">Sim</span>
        </label>
        <label className="flex items-center space-x-2 p-2.5 sm:p-3 rounded-lg border border-border hover:bg-accent/50 transition-colors cursor-pointer flex-1 min-w-[80px]">
          <RadioGroupItem value="nao" id={`${id}-nao`} />
          <span className="text-sm sm:text-base">Não</span>
        </label>
        {showUnknownOption && (
          <label className="flex items-center space-x-2 p-2.5 sm:p-3 rounded-lg border border-border hover:bg-accent/50 transition-colors cursor-pointer flex-1 min-w-[80px]">
            <RadioGroupItem value="nao_sei" id={`${id}-nao_sei`} />
            <span className="text-sm sm:text-base">{unknownLabel}</span>
          </label>
        )}
      </RadioGroup>
      {children}
    </div>
  );
}

export function SegurancaStep({ data, updateData, onNext, onBack }: SegurancaStepProps) {
  const tipoExame = data.tipoExame;
  const isDensitometria = tipoExame === 'densitometria';
  const isRessonancia = tipoExame === 'ressonancia';
  const isTomografia = tipoExame === 'tomografia';
  const isMamografia = tipoExame === 'mamografia';
  const isFeminino = data.sexo === 'feminino';

  const canProceed = () => {
    // Validações para Ressonância Magnética
    if (isRessonancia) {
      // Só exibir gravidez/amamentação para mulheres
      if (isFeminino) {
        if (data.rmGravida === null) return false;
        if (data.rmAmamentando === null) return false;
      }
      if (data.rmImplanteMedicamentoso === null) return false;
      if (data.rmMarcapasso === null) return false;
      if (data.rmFragmentoMetalico === null) return false;
      if (data.rmEletroestimulador === null) return false;
      if (data.rmClipeAneurisma === null) return false;
      if (data.rmExpansorTecidual === null) return false;
      if (data.rmClipeGastrico === null) return false;
      if (data.rmImplanteCoclear === null) return false;
      if (data.rmLesaoOlhoMetal === null) return false;
      if (data.rmTatuagemRecente === null) return false;
      if (data.rmCirurgiaRenal === null) return false;
      if (data.rmDoencaRenal === null) return false;
      if (data.rmAlergiaContraste === null) return false;
      return true;
    }
    
    // Validações para Tomografia Computadorizada
    if (isTomografia) {
      if (isFeminino) {
        if (data.tcGravida === null) return false;
        if (data.tcAmamentando === null) return false;
      }
      if (data.tcUsaMetformina === null) return false;
      if (data.tcMarcapasso === null) return false;
      if (data.tcAlergiaContraste === null) return false;
      if (data.tcCirurgiaRenal === null) return false;
      if (data.tcDoencaRenal === null) return false;
      return true;
    }
    
    // Validações para Mamografia
    if (isMamografia) {
      if (isFeminino && data.gravida === null) return false;
      return true;
    }
    
    // Validações para Densitometria
    if (isDensitometria) {
      if (isFeminino && data.gravida === null) return false;
      if (data.exameContrasteRecente === null) return false;
      if (data.fraturouOsso === null) return false;
      if (data.fraturouOsso === true && (data.fraturouOssoDetalhes?.trim() ?? '') === '') return false;
      if (data.perdeuAltura === null) return false;
      if (data.perdaOsseaRadiografia === null) return false;
      if (data.cifoseDorsal === null) return false;
      if (data.quedas12Meses === null) return false;
      if (data.parenteOsteoporose === null) return false;
      if (data.parenteOsteoporose === true && (data.parenteOsteoporoseDetalhes?.trim() ?? '') === '') return false;
      return true;
    }
    
    return true;
  };

  return (
    <QuestionCard
      title="Questões de Segurança"
      subtitle="Informações importantes para a realização do exame"
    >
      <div className="space-y-6 sm:space-y-8">
        
        {/* ========== RESSONÂNCIA MAGNÉTICA ========== */}
        {isRessonancia && (
          <>
            {isFeminino && (
              <>
                <YesNoQuestion
                  id="rm-gravida"
                  label="Você está grávida ou suspeita que possa estar?"
                  value={data.rmGravida}
                  onChange={(v) => updateData({ rmGravida: v })}
                  showWarning
                />
                <YesNoQuestion
                  id="rm-amamentando"
                  label="Está amamentando?"
                  value={data.rmAmamentando}
                  onChange={(v) => updateData({ rmAmamentando: v })}
                />
              </>
            )}
            
            <YesNoQuestion
              id="rm-implante-medicamentoso"
              label="Tem algum implante medicamentoso?"
              value={data.rmImplanteMedicamentoso}
              onChange={(v) => updateData({ rmImplanteMedicamentoso: v })}
              showWarning
            />
            
            <YesNoQuestion
              id="rm-marcapasso"
              label="Tem marcapasso ou desfibrilador cardíaco?"
              value={data.rmMarcapasso}
              onChange={(v) => updateData({ rmMarcapasso: v })}
              showWarning
            />
            
            <YesNoQuestion
              id="rm-fragmento-metalico"
              label="Tem algum fragmento metálico ou projétil de arma de fogo alojado no corpo?"
              value={data.rmFragmentoMetalico}
              onChange={(v) => updateData({ rmFragmentoMetalico: v })}
              showWarning
            />
            
            <YesNoQuestion
              id="rm-eletroestimulador"
              label="Tem algum eletroestimulador implantado?"
              value={data.rmEletroestimulador}
              onChange={(v) => updateData({ rmEletroestimulador: v })}
              showWarning
            />
            
            <YesNoQuestion
              id="rm-clipe-aneurisma"
              label="Tem clipe de aneurisma na cabeça?"
              value={data.rmClipeAneurisma}
              onChange={(v) => updateData({ rmClipeAneurisma: v })}
              showWarning
            />
            
            <YesNoQuestion
              id="rm-expansor-tecidual"
              label="Tem algum expansor tecidual?"
              value={data.rmExpansorTecidual}
              onChange={(v) => updateData({ rmExpansorTecidual: v })}
              showWarning
            />
            
            <YesNoQuestion
              id="rm-clipe-gastrico"
              label="Tem clipe gástrico, esofágico ou fez uso recente de pílula com microcâmera?"
              value={data.rmClipeGastrico}
              onChange={(v) => updateData({ rmClipeGastrico: v })}
              showWarning
            />
            
            <YesNoQuestion
              id="rm-implante-coclear"
              label="Tem implante coclear ou outro implante eletrônico?"
              value={data.rmImplanteCoclear}
              onChange={(v) => updateData({ rmImplanteCoclear: v })}
              showWarning
            />
            
            <YesNoQuestion
              id="rm-lesao-olho-metal"
              label="Tem histórico de lesão de olho por metal?"
              value={data.rmLesaoOlhoMetal}
              onChange={(v) => updateData({ rmLesaoOlhoMetal: v })}
              showWarning
            />
            
            <YesNoQuestion
              id="rm-tatuagem-recente"
              label="Tem alguma tatuagem realizada há menos de 15 dias?"
              value={data.rmTatuagemRecente}
              onChange={(v) => updateData({ rmTatuagemRecente: v })}
            />
            
            <YesNoQuestion
              id="rm-cirurgia-renal"
              label="Já fez alguma cirurgia renal? (p. ex. retirada de rim ou transplante renal)"
              value={data.rmCirurgiaRenal}
              onChange={(v) => updateData({ rmCirurgiaRenal: v })}
              unknownLabel="Não lembro"
            />
            
            <YesNoQuestion
              id="rm-doenca-renal"
              label="Tem alguma doença renal? (p. ex. insuficiência renal ou doença renal crônica)"
              value={data.rmDoencaRenal}
              onChange={(v) => updateData({ rmDoencaRenal: v })}
            />
            
            <YesNoQuestion
              id="rm-alergia-contraste"
              label="Já teve alguma reação alérgica ao meio de contraste de ressonância magnética que precisou de atendimento médico?"
              value={data.rmAlergiaContraste}
              onChange={(v) => updateData({ rmAlergiaContraste: v })}
              showWarning
              unknownLabel="Não lembro"
            />
          </>
        )}

        {/* ========== TOMOGRAFIA COMPUTADORIZADA ========== */}
        {isTomografia && (
          <>
            {isFeminino && (
              <>
                <YesNoQuestion
                  id="tc-gravida"
                  label="Existe possibilidade de estar grávida?"
                  value={data.tcGravida}
                  onChange={(v) => updateData({ tcGravida: v })}
                  showWarning
                />
                <YesNoQuestion
                  id="tc-amamentando"
                  label="Está amamentando?"
                  value={data.tcAmamentando}
                  onChange={(v) => updateData({ tcAmamentando: v })}
                />
              </>
            )}
            
            <YesNoQuestion
              id="tc-metformina"
              label="Faz uso de metformina?"
              value={data.tcUsaMetformina}
              onChange={(v) => updateData({ tcUsaMetformina: v })}
            />
            
            <YesNoQuestion
              id="tc-marcapasso"
              label="Tem marcapasso ou desfibrilador cardíaco?"
              value={data.tcMarcapasso}
              onChange={(v) => updateData({ tcMarcapasso: v })}
              showWarning
            />
            
            <YesNoQuestion
              id="tc-alergia-contraste"
              label="Já teve alguma reação alérgica ao contraste de tomografia computadorizada que precisou de atendimento médico?"
              value={data.tcAlergiaContraste}
              onChange={(v) => updateData({ tcAlergiaContraste: v })}
              showWarning
              unknownLabel="Não lembro"
            />
            
            <YesNoQuestion
              id="tc-cirurgia-renal"
              label="Já fez alguma cirurgia renal? (p. ex. retirada de rim ou transplante renal)"
              value={data.tcCirurgiaRenal}
              onChange={(v) => updateData({ tcCirurgiaRenal: v })}
              unknownLabel="Não lembro"
            />
            
            <YesNoQuestion
              id="tc-doenca-renal"
              label="Tem alguma doença renal? (p. ex. insuficiência renal ou doença renal crônica)"
              value={data.tcDoencaRenal}
              onChange={(v) => updateData({ tcDoencaRenal: v })}
            />
          </>
        )}

        {/* ========== MAMOGRAFIA ========== */}
        {isMamografia && isFeminino && (
          <YesNoQuestion
            id="gravida-mamo"
            label="Você está grávida ou suspeita que possa estar?"
            value={data.gravida}
            onChange={(v) => updateData({ gravida: v })}
            showWarning
          />
        )}

        {/* ========== DENSITOMETRIA ========== */}
        {isDensitometria && (
          <>
            {isFeminino && (
              <YesNoQuestion
                id="gravida-densi"
                label="Você está grávida ou suspeita que possa estar?"
                value={data.gravida}
                onChange={(v) => updateData({ gravida: v })}
                showWarning
              />
            )}

            <YesNoQuestion
              id="contraste-recente"
              label="Realizou algum exame de raio-x com contraste/bário ou de medicina nuclear nas últimas duas semanas?"
              value={data.exameContrasteRecente}
              onChange={(v) => updateData({ exameContrasteRecente: v })}
            />

            <YesNoQuestion
              id="fraturou-osso"
              label="Fraturou algum osso nos últimos cinco anos? Se sim, qual osso e como ocorreu?"
              value={data.fraturouOsso}
              onChange={(v) => updateData({ fraturouOsso: v })}
              unknownLabel="Não lembro"
            >
              {data.fraturouOsso === true && (
                <Textarea
                  placeholder="Por favor, descreva qual osso e como ocorreu"
                  value={data.fraturouOssoDetalhes ?? ''}
                  onChange={(e) => updateData({ fraturouOssoDetalhes: e.target.value })}
                  className="mt-3 animate-fade-in"
                />
              )}
            </YesNoQuestion>

            <YesNoQuestion
              id="perdeu-altura"
              label="Você já perdeu mais de três centímetros de altura?"
              value={data.perdeuAltura}
              onChange={(v) => updateData({ perdeuAltura: v })}
            />

            <YesNoQuestion
              id="perda-ossea"
              label="Você já teve perda óssea diagnosticada previamente em uma radiografia?"
              value={data.perdaOsseaRadiografia}
              onChange={(v) => updateData({ perdaOsseaRadiografia: v })}
            />

            <YesNoQuestion
              id="cifose"
              label="Você já desenvolveu curvatura nas costas (cifose dorsal)?"
              value={data.cifoseDorsal}
              onChange={(v) => updateData({ cifoseDorsal: v })}
            />

            <YesNoQuestion
              id="quedas"
              label="Você sofreu mais de uma queda nos últimos doze meses?"
              value={data.quedas12Meses}
              onChange={(v) => updateData({ quedas12Meses: v })}
            />

            <YesNoQuestion
              id="parente-osteo"
              label="Tem algum parente de primeiro grau com osteoporose? Se sim, qual parente?"
              value={data.parenteOsteoporose}
              onChange={(v) => updateData({ parenteOsteoporose: v })}
            >
              {data.parenteOsteoporose === true && (
                <Textarea
                  placeholder="Por favor, informe qual parente"
                  value={data.parenteOsteoporoseDetalhes ?? ''}
                  onChange={(e) => updateData({ parenteOsteoporoseDetalhes: e.target.value })}
                  className="mt-3 animate-fade-in"
                />
              )}
            </YesNoQuestion>
          </>
        )}
      </div>

      <NavigationButtons
        onBack={onBack}
        onNext={onNext}
        disabled={!canProceed()}
      />
    </QuestionCard>
  );
}
