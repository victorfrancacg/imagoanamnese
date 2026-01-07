interface EditFormSectionProps {
  title: string;
  children: React.ReactNode;
}

/**
 * Componente de seção do formulário de edição
 * Agrupa campos relacionados com um título visual
 */
export function EditFormSection({ title, children }: EditFormSectionProps) {
  return (
    <div className="space-y-4">
      <h3 className="text-lg font-semibold border-b pb-2">{title}</h3>
      <div className="space-y-4">{children}</div>
    </div>
  );
}
