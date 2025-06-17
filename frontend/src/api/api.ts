import { NotificationItemDto } from "./dto/notification-item.dto";

const API_BASE = process.env.NEXT_PUBLIC_API_URL

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
export async function fetchNotifications(): Promise<NotificationItemDto[]> {
  const res = await fetch(`${API_BASE}/notifications`, {
    credentials: "include",
    headers: { "Content-Type": "application/json" },
  });
  return handleResponse<NotificationItemDto[]>(res);
}
