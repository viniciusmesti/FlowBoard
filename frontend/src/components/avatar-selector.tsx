"use client"

import { useState, useEffect } from "react"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Button } from "@/components/ui/button"
import { Label } from "@/components/ui/label"
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog"
import { ScrollArea } from "@/components/ui/scroll-area"
import { Check, User } from "lucide-react"
import { availableAvatars, getAvatarById, getAvatarUrl, getAvatarFallback } from "@/lib/avatars"

interface AvatarSelectorProps {
  selectedAvatar: string
  onAvatarSelect: (avatarId: string) => void
  label?: string
}

export function AvatarSelector({ selectedAvatar, onAvatarSelect, label = "Avatar" }: AvatarSelectorProps) {
  const [isOpen, setIsOpen] = useState(false)
  const [imageErrors, setImageErrors] = useState<Set<string>>(new Set())

  const selectedAvatarData = getAvatarById(selectedAvatar)
  const avatarFallback = getAvatarFallback(selectedAvatar)

  // Filtrar avatares que falharam ao carregar
  const workingAvatars = availableAvatars.filter(avatar => !imageErrors.has(avatar.id))

  const handleImageError = (avatarId: string) => {
    console.log(`❌ Erro ao carregar avatar: ${avatarId}`)
    setImageErrors(prev => new Set(prev).add(avatarId))
  }

  const handleAvatarSelect = (avatarId: string) => {
    console.log("Avatar selecionado:", avatarId)
    onAvatarSelect(avatarId)
    setIsOpen(false)
  }

  return (
    <div className="space-y-2">
      <Label htmlFor="avatar">{label}</Label>
      <div className="flex items-center space-x-3">
        <Avatar className="h-12 w-12">
          <AvatarImage src={getAvatarUrl(selectedAvatar)} alt={selectedAvatarData.name} />
          <AvatarFallback className={avatarFallback.color}>
            <User className="h-6 w-6 text-white" />
          </AvatarFallback>
        </Avatar>
        
        <Dialog open={isOpen} onOpenChange={setIsOpen}>
          <DialogTrigger asChild>
            <Button variant="outline" type="button">
              Escolher Avatar ({workingAvatars.length} opções)
            </Button>
          </DialogTrigger>
          <DialogContent className="max-w-md">
            <DialogHeader>
              <DialogTitle>Selecione seu Avatar ({workingAvatars.length} disponíveis)</DialogTitle>
            </DialogHeader>
            
            {/* Debug info */}
            <div className="p-2 bg-gray-100 rounded text-xs text-gray-600 mb-2">
              Total: {workingAvatars.length} avatares | IDs: {workingAvatars.map(a => a.id).join(', ')}
              {imageErrors.size > 0 && (
                <div className="mt-1 text-red-500">
                  Erros: {Array.from(imageErrors).join(', ')}
                </div>
              )}
            </div>
            
            <ScrollArea className="h-96">
              <div className="grid grid-cols-2 gap-4 p-4 pb-6">
                {workingAvatars.map((avatar, index) => {
                  const isSelected = selectedAvatar === avatar.id
                  
                  return (
                    <button
                      key={avatar.id}
                      onClick={() => handleAvatarSelect(avatar.id)}
                      className={`relative p-4 rounded-lg border-2 transition-all hover:scale-105 ${
                        isSelected 
                          ? 'border-blue-500 bg-blue-50' 
                          : 'border-gray-200 hover:border-gray-300'
                      }`}
                    >
                      <div className="flex flex-col items-center space-y-2">
                        <Avatar className="h-20 w-20">
                          <AvatarImage 
                            src={getAvatarUrl(avatar.id)} 
                            alt={avatar.name}
                            onError={() => handleImageError(avatar.id)}
                          />
                          <AvatarFallback className={avatar.color}>
                            <User className="h-10 w-10 text-white" />
                          </AvatarFallback>
                        </Avatar>
                        <span className="text-sm font-medium text-center">{avatar.name}</span>
                        <span className="text-xs text-gray-500">#{index + 1} - {avatar.id}</span>
                        {isSelected && (
                          <div className="absolute top-2 right-2">
                            <Check className="h-5 w-5 text-blue-500" />
                          </div>
                        )}
                      </div>
                    </button>
                  )
                })}
              </div>
            </ScrollArea>
          </DialogContent>
        </Dialog>
      </div>
    </div>
  )
}
