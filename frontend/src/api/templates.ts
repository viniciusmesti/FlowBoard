import { RequirementTemplate } from '@/types'
import { NotificationItemDto } from './dto/notification-item.dto' // if needed

const API_BASE = process.env.NEXT_PUBLIC_API_URL

async function handleResponse<T>(res: Response): Promise<T> {
  if (!res.ok) {
    const errorText = await res.text()
    throw new Error(`API error: ${res.status} ${errorText}`)
  }
  return res.json() as Promise<T>
}

/**
 * Busca todos os templates de requisitos
 */
export async function fetchTemplates(): Promise<RequirementTemplate[]> {
  const res = await fetch(`${API_BASE}/templates`, {
    credentials: 'include',
    headers: { 'Content-Type': 'application/json' }
  })
  return handleResponse<RequirementTemplate[]>(res)
}

/**
 * Salva um novo template no backend
 */
export async function createTemplate(
  data: Pick<RequirementTemplate, 'name' | 'description' | 'color' | 'priority'>
): Promise<RequirementTemplate> {
  const res = await fetch(`${API_BASE}/templates`, {
    method: 'POST',
    credentials: 'include',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(data)
  })
  return handleResponse<RequirementTemplate>(res)
}

/**
 * Cria tasks a partir de um template em um requisito
 */
export async function applyTemplate(
  templateId: string,
  requirementId: string
): Promise<void> {
  const res = await fetch(
    `${API_BASE}/templates/${templateId}/apply/${requirementId}`,
    {
      method: 'POST',
      credentials: 'include',
      headers: { 'Content-Type': 'application/json' }
    }
  )
  await handleResponse<void>(res)
}