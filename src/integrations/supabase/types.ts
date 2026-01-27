// Interface para respostas completas do questionário
// DO NOT DELETE: Manual interface for respostas_completas structure
export interface RespostasCompletas {
  versao: string;
  tipoExame: string;
  dadosPessoais: {
    nome: string;
    cpf: string;
    dataNascimento: string;
    sexo: 'masculino' | 'feminino' | null;
    peso: number | null;
    altura: number | null;
    telefone: string;
    dataExame: string;
  };
  seguranca: Record<string, boolean | 'nao_sei' | string | null>;
  clinicas: Record<string, boolean | 'nao_sei' | string | any>;
  consentimento: {
    aceitaRiscos: boolean;
    aceitaCompartilhamento: boolean;
    assinaturaData?: string;
    preenchidoPor?: 'paciente' | 'responsavel';
    nomeResponsavel?: string;
    assinaturaResponsavel?: string;
    tcAceitaContraste?: boolean | null;  // TC: autorização contraste iodado
    rmAceitaContraste?: boolean | null;  // RM: autorização contraste gadolínio
  };
  metadata?: {
    preenchidoEm: string;
    navegador?: string;
  };
}

export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[]

export type Database = {
  // Allows to automatically instantiate createClient with right options
  // instead of createClient<Database, { PostgrestVersion: 'XX' }>(URL, KEY)
  __InternalSupabase: {
    PostgrestVersion: "14.1"
  }
  public: {
    Tables: {
      questionarios: {
        Row: {
          assinatura_data: string | null
                    assinatura_assistente: string | null
          nome_assistente: string | null
          registro_assistente: string | null
          assinatura_operador: string | null
          nome_operador: string | null
          registro_operador: string | null
          cpf: string | null
          created_at: string
          data_exame: string | null
          data_finalizacao: string | null
          data_nascimento: string | null
          final_pdf_url: string | null
          id: string
          nome: string
          pdf_url: string | null
          respostas_completas: RespostasCompletas
          sexo: string | null
          status: string | null
          telefone: string | null
          tipo_exame: string | null
          updated_at: string
        }
        Insert: {
          assinatura_data?: string | null
                    assinatura_assistente?: string | null
          nome_assistente?: string | null
          registro_assistente?: string | null
          assinatura_operador?: string | null
          nome_operador?: string | null
          registro_operador?: string | null
          cpf?: string | null
          created_at?: string
          data_exame?: string | null
          data_finalizacao?: string | null
          data_nascimento?: string | null
          final_pdf_url?: string | null
          id?: string
          nome: string
          pdf_url?: string | null
          respostas_completas: RespostasCompletas
          sexo?: string | null
          status?: string | null
          telefone?: string | null
          tipo_exame?: string | null
          updated_at?: string
        }
        Update: {
          assinatura_data?: string | null
                    assinatura_assistente?: string | null
          nome_assistente?: string | null
          registro_assistente?: string | null
          assinatura_operador?: string | null
          nome_operador?: string | null
          registro_operador?: string | null
          cpf?: string | null
          created_at?: string
          data_exame?: string | null
          data_finalizacao?: string | null
          data_nascimento?: string | null
          final_pdf_url?: string | null
          id?: string
          nome?: string
          pdf_url?: string | null
          respostas_completas?: RespostasCompletas
          sexo?: string | null
          status?: string | null
          telefone?: string | null
          tipo_exame?: string | null
          updated_at?: string
        }
        Relationships: []
      }
    }
    Views: {
      [_ in never]: never
    }
    Functions: {
      [_ in never]: never
    }
    Enums: {
      [_ in never]: never
    }
    CompositeTypes: {
      [_ in never]: never
    }
  }
}

type DatabaseWithoutInternals = Omit<Database, "__InternalSupabase">

type DefaultSchema = DatabaseWithoutInternals[Extract<keyof Database, "public">]

export type Tables<
  DefaultSchemaTableNameOrOptions extends
    | keyof (DefaultSchema["Tables"] & DefaultSchema["Views"])
    | { schema: keyof DatabaseWithoutInternals },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof (DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"] &
        DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Views"])
    : never = never,
> = DefaultSchemaTableNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? (DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"] &
      DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Views"])[TableName] extends {
      Row: infer R
    }
    ? R
    : never
  : DefaultSchemaTableNameOrOptions extends keyof (DefaultSchema["Tables"] &
        DefaultSchema["Views"])
    ? (DefaultSchema["Tables"] &
        DefaultSchema["Views"])[DefaultSchemaTableNameOrOptions] extends {
        Row: infer R
      }
      ? R
      : never
    : never

export type TablesInsert<
  DefaultSchemaTableNameOrOptions extends
    | keyof DefaultSchema["Tables"]
    | { schema: keyof DatabaseWithoutInternals },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"]
    : never = never,
> = DefaultSchemaTableNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"][TableName] extends {
      Insert: infer I
    }
    ? I
    : never
  : DefaultSchemaTableNameOrOptions extends keyof DefaultSchema["Tables"]
    ? DefaultSchema["Tables"][DefaultSchemaTableNameOrOptions] extends {
        Insert: infer I
      }
      ? I
      : never
    : never

export type TablesUpdate<
  DefaultSchemaTableNameOrOptions extends
    | keyof DefaultSchema["Tables"]
    | { schema: keyof DatabaseWithoutInternals },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"]
    : never = never,
> = DefaultSchemaTableNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"][TableName] extends {
      Update: infer U
    }
    ? U
    : never
  : DefaultSchemaTableNameOrOptions extends keyof DefaultSchema["Tables"]
    ? DefaultSchema["Tables"][DefaultSchemaTableNameOrOptions] extends {
        Update: infer U
      }
      ? U
      : never
    : never

export type Enums<
  DefaultSchemaEnumNameOrOptions extends
    | keyof DefaultSchema["Enums"]
    | { schema: keyof DatabaseWithoutInternals },
  EnumName extends DefaultSchemaEnumNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaEnumNameOrOptions["schema"]]["Enums"]
    : never = never,
> = DefaultSchemaEnumNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? DatabaseWithoutInternals[DefaultSchemaEnumNameOrOptions["schema"]]["Enums"][EnumName]
  : DefaultSchemaEnumNameOrOptions extends keyof DefaultSchema["Enums"]
    ? DefaultSchema["Enums"][DefaultSchemaEnumNameOrOptions]
    : never

export type CompositeTypes<
  PublicCompositeTypeNameOrOptions extends
    | keyof DefaultSchema["CompositeTypes"]
    | { schema: keyof DatabaseWithoutInternals },
  CompositeTypeName extends PublicCompositeTypeNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[PublicCompositeTypeNameOrOptions["schema"]]["CompositeTypes"]
    : never = never,
> = PublicCompositeTypeNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? DatabaseWithoutInternals[PublicCompositeTypeNameOrOptions["schema"]]["CompositeTypes"][CompositeTypeName]
  : PublicCompositeTypeNameOrOptions extends keyof DefaultSchema["CompositeTypes"]
    ? DefaultSchema["CompositeTypes"][PublicCompositeTypeNameOrOptions]
    : never

export const Constants = {
  public: {
    Enums: {},
  },
} as const
