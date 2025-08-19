"use client"

import { availableAvatars, getAvatarUrl } from "@/lib/avatars"

export default function TestAvatarsPage() {
  return (
    <div className="container mx-auto p-8">
      <h1 className="text-2xl font-bold mb-6">Teste de Avatares</h1>
      
      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-6">
        {availableAvatars.map((avatar) => (
          <div key={avatar.id} className="text-center">
            <div className="mb-2">
              <img 
                src={getAvatarUrl(avatar.id)} 
                alt={avatar.name}
                className="w-24 h-24 mx-auto rounded-full border-2 border-gray-200"
                onError={(e) => {
                  console.error(`❌ Erro ao carregar ${avatar.id}:`, e)
                  e.currentTarget.style.borderColor = 'red'
                }}
                onLoad={() => {
                  console.log(`✅ ${avatar.id} carregou com sucesso`)
                }}
              />
            </div>
            <h3 className="font-medium">{avatar.name}</h3>
            <p className="text-sm text-gray-500">{avatar.id}</p>
            <p className="text-xs text-gray-400">{getAvatarUrl(avatar.id)}</p>
          </div>
        ))}
      </div>

      <div className="mt-8 p-4 bg-gray-100 rounded">
        <h2 className="font-bold mb-2">Informações de Debug:</h2>
        <p>Total de avatares: {availableAvatars.length}</p>
        <p>IDs: {availableAvatars.map(a => a.id).join(', ')}</p>
        <p>URLs: {availableAvatars.map(a => getAvatarUrl(a.id)).join(', ')}</p>
      </div>
    </div>
  )
}
