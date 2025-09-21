# Code Structure & Maintainability Prompt for Firebase Applications

## Modern Next.js 15 Architecture Patterns

When structuring code in this Firebase application, follow these well-architected patterns for maintainability and scalability. **For free tier optimization**, see `finops-free-tier-maximization.md` for development stack choices that maximize free services.

> 🆓 **Free-Tier Stack**: Next.js 15 + Firebase Hosting + Firebase Spark + GitHub (public repos) = $0/month development cost.

### Project Structure
```
src/
├── app/                          # Next.js 15 App Router
│   ├── (auth)/                   # Route groups
│   │   ├── login/
│   │   └── register/
│   ├── dashboard/
│   │   ├── page.tsx
│   │   ├── loading.tsx
│   │   └── error.tsx
│   ├── api/                      # API routes
│   │   ├── auth/
│   │   └── users/
│   ├── globals.css
│   ├── layout.tsx                # Root layout
│   └── page.tsx                  # Home page
├── components/                   # Reusable UI components
│   ├── ui/                       # Base UI components (shadcn/ui)
│   │   ├── button.tsx
│   │   ├── input.tsx
│   │   └── index.ts
│   ├── auth/                     # Authentication components
│   │   ├── login-form.tsx
│   │   └── auth-provider.tsx
│   ├── dashboard/                # Dashboard-specific components
│   └── layout/                   # Layout components
│       ├── header.tsx
│       └── sidebar.tsx
├── lib/                          # Core utilities and configurations
│   ├── firebase/                 # Firebase configuration
│   │   ├── config.ts
│   │   ├── auth.ts
│   │   ├── firestore.ts
│   │   └── storage.ts
│   ├── utils/                    # Utility functions
│   │   ├── cn.ts                 # Class name utility
│   │   ├── validators.ts         # Zod schemas
│   │   └── formatters.ts
│   ├── hooks/                    # Custom React hooks
│   │   ├── use-auth.ts
│   │   ├── use-firestore.ts
│   │   └── use-storage.ts
│   └── types/                    # TypeScript definitions
│       ├── auth.ts
│       ├── user.ts
│       └── database.ts
├── styles/                       # Additional styles
└── middleware.ts                 # Next.js middleware
```

### Component Architecture Principles

#### 1. Component Composition over Inheritance
```typescript
// ✅ Good: Composable components
interface CardProps {
  children: React.ReactNode;
  className?: string;
}

export function Card({ children, className }: CardProps) {
  return (
    <div className={cn("rounded-lg border bg-card text-card-foreground shadow-sm", className)}>
      {children}
    </div>
  );
}

export function CardHeader({ children, className }: CardProps) {
  return (
    <div className={cn("flex flex-col space-y-1.5 p-6", className)}>
      {children}
    </div>
  );
}

// Usage
<Card>
  <CardHeader>
    <h2>User Profile</h2>
  </CardHeader>
  <CardContent>...</CardContent>
</Card>
```

#### 2. Server and Client Component Separation
```typescript
// ✅ Server Component (default in app directory)
import { getUserProfile } from '@/lib/firebase/firestore';

export default async function ProfilePage({ params }: { params: { id: string } }) {
  const user = await getUserProfile(params.id);

  return (
    <div>
      <UserProfileHeader user={user} />
      <UserProfileClient userId={params.id} />
    </div>
  );
}

// ✅ Client Component (when needed)
'use client';

import { useAuth } from '@/lib/hooks/use-auth';

export function UserProfileClient({ userId }: { userId: string }) {
  const { user } = useAuth();
  // Client-side interactivity
}
```

#### 3. TypeScript-First Development
```typescript
// Define strict types for all data structures
export interface User {
  readonly id: string;
  email: string;
  displayName: string | null;
  photoURL: string | null;
  role: UserRole;
  createdAt: Timestamp;
  updatedAt: Timestamp;
}

export type UserRole = 'admin' | 'user' | 'moderator';

// Use branded types for IDs
export type UserId = string & { readonly brand: unique symbol };
export type PostId = string & { readonly brand: unique symbol };

// Zod schemas for runtime validation
export const CreateUserSchema = z.object({
  email: z.string().email(),
  displayName: z.string().min(1).max(50),
  role: z.enum(['admin', 'user', 'moderator']).default('user'),
});

export type CreateUserInput = z.infer<typeof CreateUserSchema>;
```

### State Management Patterns

#### 1. React Server Components + useState for Local State
```typescript
// ✅ Server-side data fetching
export default async function PostsPage() {
  const posts = await getPosts();

  return (
    <div>
      <PostsList initialPosts={posts} />
    </div>
  );
}

// ✅ Client-side state management
'use client';

export function PostsList({ initialPosts }: { initialPosts: Post[] }) {
  const [posts, setPosts] = useState(initialPosts);
  const [filter, setFilter] = useState('');

  // Local state management for UI
}
```

#### 2. Custom Hooks for Firebase Integration
```typescript
// ✅ Reusable Firebase hooks
export function useFirestoreDocument<T>(
  path: string,
  converter?: FirestoreDataConverter<T>
) {
  const [data, setData] = useState<T | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<Error | null>(null);

  useEffect(() => {
    const docRef = doc(db, path);
    const unsubscribe = onSnapshot(
      converter ? docRef.withConverter(converter) : docRef,
      (snapshot) => {
        if (snapshot.exists()) {
          setData(snapshot.data() as T);
        } else {
          setData(null);
        }
        setLoading(false);
      },
      (err) => {
        setError(err);
        setLoading(false);
      }
    );

    return unsubscribe;
  }, [path, converter]);

  return { data, loading, error };
}
```

### Error Handling & Loading States

#### 1. Error Boundaries
```typescript
'use client';

interface ErrorBoundaryProps {
  children: React.ReactNode;
  fallback?: React.ComponentType<{ error: Error; reset: () => void }>;
}

export function ErrorBoundary({ children, fallback: Fallback }: ErrorBoundaryProps) {
  return (
    <ErrorBoundaryComponent
      fallback={Fallback || DefaultErrorFallback}
    >
      {children}
    </ErrorBoundaryComponent>
  );
}

function DefaultErrorFallback({ error, reset }: { error: Error; reset: () => void }) {
  return (
    <div className="flex flex-col items-center justify-center p-6">
      <h2>Something went wrong</h2>
      <button onClick={reset}>Try again</button>
    </div>
  );
}
```

#### 2. Loading and Suspense Patterns
```typescript
// ✅ Using Next.js loading.tsx
export default function Loading() {
  return (
    <div className="flex items-center justify-center p-6">
      <Spinner />
    </div>
  );
}

// ✅ Suspense boundaries for data fetching
export default function PostsLayout({ children }: { children: React.ReactNode }) {
  return (
    <div>
      <Suspense fallback={<PostsLoading />}>
        {children}
      </Suspense>
    </div>
  );
}
```

### Code Quality Guidelines

#### 1. File and Function Naming
- Use kebab-case for files: `user-profile.tsx`, `auth-provider.tsx`
- Use PascalCase for components: `UserProfile`, `AuthProvider`
- Use camelCase for functions and variables: `getUserProfile`, `currentUser`
- Use SCREAMING_SNAKE_CASE for constants: `MAX_UPLOAD_SIZE`

#### 2. Function Design Principles
```typescript
// ✅ Pure functions when possible
export function formatDate(date: Date, locale = 'en-US'): string {
  return new Intl.DateTimeFormat(locale).format(date);
}

// ✅ Single responsibility principle
export async function createUser(userData: CreateUserInput): Promise<User> {
  const validatedData = CreateUserSchema.parse(userData);
  const userRef = doc(collection(db, 'users'));

  const user: User = {
    id: userRef.id,
    ...validatedData,
    createdAt: Timestamp.now(),
    updatedAt: Timestamp.now(),
  };

  await setDoc(userRef, user);
  return user;
}

// ✅ Error handling with Result pattern
export type Result<T, E = Error> =
  | { success: true; data: T }
  | { success: false; error: E };

export async function safeCreateUser(userData: CreateUserInput): Promise<Result<User>> {
  try {
    const user = await createUser(userData);
    return { success: true, data: user };
  } catch (error) {
    return { success: false, error: error as Error };
  }
}
```

#### 3. Import Organization
```typescript
// ✅ Organized imports
// 1. React and Next.js
import React from 'react';
import { redirect } from 'next/navigation';

// 2. Third-party libraries
import { z } from 'zod';
import { clsx } from 'clsx';

// 3. Internal utilities and configs
import { db } from '@/lib/firebase/config';
import { cn } from '@/lib/utils/cn';

// 4. Internal components and hooks
import { Button } from '@/components/ui/button';
import { useAuth } from '@/lib/hooks/use-auth';

// 5. Type imports last
import type { User } from '@/lib/types/user';
```

### Performance Optimization Patterns

#### 1. Code Splitting and Dynamic Imports
```typescript
// ✅ Dynamic imports for large components
const AdminPanel = dynamic(() => import('@/components/admin/admin-panel'), {
  loading: () => <AdminPanelSkeleton />,
  ssr: false,
});

// ✅ Conditional loading based on user role
export function Dashboard() {
  const { user } = useAuth();

  return (
    <div>
      {user?.role === 'admin' && <AdminPanel />}
    </div>
  );
}
```

#### 2. Memoization Patterns
```typescript
// ✅ Memo for expensive components
export const UserList = memo(function UserList({ users }: { users: User[] }) {
  return (
    <div>
      {users.map(user => (
        <UserCard key={user.id} user={user} />
      ))}
    </div>
  );
});

// ✅ useMemo for expensive calculations
export function UserStats({ users }: { users: User[] }) {
  const stats = useMemo(() => {
    return {
      total: users.length,
      active: users.filter(u => u.lastLoginAt > Date.now() - 30 * 24 * 60 * 60 * 1000).length,
      byRole: users.reduce((acc, user) => {
        acc[user.role] = (acc[user.role] || 0) + 1;
        return acc;
      }, {} as Record<UserRole, number>),
    };
  }, [users]);

  return <StatsDisplay stats={stats} />;
}
```

## Code Quality Checklist

### Before Commit
- [ ] All TypeScript errors resolved
- [ ] Components properly typed with interfaces
- [ ] Error boundaries implemented for risky operations
- [ ] Loading states handled appropriately
- [ ] Input validation implemented (both client and server)
- [ ] No console.log statements in production code
- [ ] Imports organized and unused imports removed
- [ ] Component and function names follow naming conventions

### Code Review Criteria
- [ ] Single responsibility principle followed
- [ ] DRY principle applied (no unnecessary duplication)
- [ ] Proper error handling implemented
- [ ] Performance considerations addressed
- [ ] Accessibility standards met (ARIA labels, keyboard navigation)
- [ ] Security best practices followed
- [ ] Code is self-documenting or has appropriate documentation

### Testing Considerations
- [ ] Unit tests for utility functions
- [ ] Integration tests for Firebase operations
- [ ] Component tests for complex UI logic
- [ ] E2E tests for critical user flows
- [ ] Security rule tests for Firestore

## Development Commands

```bash
# Type checking
npm run type-check

# Linting and formatting
npm run lint
npm run lint:fix
npm run format

# Testing
npm run test
npm run test:watch
npm run test:coverage

# Build verification
npm run build
npm run preview
```