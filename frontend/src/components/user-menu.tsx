"use client";
import { useAuth } from "@/contexts/AuthContext";
import Link from "next/link";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { getAvatarFallback, getAvatarUrl } from "@/lib/avatars";
import { User } from "lucide-react";

export function UserMenu() {
  const { user, logout } = useAuth();

  if (user) {
    const avatarFallback = getAvatarFallback(user.avatar || 'user');

    return (
      <div className="flex items-center gap-3">
        <Avatar>
          <AvatarImage src={getAvatarUrl(user.avatar || 'user')} alt={user.name} />
          <AvatarFallback className={avatarFallback.color}>
            <User className="h-5 w-5 text-white" />
          </AvatarFallback>
        </Avatar>
        <span className="font-medium text-gray-800">{user.name}</span>
        <button onClick={logout} className="px-3 py-1 rounded bg-gray-200 hover:bg-gray-300 text-sm">Sair</button>
      </div>
    );
  }
  return (
    <Link href="/login">
      <button className="px-3 py-1 rounded bg-blue-600 hover:bg-blue-700 text-white text-sm">Entrar</button>
    </Link>
  );
} 