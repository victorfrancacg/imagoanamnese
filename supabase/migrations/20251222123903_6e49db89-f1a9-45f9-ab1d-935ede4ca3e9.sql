-- Criar bucket para armazenar PDFs dos questionários
INSERT INTO storage.buckets (id, name, public) VALUES ('questionarios-pdfs', 'questionarios-pdfs', true);

-- Políticas para o bucket
CREATE POLICY "Anyone can read PDFs" 
ON storage.objects 
FOR SELECT 
USING (bucket_id = 'questionarios-pdfs');

CREATE POLICY "Service can insert PDFs" 
ON storage.objects 
FOR INSERT 
WITH CHECK (bucket_id = 'questionarios-pdfs');

-- Adicionar coluna para URL do PDF na tabela questionarios
ALTER TABLE public.questionarios 
ADD COLUMN pdf_url text;