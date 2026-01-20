import { TermoConsentimento } from "../../core/types";

export const TERMO_DENSITOMETRIA: TermoConsentimento = {
  titulo: "TERMO DE CONSENTIMENTO INFORMADO – EXAME DE DENSITOMETRIA ÓSSEA (DXA)",
  secoes: [
    {
      titulo: "1. DO EXAME DE DENSITOMETRIA ÓSSEA",
      texto: "A Densitometria Óssea, também denominada Absorciometria por Dupla Energia de Raios X (DXA), é um exame de diagnóstico por imagem utilizado para a avaliação da densidade mineral óssea, auxiliando no diagnóstico, acompanhamento e estratificação do risco de osteopenia, osteoporose e fraturas. O exame é amplamente reconhecido como método padrão para avaliação da saúde óssea, sendo indicado conforme critérios clínicos e diretrizes médicas vigentes."
    },
    {
      titulo: "2. DO FUNCIONAMENTO DO APARELHO",
      texto: "O exame é realizado em equipamento específico que utiliza raios X em doses extremamente baixas, significativamente inferiores às utilizadas em exames radiográficos convencionais. Durante o procedimento, o paciente permanece deitado sobre uma mesa plana, enquanto o braço do aparelho realiza varreduras sobre as regiões anatômicas de interesse, sem contato físico direto."
    },
    {
      titulo: "3. REGIÕES AVALIADAS",
      texto: "As regiões mais comumente avaliadas na densitometria óssea incluem:",
      bullets: [
        "Coluna lombar;",
        "Quadril (fêmur proximal);",
        "Antebraço, em situações específicas;",
        "Corpo inteiro, quando indicado para avaliação de composição corporal."
      ],
      textoAdicional: "A escolha das regiões avaliadas depende da indicação clínica, das condições do paciente e de critérios técnicos."
    },
    {
      titulo: "4. DO TEMPO DE REALIZAÇÃO",
      texto: "O exame apresenta duração média de 10 a 20 minutos, podendo variar conforme o número de regiões analisadas e a colaboração do paciente durante o procedimento."
    },
    {
      titulo: "5. DOS RISCOS E SEGURANÇA",
      texto: "A densitometria óssea é considerada um exame seguro, não invasivo e indolor. A exposição à radiação é mínima, não oferecendo risco significativo quando realizada dentro das indicações clínicas adequadas. Por utilizar raios X, ainda que em baixíssima dose, o exame deve ser realizado com cautela em gestantes, sendo necessária comunicação prévia à equipe para avaliação individualizada."
    },
    {
      titulo: "6. DE FATORES QUE PODEM INTERFERIR NO RESULTADO",
      texto: "Algumas condições podem interferir na qualidade ou interpretação dos resultados do exame, tais como:",
      bullets: [
        "Presença de próteses metálicas ou implantes na região avaliada;",
        "Cirurgias prévias;",
        "Fraturas recentes;",
        "Alterações degenerativas importantes da coluna;",
        "Uso recente de contrastes radiológicos (iodados ou à base de bário), devendo-se respeitar intervalo adequado antes da realização do exame."
      ],
      textoAdicional: "Essas informações devem ser comunicadas previamente para correta análise técnica."
    },
    {
      titulo: "7. DO USO DAS IMAGENS E DADOS",
      texto: "As imagens e dados obtidos por meio do exame, bem como os dados pessoais colhidos durante o preenchimento do questionário, destinam-se exclusivamente à finalidade diagnóstica e de acompanhamento clínico, respeitando-se o sigilo profissional, as normas éticas aplicáveis e a legislação vigente, em especial a Lei Geral de Proteção de Dados (Lei nº 13.709/2018 – LGPD)."
    }
  ]
};
