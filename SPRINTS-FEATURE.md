# Feature: Gestão de Sprints nos Requisitos

## Visão Geral

Foi adicionada a funcionalidade de **gestão de sprints** ao sistema, permitindo que cada requisito tenha informações sobre:
- **Sprint Atual**: O sprint em que o requisito está sendo trabalhado
- **Último Sprint Concluído**: O último sprint em que o requisito foi concluído

Isso proporciona uma melhor experiência para acompanhar o progresso dos requisitos através dos ciclos de desenvolvimento.

## Alterações no Backend

### 1. Entidade Requirement
**Arquivo:** `backend/src/requirements/entities/requirement.entity.ts`

Novos campos adicionados:
```typescript
@Column({ nullable: true })
currentSprint?: string; // Sprint atual em que o requisito está sendo trabalhado

@Column({ nullable: true })
lastCompletedSprint?: string; // Último sprint em que o requisito foi concluído
```

### 2. DTOs
**Arquivo:** `backend/src/requirements/dto/create-requirement.dto.ts`

```typescript
@IsString()
@IsOptional()
currentSprint?: string;

@IsString()
@IsOptional()
lastCompletedSprint?: string;
```

O `UpdateRequirementDto` herda automaticamente esses campos.

### 3. Migration
**Arquivo:** `backend/src/migrations/003-add-sprint-fields.ts`

Nova migration criada para adicionar as colunas ao banco de dados:
- `currentSprint` (varchar, nullable)
- `lastCompletedSprint` (varchar, nullable)

**Para aplicar a migration:**
```bash
cd backend
npm run migration:run
```

## Alterações no Frontend

### 1. Tipos TypeScript
**Arquivo:** `frontend/src/types/index.ts`

Interface `Requirement` atualizada:
```typescript
export interface Requirement {
  // ... campos existentes
  currentSprint?: string
  lastCompletedSprint?: string
  // ...
}
```

### 2. UI - Visualização de Sprints

#### Dashboard Principal (`frontend/src/app/page.tsx`)
Cada card de requisito agora mostra os sprints:
- Badge azul para o **Sprint Atual**
- Badge verde para o **Último Sprint Concluído**

```tsx
{(requirement.currentSprint || requirement.lastCompletedSprint) && (
  <div className="flex items-center gap-2 mt-3 pt-3 border-t">
    {requirement.currentSprint && (
      <Badge variant="outline" className="text-xs bg-blue-50 text-blue-700 border-blue-200">
        Sprint Atual: {requirement.currentSprint}
      </Badge>
    )}
    {requirement.lastCompletedSprint && (
      <Badge variant="outline" className="text-xs bg-green-50 text-green-700 border-green-200">
        Último Sprint: {requirement.lastCompletedSprint}
      </Badge>
    )}
  </div>
)}
```

#### Página de Arquivados (`frontend/src/app/archived/page.tsx`)
Requisitos concluídos mostram o sprint em que foram finalizados:

```tsx
{requirement.lastCompletedSprint && (
  <div className="flex items-center gap-2">
    <Badge variant="outline" className="text-xs bg-green-50 text-green-700 border-green-200">
      Sprint: {requirement.lastCompletedSprint}
    </Badge>
  </div>
)}
```

#### Página de Detalhes (`frontend/src/app/requirement/[id]/page.tsx`)
Na página de detalhes do requisito, os sprints aparecem logo abaixo do título:

```tsx
{(requirement.currentSprint || requirement.lastCompletedSprint) && (
  <div className="flex items-center gap-2 mb-3">
    {requirement.currentSprint && (
      <Badge variant="outline" className="text-xs bg-blue-50 text-blue-700 border-blue-200">
        Sprint Atual: {requirement.currentSprint}
      </Badge>
    )}
    {requirement.lastCompletedSprint && (
      <Badge variant="outline" className="text-xs bg-green-50 text-green-700 border-green-200">
        Último Sprint: {requirement.lastCompletedSprint}
      </Badge>
    )}
  </div>
)}
```

### 3. UI - Edição de Sprints

#### Modal de Detalhes (`frontend/src/components/requirement-detail-modal.tsx`)
Ao clicar em "Editar" no modal de detalhes do requisito, é possível editar:

- **Sprint Atual**: Campo de texto livre
- **Último Sprint Concluído**: Campo de texto livre

Exemplos de formatos aceitos:
- "Sprint 5"
- "Sprint 12 - Q4 2024"
- "Release 2.5"
- "Outubro 2024"
- Qualquer texto descritivo

```tsx
<Label className="mt-4">Sprint Atual</Label>
{editing ? (
  <Input 
    type="text" 
    placeholder="Ex: Sprint 5, Q4 2024, etc."
    value={form.currentSprint} 
    onChange={(e) => setForm({ ...form, currentSprint: e.target.value })} 
  />
) : (
  <p className="text-sm text-gray-700">
    {requirement.currentSprint || '—'}
  </p>
)}
```

## Como Usar

### 1. Adicionar Sprint a um Requisito

#### Via Dashboard:
1. Clique no requisito para abrir o modal de detalhes
2. Clique no botão "Editar"
3. Preencha os campos "Sprint Atual" e/ou "Último Sprint Concluído"
4. Clique em "Salvar"

#### Via API (Criação):
```bash
POST /requirements
{
  "title": "Nova Feature",
  "description": "Descrição",
  "color": "bg-blue-500",
  "currentSprint": "Sprint 8",
  "lastCompletedSprint": "Sprint 7"
}
```

#### Via API (Atualização):
```bash
PATCH /requirements/:id
{
  "currentSprint": "Sprint 9",
  "lastCompletedSprint": "Sprint 8"
}
```

### 2. Visualizar Sprints

- **Dashboard**: Sprints aparecem em cada card de requisito
- **Página de Detalhes**: Sprints aparecem abaixo do título
- **Arquivados**: Último sprint concluído aparece nos requisitos finalizados

## Fluxo de Trabalho Recomendado

### Planejamento de Sprint
1. No início do sprint, defina o `currentSprint` para os requisitos que serão trabalhados
   - Exemplo: "Sprint 10 - Nov 2024"

### Durante o Sprint
2. Os requisitos mostram em qual sprint estão sendo trabalhados
3. A equipe pode filtrar visualmente por sprint nos cards

### Ao Finalizar o Sprint
3. Quando um requisito é concluído:
   - Mova o valor de `currentSprint` para `lastCompletedSprint`
   - Limpe o `currentSprint` ou defina para o próximo sprint
   - Marque o requisito como "completed"

### Retrospectiva
4. Na página de arquivados, visualize todos os requisitos concluídos e seus sprints
5. Analise a produtividade por sprint

## Exemplos de Nomenclatura de Sprints

Sugestões de formatos para sprints:

### Numérico Simples
- "Sprint 1"
- "Sprint 2"
- "Sprint 3"

### Com Data
- "Sprint 5 - Out 2024"
- "Sprint 12 - Nov/Dez 2024"

### Por Trimestre
- "Q4 2024 - Sprint 1"
- "Q1 2025 - Sprint 3"

### Por Release
- "Release 1.0 - Sprint 1"
- "Release 2.0 - Sprint 5"

### Temático
- "Sprint MVP"
- "Sprint Launch"
- "Sprint Beta"

## Benefícios

✅ **Rastreabilidade**: Saiba em qual sprint cada requisito foi trabalhado
✅ **Planejamento**: Organize requisitos por sprint visualmente
✅ **Histórico**: Mantenha registro dos sprints concluídos
✅ **Métricas**: Analise produtividade e velocidade por sprint
✅ **Flexibilidade**: Formato livre permite diferentes metodologias
✅ **Transparência**: Toda equipe vê o status dos sprints

## Próximos Passos (Opcional)

Possíveis melhorias futuras:
- [ ] Filtro por sprint no dashboard
- [ ] Relatório de produtividade por sprint
- [ ] Timeline de sprints
- [ ] Gráfico de burndown por sprint
- [ ] Planejamento de sprint integrado
- [ ] Auto-incremento de sprints

## Migração de Dados

Para projetos existentes, os campos são opcionais (`nullable: true`), então:
- Requisitos antigos funcionam normalmente
- Não é necessário preencher retroativamente
- Comece a usar a partir de agora

## Suporte

Para dúvidas ou problemas:
1. Verifique se a migration foi executada: `npm run migration:run`
2. Reinicie o backend após a migration
3. Limpe o cache do navegador
4. Verifique os logs do backend para erros

## Código-Fonte

**Backend:**
- `backend/src/requirements/entities/requirement.entity.ts`
- `backend/src/requirements/dto/create-requirement.dto.ts`
- `backend/src/migrations/003-add-sprint-fields.ts`

**Frontend:**
- `frontend/src/types/index.ts`
- `frontend/src/app/page.tsx`
- `frontend/src/app/archived/page.tsx`
- `frontend/src/app/requirement/[id]/page.tsx`
- `frontend/src/components/requirement-detail-modal.tsx`


