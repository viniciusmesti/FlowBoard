# Sistema de Avatares - FlowBoard

## Visão Geral

O FlowBoard agora possui um sistema de seleção de avatares para os usuários durante o cadastro. Os usuários podem escolher entre 5 avatares diferentes, cada um com uma imagem única e cor personalizada.

## Avatares Disponíveis

| ID | Nome | Cor |
|----|------|-----|
| `user` | Avatar Padrão | Azul |
| `user1` | Avatar 1 | Verde |
| `user2` | Avatar 2 | Roxo |
| `user3` | Avatar 3 | Laranja |
| `user4` | Avatar 4 | Teal |

## Como Funciona

### 1. Durante o Cadastro
- O usuário vê um campo "Foto de perfil" com um avatar padrão
- Clica em "Escolher Avatar" para abrir o modal de seleção
- Seleciona o avatar desejado
- O avatar é salvo junto com os dados do usuário

### 2. Fallback de Imagens
- Se a imagem do avatar não carregar, o sistema mostra um ícone de usuário colorido
- Cada avatar tem uma cor única para identificação visual

### 3. Avatar Padrão
- Se nenhum avatar for selecionado, o sistema usa `user` como padrão

## Implementação Técnica

### Frontend
- **Componente:** `AvatarSelector` - Modal de seleção de avatares
- **Configuração:** `src/lib/avatars.ts` - Lista de avatares disponíveis
- **Página:** `src/app/register/page.tsx` - Integração no formulário de cadastro

### Backend
- **DTO:** `CreateUserDto` - Campo `avatar` opcional
- **Entidade:** `User` - Campo `avatar` nullable
- **Serviço:** `UsersService` - Define avatar padrão se não fornecido

## Estrutura de Arquivos

```
frontend/
├── src/
│   ├── components/
│   │   └── avatar-selector.tsx      # Componente de seleção
│   ├── lib/
│   │   └── avatars.ts               # Configuração dos avatares
│   └── app/
│       └── register/
│           └── page.tsx             # Página de cadastro
└── public/
    └── avatars/                     # Imagens dos avatares
        ├── user.png                 # Avatar padrão
        ├── user1.png                # Avatar 1
        ├── user2.png                # Avatar 2
        ├── user3.png                # Avatar 3
        └── user4.png                # Avatar 4
```

## Uso

### No Componente AvatarSelector
```tsx
<AvatarSelector
  selectedAvatar={avatar}
  onAvatarSelect={setAvatar}
  label="Foto de perfil"
/>
```

### Para Obter Dados do Avatar
```tsx
import { getAvatarById, getAvatarUrl, getAvatarFallback } from "@/lib/avatars"

const avatarData = getAvatarById('user')
const avatarUrl = getAvatarUrl('user')
const fallback = getAvatarFallback('user')
```

## Personalização

### Adicionar Novos Avatares
1. Adicione a imagem do avatar na pasta `public/avatars/`
2. Adicione o novo avatar em `src/lib/avatars.ts`
3. Defina nome e cor
4. O sistema automaticamente detectará o novo avatar

### Modificar Cores
- As cores são classes do Tailwind CSS
- Exemplo: `bg-blue-500`, `bg-green-500`, etc.

## Notas Importantes

- **Compatibilidade:** Funciona com usuários existentes (avatar padrão)
- **Responsivo:** Modal se adapta a diferentes tamanhos de tela
- **Acessibilidade:** Labels e descrições para leitores de tela
- **Performance:** Imagens são carregadas sob demanda
- **Fallback:** Ícone de usuário colorido se a imagem não carregar

## Próximos Passos

- [x] Implementar seleção de avatares reais
- [ ] Permitir upload de avatares personalizados
- [ ] Implementar edição de avatar no perfil do usuário
- [ ] Adicionar animações de transição
- [ ] Otimizar tamanho das imagens para melhor performance
