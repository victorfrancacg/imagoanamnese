-- Política para permitir atualização do pdf_url
CREATE POLICY "Anyone can update pdf_url" 
ON public.questionarios 
FOR UPDATE 
USING (true)
WITH CHECK (true);