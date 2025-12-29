import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

serve(async (req) => {
  // Handle CORS preflight requests
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const externalSupabaseUrl = Deno.env.get('EXTERNAL_SUPABASE_URL');
    const externalSupabaseKey = Deno.env.get('EXTERNAL_SUPABASE_KEY');

    if (!externalSupabaseUrl || !externalSupabaseKey) {
      console.error('Missing external Supabase credentials');
      return new Response(
        JSON.stringify({ error: 'External Supabase credentials not configured' }),
        { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    const payload = await req.json();
    console.log('Received payload for external sync:', JSON.stringify(payload, null, 2));

    // Validate required fields
    if (!payload.nome) {
      console.error('Missing required field: nome');
      return new Response(
        JSON.stringify({ error: 'Missing required field: nome' }),
        { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    // Create external Supabase client
    const externalSupabase = createClient(externalSupabaseUrl, externalSupabaseKey);

    // Prepare data for external database
    const externalData = {
      nome: payload.nome,
      cpf: payload.cpf || null,
      data_nascimento: payload.data_nascimento || null,
      sexo: payload.sexo || null,
      peso: payload.peso || null,
      altura: payload.altura || null,
      tipo_exame: payload.tipo_exame || null,
      data_exame: payload.data_exame || null,
      gravida: payload.gravida || null,
      motivo_exame: payload.motivo_exame || null,
      sintomas: payload.sintomas || null,
      sintomas_outros: payload.sintomas_outros || null,
      cancer_mama: payload.cancer_mama || null,
      amamentando: payload.amamentando || null,
      problema_prostata: payload.problema_prostata || null,
      dificuldade_urinaria: payload.dificuldade_urinaria || null,
      aceita_riscos: payload.aceita_riscos ?? false,
      aceita_compartilhamento: payload.aceita_compartilhamento ?? false,
      assinatura_data: payload.assinatura_data || null,
      pdf_url: payload.pdf_url || null,
      lovable_cloud_id: payload.lovable_cloud_id || null,
    };

    console.log('Inserting into external database:', JSON.stringify(externalData, null, 2));

    // Insert into external Supabase
    const { data, error } = await externalSupabase
      .from('questionarios')
      .insert(externalData)
      .select('id')
      .single();

    if (error) {
      console.error('Error inserting into external database:', error);
      return new Response(
        JSON.stringify({ error: error.message, details: error }),
        { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    console.log('Successfully synced to external database with id:', data.id);

    return new Response(
      JSON.stringify({ success: true, external_id: data.id }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );

  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : 'Unknown error';
    console.error('Error in sync-external-db function:', error);
    return new Response(
      JSON.stringify({ error: errorMessage }),
      { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  }
});
