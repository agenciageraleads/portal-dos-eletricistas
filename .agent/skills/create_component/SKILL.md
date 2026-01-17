---
name: create_component
description: Create a new React/Next.js component following the project's design system and standards.
---

# Create Component Skill

Use this skill when the user asks to create a new UI component.

## 1. Standards & Stack

- **Framework**: React 19 (Server Components by default, use `'use client'` if interactivity is needed).
- **Styling**: Tailwind CSS v4 (Class-based).
- **Icons**: `lucide-react` (e.g., `import { User } from 'lucide-react'`).
- **Language**: TypeScript (`.tsx`).

## 2. Component Structure

### File Location
- Default: `apps/web/app/components/`
- Feature-specific: `apps/web/app/(routes)/[feature]/components/`

### Template

```tsx
// If hooks (useState, useEffect) or event handlers are needed:
// 'use client'; 

import { clsx, type ClassValue } from 'clsx';
import { twMerge } from 'tailwind-merge';
import { IconName } from 'lucide-react'; // Example icon import

// Utility for cleaner execution (can be imported from @/lib/utils if available, else inline)
function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

interface ComponentNameProps {
  className?: string;
  variant?: 'primary' | 'secondary';
  // Add other props here
}

export function ComponentName({ 
  className, 
  variant = 'primary', 
  ...props 
}: ComponentNameProps) {
  return (
    <div 
      className={cn(
        "flex items-center gap-2 p-4 rounded-xl transition-all",
        variant === 'primary' ? "bg-blue-600 text-white" : "bg-gray-100 text-gray-900",
        className
      )}
      {...props}
    >
      {/* Component Content */}
      <span className="font-semibold">Component Content</span>
    </div>
  );
}
```

## 3. Checklist for Agent

1. [ ] **Verify Path**: Check if the file already exists to avoid accidental overwrites (unless requested).
2. [ ] **Imports**: Ensure `lucide-react` icons are imported correctly.
3. [ ] **Typing**: Always define an interface for props.
4. [ ] **Responsiveness**: Use standard Tailwind breakpoints (`md:`, `lg:`) if the component layout changes.
5. [ ] **Export**: Use named exports (`export function`).

## 4. Usage Example

**User:** "Crie um card de estatística simples."

**Agent Action:**
1. Create `apps/web/app/components/StatsCard.tsx`.
2. Implement using the template above.
3. Add proper props for `title`, `value`, `icon`, and `trend`.
