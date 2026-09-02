import { useState } from 'react'
import { useCreateFamilyMember, useFamilyMembers, useUpdateFamilyMember } from './useFamilyMembers'
import { useDebouncedCallback } from '@/lib/useDebouncedCallback'
import { Input } from '@/components/ui/Input'
import { Button } from '@/components/ui/Button'
import { Badge } from '@/components/ui/Badge'
import type { FamilyMember } from '@/lib/supabase/queries/familyMembers'

function MemberRow({ member }: { member: FamilyMember }) {
  const updateMember = useUpdateFamilyMember()
  const [name, setName] = useState(member.display_name)

  const commitName = useDebouncedCallback((value: string) => {
    if (!value.trim() || value === member.display_name) return
    updateMember.mutate({ id: member.id, patch: { display_name: value.trim() } })
  }, 500)

  return (
    <div className="flex items-center justify-between rounded-lg border border-gray-200 p-3 dark:border-gray-800">
      <div className="flex items-center gap-2">
        <Input
          value={name}
          onChange={(e) => {
            setName(e.target.value)
            commitName(e.target.value)
          }}
        />
        {!member.auth_user_id && <Badge tone="warning">אין חשבון מקושר</Badge>}
        {!member.is_active && <Badge tone="warning">לא פעיל</Badge>}
      </div>
      <Button
        variant="ghost"
        onClick={() => updateMember.mutate({ id: member.id, patch: { is_active: !member.is_active } })}
      >
        {member.is_active ? 'השבתה' : 'הפעלה'}
      </Button>
    </div>
  )
}

export function FamilyMembersSettingsPage() {
  const { data: members = [] } = useFamilyMembers()
  const createMember = useCreateFamilyMember()
  const [newName, setNewName] = useState('')

  return (
    <div className="flex flex-col gap-4">
      <h2 className="text-lg font-semibold text-gray-900 dark:text-gray-100">בני משפחה</h2>

      <div className="flex flex-col gap-2">
        {members.map((member) => (
          <MemberRow key={member.id} member={member} />
        ))}
      </div>

      <div className="flex items-end gap-2 rounded-lg border border-gray-200 p-3 dark:border-gray-800">
        <Input placeholder="שם" value={newName} onChange={(e) => setNewName(e.target.value)} />
        <Button
          onClick={() => {
            if (!newName.trim()) return
            createMember.mutate({ display_name: newName.trim() })
            setNewName('')
          }}
        >
          הוספה
        </Button>
      </div>
    </div>
  )
}
