"use client"

import { useState } from "react"
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

  const selectedAvatarData = getAvatarById(selectedAvatar)
  const avatarFallback = getAvatarFallback(selectedAvatar)

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
              Escolher Avatar ({availableAvatars.length} opções)
            </Button>
          </DialogTrigger>
          <DialogContent className="max-w-md">
            <DialogHeader>
              <DialogTitle>Selecione seu Avatar ({availableAvatars.length} disponíveis)</DialogTitle>
            </DialogHeader>
            
            <ScrollArea className="h-96">
              <div className="grid grid-cols-2 gap-4 p-4 pb-6">
                {availableAvatars.map((avatar, index) => {
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
                        <div className="h-20 w-20 rounded-full overflow-hidden border-2 border-gray-200">
                          <img 
                            src={getAvatarUrl(avatar.id)} 
                            alt={avatar.name}
                            className="w-full h-full object-cover"
                          />
                        </div>
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
