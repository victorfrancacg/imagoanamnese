import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Checkbox } from "@/components/ui/checkbox";
import { Input } from "@/components/ui/input";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { QuestionnaireData } from "@/types/questionnaire";

interface ClinicalFieldsProps {
  data: QuestionnaireData;
  updateData: (updates: Partial<QuestionnaireData>) => void;
}

// Componente reutilizável para perguntas Sim/Não
function YesNoQuestion({
  id,
  label,
  value,
  onChange,
  children,
}: {
  id: string;
  label: string;
  value: boolean | null;
  onChange: (value: boolean) => void;
  children?: React.ReactNode;
}) {
  return (
    <div className="space-y-3 animate-fade-in">
      <Label className="text-base font-medium">{label}</Label>
      <RadioGroup
        value={value === null ? '' : value ? 'sim' : 'nao'}
        onValueChange={(value) => onChange(value === 'sim')}
        className="flex gap-4"
      >
        <div className="flex items-center space-x-2 p-3 rounded-lg border border-border hover:bg-accent/50 transition-colors cursor-pointer flex-1">
          <RadioGroupItem value="sim" id={`${id}-sim`} />
          <Label htmlFor={`${id}-sim`} className="cursor-pointer">Sim</Label>
        </div>
        <div className="flex items-center space-x-2 p-3 rounded-lg border border-border hover:bg-accent/50 transition-colors cursor-pointer flex-1">
          <RadioGroupItem value="nao" id={`${id}-nao`} />
          <Label htmlFor={`${id}-nao`} className="cursor-pointer">Não</Label>
        </div>
      </RadioGroup>
      {children}
    </div>
  );
}

/**
 * Componente de campos clínicos para edição
 * Versão completa com todos os campos de todos os tipos de exame
 */
export function ClinicalFields({ data, updateData }: ClinicalFieldsProps) {
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

  const getMotivoLabel = () => {
    if (tipoExame === 'densitometria') {
      return 'Por que seu médico solicitou esse exame de Densitometria?';
    }
    if (tipoExame === 'mamografia') {
      return 'Motivo do exame de Mamografia';
    }
    return 'Motivo do Exame';
  };

  return (
    <div className="space-y-6">
      {/* Regiões do Exame - Apenas para Tomografia e Ressonância */}
      {isTomografiaOuRessonancia && (
        <div className="space-y-3 p-4 rounded-lg bg-accent/30 border border-border">
          <Label className="text-sm font-medium">
            Regiões submetidas ao exame <span className="text-destructive">*</span>
          </Label>
          <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
            {regioesDisponiveis.map((regiao) => (
              <div
                key={regiao.id}
                className="flex items-center space-x-3 p-3 rounded-lg border border-border hover:bg-accent/50 transition-colors cursor-pointer"
                onClick={() => handleRegiaoChange(regiao.id, !(data.regioesExame || []).includes(regiao.id))}
              >
                <Checkbox
                  id={`edit-regiao-${regiao.id}`}
                  checked={(data.regioesExame || []).includes(regiao.id)}
                  onCheckedChange={(checked) => handleRegiaoChange(regiao.id, checked as boolean)}
                />
                <Label htmlFor={`edit-regiao-${regiao.id}`} className="cursor-pointer font-normal">
                  {regiao.label}
                </Label>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Motivo do Exame */}
      <div className="space-y-2">
        <Label htmlFor="edit-motivo">{getMotivoLabel()}</Label>
        <Textarea
          id="edit-motivo"
          placeholder="Descreva o motivo do exame"
          value={data.motivoExame}
          onChange={(e) => updateData({ motivoExame: e.target.value })}
          className="min-h-[100px]"
        />
      </div>

      {/* ========== TOMOGRAFIA E RESSONÂNCIA ========== */}
      {isTomografiaOuRessonancia && (
        <>
          <YesNoQuestion
            id="edit-trauma"
            label="Sofreu algum trauma na região a ser examinada?"
            value={data.traumaRegiao}
            onChange={(v) => updateData({ traumaRegiao: v })}
          />

          <YesNoQuestion
            id="edit-cirurgia-corpo"
            label="Já fez alguma cirurgia em qualquer lugar do corpo? Se sim, qual?"
            value={data.cirurgiaCorpo}
            onChange={(v) => updateData({ cirurgiaCorpo: v })}
          >
            {data.cirurgiaCorpo && (
              <Textarea
                placeholder="Descreva qual cirurgia"
                value={data.cirurgiaCorpoDetalhes ?? ''}
                onChange={(e) => updateData({ cirurgiaCorpoDetalhes: e.target.value })}
                className="animate-fade-in"
              />
            )}
          </YesNoQuestion>

          <YesNoQuestion
            id="edit-cancer"
            label="Tem histórico de câncer? Se sim, em qual local?"
            value={data.historicoCancer}
            onChange={(v) => updateData({ historicoCancer: v })}
          >
            {data.historicoCancer && (
              <Textarea
                placeholder="Descreva em qual local"
                value={data.historicoCancerDetalhes ?? ''}
                onChange={(e) => updateData({ historicoCancerDetalhes: e.target.value })}
                className="animate-fade-in"
              />
            )}
          </YesNoQuestion>

          {tipoExame === 'ressonancia' && (
            <YesNoQuestion
              id="edit-exames-relacionados"
              label="Tem exames relacionados à doença atual? Se sim, quais?"
              value={data.examesRelacionados}
              onChange={(v) => updateData({ examesRelacionados: v })}
            >
              {data.examesRelacionados && (
                <Textarea
                  placeholder="Descreva quais exames"
                  value={data.examesRelacionadosDetalhes ?? ''}
                  onChange={(e) => updateData({ examesRelacionadosDetalhes: e.target.value })}
                  className="animate-fade-in"
                />
              )}
            </YesNoQuestion>
          )}

          {isFeminino && tipoExame === 'tomografia' && (
            <YesNoQuestion
              id="edit-amamentando"
              label="Você está em período de amamentação?"
              value={data.amamentando}
              onChange={(v) => updateData({ amamentando: v })}
            />
          )}

          {isMasculino && (
            <>
              <YesNoQuestion
                id="edit-prostata"
                label="Tem histórico de problemas na próstata?"
                value={data.problemaProstata}
                onChange={(v) => updateData({ problemaProstata: v })}
              />

              <YesNoQuestion
                id="edit-urinaria"
                label="Tem dificuldades urinárias ou histórico de infecção urinária?"
                value={data.dificuldadeUrinaria}
                onChange={(v) => updateData({ dificuldadeUrinaria: v })}
              />
            </>
          )}
        </>
      )}

      {/* ========== MAMOGRAFIA ========== */}
      {isMamografia && (
        <>
          <YesNoQuestion
            id="edit-mamo-anterior"
            label="Já realizou este exame anteriormente? Se sim, quando?"
            value={data.mamoExameAnterior}
            onChange={(v) => updateData({ mamoExameAnterior: v })}
          >
            {data.mamoExameAnterior && (
              <Input
                type="text"
                placeholder="Informe quando realizou"
                value={data.mamoExameAnteriorDetalhes ?? ''}
                onChange={(e) => updateData({ mamoExameAnteriorDetalhes: e.target.value })}
                className="animate-fade-in h-12"
              />
            )}
          </YesNoQuestion>

          <div className="space-y-3">
            <Label>Em qual data foi sua última menstruação?</Label>
            <Input
              type="text"
              placeholder="Ex: 15/12/2024 ou há 2 semanas"
              value={data.mamoUltimaMenstruacao}
              onChange={(e) => updateData({ mamoUltimaMenstruacao: e.target.value })}
              className="h-12"
            />
          </div>

          <YesNoQuestion
            id="edit-mamo-menopausa"
            label="Está na menopausa? Se sim, entrou com que idade?"
            value={data.mamoMenopausa}
            onChange={(v) => updateData({ mamoMenopausa: v })}
          >
            {data.mamoMenopausa && (
              <Input
                type="text"
                placeholder="Informe a idade"
                value={data.mamoMenopausaDetalhes ?? ''}
                onChange={(e) => updateData({ mamoMenopausaDetalhes: e.target.value })}
                className="animate-fade-in h-12"
              />
            )}
          </YesNoQuestion>

          <YesNoQuestion
            id="edit-mamo-hormonios"
            label="Faz uso de hormônios?"
            value={data.mamoUsaHormonios}
            onChange={(v) => updateData({ mamoUsaHormonios: v })}
          />

          <YesNoQuestion
            id="edit-mamo-filhos"
            label="Você tem filhos? Se sim, amamentou?"
            value={data.mamoTemFilhos}
            onChange={(v) => updateData({ mamoTemFilhos: v })}
          >
            {data.mamoTemFilhos && (
              <Input
                type="text"
                placeholder="Amamentou? Por quanto tempo?"
                value={data.mamoTemFilhosDetalhes ?? ''}
                onChange={(e) => updateData({ mamoTemFilhosDetalhes: e.target.value })}
                className="animate-fade-in h-12"
              />
            )}
          </YesNoQuestion>

          <YesNoQuestion
            id="edit-mamo-problema"
            label="Você já teve ou tem algum problema nas mamas? Se sim, em qual?"
            value={data.mamoProblemaMamas}
            onChange={(v) => updateData({ mamoProblemaMamas: v })}
          >
            {data.mamoProblemaMamas && (
              <Textarea
                placeholder="Descreva o problema e em qual mama"
                value={data.mamoProblemaMamasDetalhes ?? ''}
                onChange={(e) => updateData({ mamoProblemaMamasDetalhes: e.target.value })}
                className="animate-fade-in"
              />
            )}
          </YesNoQuestion>

          <YesNoQuestion
            id="edit-mamo-cirurgia"
            label="Já realizou alguma cirurgia nas mamas? Se sim, qual?"
            value={data.mamoCirurgiaMamas}
            onChange={(v) => updateData({ mamoCirurgiaMamas: v })}
          >
            {data.mamoCirurgiaMamas && (
              <Textarea
                placeholder="Descreva qual cirurgia"
                value={data.mamoCirurgiaMamasDetalhes ?? ''}
                onChange={(e) => updateData({ mamoCirurgiaMamasDetalhes: e.target.value })}
                className="animate-fade-in"
              />
            )}
          </YesNoQuestion>

          <YesNoQuestion
            id="edit-mamo-ultra"
            label="Já realizou ultrassonografia de mama? Se sim, quando?"
            value={data.mamoUltrassonografia}
            onChange={(v) => updateData({ mamoUltrassonografia: v })}
          >
            {data.mamoUltrassonografia && (
              <Input
                type="text"
                placeholder="Informe quando realizou"
                value={data.mamoUltrassonografiaDetalhes ?? ''}
                onChange={(e) => updateData({ mamoUltrassonografiaDetalhes: e.target.value })}
                className="animate-fade-in h-12"
              />
            )}
          </YesNoQuestion>

          <YesNoQuestion
            id="edit-mamo-historico"
            label="Há histórico familiar de câncer de mama ou de ovário? Se sim, qual ou quais parentes?"
            value={data.mamoHistoricoFamiliar}
            onChange={(v) => updateData({ mamoHistoricoFamiliar: v })}
          >
            {data.mamoHistoricoFamiliar && (
              <Textarea
                placeholder="Informe quais parentes"
                value={data.mamoHistoricoFamiliarDetalhes ?? ''}
                onChange={(e) => updateData({ mamoHistoricoFamiliarDetalhes: e.target.value })}
                className="animate-fade-in"
              />
            )}
          </YesNoQuestion>

          <YesNoQuestion
            id="edit-mamo-radio"
            label="Já fez radioterapia na mama? Se sim, em que ano?"
            value={data.mamoRadioterapia}
            onChange={(v) => updateData({ mamoRadioterapia: v })}
          >
            {data.mamoRadioterapia && (
              <Input
                type="text"
                placeholder="Informe o ano"
                value={data.mamoRadioterapiaDetalhes ?? ''}
                onChange={(e) => updateData({ mamoRadioterapiaDetalhes: e.target.value })}
                className="animate-fade-in h-12"
              />
            )}
          </YesNoQuestion>
        </>
      )}

      {/* ========== DENSITOMETRIA ========== */}
      {isDensitometria && (
        <>
          <YesNoQuestion
            id="edit-osteoporose"
            label="Tem osteoporose?"
            value={data.temOsteoporose}
            onChange={(v) => updateData({ temOsteoporose: v })}
          />

          <YesNoQuestion
            id="edit-tireoide"
            label="Tem doença na tireoide? Se sim, qual?"
            value={data.doencaTireoide}
            onChange={(v) => updateData({ doencaTireoide: v })}
          >
            {data.doencaTireoide && (
              <Textarea
                placeholder="Descreva qual doença"
                value={data.doencaTireoideDetalhes ?? ''}
                onChange={(e) => updateData({ doencaTireoideDetalhes: e.target.value })}
                className="animate-fade-in"
              />
            )}
          </YesNoQuestion>

          <YesNoQuestion
            id="edit-intestinal"
            label="Tem doença intestinal crônica? Se sim, qual?"
            value={data.doencaIntestinal}
            onChange={(v) => updateData({ doencaIntestinal: v })}
          >
            {data.doencaIntestinal && (
              <Textarea
                placeholder="Descreva qual doença"
                value={data.doencaIntestinalDetalhes ?? ''}
                onChange={(e) => updateData({ doencaIntestinalDetalhes: e.target.value })}
                className="animate-fade-in"
              />
            )}
          </YesNoQuestion>

          <YesNoQuestion
            id="edit-hiperparatiroidismo"
            label="Tem hiperparatiroidismo?"
            value={data.temHiperparatiroidismo}
            onChange={(v) => updateData({ temHiperparatiroidismo: v })}
          />

          <YesNoQuestion
            id="edit-paget"
            label="Tem doença de Paget?"
            value={data.temDoencaPaget}
            onChange={(v) => updateData({ temDoencaPaget: v })}
          />

          <YesNoQuestion
            id="edit-calcio"
            label="Possui má absorção de cálcio?"
            value={data.maAbsorcaoCalcio}
            onChange={(v) => updateData({ maAbsorcaoCalcio: v })}
          />

          <YesNoQuestion
            id="edit-osteomalacia"
            label="Tem osteomalácia?"
            value={data.temOsteomalacia}
            onChange={(v) => updateData({ temOsteomalacia: v })}
          />

          <YesNoQuestion
            id="edit-cushing"
            label="Tem síndrome de Cushing?"
            value={data.temSindromeCushing}
            onChange={(v) => updateData({ temSindromeCushing: v })}
          />

          <YesNoQuestion
            id="edit-vitamina-d"
            label="Possui deficiência de vitamina D?"
            value={data.deficienciaVitaminaD}
            onChange={(v) => updateData({ deficienciaVitaminaD: v })}
          />

          <YesNoQuestion
            id="edit-renal"
            label="Possui disfunção renal crônica?"
            value={data.disfuncaoRenalCronica}
            onChange={(v) => updateData({ disfuncaoRenalCronica: v })}
          />

          <YesNoQuestion
            id="edit-medicacao"
            label="Faz uso de alguma medicação regularmente? Se sim, qual?"
            value={data.usaMedicacaoRegular}
            onChange={(v) => updateData({ usaMedicacaoRegular: v })}
          >
            {data.usaMedicacaoRegular && (
              <Textarea
                placeholder="Descreva quais medicações"
                value={data.usaMedicacaoRegularDetalhes ?? ''}
                onChange={(e) => updateData({ usaMedicacaoRegularDetalhes: e.target.value })}
                className="animate-fade-in"
              />
            )}
          </YesNoQuestion>

          {/* Perguntas específicas para Densitometria - Feminino */}
          {isFeminino && (
            <div className="space-y-6 pt-4 border-t border-border">
              <YesNoQuestion
                id="edit-menopausa"
                label="Já passou pela menopausa? Se sim, com que idade e seus ciclos foram sempre irregulares?"
                value={data.passouMenopausa}
                onChange={(v) => updateData({ passouMenopausa: v })}
              >
                {data.passouMenopausa && (
                  <Textarea
                    placeholder="Informe a idade e se os ciclos foram irregulares"
                    value={data.passouMenopausaDetalhes ?? ''}
                    onChange={(e) => updateData({ passouMenopausaDetalhes: e.target.value })}
                    className="animate-fade-in"
                  />
                )}
              </YesNoQuestion>

              <YesNoQuestion
                id="edit-ciclos"
                label="Seus ciclos são/estão irregulares e acredita que possa estar na perimenopausa?"
                value={data.ciclosIrregulares}
                onChange={(v) => updateData({ ciclosIrregulares: v })}
              />

              <YesNoQuestion
                id="edit-cancer-mama-densi"
                label="Já teve câncer de mama?"
                value={data.teveCancerMamaDensi}
                onChange={(v) => updateData({ teveCancerMamaDensi: v })}
              />

              <YesNoQuestion
                id="edit-histerectomia"
                label="Já fez histerectomia (remoção do útero)? Se sim, com qual idade?"
                value={data.fezHisterectomia}
                onChange={(v) => updateData({ fezHisterectomia: v })}
              >
                {data.fezHisterectomia && (
                  <Textarea
                    placeholder="Informe com qual idade"
                    value={data.fezHisterectomiaDetalhes ?? ''}
                    onChange={(e) => updateData({ fezHisterectomiaDetalhes: e.target.value })}
                    className="animate-fade-in"
                  />
                )}
              </YesNoQuestion>

              <YesNoQuestion
                id="edit-ovarios"
                label="Retirou ovários?"
                value={data.retirouOvarios}
                onChange={(v) => updateData({ retirouOvarios: v })}
              />
            </div>
          )}
        </>
      )}
    </div>
  );
}
