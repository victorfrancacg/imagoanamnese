import { useRef, useState, useEffect } from "react";
import { QuestionCard } from "../QuestionCard";
import { NavigationButtons } from "../NavigationButtons";
import { Label } from "@/components/ui/label";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { QuestionnaireData } from "@/types/questionnaire";
import { Eraser } from "lucide-react";

interface ConsentimentoStepProps {
  data: QuestionnaireData;
  updateData: (updates: Partial<QuestionnaireData>) => void;
  onNext: () => void;
  onBack: () => void;
  isSaving?: boolean;
}

export function ConsentimentoStep({ data, updateData, onNext, onBack, isSaving = false }: ConsentimentoStepProps) {
  // Canvas do paciente
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [isDrawing, setIsDrawing] = useState(false);
  const [hasSignature, setHasSignature] = useState(false);

  // Canvas do responsável
  const canvasResponsavelRef = useRef<HTMLCanvasElement>(null);
  const [isDrawingResponsavel, setIsDrawingResponsavel] = useState(false);
  const [hasSignatureResponsavel, setHasSignatureResponsavel] = useState(false);

  // Lógica de validação:
  // - Se preenchido pelo paciente: assinatura do paciente obrigatória
  // - Se preenchido pelo responsável: assinatura e nome do responsável obrigatórios, assinatura do paciente opcional
  const preenchidoPorResponsavel = data.preenchidoPor === 'responsavel';
  const nomeResponsavelPreenchido = (data.nomeResponsavel?.trim() || '').length > 0;

  const assinaturaValida = preenchidoPorResponsavel
    ? hasSignatureResponsavel && nomeResponsavelPreenchido
    : hasSignature;

  // Para TC e RM, precisa aceitar/recusar ambos os termos (geral e contraste)
  const canProceed = data.tipoExame === 'tomografia'
    ? data.aceitaRiscos !== null && data.tcAceitaContraste !== null && assinaturaValida
    : data.tipoExame === 'ressonancia'
    ? data.aceitaRiscos !== null && data.rmAceitaContraste !== null && assinaturaValida
    : data.aceitaRiscos !== null && assinaturaValida;

  // Inicialização do canvas do paciente
  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    // Set canvas size
    const rect = canvas.getBoundingClientRect();
    canvas.width = rect.width * 2;
    canvas.height = rect.height * 2;
    ctx.scale(2, 2);

    // Set drawing style
    ctx.strokeStyle = 'hsl(var(--foreground))';
    ctx.lineWidth = 2;
    ctx.lineCap = 'round';
    ctx.lineJoin = 'round';

    // Restore signature if exists
    if (data.assinaturaData) {
      const img = new Image();
      img.onload = () => {
        ctx.drawImage(img, 0, 0, rect.width, rect.height);
        setHasSignature(true);
      };
      img.src = data.assinaturaData;
    }
  }, []);

  // Inicialização do canvas do responsável
  useEffect(() => {
    const canvas = canvasResponsavelRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    // Set canvas size
    const rect = canvas.getBoundingClientRect();
    canvas.width = rect.width * 2;
    canvas.height = rect.height * 2;
    ctx.scale(2, 2);

    // Set drawing style
    ctx.strokeStyle = 'hsl(var(--foreground))';
    ctx.lineWidth = 2;
    ctx.lineCap = 'round';
    ctx.lineJoin = 'round';

    // Restore signature if exists
    if (data.assinaturaResponsavel) {
      const img = new Image();
      img.onload = () => {
        ctx.drawImage(img, 0, 0, rect.width, rect.height);
        setHasSignatureResponsavel(true);
      };
      img.src = data.assinaturaResponsavel;
    }
  }, [data.preenchidoPor]);

  const getCoordinates = (e: React.MouseEvent | React.TouchEvent) => {
    const canvas = canvasRef.current;
    if (!canvas) return { x: 0, y: 0 };

    const rect = canvas.getBoundingClientRect();
    
    if ('touches' in e) {
      return {
        x: e.touches[0].clientX - rect.left,
        y: e.touches[0].clientY - rect.top
      };
    }
    
    return {
      x: e.clientX - rect.left,
      y: e.clientY - rect.top
    };
  };

  const startDrawing = (e: React.MouseEvent | React.TouchEvent) => {
    e.preventDefault();
    const canvas = canvasRef.current;
    const ctx = canvas?.getContext('2d');
    if (!ctx) return;

    setIsDrawing(true);
    const { x, y } = getCoordinates(e);
    ctx.beginPath();
    ctx.moveTo(x, y);
  };

  const draw = (e: React.MouseEvent | React.TouchEvent) => {
    e.preventDefault();
    if (!isDrawing) return;
    
    const canvas = canvasRef.current;
    const ctx = canvas?.getContext('2d');
    if (!ctx) return;

    const { x, y } = getCoordinates(e);
    ctx.lineTo(x, y);
    ctx.stroke();
    setHasSignature(true);
  };

  const stopDrawing = () => {
    if (isDrawing) {
      setIsDrawing(false);
      saveSignature();
    }
  };

  const saveSignature = () => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    
    const dataUrl = canvas.toDataURL('image/png');
    updateData({ assinaturaData: dataUrl });
  };

  const clearSignature = () => {
    const canvas = canvasRef.current;
    const ctx = canvas?.getContext('2d');
    if (!canvas || !ctx) return;

    const rect = canvas.getBoundingClientRect();
    ctx.clearRect(0, 0, rect.width, rect.height);
    setHasSignature(false);
    updateData({ assinaturaData: '' });
  };

  // Funções para o canvas do responsável
  const getCoordinatesResponsavel = (e: React.MouseEvent | React.TouchEvent) => {
    const canvas = canvasResponsavelRef.current;
    if (!canvas) return { x: 0, y: 0 };

    const rect = canvas.getBoundingClientRect();

    if ('touches' in e) {
      return {
        x: e.touches[0].clientX - rect.left,
        y: e.touches[0].clientY - rect.top
      };
    }

    return {
      x: e.clientX - rect.left,
      y: e.clientY - rect.top
    };
  };

  const startDrawingResponsavel = (e: React.MouseEvent | React.TouchEvent) => {
    e.preventDefault();
    const canvas = canvasResponsavelRef.current;
    const ctx = canvas?.getContext('2d');
    if (!ctx) return;

    setIsDrawingResponsavel(true);
    const { x, y } = getCoordinatesResponsavel(e);
    ctx.beginPath();
    ctx.moveTo(x, y);
  };

  const drawResponsavel = (e: React.MouseEvent | React.TouchEvent) => {
    e.preventDefault();
    if (!isDrawingResponsavel) return;

    const canvas = canvasResponsavelRef.current;
    const ctx = canvas?.getContext('2d');
    if (!ctx) return;

    const { x, y } = getCoordinatesResponsavel(e);
    ctx.lineTo(x, y);
    ctx.stroke();
    setHasSignatureResponsavel(true);
  };

  const stopDrawingResponsavel = () => {
    if (isDrawingResponsavel) {
      setIsDrawingResponsavel(false);
      saveSignatureResponsavel();
    }
  };

  const saveSignatureResponsavel = () => {
    const canvas = canvasResponsavelRef.current;
    if (!canvas) return;

    const dataUrl = canvas.toDataURL('image/png');
    updateData({ assinaturaResponsavel: dataUrl });
  };

  const clearSignatureResponsavel = () => {
    const canvas = canvasResponsavelRef.current;
    const ctx = canvas?.getContext('2d');
    if (!canvas || !ctx) return;

    const rect = canvas.getBoundingClientRect();
    ctx.clearRect(0, 0, rect.width, rect.height);
    setHasSignatureResponsavel(false);
    updateData({ assinaturaResponsavel: '' });
  };

  // Termos específicos por tipo de exame
  const renderTermoConsentimento = () => {
    if (data.tipoExame === 'tomografia') {
      return (
        <div className="space-y-6">
          {/* TERMO 1: Termo Geral de TC */}
          <div className="space-y-4">
            <div className="p-3 sm:p-4 rounded-lg bg-accent/30 border border-border">
              <h4 className="font-medium text-foreground mb-1.5 sm:mb-2 text-sm sm:text-base">Termo de Consentimento Informado – Exame de Tomografia Computadorizada (TC)</h4>
              <div className="max-h-64 overflow-y-auto pr-2 text-xs sm:text-sm text-muted-foreground leading-relaxed space-y-3">
                <div>
                  <p className="font-semibold text-foreground">1. DO EXAME DE TOMOGRAFIA COMPUTADORIZADA</p>
                  <p>A Tomografia Computadorizada (TC) é um exame de diagnóstico por imagem que utiliza raios X associados a sistemas computacionais avançados para obtenção de imagens detalhadas do corpo humano em cortes seccionais, permitindo avaliação precisa de órgãos, ossos, vasos sanguíneos e tecidos. A TC é amplamente utilizada para fins diagnósticos, acompanhamento clínico, avaliação de urgências e planejamento terapêutico, conforme indicação médica.</p>
                </div>
                <div>
                  <p className="font-semibold text-foreground">2. DO FUNCIONAMENTO DO APARELHO</p>
                  <p>O exame é realizado em equipamento específico composto por um gantry (estrutura circular) que abriga o tubo de raios X e os detectores. Durante o exame, o paciente permanece deitado sobre uma mesa móvel que se desloca através do equipamento enquanto os raios X giram ao redor do corpo, gerando imagens de alta resolução. O procedimento exige imobilidade durante a aquisição das imagens, sendo que movimentos podem comprometer a qualidade diagnóstica.</p>
                </div>
                <div>
                  <p className="font-semibold text-foreground">3. DO TEMPO DE REALIZAÇÃO</p>
                  <p>O tempo total do exame é variável conforme a região estudada, o protocolo técnico e a necessidade de uso de contraste, geralmente entre 5 e 30 minutos, sendo a aquisição das imagens, em muitos casos, realizada em poucos segundos.</p>
                </div>
                <div>
                  <p className="font-semibold text-foreground">4. DA RADIAÇÃO E SEGURANÇA</p>
                  <p>A Tomografia Computadorizada utiliza radiação ionizante (raios X). As doses empregadas são cuidadosamente ajustadas conforme protocolos técnicos, idade, biotipo do paciente e finalidade clínica, respeitando os princípios de justificação, otimização e limitação da dose, conforme normas nacionais e internacionais de radioproteção. Apesar dos avanços tecnológicos, a TC deve ser realizada apenas quando clinicamente indicada, especialmente em gestantes ou em caso de suspeita de gravidez, situação que deve ser comunicada previamente à equipe.</p>
                </div>
                <div>
                  <p className="font-semibold text-foreground">5. DOS RISCOS E DESCONFORTOS GERAIS</p>
                  <p>A TC é considerada um exame seguro, porém pode estar associada a:</p>
                  <ul className="list-disc list-inside ml-2 mt-1">
                    <li>Exposição à radiação ionizante;</li>
                    <li>Desconforto leve relacionado à posição ou à necessidade de imobilidade;</li>
                    <li>Ansiedade em ambientes hospitalares.</li>
                  </ul>
                  <p className="mt-1">Os benefícios diagnósticos do exame, quando corretamente indicado, superam os riscos potenciais associados.</p>
                </div>
                <div>
                  <p className="font-semibold text-foreground">6. DO USO DAS IMAGENS E DADOS</p>
                  <p>As imagens, laudos e demais informações obtidas por meio do exame de Tomografia Computadorizada, bem como os dados pessoais obtidos por meio do preenchimento do questionário, constituem dados sensíveis, sendo utilizados exclusivamente para fins diagnósticos, assistenciais, de acompanhamento clínico e, quando aplicável, auditorias médicas e regulatórias.</p>
                  <p className="mt-1">O tratamento, armazenamento, transmissão e eventual compartilhamento dessas informações ocorrem em conformidade com:</p>
                  <ul className="list-disc list-inside ml-2 mt-1">
                    <li>O sigilo profissional;</li>
                    <li>As normas éticas aplicáveis à prática médica e diagnóstica;</li>
                    <li>A Lei Geral de Proteção de Dados – LGPD (Lei nº 13.709/2018);</li>
                    <li>Demais legislações e regulamentações vigentes.</li>
                  </ul>
                  <p className="mt-1">O acesso aos dados é restrito a profissionais devidamente autorizados, sendo adotadas medidas técnicas e administrativas para garantir a confidencialidade, integridade e segurança das informações, inclusive em sistemas informatizados e meios digitais.</p>
                </div>
              </div>
            </div>

            <div className="space-y-2 sm:space-y-3">
              <Label className="text-sm sm:text-base font-medium">
                Você declara estar ciente e concorda em realizar o exame?
              </Label>
              <RadioGroup
                value={data.aceitaRiscos === null ? '' : data.aceitaRiscos ? 'sim' : 'nao'}
                onValueChange={(value) => updateData({ aceitaRiscos: value === 'sim' })}
                className="flex gap-4"
              >
                <label className="flex items-center space-x-2 p-3 rounded-lg border border-border hover:bg-accent/50 transition-colors cursor-pointer flex-1">
                  <RadioGroupItem value="sim" id="tc-geral-sim" />
                  <span className="text-xs sm:text-sm">Sim, estou ciente e concordo</span>
                </label>
                <label className="flex items-center space-x-2 p-3 rounded-lg border border-border hover:bg-accent/50 transition-colors cursor-pointer flex-1">
                  <RadioGroupItem value="nao" id="tc-geral-nao" />
                  <span className="text-xs sm:text-sm">Não concordo</span>
                </label>
              </RadioGroup>
            </div>
          </div>

          {/* TERMO 2: Termo de Contraste Iodado */}
          <div className="space-y-4">
            <div className="p-3 sm:p-4 rounded-lg bg-accent/30 border border-border">
              <h4 className="font-medium text-foreground mb-1.5 sm:mb-2 text-sm sm:text-base">Termo de Consentimento – Uso de Contraste Iodado</h4>
              <div className="max-h-64 overflow-y-auto pr-2 text-xs sm:text-sm text-muted-foreground leading-relaxed space-y-3">
                <div>
                  <p className="font-semibold text-foreground">1. DA TOMOGRAFIA COMPUTADORIZADA COM USO DE CONTRASTE</p>
                  <p>Em determinadas situações clínicas, pode ser necessária a administração de meio de contraste iodado, por via intravenosa, oral ou retal, com o objetivo de melhorar a visualização de estruturas anatômicas e vasculares.</p>
                </div>
                <div>
                  <p className="font-semibold text-foreground">1.1. Reações ao Contraste</p>
                  <p>O contraste iodado é amplamente utilizado e, na maioria dos casos, bem tolerado. Entretanto, podem ocorrer, de forma infrequente, reações adversas, incluindo:</p>
                  <ul className="list-disc list-inside ml-2 mt-1">
                    <li>Sensação de calor ou gosto metálico;</li>
                    <li>Náuseas ou vômitos;</li>
                    <li>Reações alérgicas leves (coceira, urticária);</li>
                    <li>Reações alérgicas moderadas ou graves, raras, que podem exigir atendimento médico imediato.</li>
                  </ul>
                  <p className="mt-1">A equipe está preparada para reconhecimento e manejo de eventuais intercorrências.</p>
                </div>
                <div>
                  <p className="font-semibold text-foreground">1.2. Função Renal</p>
                  <p>O contraste iodado é eliminado pelos rins. Pacientes com insuficiência renal, diabetes mellitus, desidratação, insuficiência cardíaca ou idade avançada podem apresentar maior risco de comprometimento da função renal.</p>
                  <p className="mt-1">Quando indicado, poderão ser solicitados exames laboratoriais prévios para avaliação da função renal antes da administração do contraste.</p>
                </div>
                <div>
                  <p className="font-semibold text-foreground">1.3. Uso de Metformina</p>
                  <p>Pacientes em uso de metformina devem informar previamente essa condição. Em situações específicas, especialmente na presença de alteração da função renal, poderá ser recomendada a suspensão temporária da medicação, conforme protocolos médicos, para redução do risco de complicações metabólicas raras.</p>
                </div>
                <div>
                  <p className="font-semibold text-foreground">2. DE CONTRAINDICAÇÕES E CONDIÇÕES ESPECIAIS</p>
                  <p>A TC com contraste pode exigir avaliação individualizada em pacientes com:</p>
                  <ul className="list-disc list-inside ml-2 mt-1">
                    <li>Histórico de reação prévia a contraste iodado;</li>
                    <li>Doença renal conhecida;</li>
                    <li>Gestação ou suspeita de gravidez;</li>
                    <li>Condições clínicas graves que limitem a colaboração durante o exame.</li>
                  </ul>
                </div>
              </div>
            </div>

            <div className="space-y-2 sm:space-y-3">
              <Label className="text-sm sm:text-base font-medium">
                Você autoriza a administração de contraste iodado, se necessário?
              </Label>
              <RadioGroup
                value={data.tcAceitaContraste === null ? '' : data.tcAceitaContraste ? 'autorizo' : 'nao_autorizo'}
                onValueChange={(value) => updateData({ tcAceitaContraste: value === 'autorizo' })}
                className="flex flex-col gap-2 sm:gap-3"
              >
                <label className="flex items-start space-x-2 p-2.5 sm:p-3 rounded-lg border border-border hover:bg-accent/50 transition-colors cursor-pointer">
                  <RadioGroupItem value="autorizo" id="tc-contraste-autorizo" className="mt-1" />
                  <span className="text-xs sm:text-sm leading-relaxed">
                    Após o exposto e não havendo mais dúvidas, declaro ter compreendido a necessidade e as possíveis complicações pelo uso do meio de contraste iodado e <strong>autorizo</strong> sua administração.
                  </span>
                </label>
                <label className="flex items-start space-x-2 p-2.5 sm:p-3 rounded-lg border border-border hover:bg-accent/50 transition-colors cursor-pointer">
                  <RadioGroupItem value="nao_autorizo" id="tc-contraste-nao-autorizo" className="mt-1" />
                  <span className="text-xs sm:text-sm leading-relaxed">
                    Após o exposto, declaro ter compreendido a necessidade e as possíveis complicações pelo uso do meio de contraste iodado, entretanto <strong>NÃO autorizo</strong> sua administração.
                  </span>
                </label>
              </RadioGroup>
            </div>
          </div>
        </div>
      );
    }

    if (data.tipoExame === 'ressonancia') {
      return (
        <div className="space-y-6">
          {/* TERMO 1: Termo Geral de RM */}
          <div className="space-y-4">
            <div className="p-3 sm:p-4 rounded-lg bg-accent/30 border border-border">
              <h4 className="font-medium text-foreground mb-1.5 sm:mb-2 text-sm sm:text-base">Termo de Consentimento Informado – Exame de Ressonância Magnética (RM)</h4>
              <div className="max-h-64 overflow-y-auto pr-2 text-xs sm:text-sm text-muted-foreground leading-relaxed space-y-3">
                <div>
                  <p className="font-semibold text-foreground">1. DO EXAME DE RESSONÂNCIA MAGNÉTICA</p>
                  <p>A Ressonância Magnética (RM) é um exame de diagnóstico por imagem que utiliza campo magnético intenso e ondas de radiofrequência para obtenção de imagens detalhadas dos órgãos, tecidos e estruturas internas do corpo humano. O exame não utiliza radiação ionizante (raios X). A RM permite avaliação anatômica e funcional precisa, sendo amplamente empregada para diagnóstico, acompanhamento e planejamento terapêutico em diversas especialidades médicas.</p>
                </div>
                <div>
                  <p className="font-semibold text-foreground">2. DO FUNCIONAMENTO DO APARELHO</p>
                  <p>O exame é realizado em equipamento específico composto por um ímã de alta potência, no qual o paciente permanece deitado sobre uma mesa móvel que se desloca para o interior do aparelho. Durante a aquisição das imagens, o equipamento produz ruídos elevados e repetitivos, considerados normais ao funcionamento do sistema. É obrigatório que o paciente permaneça imóvel durante a realização do exame, pois movimentos podem comprometer a qualidade das imagens e a interpretação diagnóstica.</p>
                </div>
                <div>
                  <p className="font-semibold text-foreground">3. DO TEMPO DE REALIZAÇÃO</p>
                  <p>O tempo de exame pode variar conforme a região estudada, o protocolo técnico adotado e a necessidade ou não de uso de contraste, geralmente entre 20 e 60 minutos, podendo ser maior em situações específicas.</p>
                </div>
                <div>
                  <p className="font-semibold text-foreground">4. DOS RISCOS GERAIS E DESCONFORTOS</p>
                  <p>A Ressonância Magnética é considerada um exame seguro, porém pode estar associada a alguns riscos e desconfortos, incluindo, mas não se limitando a:</p>
                  <ul className="list-disc list-inside ml-2 mt-1">
                    <li>Sensação de confinamento (claustrofobia), especialmente em pacientes sensíveis a ambientes fechados;</li>
                    <li>Ruído intenso, sendo fornecidos protetores auriculares quando necessário;</li>
                    <li>Sensação de calor leve em determinadas regiões do corpo durante a aquisição das imagens;</li>
                    <li>Ansiedade ou desconforto relacionados à permanência imóvel por período prolongado.</li>
                  </ul>
                </div>
                <div>
                  <p className="font-semibold text-foreground">5. DE OBJETOS METÁLICOS E DISPOSITIVOS IMPLANTÁVEIS</p>
                  <p>Devido ao campo magnético intenso, é terminantemente proibida a entrada na sala de exame com objetos metálicos, tais como joias, relógios, cartões magnéticos, aparelhos eletrônicos, próteses removíveis, piercings e similares. A RM pode ser contraindicada ou exigir avaliação prévia em pacientes portadores de:</p>
                  <ul className="list-disc list-inside ml-2 mt-1">
                    <li>Marca-passo cardíaco;</li>
                    <li>Desfibriladores implantáveis;</li>
                    <li>Clipes metálicos intracranianos;</li>
                    <li>Implantes cocleares;</li>
                    <li>Próteses metálicas não compatíveis com RM;</li>
                    <li>Fragmentos metálicos no corpo.</li>
                  </ul>
                  <p className="mt-1">A omissão de informações sobre implantes ou objetos metálicos pode acarretar risco grave à integridade física do paciente.</p>
                </div>
                <div>
                  <p className="font-semibold text-foreground">6. DE GESTAÇÃO E OUTRAS CONDIÇÕES ESPECIAIS</p>
                  <p>Embora não haja evidência conclusiva de risco, a realização de RM em gestantes, especialmente no primeiro trimestre, será avaliada individualmente, considerando a indicação clínica e os benefícios diagnósticos. O uso de contraste em gestantes é restrito a situações excepcionais, quando estritamente necessário.</p>
                </div>
                <div>
                  <p className="font-semibold text-foreground">7. DO USO DAS IMAGENS E DADOS</p>
                  <p>As imagens e informações obtidas durante o exame, bem como os dados pessoais colhidos durante o preenchimento do questionário, destinam-se exclusivamente à finalidade diagnóstica, respeitando-se o sigilo profissional, as normas éticas e a legislação vigente, incluindo a Lei Geral de Proteção de Dados (Lei nº 13.709/2018 – LGPD).</p>
                </div>
              </div>
            </div>

            <div className="space-y-2 sm:space-y-3">
              <Label className="text-sm sm:text-base font-medium">
                Você declara estar ciente e concorda em realizar o exame?
              </Label>
              <RadioGroup
                value={data.aceitaRiscos === null ? '' : data.aceitaRiscos ? 'sim' : 'nao'}
                onValueChange={(value) => updateData({ aceitaRiscos: value === 'sim' })}
                className="flex gap-4"
              >
                <label className="flex items-center space-x-2 p-3 rounded-lg border border-border hover:bg-accent/50 transition-colors cursor-pointer flex-1">
                  <RadioGroupItem value="sim" id="rm-geral-sim" />
                  <span className="text-xs sm:text-sm">Sim, estou ciente e concordo</span>
                </label>
                <label className="flex items-center space-x-2 p-3 rounded-lg border border-border hover:bg-accent/50 transition-colors cursor-pointer flex-1">
                  <RadioGroupItem value="nao" id="rm-geral-nao" />
                  <span className="text-xs sm:text-sm">Não concordo</span>
                </label>
              </RadioGroup>
            </div>
          </div>

          {/* TERMO 2: Termo de Contraste (Gadolínio) */}
          <div className="space-y-4">
            <div className="p-3 sm:p-4 rounded-lg bg-accent/30 border border-border">
              <h4 className="font-medium text-foreground mb-1.5 sm:mb-2 text-sm sm:text-base">Termo de Consentimento – Uso de Contraste (Gadolínio)</h4>
              <div className="max-h-64 overflow-y-auto pr-2 text-xs sm:text-sm text-muted-foreground leading-relaxed space-y-3">
                <div>
                  <p className="font-semibold text-foreground">1. DA RESSONÂNCIA MAGNÉTICA COM USO DE CONTRASTE</p>
                  <p>Em determinadas situações clínicas, pode ser necessária a administração de meio de contraste à base de gadolínio, por via intravenosa, com a finalidade de melhorar a visualização e caracterização de estruturas anatômicas ou patológicas.</p>
                </div>
                <div>
                  <p className="font-semibold text-foreground">1.1. Riscos do Contraste</p>
                  <p>O contraste utilizado em RM é considerado seguro para a maioria dos pacientes. Entretanto, podem ocorrer, de forma rara, reações adversas, tais como:</p>
                  <ul className="list-disc list-inside ml-2 mt-1">
                    <li>Náuseas, tontura ou sensação de calor;</li>
                    <li>Reações alérgicas leves (coceira, vermelhidão);</li>
                    <li>Reações alérgicas graves, extremamente raras, que requerem atendimento médico imediato.</li>
                  </ul>
                </div>
                <div>
                  <p className="font-semibold text-foreground">1.2. Função Renal</p>
                  <p>Pacientes com doença renal grave devem ser avaliados previamente, pois, em casos específicos, o uso de contraste pode estar associado a complicações raras. A avaliação da função renal poderá ser solicitada antes da administração do contraste.</p>
                </div>
              </div>
            </div>

            <div className="space-y-2 sm:space-y-3">
              <Label className="text-sm sm:text-base font-medium">
                Você autoriza a administração de contraste (gadolínio), se necessário?
              </Label>
              <RadioGroup
                value={data.rmAceitaContraste === null ? '' : data.rmAceitaContraste ? 'autorizo' : 'nao_autorizo'}
                onValueChange={(value) => updateData({ rmAceitaContraste: value === 'autorizo' })}
                className="flex flex-col gap-2 sm:gap-3"
              >
                <label className="flex items-start space-x-2 p-2.5 sm:p-3 rounded-lg border border-border hover:bg-accent/50 transition-colors cursor-pointer">
                  <RadioGroupItem value="autorizo" id="rm-contraste-autorizo" className="mt-1" />
                  <span className="text-xs sm:text-sm leading-relaxed">
                    Após o exposto e não havendo mais dúvidas, declaro ter compreendido a necessidade e as possíveis complicações pelo uso do meio de contraste à base de gadolínio e <strong>autorizo</strong> sua administração.
                  </span>
                </label>
                <label className="flex items-start space-x-2 p-2.5 sm:p-3 rounded-lg border border-border hover:bg-accent/50 transition-colors cursor-pointer">
                  <RadioGroupItem value="nao_autorizo" id="rm-contraste-nao-autorizo" className="mt-1" />
                  <span className="text-xs sm:text-sm leading-relaxed">
                    Após o exposto, declaro ter compreendido a necessidade e as possíveis complicações pelo uso do meio de contraste à base de gadolínio, entretanto <strong>NÃO autorizo</strong> sua administração.
                  </span>
                </label>
              </RadioGroup>
            </div>
          </div>
        </div>
      );
    }

    if (data.tipoExame === 'densitometria') {
      return (
        <div className="space-y-4">
          <div className="p-4 rounded-lg bg-accent/30 border border-border">
            <h4 className="font-medium text-foreground mb-2">Termo de Consentimento Informado – Exame de Densitometria Óssea (DXA)</h4>
            <div className="max-h-64 overflow-y-auto pr-2 text-sm text-muted-foreground leading-relaxed space-y-3">
              <div>
                <p className="font-semibold text-foreground">1. DO EXAME DE DENSITOMETRIA ÓSSEA</p>
                <p>A Densitometria Óssea, também denominada Absorciometria por Dupla Energia de Raios X (DXA), é um exame de diagnóstico por imagem utilizado para a avaliação da densidade mineral óssea, auxiliando no diagnóstico, acompanhamento e estratificação do risco de osteopenia, osteoporose e fraturas. O exame é amplamente reconhecido como método padrão para avaliação da saúde óssea, sendo indicado conforme critérios clínicos e diretrizes médicas vigentes.</p>
              </div>
              <div>
                <p className="font-semibold text-foreground">2. DO FUNCIONAMENTO DO APARELHO</p>
                <p>O exame é realizado em equipamento específico que utiliza raios X em doses extremamente baixas, significativamente inferiores às utilizadas em exames radiográficos convencionais. Durante o procedimento, o paciente permanece deitado sobre uma mesa plana, enquanto o braço do aparelho realiza varreduras sobre as regiões anatômicas de interesse, sem contato físico direto.</p>
              </div>
              <div>
                <p className="font-semibold text-foreground">3. REGIÕES AVALIADAS</p>
                <p>As regiões mais comumente avaliadas na densitometria óssea incluem:</p>
                <ul className="list-disc list-inside ml-2 mt-1">
                  <li>Coluna lombar;</li>
                  <li>Quadril (fêmur proximal);</li>
                  <li>Antebraço, em situações específicas;</li>
                  <li>Corpo inteiro, quando indicado para avaliação de composição corporal.</li>
                </ul>
                <p className="mt-1">A escolha das regiões avaliadas depende da indicação clínica, das condições do paciente e de critérios técnicos.</p>
              </div>
              <div>
                <p className="font-semibold text-foreground">4. DO TEMPO DE REALIZAÇÃO</p>
                <p>O exame apresenta duração média de 10 a 20 minutos, podendo variar conforme o número de regiões analisadas e a colaboração do paciente durante o procedimento.</p>
              </div>
              <div>
                <p className="font-semibold text-foreground">5. DOS RISCOS E SEGURANÇA</p>
                <p>A densitometria óssea é considerada um exame seguro, não invasivo e indolor. A exposição à radiação é mínima, não oferecendo risco significativo quando realizada dentro das indicações clínicas adequadas. Por utilizar raios X, ainda que em baixíssima dose, o exame deve ser realizado com cautela em gestantes, sendo necessária comunicação prévia à equipe para avaliação individualizada.</p>
              </div>
              <div>
                <p className="font-semibold text-foreground">6. DE FATORES QUE PODEM INTERFERIR NO RESULTADO</p>
                <p>Algumas condições podem interferir na qualidade ou interpretação dos resultados do exame, tais como:</p>
                <ul className="list-disc list-inside ml-2 mt-1">
                  <li>Presença de próteses metálicas ou implantes na região avaliada;</li>
                  <li>Cirurgias prévias;</li>
                  <li>Fraturas recentes;</li>
                  <li>Alterações degenerativas importantes da coluna;</li>
                  <li>Uso recente de contrastes radiológicos (iodados ou à base de bário), devendo-se respeitar intervalo adequado antes da realização do exame.</li>
                </ul>
                <p className="mt-1">Essas informações devem ser comunicadas previamente para correta análise técnica.</p>
              </div>
              <div>
                <p className="font-semibold text-foreground">7. DO USO DAS IMAGENS E DADOS</p>
                <p>As imagens e dados obtidos por meio do exame, bem como os dados pessoais colhidos durante o preenchimento do questionário, destinam-se exclusivamente à finalidade diagnóstica e de acompanhamento clínico, respeitando-se o sigilo profissional, as normas éticas aplicáveis e a legislação vigente, em especial a Lei Geral de Proteção de Dados (Lei nº 13.709/2018 – LGPD).</p>
              </div>
            </div>
          </div>

          <div className="space-y-3">
            <Label className="text-base font-medium">
              Você declara estar ciente e concorda em realizar o exame?
            </Label>
            <RadioGroup
              value={data.aceitaRiscos === null ? '' : data.aceitaRiscos ? 'sim' : 'nao'}
              onValueChange={(value) => updateData({ aceitaRiscos: value === 'sim' })}
              className="flex gap-4"
            >
              <label className="flex items-center space-x-2 p-3 rounded-lg border border-border hover:bg-accent/50 transition-colors cursor-pointer flex-1">
                <RadioGroupItem value="sim" id="densi-sim" />
                <span>Sim, estou ciente e concordo</span>
              </label>
              <label className="flex items-center space-x-2 p-3 rounded-lg border border-border hover:bg-accent/50 transition-colors cursor-pointer flex-1">
                <RadioGroupItem value="nao" id="densi-nao" />
                <span>Não concordo</span>
              </label>
            </RadioGroup>
          </div>
        </div>
      );
    }

    if (data.tipoExame === 'mamografia') {
      return (
        <div className="space-y-4">
          <div className="p-4 rounded-lg bg-accent/30 border border-border">
            <h4 className="font-medium text-foreground mb-2">Termo de Consentimento – Mamografia</h4>
            <p className="text-sm text-muted-foreground leading-relaxed whitespace-pre-line">
              Declaro que fui devidamente informado(a) sobre o exame de mamografia, que utiliza raios X em baixa dose para avaliação das mamas, com finalidade diagnóstica e/ou de rastreamento. Compreendo que o exame envolve a compressão das mamas, necessária para obtenção de imagens adequadas, podendo causar desconforto ou dor transitória.

              Estou ciente de que, em pacientes com próteses mamárias, a mamografia pode apresentar limitações técnicas, exigir manobras adicionais, e, embora raro, existe risco mínimo de deslocamento ou dano à prótese. Declaro que informei corretamente à equipe sobre a presença de prótese, cirurgias prévias, gestação suspeita ou confirmada, e outras condições relevantes.
            </p>
          </div>
          
          <div className="space-y-3">
            <Label className="text-base font-medium">
              Você declara estar ciente e concorda em realizar o exame?
            </Label>
            <RadioGroup
              value={data.aceitaRiscos === null ? '' : data.aceitaRiscos ? 'sim' : 'nao'}
              onValueChange={(value) => updateData({ aceitaRiscos: value === 'sim' })}
              className="flex gap-4"
            >
              <label className="flex items-center space-x-2 p-3 rounded-lg border border-border hover:bg-accent/50 transition-colors cursor-pointer flex-1">
                <RadioGroupItem value="sim" id="mamo-sim" />
                <span>Sim, estou ciente e concordo</span>
              </label>
              <label className="flex items-center space-x-2 p-3 rounded-lg border border-border hover:bg-accent/50 transition-colors cursor-pointer flex-1">
                <RadioGroupItem value="nao" id="mamo-nao" />
                <span>Não concordo</span>
              </label>
            </RadioGroup>
          </div>
        </div>
      );
    }

    // Termo genérico para outros tipos de exame
    return (
      <div className="space-y-4">
        <div className="p-4 rounded-lg bg-accent/30 border border-border">
          <h4 className="font-medium text-foreground mb-2">Riscos Associados ao Exame</h4>
          <p className="text-sm text-muted-foreground leading-relaxed">
            Todo exame de imagem pode envolver riscos inerentes ao procedimento. 
            A equipe médica está preparada para lidar com quaisquer intercorrências 
            e os benefícios diagnósticos do exame geralmente superam os riscos potenciais.
          </p>
        </div>
        
        <div className="space-y-3">
          <Label className="text-base font-medium">
            Você declara estar ciente dos riscos associados ao exame e concorda em realizá-lo?
          </Label>
          <RadioGroup
            value={data.aceitaRiscos === null ? '' : data.aceitaRiscos ? 'sim' : 'nao'}
            onValueChange={(value) => updateData({ aceitaRiscos: value === 'sim' })}
            className="flex gap-4"
          >
            <label className="flex items-center space-x-2 p-3 rounded-lg border border-border hover:bg-accent/50 transition-colors cursor-pointer flex-1">
              <RadioGroupItem value="sim" id="riscos-sim" />
              <span>Sim, estou ciente e concordo</span>
            </label>
            <label className="flex items-center space-x-2 p-3 rounded-lg border border-border hover:bg-accent/50 transition-colors cursor-pointer flex-1">
              <RadioGroupItem value="nao" id="riscos-nao" />
              <span>Não concordo</span>
            </label>
          </RadioGroup>
        </div>
      </div>
    );
  };

  return (
    <QuestionCard
      title="Termo de Consentimento"
      subtitle="Por favor, leia atentamente os termos abaixo"
    >
      <div className="space-y-6 sm:space-y-8">
        {/* Termo específico por tipo de exame */}
        {renderTermoConsentimento()}

        {/* Pergunta: Quem está preenchendo */}
        <div className="space-y-3 sm:space-y-4">
          <Label className="text-sm sm:text-base font-medium">
            O questionário foi preenchido pelo próprio paciente ou por um responsável?
          </Label>
          <RadioGroup
            value={data.preenchidoPor}
            onValueChange={(value) => updateData({ preenchidoPor: value as 'paciente' | 'responsavel' })}
            className="flex gap-4"
          >
            <label className="flex items-center space-x-2 p-3 rounded-lg border border-border hover:bg-accent/50 transition-colors cursor-pointer flex-1">
              <RadioGroupItem value="paciente" id="preenchido-paciente" />
              <span className="text-xs sm:text-sm">Paciente</span>
            </label>
            <label className="flex items-center space-x-2 p-3 rounded-lg border border-border hover:bg-accent/50 transition-colors cursor-pointer flex-1">
              <RadioGroupItem value="responsavel" id="preenchido-responsavel" />
              <span className="text-xs sm:text-sm">Responsável</span>
            </label>
          </RadioGroup>
        </div>

        {/* Campos do Responsável (se aplicável) */}
        {preenchidoPorResponsavel && (
          <div className="space-y-4 p-4 rounded-lg border border-border bg-accent/20">
            <h4 className="font-medium text-foreground text-sm sm:text-base">Dados do Responsável</h4>

            {/* Nome do Responsável */}
            <div className="space-y-2">
              <Label htmlFor="nomeResponsavel" className="text-sm font-medium">
                Nome completo do responsável <span className="text-destructive">*</span>
              </Label>
              <Input
                id="nomeResponsavel"
                type="text"
                placeholder="Digite o nome completo do responsável"
                value={data.nomeResponsavel || ''}
                onChange={(e) => updateData({ nomeResponsavel: e.target.value })}
                className="w-full"
              />
            </div>

            {/* Assinatura do Responsável */}
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <Label className="text-sm font-medium">
                  Assinatura do Responsável <span className="text-destructive">*</span>
                </Label>
                <Button
                  type="button"
                  variant="ghost"
                  size="sm"
                  onClick={clearSignatureResponsavel}
                  className="text-muted-foreground hover:text-foreground h-8 text-xs sm:text-sm"
                >
                  <Eraser className="w-3.5 h-3.5 sm:w-4 sm:h-4 mr-1 sm:mr-2" />
                  Limpar
                </Button>
              </div>

              <div className="border-2 border-dashed border-border rounded-lg p-2 bg-background">
                <canvas
                  ref={canvasResponsavelRef}
                  className="w-full h-32 cursor-crosshair touch-none"
                  onMouseDown={startDrawingResponsavel}
                  onMouseMove={drawResponsavel}
                  onMouseUp={stopDrawingResponsavel}
                  onMouseLeave={stopDrawingResponsavel}
                  onTouchStart={startDrawingResponsavel}
                  onTouchMove={drawResponsavel}
                  onTouchEnd={stopDrawingResponsavel}
                />
              </div>
              <p className="text-xs text-muted-foreground text-center">
                O responsável deve assinar no campo acima
              </p>
            </div>
          </div>
        )}

        {/* Assinatura Digital do Paciente */}
        <div className="space-y-3 sm:space-y-4">
          <div className="flex items-center justify-between">
            <Label className="text-sm sm:text-base font-medium">
              Assinatura Digital do Paciente
              {!preenchidoPorResponsavel && <span className="text-destructive ml-1">*</span>}
              {preenchidoPorResponsavel && <span className="text-muted-foreground ml-1 text-xs">(opcional)</span>}
            </Label>
            <Button
              type="button"
              variant="ghost"
              size="sm"
              onClick={clearSignature}
              className="text-muted-foreground hover:text-foreground h-8 text-xs sm:text-sm"
            >
              <Eraser className="w-3.5 h-3.5 sm:w-4 sm:h-4 mr-1 sm:mr-2" />
              Limpar
            </Button>
          </div>

          <div className="border-2 border-dashed border-border rounded-lg p-2 bg-background">
            <canvas
              ref={canvasRef}
              className="w-full h-32 cursor-crosshair touch-none"
              onMouseDown={startDrawing}
              onMouseMove={draw}
              onMouseUp={stopDrawing}
              onMouseLeave={stopDrawing}
              onTouchStart={startDrawing}
              onTouchMove={draw}
              onTouchEnd={stopDrawing}
            />
          </div>
          <p className="text-sm text-muted-foreground text-center">
            {preenchidoPorResponsavel
              ? "Se possível, o paciente pode assinar no campo acima"
              : "Assine no campo acima usando o mouse ou o dedo (em dispositivos touch)"
            }
          </p>
        </div>
      </div>

      <NavigationButtons
        onBack={onBack}
        onNext={onNext}
        isLastStep
        disabled={!canProceed || isSaving}
        nextLabel={isSaving ? "Salvando..." : undefined}
      />
    </QuestionCard>
  );
}
