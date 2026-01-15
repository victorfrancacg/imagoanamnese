import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Separator } from '@/components/ui/separator';
import { Label } from '@/components/ui/label';
import { QuestionnaireAnswers } from '@/components/tecnico/QuestionnaireAnswers';
import { formatCpf, formatDate } from '@/lib/utils';
import { getStatusBadge } from '@/lib/badge-helpers';
import { FileText } from 'lucide-react';
import type { Tables } from '@/integrations/supabase/types';

type Questionario = Tables<'questionarios'>;

interface ViewQuestionnaireDialogProps {
  questionario: Questionario | null;
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

function InfoItem({ label, value }: { label: string; value: string | null | undefined }) {
  return (
    <div className="space-y-1">
      <Label className="text-muted-foreground text-xs">{label}</Label>
      <p className="text-sm font-medium">{value || '-'}</p>
    </div>
  );
}

export function ViewQuestionnaireDialog({
  questionario,
  open,
  onOpenChange,
}: ViewQuestionnaireDialogProps) {
  if (!questionario) return null;

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-4xl max-h-[90vh]">
        <DialogHeader className="flex flex-row items-start justify-between pr-8">
          <div>
            <DialogTitle>Questionário - {questionario.nome}</DialogTitle>
            <DialogDescription>
              Visualização somente leitura dos dados do questionário
            </DialogDescription>
          </div>
          {questionario.final_pdf_url && (
            <Button
              variant="outline"
              size="sm"
              className="gap-2 flex-shrink-0"
              onClick={() => window.open(questionario.final_pdf_url!, '_blank')}
            >
              <FileText className="h-4 w-4" />
              Visualizar PDF
            </Button>
          )}
        </DialogHeader>

        <ScrollArea className="h-[60vh] pr-4">
          <div className="space-y-6">
            {/* Seção: Dados Pessoais */}
            <div>
              <h3 className="font-semibold mb-3 text-lg">Dados Pessoais</h3>
              <div className="grid grid-cols-2 gap-4">
                <InfoItem label="Nome Completo" value={questionario.nome} />
                <InfoItem label="CPF" value={formatCpf(questionario.cpf)} />
                <InfoItem label="Telefone" value={questionario.telefone} />
                <InfoItem
                  label="Data de Nascimento"
                  value={
                    questionario.data_nascimento
                      ? formatDate(questionario.data_nascimento)
                      : null
                  }
                />
                <InfoItem
                  label="Sexo"
                  value={
                    questionario.sexo
                      ? questionario.sexo === 'masculino'
                        ? 'Masculino'
                        : 'Feminino'
                      : null
                  }
                />
                <InfoItem
                  label="Tipo de Exame"
                  value={
                    questionario.tipo_exame
                      ? questionario.tipo_exame.charAt(0).toUpperCase() +
                        questionario.tipo_exame.slice(1)
                      : null
                  }
                />
                <InfoItem
                  label="Data do Exame"
                  value={
                    questionario.data_exame
                      ? formatDate(questionario.data_exame)
                      : null
                  }
                />
                <div className="space-y-1">
                  <Label className="text-muted-foreground text-xs">Status</Label>
                  <div>{getStatusBadge(questionario.status)}</div>
                </div>
              </div>
            </div>

            <Separator />

            {/* Reutilizar componente QuestionnaireAnswers */}
            <QuestionnaireAnswers questionario={questionario} />
          </div>
        </ScrollArea>

        <DialogFooter>
          <Button variant="outline" onClick={() => onOpenChange(false)}>
            Fechar
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
