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
    // Verificar autorização
    const authHeader = req.headers.get('Authorization');
    if (!authHeader) {
      console.error('Token de autorização não fornecido');
      return new Response(
        JSON.stringify({ error: 'Token de autorização não fornecido' }),
        { status: 401, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    const supabaseUrl = Deno.env.get('SUPABASE_URL')!;
    const supabaseServiceKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!;

    // Extrair o token do header
    const token = authHeader.replace('Bearer ', '');

    // Cliente admin com service_role key para todas as operações
    const supabaseAdmin = createClient(supabaseUrl, supabaseServiceKey, {
      auth: {
        autoRefreshToken: false,
        persistSession: false,
      },
    });

    // Verificar o token JWT e obter o usuário
    const { data: { user }, error: userError } = await supabaseAdmin.auth.getUser(token);

    if (userError || !user) {
      console.error('Erro ao verificar usuário:', userError);
      return new Response(
        JSON.stringify({ error: 'Usuário não autenticado', details: userError?.message }),
        { status: 401, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    console.log('Usuário autenticado:', user.id);

    // Verificar se o usuário é admin
    const { data: profile, error: profileError } = await supabaseAdmin
      .from('profiles')
      .select('user_type')
      .eq('id', user.id)
      .single();

    if (profileError) {
      console.error('Erro ao buscar perfil:', profileError);
      return new Response(
        JSON.stringify({ error: 'Erro ao verificar permissões', details: profileError.message }),
        { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    if (!profile || profile.user_type !== 'admin') {
      console.error('Usuário não é admin:', profile);
      return new Response(
        JSON.stringify({ error: 'Acesso negado. Apenas administradores podem aprovar técnicos.' }),
        { status: 403, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    console.log('Usuário é admin, prosseguindo com aprovação');

    // Obter o ID do técnico a ser aprovado
    const { technicianId } = await req.json();

    if (!technicianId) {
      return new Response(
        JSON.stringify({ error: 'ID do técnico não fornecido' }),
        { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    // 1. Confirmar email do técnico
    const { error: emailError } = await supabaseAdmin.auth.admin.updateUserById(technicianId, {
      email_confirm: true,
    });

    if (emailError) {
      console.error('Erro ao confirmar email:', emailError);
      return new Response(
        JSON.stringify({ error: 'Erro ao confirmar email do técnico', details: emailError.message }),
        { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    // 2. Atualizar status do perfil para 'ativo'
    const { error: profileUpdateError } = await supabaseAdmin
      .from('profiles')
      .update({ status: 'ativo' })
      .eq('id', technicianId);

    if (profileUpdateError) {
      console.error('Erro ao atualizar perfil:', profileUpdateError);
      return new Response(
        JSON.stringify({ error: 'Erro ao atualizar status do técnico', details: profileUpdateError.message }),
        { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    console.log('Técnico aprovado com sucesso:', technicianId);

    return new Response(
      JSON.stringify({ success: true, message: 'Técnico aprovado com sucesso' }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );

  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : 'Erro desconhecido';
    console.error('Erro na função approve-technician:', error);
    return new Response(
      JSON.stringify({ error: errorMessage }),
      { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  }
});
