-- Create table for storing questionnaires
CREATE TABLE public.questionarios (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  nome TEXT NOT NULL,
  idade INTEGER,
  sexo TEXT,
  sexo_outro TEXT,
  tem_contraindicacao BOOLEAN,
  contraindicacao_detalhes TEXT,
  tomografia_anterior BOOLEAN,
  alergia BOOLEAN,
  alergia_detalhes TEXT,
  gravida BOOLEAN,
  motivo_exame TEXT,
  sintomas TEXT[],
  sintomas_outros TEXT,
  cancer_mama BOOLEAN,
  amamentando BOOLEAN,
  problema_prostata BOOLEAN,
  dificuldade_urinaria BOOLEAN,
  aceita_riscos BOOLEAN NOT NULL,
  aceita_compartilhamento BOOLEAN NOT NULL,
  assinatura_data TEXT,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Enable Row Level Security
ALTER TABLE public.questionarios ENABLE ROW LEVEL SECURITY;

-- Create policy for inserting questionnaires (public access for now)
CREATE POLICY "Anyone can insert questionnaires"
ON public.questionarios
FOR INSERT
WITH CHECK (true);

-- Create policy for reading questionnaires (public access for now)
CREATE POLICY "Anyone can read questionnaires"
ON public.questionarios
FOR SELECT
USING (true);

-- Create function to update timestamps
CREATE OR REPLACE FUNCTION public.update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SET search_path = public;

-- Create trigger for automatic timestamp updates
CREATE TRIGGER update_questionarios_updated_at
BEFORE UPDATE ON public.questionarios
FOR EACH ROW
EXECUTE FUNCTION public.update_updated_at_column();