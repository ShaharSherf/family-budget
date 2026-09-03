// Hand-authored to match supabase/migrations/*.sql until a live Supabase
// project exists. Once it does, regenerate with:
//   npm run db:types
// (wraps `supabase gen types typescript --project-id <id> --schema public`)
// and this file becomes fully generated — do not hand-edit after that point.

export type Json = string | number | boolean | null | { [key: string]: Json | undefined } | Json[]

export interface Database {
  public: {
    Tables: {
      family_members: {
        Row: {
          id: string
          display_name: string
          auth_user_id: string | null
          birthday_month: number | null
          is_active: boolean
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          display_name: string
          auth_user_id?: string | null
          birthday_month?: number | null
          is_active?: boolean
          created_at?: string
          updated_at?: string
        }
        Update: Partial<Database['public']['Tables']['family_members']['Insert']>
        Relationships: []
      }
      categories: {
        Row: {
          id: string
          name_he: string
          name_en: string | null
          kind: 'income' | 'expense'
          sort_order: number
          is_active: boolean
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          name_he: string
          name_en?: string | null
          kind: 'income' | 'expense'
          sort_order?: number
          is_active?: boolean
          created_at?: string
          updated_at?: string
        }
        Update: Partial<Database['public']['Tables']['categories']['Insert']>
        Relationships: []
      }
      details: {
        Row: {
          id: string
          category_id: string
          name_he: string
          name_en: string | null
          sort_order: number
          is_active: boolean
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          category_id: string
          name_he: string
          name_en?: string | null
          sort_order?: number
          is_active?: boolean
          created_at?: string
          updated_at?: string
        }
        Update: Partial<Database['public']['Tables']['details']['Insert']>
        Relationships: []
      }
      months: {
        Row: {
          month_key: string
          is_closed: boolean
          closed_at: string | null
          closed_by: string | null
          last_unlocked_at: string | null
          last_unlocked_by: string | null
          notes: string | null
          created_at: string
        }
        Insert: {
          month_key: string
          is_closed?: boolean
          closed_at?: string | null
          closed_by?: string | null
          last_unlocked_at?: string | null
          last_unlocked_by?: string | null
          notes?: string | null
          created_at?: string
        }
        Update: Partial<Database['public']['Tables']['months']['Insert']>
        Relationships: []
      }
      budget_lines: {
        Row: {
          id: string
          month_key: string
          category_id: string
          detail_id: string
          target_amount: number | null
          actual_amount: number | null
          share_pct: number
          family_actual_amount: number | null
          notes: string | null
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          month_key: string
          category_id: string
          detail_id: string
          target_amount?: number | null
          actual_amount?: number | null
          share_pct?: number
          notes?: string | null
          created_at?: string
          updated_at?: string
        }
        Update: Partial<Database['public']['Tables']['budget_lines']['Insert']>
        Relationships: []
      }
      budget_line_payments: {
        Row: {
          id: string
          budget_line_id: string
          family_member_id: string
          paid_amount: number
        }
        Insert: {
          id?: string
          budget_line_id: string
          family_member_id: string
          paid_amount?: number
        }
        Update: Partial<Database['public']['Tables']['budget_line_payments']['Insert']>
        Relationships: []
      }
      savings_goals: {
        Row: {
          id: string
          name: string
          monthly_target_amount: number | null
          lifetime_target_amount: number | null
          opening_balance_amount: number
          is_active: boolean
          notes: string | null
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          name: string
          monthly_target_amount?: number | null
          lifetime_target_amount?: number | null
          opening_balance_amount?: number
          is_active?: boolean
          notes?: string | null
          created_at?: string
          updated_at?: string
        }
        Update: Partial<Database['public']['Tables']['savings_goals']['Insert']>
        Relationships: []
      }
      savings_contributions: {
        Row: {
          id: string
          goal_id: string
          month_key: string
          contributed_amount: number
          actual_balance_amount: number | null
          notes: string | null
          created_at: string
        }
        Insert: {
          id?: string
          goal_id: string
          month_key: string
          contributed_amount?: number
          actual_balance_amount?: number | null
          notes?: string | null
          created_at?: string
        }
        Update: Partial<Database['public']['Tables']['savings_contributions']['Insert']>
        Relationships: []
      }
      allowed_signup_emails: {
        Row: { email: string }
        Insert: { email: string }
        Update: Partial<Database['public']['Tables']['allowed_signup_emails']['Insert']>
        Relationships: []
      }
      calendar_events: {
        Row: {
          id: string
          title: string
          month: number
          day: number
          notes: string | null
          created_at: string
        }
        Insert: {
          id?: string
          title: string
          month: number
          day: number
          notes?: string | null
          created_at?: string
        }
        Update: Partial<Database['public']['Tables']['calendar_events']['Insert']>
        Relationships: []
      }
    }
    Views: {
      category_actuals: {
        Row: {
          month_key: string
          category_id: string
          name_he: string
          kind: 'income' | 'expense'
          actual_total: number | null
          target_total: number | null
        }
        Relationships: []
      }
      month_kpis: {
        Row: {
          month_key: string
          income_actual: number
          income_target: number
          expense_actual: number
          expense_target: number
          leftover_actual: number
        }
        Relationships: []
      }
    }
    Functions: {
      create_month: {
        Args: { p_month_key: string }
        Returns: undefined
      }
      is_household_member: {
        Args: Record<string, never>
        Returns: boolean
      }
    }
    Enums: Record<string, never>
  }
}

type PublicSchema = Database['public']

export type Tables<T extends keyof PublicSchema['Tables']> = PublicSchema['Tables'][T]['Row']
export type TablesInsert<T extends keyof PublicSchema['Tables']> = PublicSchema['Tables'][T]['Insert']
export type TablesUpdate<T extends keyof PublicSchema['Tables']> = PublicSchema['Tables'][T]['Update']
export type ViewRow<T extends keyof PublicSchema['Views']> = PublicSchema['Views'][T]['Row']
