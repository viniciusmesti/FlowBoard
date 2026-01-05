"use client"

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { getAvatarUrl } from "@/lib/avatars"
import type { System } from "@/types"
import { useRouter } from "next/navigation"
import { Calendar } from "lucide-react"

interface SystemCardProps {
  system: System
}

export function SystemCard({ system }: SystemCardProps) {
  const router = useRouter()

  const handleClick = () => {
    router.push(`/dashboard/${system.id}`)
  }

  return (
    <Card
      className="cursor-pointer hover:shadow-lg transition-shadow overflow-hidden"
      onClick={handleClick}
    >
      <CardHeader className={`${system.color} text-white pb-3`}>
        <div className="flex items-start justify-between">
          <div className="flex-1">
            <CardTitle className="text-lg mb-2 text-white">{system.name}</CardTitle>
            {system.description && (
              <CardDescription className="line-clamp-2 text-white/90">
                {system.description}
              </CardDescription>
            )}
          </div>
        </div>
      </CardHeader>
      <CardContent>
        <div className="space-y-3">
          {system.requirementTypes && system.requirementTypes.length > 0 && (
            <div className="flex flex-wrap gap-1">
              {system.requirementTypes.slice(0, 4).map((type, idx) => (
                <Badge key={idx} variant="secondary" className="text-xs">
                  {type}
                </Badge>
              ))}
              {system.requirementTypes.length > 4 && (
                <Badge variant="secondary" className="text-xs">
                  +{system.requirementTypes.length - 4}
                </Badge>
              )}
            </div>
          )}

          <div className="flex items-center justify-between pt-2 border-t">
            <div className="flex items-center gap-2">
              <Avatar className="w-6 h-6">
                {system.owner?.avatar ? (
                  <AvatarImage
                    src={getAvatarUrl(system.owner.avatar)}
                    alt={system.owner.name}
                  />
                ) : null}
                <AvatarFallback className="text-xs">
                  {system.owner?.name?.[0] || "?"}
                </AvatarFallback>
              </Avatar>
              <span className="text-xs text-gray-600">{system.owner?.name}</span>
            </div>
            <div className="flex items-center gap-1 text-xs text-gray-500">
              <Calendar className="w-3 h-3" />
              {new Date(system.createdAt).toLocaleDateString("pt-BR")}
            </div>
          </div>

          {system.requirements && system.requirements.length > 0 && (
            <div className="text-xs text-gray-500 pt-1">
              {system.requirements.length} requisito
              {system.requirements.length !== 1 ? "s" : ""}
            </div>
          )}
        </div>
      </CardContent>
    </Card>
  )
}

