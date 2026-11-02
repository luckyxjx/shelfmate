import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { supabase, isSupabaseConfigured } from '../lib/supabase'
import { mockStore, MOCK_USER } from '../lib/mockData'
import type { Profile } from '../types/database'

export function useProfile(userId: string | undefined) {
  return useQuery({
    queryKey: ['profile', userId],
    queryFn: async () => {
      if (!userId) return null
      if (!isSupabaseConfigured || userId === MOCK_USER.id) {
        return mockStore.getProfile()
      }
      const { data, error } = await supabase
        .from('profiles')
        .select('*')
        .eq('id', userId)
        .single()
      if (error) throw error
      return data as Profile
    },
    enabled: !!userId,
  })
}

export function useUpdateProfile() {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: async (update: Partial<Profile> & { id: string }) => {
      const { id, ...rest } = update
      if (!isSupabaseConfigured || id === MOCK_USER.id) {
        return mockStore.updateProfile(rest)
      }
      const { data, error } = await supabase
        .from('profiles')
        .update(rest)
        .eq('id', id)
        .select()
        .single()
      if (error) throw error
      return data as Profile
    },
    onSuccess: (data) => {
      qc.setQueryData(['profile', data.id], data)
    },
  })
}

export function useUploadAvatar() {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: async ({ userId, file }: { userId: string; file: File }) => {
      if (!isSupabaseConfigured || userId === MOCK_USER.id) {
        const localUrl = URL.createObjectURL(file)
        return mockStore.updateProfile({ avatar_url: localUrl })
      }

      const ext = file.name.split('.').pop()
      const path = `avatars/${userId}.${ext}`
      const { error: uploadError } = await supabase.storage
        .from('public')
        .upload(path, file, { upsert: true })
      if (uploadError) throw uploadError

      const { data: { publicUrl } } = supabase.storage.from('public').getPublicUrl(path)

      const { data, error } = await supabase
        .from('profiles')
        .update({ avatar_url: publicUrl })
        .eq('id', userId)
        .select()
        .single()
      if (error) throw error
      return data as Profile
    },
    onSuccess: (data) => {
      qc.setQueryData(['profile', data.id], data)
    },
  })
}
