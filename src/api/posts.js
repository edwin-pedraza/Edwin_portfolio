import { api } from './client'

export const listPosts = ({ orderBy = 'published_at', ascending = false } = {}) =>
  api.get(`/posts?orderBy=${orderBy}&ascending=${ascending}`)

export const getPostById = (id) => api.get(`/posts/${id}`)

export const getPrevNext = (publishedAt) =>
  api.get(`/posts/prev-next?publishedAt=${encodeURIComponent(publishedAt)}`)

export const listRelatedByTag = (tag, excludeId, limit = 3) =>
  api.get(`/posts/related/${encodeURIComponent(tag)}?excludeId=${excludeId}&limit=${limit}`)

export const createPost  = (payload) => api.post('/posts', payload)
export const updatePost  = (id, payload) => api.put(`/posts/${id}`, payload)
export const deletePost  = (id) => api.delete(`/posts/${id}`)