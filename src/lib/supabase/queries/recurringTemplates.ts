import { supabase } from '@/lib/supabase/client'
import type { TablesInsert, TablesUpdate } from '@/lib/supabase/database.types'

const SELECT_WITH_RELATIONS = `
  *,
  category:categories!recurring_templates_category_id_fkey ( id, name_he, kind ),
  detail:details!recurring_templates_detail_id_fkey ( id, name_he ),
  default_payments:recurring_template_default_payments ( * )
`

export type RecurringTemplateWithRelations = {
  id: string
  category_id: string
  detail_id: string
  default_target_amount: number | null
  default_actual_amount: number | null
  default_share_pct: number
  default_notes: string | null
  is_active: boolean
  effective_from: string
  effective_until: string | null
  created_at: string
  updated_at: string
  category: { id: string; name_he: string; kind: 'income' | 'expense' }
  detail: { id: string; name_he: string }
  default_payments: { id: string; template_id: string; family_member_id: string; default_paid_amount: number }[]
}

export async function getRecurringTemplates(): Promise<RecurringTemplateWithRelations[]> {
  const { data, error } = await supabase.from('recurring_templates').select(SELECT_WITH_RELATIONS)
  if (error) throw error
  return data as unknown as RecurringTemplateWithRelations[]
}

export async function createRecurringTemplate(
  input: TablesInsert<'recurring_templates'>,
): Promise<RecurringTemplateWithRelations> {
  const { data, error } = await supabase
    .from('recurring_templates')
    .insert(input)
    .select(SELECT_WITH_RELATIONS)
    .single()
  if (error) throw error
  return data as unknown as RecurringTemplateWithRelations
}

/** Edits apply to future months only — create_month() copies values at generation time, never reads the template live. */
export async function updateRecurringTemplate(
  id: string,
  patch: TablesUpdate<'recurring_templates'>,
): Promise<RecurringTemplateWithRelations> {
  const { data, error } = await supabase
    .from('recurring_templates')
    .update(patch)
    .eq('id', id)
    .select(SELECT_WITH_RELATIONS)
    .single()
  if (error) throw error
  return data as unknown as RecurringTemplateWithRelations
}

/** Pausing keeps history intact — create_month() only considers is_active templates. */
export async function setRecurringTemplateActive(id: string, isActive: boolean): Promise<void> {
  const { error } = await supabase.from('recurring_templates').update({ is_active: isActive }).eq('id', id)
  if (error) throw error
}

export async function setRecurringTemplateDefaultPayment(
  templateId: string,
  familyMemberId: string,
  defaultPaidAmount: number,
): Promise<void> {
  const { error } = await supabase
    .from('recurring_template_default_payments')
    .upsert(
      { template_id: templateId, family_member_id: familyMemberId, default_paid_amount: defaultPaidAmount },
      { onConflict: 'template_id,family_member_id' },
    )
  if (error) throw error
}
