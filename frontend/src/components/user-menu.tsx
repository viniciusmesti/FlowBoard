"use client";
import { useAuth } from "@/contexts/AuthContext";
import Link from "next/link";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";

export function UserMenu() {
  const { user, logout } = useAuth();

  if (user) {
    return (
      <div className="flex items-center gap-3">
        <Avatar>
          {user.avatar ? (
            <AvatarImage src={user.avatar} alt={user.name} />
          ) : (
            <AvatarFallback>{user.name.slice(0, 2).toUpperCase()}</AvatarFallback>
          )}
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