import { useState } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Loader2 } from 'lucide-react';
import type { Tables } from '@/integrations/supabase/types';
import { QuestionnaireData } from '@/types/questionnaire';
import { useQuestionarioUpdate } from '@/hooks/useQuestionarioUpdate';
import { validateQuestionnaireData } from '@/lib/validation';
import { EditFormSection } from './EditFormSection';
import { PersonalFields } from './edit-fields/PersonalFields';
import { SecurityFields } from './edit-fields/SecurityFields';
import { ClinicalFields } from './edit-fields/ClinicalFields';

interface EditQuestionnaireDialogProps {
  questionario: Tables<'questionarios'>;
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

/**
 * Dialog principal para edição de questionários
 * Permite editar dados pessoais, segurança e clínicos em um único formulário scrollável
 */
export function EditQuestionnaireDialog({ questionario, open, onOpenChange }: EditQuestionnaireDialogProps) {
  const [formData, setFormData] = useState<QuestionnaireData>(() => {
    // Inicializar com dados existentes do questionário
    const r = questionario.respostas_completas;

    return {
      // Dados pessoais
      nome: questionario.nome,
      cpf: questionario.cpf || '',
      telefone: r?.dadosPessoais?.telefone || questionario.telefone || '',
      dataNascimento: questionario.data_nascimento || '',
      sexo: questionario.sexo as 'masculino' | 'feminino' | null,
      peso: r?.dadosPessoais?.peso ?? null,
      altura: r?.dadosPessoais?.altura ?? null,
      tipoExame: questionario.tipo_exame || '',
      dataExame: questionario.data_exame || '',

      // Segurança - Tomografia
      tcGravida: r?.seguranca?.tcGravida ?? null,
      tcAmamentando: r?.seguranca?.tcAmamentando ?? null,
      tcUsaMetformina: r?.seguranca?.tcUsaMetformina ?? null,
      tcMarcapasso: r?.seguranca?.tcMarcapasso ?? null,
      tcAlergiaContraste: r?.seguranca?.tcAlergiaContraste ?? null,
      tcCirurgiaRenal: r?.seguranca?.tcCirurgiaRenal ?? null,
      tcDoencaRenal: r?.seguranca?.tcDoencaRenal ?? null,

      // Segurança - Ressonância
      rmGravida: r?.seguranca?.rmGravida ?? null,
      rmAmamentando: r?.seguranca?.rmAmamentando ?? null,
      rmImplanteMedicamentoso: r?.seguranca?.rmImplanteMedicamentoso ?? null,
      rmMarcapasso: r?.seguranca?.rmMarcapasso ?? null,
      rmFragmentoMetalico: r?.seguranca?.rmFragmentoMetalico ?? null,
      rmEletroestimulador: r?.seguranca?.rmEletroestimulador ?? null,
      rmClipeAneurisma: r?.seguranca?.rmClipeAneurisma ?? null,
      rmExpansorTecidual: r?.seguranca?.rmExpansorTecidual ?? null,
      rmClipeGastrico: r?.seguranca?.rmClipeGastrico ?? null,
      rmImplanteCoclear: r?.seguranca?.rmImplanteCoclear ?? null,
      rmLesaoOlhoMetal: r?.seguranca?.rmLesaoOlhoMetal ?? null,
      rmTatuagemRecente: r?.seguranca?.rmTatuagemRecente ?? null,
      rmCirurgiaRenal: r?.seguranca?.rmCirurgiaRenal ?? null,
      rmDoencaRenal: r?.seguranca?.rmDoencaRenal ?? null,
      rmAlergiaContraste: r?.seguranca?.rmAlergiaContraste ?? null,

      // Segurança - Genérico
      gravida: r?.seguranca?.gravida ?? null,

      // Segurança - Densitometria
      exameContrasteRecente: r?.seguranca?.exameContrasteRecente ?? null,
      fraturouOsso: r?.seguranca?.fraturouOsso ?? null,
      fraturouOssoDetalhes: r?.seguranca?.fraturouOssoDetalhes,
      perdeuAltura: r?.seguranca?.perdeuAltura ?? null,
      perdaOsseaRadiografia: r?.seguranca?.perdaOsseaRadiografia ?? null,
      cifoseDorsal: r?.seguranca?.cifoseDorsal ?? null,
      quedas12Meses: r?.seguranca?.quedas12Meses ?? null,
      parenteOsteoporose: r?.seguranca?.parenteOsteoporose ?? null,
      parenteOsteoporoseDetalhes: r?.seguranca?.parenteOsteoporoseDetalhes,

      // Clínicas
      regioesExame: r?.clinicas?.regioesExame || [],
      motivoExame: r?.clinicas?.motivoExame || '',
      sintomas: r?.clinicas?.sintomas || [],
      sintomasOutros: r?.clinicas?.sintomasOutros,
      traumaRegiao: r?.clinicas?.traumaRegiao ?? null,
      cirurgiaCorpo: r?.clinicas?.cirurgiaCorpo ?? null,
      cirurgiaCorpoDetalhes: r?.clinicas?.cirurgiaCorpoDetalhes,
      historicoCancer: r?.clinicas?.historicoCancer ?? null,
      historicoCancerDetalhes: r?.clinicas?.historicoCancerDetalhes,
      examesRelacionados: r?.clinicas?.examesRelacionados ?? null,
      examesRelacionadosDetalhes: r?.clinicas?.examesRelacionadosDetalhes,

      // Específicas
      cancerMama: r?.clinicas?.cancerMama ?? null,
      amamentando: r?.clinicas?.amamentando ?? null,
      problemaProstata: r?.clinicas?.problemaProstata ?? null,
      dificuldadeUrinaria: r?.clinicas?.dificuldadeUrinaria ?? null,

      // Mamografia
      mamoExameAnterior: r?.clinicas?.mamoExameAnterior ?? null,
      mamoExameAnteriorDetalhes: r?.clinicas?.mamoExameAnteriorDetalhes,
      mamoUltimaMenstruacao: r?.clinicas?.mamoUltimaMenstruacao || '',
      mamoMenopausa: r?.clinicas?.mamoMenopausa ?? null,
      mamoMenopausaDetalhes: r?.clinicas?.mamoMenopausaDetalhes,
      mamoUsaHormonios: r?.clinicas?.mamoUsaHormonios ?? null,
      mamoTemFilhos: r?.clinicas?.mamoTemFilhos ?? null,
      mamoTemFilhosDetalhes: r?.clinicas?.mamoTemFilhosDetalhes,
      mamoProblemaMamas: r?.clinicas?.mamoProblemaMamas ?? null,
      mamoProblemaMamasDetalhes: r?.clinicas?.mamoProblemaMamasDetalhes,
      mamoCirurgiaMamas: r?.clinicas?.mamoCirurgiaMamas ?? null,
      mamoCirurgiaMamasDetalhes: r?.clinicas?.mamoCirurgiaMamasDetalhes,
      mamoUltrassonografia: r?.clinicas?.mamoUltrassonografia ?? null,
      mamoUltrassonografiaDetalhes: r?.clinicas?.mamoUltrassonografiaDetalhes,
      mamoHistoricoFamiliar: r?.clinicas?.mamoHistoricoFamiliar ?? null,
      mamoHistoricoFamiliarDetalhes: r?.clinicas?.mamoHistoricoFamiliarDetalhes,
      mamoRadioterapia: r?.clinicas?.mamoRadioterapia ?? null,
      mamoRadioterapiaDetalhes: r?.clinicas?.mamoRadioterapiaDetalhes,

      // Densitometria
      temOsteoporose: r?.clinicas?.temOsteoporose ?? null,
      doencaTireoide: r?.clinicas?.doencaTireoide ?? null,
      doencaTireoideDetalhes: r?.clinicas?.doencaTireoideDetalhes,
      doencaIntestinal: r?.clinicas?.doencaIntestinal ?? null,
      doencaIntestinalDetalhes: r?.clinicas?.doencaIntestinalDetalhes,
      temHiperparatiroidismo: r?.clinicas?.temHiperparatiroidismo ?? null,
      temDoencaPaget: r?.clinicas?.temDoencaPaget ?? null,
      maAbsorcaoCalcio: r?.clinicas?.maAbsorcaoCalcio ?? null,
      temOsteomalacia: r?.clinicas?.temOsteomalacia ?? null,
      temSindromeCushing: r?.clinicas?.temSindromeCushing ?? null,
      deficienciaVitaminaD: r?.clinicas?.deficienciaVitaminaD ?? null,
      disfuncaoRenalCronica: r?.clinicas?.disfuncaoRenalCronica ?? null,
      usaMedicacaoRegular: r?.clinicas?.usaMedicacaoRegular ?? null,
      usaMedicacaoRegularDetalhes: r?.clinicas?.usaMedicacaoRegularDetalhes,
      passouMenopausa: r?.clinicas?.passouMenopausa ?? null,
      passouMenopausaDetalhes: r?.clinicas?.passouMenopausaDetalhes,
      ciclosIrregulares: r?.clinicas?.ciclosIrregulares ?? null,
      teveCancerMamaDensi: r?.clinicas?.teveCancerMamaDensi ?? null,
      fezHisterectomia: r?.clinicas?.fezHisterectomia ?? null,
      fezHisterectomiaDetalhes: r?.clinicas?.fezHisterectomiaDetalhes,
      retirouOvarios: r?.clinicas?.retirouOvarios ?? null,

      // Consentimento
      aceitaRiscos: r?.consentimento?.aceitaRiscos ?? null,
      aceitaCompartilhamento: r?.consentimento?.aceitaCompartilhamento ?? null,
      assinaturaData: questionario.assinatura_data || '',
    };
  });

  const updateMutation = useQuestionarioUpdate();

  const handleSave = () => {
    const validation = validateQuestionnaireData(formData);

    if (!validation.isValid) {
      // Mostrar primeiro erro encontrado
      const firstError = Object.values(validation.errors)[0];
      console.error('Validation errors:', validation.errors);
      // O toast de erro será mostrado pelo hook
      return;
    }

    updateMutation.mutate({
      id: questionario.id,
      data: formData,
      editedBy: 'system', // TODO: Substituir com usuário real quando autenticação estiver implementada
    }, {
      onSuccess: () => {
        onOpenChange(false);
      }
    });
  };

  const updateData = (updates: Partial<QuestionnaireData>) => {
    setFormData(prev => ({ ...prev, ...updates }));
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-4xl max-h-[90vh]">
        <DialogHeader>
          <DialogTitle>Editar Questionário - {questionario.nome}</DialogTitle>
        </DialogHeader>

        <ScrollArea className="h-[60vh] pr-4">
          <div className="space-y-6">
            <EditFormSection title="Dados Pessoais">
              <PersonalFields data={formData} updateData={updateData} />
            </EditFormSection>

            <EditFormSection title="Questões de Segurança">
              <SecurityFields data={formData} updateData={updateData} />
            </EditFormSection>

            <EditFormSection title="Questões Clínicas">
              <ClinicalFields data={formData} updateData={updateData} />
            </EditFormSection>
          </div>
        </ScrollArea>

        <DialogFooter>
          <Button variant="outline" onClick={() => onOpenChange(false)}>
            Cancelar
          </Button>
          <Button onClick={handleSave} disabled={updateMutation.isPending}>
            {updateMutation.isPending && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
            Salvar Alterações
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
