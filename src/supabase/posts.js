import { supabase } from './client'

export async function listPosts({ orderBy = 'published_at', ascending = false } = {}) {
  const { data, error } = await supabase
    .from('post')
    .select('*')
    .order(orderBy, { ascending })
  if (error) throw error
  return data || []
}

export async function getPostById(id) {
  const { data, error } = await supabase
    .from('post')
    .select('*')
    .eq('id', id)
    .single()
  if (error) throw error
  return data
}

export async function getPrevNext(publishedAt) {
  if (!publishedAt) return { prev: null, next: null }
  const [{ data: prev }, { data: next }] = await Promise.all([
    supabase
      .from('post')
      .select('id,title,cover_url')
      .lt('published_at', publishedAt)
      .order('published_at', { ascending: false })
      .limit(1),
    supabase
      .from('post')
      .select('id,title,cover_url')
      .gt('published_at', publishedAt)
      .order('published_at', { ascending: true })
      .limit(1),
  ])
  return { prev: prev?.[0] || null, next: next?.[0] || null }
}

export async function listRelatedByTag(tag, excludeId, limit = 3) {
  if (!tag) return []
  const { data, error } = await supabase
    .from('post')
    .select('id,title,excerpt,cover_url,tag')
    .eq('tag', tag)
    .neq('id', excludeId)
    .order('published_at', { ascending: false })
    .limit(limit)
  if (error) throw error
  return data || []
}

export async function createPost(payload) {
  const { data, error } = await supabase
    .from('post')
    .insert(payload)
    .select('id')
    .single()
  if (error) throw error
  return data
}

export async function updatePost(id, payload) {
  const { data, error } = await supabase
    .from('post')
    .update(payload)
    .eq('id', id)
    .select('id')
  if (error) throw error
  if (!data || data.length === 0) {
    throw new Error('No rows updated (check permissions or ID)')
  }
  return data[0]
}

export async function deletePost(id) {
  const { error } = await supabase
    .from('post')
    .delete()
    .eq('id', id)
  if (error) throw error
}
