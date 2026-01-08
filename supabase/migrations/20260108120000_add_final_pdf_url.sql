-- Add final_pdf_url column to questionarios table
-- This column will store the URL of the final PDF generated after technician review
ALTER TABLE public.questionarios
ADD COLUMN final_pdf_url TEXT;

COMMENT ON COLUMN public.questionarios.final_pdf_url IS 'URL of the final PDF generated after technician review and signature';
