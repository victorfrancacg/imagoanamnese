import { TermoConsentimento } from "../../core/types";

export const TERMO_RESSONANCIA: TermoConsentimento = {
  titulo: "TERMO DE CONSENTIMENTO INFORMADO – EXAME DE RESSONÂNCIA MAGNÉTICA (RM)",
  secoes: [
    {
      titulo: "1. DO EXAME DE RESSONÂNCIA MAGNÉTICA",
      texto: "A Ressonância Magnética (RM) é um exame de diagnóstico por imagem que utiliza campo magnético intenso e ondas de radiofrequência para obtenção de imagens detalhadas dos órgãos, tecidos e estruturas internas do corpo humano. O exame não utiliza radiação ionizante (raios X). A RM permite avaliação anatômica e funcional precisa, sendo amplamente empregada para diagnóstico, acompanhamento e planejamento terapêutico em diversas especialidades médicas."
    },
    {
      titulo: "2. DO FUNCIONAMENTO DO APARELHO",
      texto: "O exame é realizado em equipamento específico composto por um ímã de alta potência, no qual o paciente permanece deitado sobre uma mesa móvel que se desloca para o interior do aparelho. Durante a aquisição das imagens, o equipamento produz ruídos elevados e repetitivos, considerados normais ao funcionamento do sistema. É obrigatório que o paciente permaneça imóvel durante a realização do exame, pois movimentos podem comprometer a qualidade das imagens e a interpretação diagnóstica."
    },
    {
      titulo: "3. DO TEMPO DE REALIZAÇÃO",
      texto: "O tempo de exame pode variar conforme a região estudada, o protocolo técnico adotado e a necessidade ou não de uso de contraste, geralmente entre 20 e 60 minutos, podendo ser maior em situações específicas."
    },
    {
      titulo: "4. DOS RISCOS GERAIS E DESCONFORTOS",
      texto: "A Ressonância Magnética é considerada um exame seguro, porém pode estar associada a alguns riscos e desconfortos, incluindo, mas não se limitando a:",
      bullets: [
        "Sensação de confinamento (claustrofobia), especialmente em pacientes sensíveis a ambientes fechados;",
        "Ruído intenso, sendo fornecidos protetores auriculares quando necessário;",
        "Sensação de calor leve em determinadas regiões do corpo durante a aquisição das imagens;",
        "Ansiedade ou desconforto relacionados à permanência imóvel por período prolongado."
      ]
    },
    {
      titulo: "5. DE OBJETOS METÁLICOS E DISPOSITIVOS IMPLANTÁVEIS",
      texto: "Devido ao campo magnético intenso, é terminantemente proibida a entrada na sala de exame com objetos metálicos, tais como joias, relógios, cartões magnéticos, aparelhos eletrônicos, próteses removíveis, piercings e similares. A RM pode ser contraindicada ou exigir avaliação prévia em pacientes portadores de:",
      bullets: [
        "Marca-passo cardíaco;",
        "Desfibriladores implantáveis;",
        "Clipes metálicos intracranianos;",
        "Implantes cocleares;",
        "Próteses metálicas não compatíveis com RM;",
        "Fragmentos metálicos no corpo."
      ],
      textoAdicional: "A omissão de informações sobre implantes ou objetos metálicos pode acarretar risco grave à integridade física do paciente."
    },
    {
      titulo: "6. DA RESSONÂNCIA MAGNÉTICA COM USO DE CONTRASTE",
      texto: "Em determinadas situações clínicas, pode ser necessária a administração de meio de contraste à base de gadolínio, por via intravenosa, com a finalidade de melhorar a visualização e caracterização de estruturas anatômicas ou patológicas."
    },
    {
      titulo: "6.1. Riscos do Contraste",
      texto: "O contraste utilizado em RM é considerado seguro para a maioria dos pacientes. Entretanto, podem ocorrer, de forma rara, reações adversas, tais como:",
      bullets: [
        "Náuseas, tontura ou sensação de calor;",
        "Reações alérgicas leves (coceira, vermelhidão);",
        "Reações alérgicas graves, extremamente raras, que requerem atendimento médico imediato."
      ]
    },
    {
      titulo: "6.2. Função Renal",
      texto: "Pacientes com doença renal grave devem ser avaliados previamente, pois, em casos específicos, o uso de contraste pode estar associado a complicações raras. A avaliação da função renal poderá ser solicitada antes da administração do contraste."
    },
    {
      titulo: "7. DE GESTAÇÃO E OUTRAS CONDIÇÕES ESPECIAIS",
      texto: "Embora não haja evidência conclusiva de risco, a realização de RM em gestantes, especialmente no primeiro trimestre, será avaliada individualmente, considerando a indicação clínica e os benefícios diagnósticos. O uso de contraste em gestantes é restrito a situações excepcionais, quando estritamente necessário."
    },
    {
      titulo: "8. DO USO DAS IMAGENS E DADOS",
      texto: "As imagens e informações obtidas durante o exame, bem como os dados pessoais colhidos durante o preenchimento do questionário, destinam-se exclusivamente à finalidade diagnóstica, respeitando-se o sigilo profissional, as normas éticas e a legislação vigente, incluindo a Lei Geral de Proteção de Dados (Lei nº 13.709/2018 – LGPD)."
    }
  ]
};
