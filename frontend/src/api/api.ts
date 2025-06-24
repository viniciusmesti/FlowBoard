import { NotificationItemDto } from "./dto/notification-item.dto";

const API_BASE = process.env.NEXT_PUBLIC_API_URL

export const mockNotifications: NotificationItemDto[] = [
  {
    id: 'demo-overdue',
    type: 'overdue',
    title: 'Task Atrasada',
    description: '"Configurar CI" está 2 dias atrasada',
    requirementId: 'demo1',
    priority: 'high',
    timestamp: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000).toISOString(),
  },
  {
    id: 'demo-approval',
    type: 'approval',
    title: 'Aprovação Pendente',
    description: 'Requisito "Integração" aguarda aprovação',
    requirementId: 'demo2',
    priority: 'high',
    timestamp: new Date(Date.now() - 3 * 60 * 60 * 1000).toISOString(),
  },
  {
    id: 'demo-due-soon',
    type: 'due-soon',
    title: 'Prazo Próximo',
    description: '"Escrever testes" vence em 5h',
    requirementId: 'demo3',
    priority: 'medium',
    timestamp: new Date(Date.now() + 5 * 60 * 60 * 1000).toISOString(),
  },
]

async function handleResponse<T>(res: Response): Promise<T> {
  if (!res.ok) {
    const errorText = await res.text();
    throw new Error(`API error: ${res.status} ${errorText}`);
  }
  // res.json() retorna Promise<unknown>, então convertemos explicitamente para Promise<T>
  return res.json() as Promise<T>;
}

/**
 * Busca todas as notificações do usuário autenticado.
 */
export async function fetchNotifications(userId: string): Promise<NotificationItemDto[]> {
  if (!userId) return [];
  try {
    const token = typeof window !== 'undefined' ? localStorage.getItem('auth_token') : null;
    const res = await fetch(`${API_BASE}/notifications?userId=${encodeURIComponent(userId)}`, {
      credentials: "include",
      headers: {
        "Content-Type": "application/json",
        ...(token ? { Authorization: `Bearer ${token}` } : {}),
      },
    });

    if (res.ok) {
      return handleResponse<NotificationItemDto[]>(res);
    }

    console.warn(`Failed to fetch notifications: ${res.status} ${res.statusText}`);
    return mockNotifications;
  } catch (err) {
    console.error("Failed to fetch notifications", err);
    return mockNotifications;
  }
}

