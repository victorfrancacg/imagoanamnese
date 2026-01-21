import { TermoConsentimento } from "../../core/types";

export const TERMO_TOMOGRAFIA: TermoConsentimento = {
  titulo: "TERMO DE CONSENTIMENTO INFORMADO – EXAME DE TOMOGRAFIA COMPUTADORIZADA (TC)",
  secoes: [
    {
      titulo: "1. DO EXAME DE TOMOGRAFIA COMPUTADORIZADA",
      texto: "A Tomografia Computadorizada (TC) é um exame de diagnóstico por imagem que utiliza raios X associados a sistemas computacionais avançados para obtenção de imagens detalhadas do corpo humano em cortes seccionais, permitindo avaliação precisa de órgãos, ossos, vasos sanguíneos e tecidos. A TC é amplamente utilizada para fins diagnósticos, acompanhamento clínico, avaliação de urgências e planejamento terapêutico, conforme indicação médica."
    },
    {
      titulo: "2. DO FUNCIONAMENTO DO APARELHO",
      texto: "O exame é realizado em equipamento específico composto por um gantry (estrutura circular) que abriga o tubo de raios X e os detectores. Durante o exame, o paciente permanece deitado sobre uma mesa móvel que se desloca através do equipamento enquanto os raios X giram ao redor do corpo, gerando imagens de alta resolução. O procedimento exige imobilidade durante a aquisição das imagens, sendo que movimentos podem comprometer a qualidade diagnóstica."
    },
    {
      titulo: "3. DO TEMPO DE REALIZAÇÃO",
      texto: "O tempo total do exame é variável conforme a região estudada, o protocolo técnico e a necessidade de uso de contraste, geralmente entre 5 e 30 minutos, sendo a aquisição das imagens, em muitos casos, realizada em poucos segundos."
    },
    {
      titulo: "4. DA RADIAÇÃO E SEGURANÇA",
      texto: "A Tomografia Computadorizada utiliza radiação ionizante (raios X). As doses empregadas são cuidadosamente ajustadas conforme protocolos técnicos, idade, biotipo do paciente e finalidade clínica, respeitando os princípios de justificação, otimização e limitação da dose, conforme normas nacionais e internacionais de radioproteção. Apesar dos avanços tecnológicos, a TC deve ser realizada apenas quando clinicamente indicada, especialmente em gestantes ou em caso de suspeita de gravidez, situação que deve ser comunicada previamente à equipe."
    },
    {
      titulo: "5. DOS RISCOS E DESCONFORTOS GERAIS",
      texto: "A TC é considerada um exame seguro, porém pode estar associada a:",
      bullets: [
        "Exposição à radiação ionizante;",
        "Desconforto leve relacionado à posição ou à necessidade de imobilidade;",
        "Ansiedade em ambientes hospitalares."
      ],
      textoAdicional: "Os benefícios diagnósticos do exame, quando corretamente indicado, superam os riscos potenciais associados."
    },
    {
      titulo: "6. DA TOMOGRAFIA COMPUTADORIZADA COM USO DE CONTRASTE",
      texto: "Em determinadas situações clínicas, pode ser necessária a administração de meio de contraste iodado, por via intravenosa, oral ou retal, com o objetivo de melhorar a visualização de estruturas anatômicas e vasculares."
    },
    {
      titulo: "6.1. Reações ao Contraste",
      texto: "O contraste iodado é amplamente utilizado e, na maioria dos casos, bem tolerado. Entretanto, podem ocorrer, de forma infrequente, reações adversas, incluindo:",
      bullets: [
        "Sensação de calor ou gosto metálico;",
        "Náuseas ou vômitos;",
        "Reações alérgicas leves (coceira, urticária);",
        "Reações alérgicas moderadas ou graves, raras, que podem exigir atendimento médico imediato."
      ],
      textoAdicional: "A equipe está preparada para reconhecimento e manejo de eventuais intercorrências."
    },
    {
      titulo: "6.2. Função Renal",
      texto: "O contraste iodado é eliminado pelos rins. Pacientes com insuficiência renal, diabetes mellitus, desidratação, insuficiência cardíaca ou idade avançada podem apresentar maior risco de comprometimento da função renal. Quando indicado, poderão ser solicitados exames laboratoriais prévios para avaliação da função renal antes da administração do contraste."
    },
    {
      titulo: "6.3. Uso de Metformina",
      texto: "Pacientes em uso de metformina devem informar previamente essa condição. Em situações específicas, especialmente na presença de alteração da função renal, poderá ser recomendada a suspensão temporária da medicação, conforme protocolos médicos, para redução do risco de complicações metabólicas raras."
    },
    {
      titulo: "7. DE CONTRAINDICAÇÕES E CONDIÇÕES ESPECIAIS",
      texto: "A TC com contraste pode exigir avaliação individualizada em pacientes com:",
      bullets: [
        "Histórico de reação prévia a contraste iodado;",
        "Doença renal conhecida;",
        "Gestação ou suspeita de gravidez;",
        "Condições clínicas graves que limitem a colaboração durante o exame."
      ]
    },
    {
      titulo: "8. DO USO DAS IMAGENS E DADOS",
      texto: "As imagens, laudos e demais informações obtidas por meio do exame de Tomografia Computadorizada, bem como os dados pessoais obtidos por meio do preenchimento do questionário, constituem dados sensíveis, sendo utilizados exclusivamente para fins diagnósticos, assistenciais, de acompanhamento clínico e, quando aplicável, auditorias médicas e regulatórias. O tratamento, armazenamento, transmissão e eventual compartilhamento dessas informações ocorrem em conformidade com:",
      bullets: [
        "O sigilo profissional;",
        "As normas éticas aplicáveis à prática médica e diagnóstica;",
        "A Lei Geral de Proteção de Dados – LGPD (Lei nº 13.709/2018);",
        "Demais legislações e regulamentações vigentes."
      ],
      textoAdicional: "O acesso aos dados é restrito a profissionais devidamente autorizados, sendo adotadas medidas técnicas e administrativas para garantir a confidencialidade, integridade e segurança das informações, inclusive em sistemas informatizados e meios digitais."
    }
  ]
};
