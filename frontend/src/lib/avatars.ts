// Lista de avatares disponíveis (baseada nos arquivos reais na pasta public/avatars)
export const availableAvatars = [
  { id: "user", name: "Avatar Padrão", color: "bg-blue-500" },
  { id: "user1", name: "Avatar 1", color: "bg-green-500" },
  { id: "user2", name: "Avatar 2", color: "bg-purple-500" },
  { id: "user3", name: "Avatar 3", color: "bg-orange-500" },
  { id: "user4", name: "Avatar 4", color: "bg-teal-500" },
]

// Função para obter dados do avatar por ID
export function getAvatarById(id: string) {
  return availableAvatars.find(avatar => avatar.id === id) || availableAvatars[0]
}

// Função para obter a URL do avatar
export function getAvatarUrl(avatarId: string) {
  return `/avatars/${avatarId}.png`
}

// Função para obter o fallback do avatar (cor + nome)
export function getAvatarFallback(avatarId: string) {
  const avatar = getAvatarById(avatarId)
  return {
    color: avatar.color,
    name: avatar.name
  }
}
