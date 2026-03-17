---
sidebar_position: 5
---

# Frontend Lab & Contribuição

O Frontend do OmniDynamic foi construído como um laboratório de testes e dashboard administrativo.

## 🏛️ Arquitetura do Frontend
- **Framework:** Next.js 14 (App Router).
- **Estilização:** Tailwind CSS (Utilitários puros).
- **Gerenciamento de Estado:** React Server Components (RSC) para listagens e `useState/useEffect` para interações de CRUD.
- **Componentes:** Baseado em Design System customizado focado em densidade de informação (Dashboards).

## 🚀 Como Contribuir
1. **Estrutura de Pastas:**
   - `src/app`: Rotas e páginas.
   - `src/components`: UI Reutilizável (Button, Tooltip, Forms).
   - `src/lib`: Clientes de API, utilitários de formatação e instâncias do Supabase (Client-side).

2. **Chamadas de API:**
   - Concentre todas as chamadas no **Gateway (Porta 3000)**. Nunca chame os microserviços diretamente do navegador.

3. **Design Aesthetics:**
   - Priorize Dark Mode.
   - Use micro-animações (Framermotion opcional) para feedback de UX.
   - Siga a escala de cores definida no `tailwind.config.ts`.
