import { TermoConsentimento } from "../../core/types";

export const TERMO_MAMOGRAFIA: TermoConsentimento = {
  titulo: "TERMO DE CONSENTIMENTO INFORMADO – EXAME DE MAMOGRAFIA",
  secoes: [
    {
      titulo: "1. DO EXAME DE MAMOGRAFIA",
      texto: "A mamografia é um exame de diagnóstico por imagem que utiliza raios X em baixa dose para avaliação das mamas, sendo o principal método para rastreamento, detecção precoce e acompanhamento de doenças mamárias, incluindo o câncer de mama. O exame permite a identificação de alterações como nódulos, assimetrias, distorções arquiteturais e microcalcificações, muitas vezes antes do surgimento de sintomas clínicos."
    },
    {
      titulo: "2. DO FUNCIONAMENTO DO APARELHO",
      texto: "O exame é realizado em equipamento específico denominado mamógrafo, projetado para obtenção de imagens detalhadas do tecido mamário com controle rigoroso da dose de radiação. Durante o procedimento, cada mama é posicionada individualmente no aparelho e submetida à compressão controlada, necessária para:",
      bullets: [
        "Reduzir a espessura do tecido mamário;",
        "Melhorar a qualidade e nitidez das imagens;",
        "Diminuir a dose de radiação;",
        "Evitar sobreposição de estruturas."
      ]
    },
    {
      titulo: "3. DA COMPRESSÃO MAMÁRIA",
      texto: "A compressão das mamas é uma etapa essencial do exame. Pode causar desconforto ou dor transitória, variável conforme a sensibilidade individual, o período do ciclo menstrual e condições pré-existentes. O desconforto é temporário e cessa imediatamente após o término da compressão."
    },
    {
      titulo: "4. DO TEMPO DE REALIZAÇÃO",
      texto: "O tempo médio do exame é de aproximadamente 10 a 20 minutos, podendo variar conforme a necessidade de incidências adicionais ou complementares."
    },
    {
      titulo: "5. DOS RISCOS E SEGURANÇA",
      texto: "A mamografia é considerada um exame seguro, realizado com baixa dose de radiação, dentro dos limites estabelecidos por normas nacionais e internacionais de radioproteção. Apesar da baixa exposição, o exame deve ser realizado conforme indicação médica, especialmente em gestantes ou em caso de suspeita de gravidez, situação que deve ser comunicada previamente à equipe."
    },
    {
      titulo: "6. DA MAMOGRAFIA EM PACIENTES COM PRÓTESES MAMÁRIAS",
      texto: "Em pacientes portadoras de próteses mamárias, a mamografia pode apresentar limitações técnicas, exigindo manobras específicas e incidências adicionais para melhor avaliação do tecido mamário residual. Embora raríssimo, existe risco mínimo de:",
      bullets: [
        "Deslocamento da prótese;",
        "Dano ou ruptura da prótese durante a compressão."
      ],
      textoAdicional: "A correta informação sobre a presença de próteses, tipo de implante e histórico cirúrgico é fundamental para a segurança do exame e adequada condução técnica."
    },
    {
      titulo: "7. DE FATORES QUE PODEM INTERFERIR NO EXAME",
      texto: "Algumas condições podem interferir na qualidade das imagens ou na interpretação diagnóstica, tais como:",
      bullets: [
        "Cirurgias mamárias prévias;",
        "Presença de próteses, expansores ou materiais cirúrgicos;",
        "Processos inflamatórios;",
        "Alterações hormonais;",
        "Uso recente de desodorantes, cremes ou talcos na região das mamas e axilas, que devem ser evitados no dia do exame."
      ]
    },
    {
      titulo: "8. DO USO DAS IMAGENS E DADOS",
      texto: "As imagens e informações obtidas destinam-se exclusivamente à finalidade diagnóstica, respeitando-se o sigilo profissional, os princípios éticos e a legislação vigente, especialmente a Lei Geral de Proteção de Dados (Lei nº 13.709/2018 – LGPD)."
    }
  ]
};
