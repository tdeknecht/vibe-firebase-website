# Feature Extensibility Prompt for Firebase Applications

## Plugin Architecture & Extensibility Patterns

When building extensible features in this Firebase application, follow these patterns to ensure modularity, maintainability, and future-proofing:

### Plugin System Architecture

#### 1. Core Plugin Interface
```typescript
// Define base plugin interface
export interface Plugin {
  readonly id: string;
  readonly name: string;
  readonly version: string;
  readonly dependencies?: string[];

  initialize(context: PluginContext): Promise<void>;
  destroy(): Promise<void>;
  getRoutes?(): PluginRoute[];
  getComponents?(): PluginComponent[];
  getHooks?(): PluginHook[];
}

export interface PluginContext {
  db: Firestore;
  auth: Auth;
  storage: Storage;
  logger: Logger;
  config: AppConfig;
}

export interface PluginRoute {
  path: string;
  component: React.ComponentType;
  guards?: string[];
}

export interface PluginComponent {
  name: string;
  component: React.ComponentType;
  props?: Record<string, any>;
}

export interface PluginHook {
  event: string;
  handler: (data: any) => Promise<any> | any;
  priority?: number;
}

// Example plugin implementation
export class UserProfilePlugin implements Plugin {
  readonly id = 'user-profile';
  readonly name = 'User Profile Management';
  readonly version = '1.0.0';
  readonly dependencies = ['auth'];

  private context!: PluginContext;

  async initialize(context: PluginContext): Promise<void> {
    this.context = context;

    // Register event listeners
    this.context.logger.info('User Profile Plugin initialized');
  }

  async destroy(): Promise<void> {
    // Cleanup resources
    this.context.logger.info('User Profile Plugin destroyed');
  }

  getRoutes(): PluginRoute[] {
    return [
      {
        path: '/profile',
        component: UserProfilePage,
        guards: ['authenticated'],
      },
      {
        path: '/profile/edit',
        component: EditProfilePage,
        guards: ['authenticated', 'profile-owner'],
      },
    ];
  }

  getComponents(): PluginComponent[] {
    return [
      {
        name: 'ProfileWidget',
        component: ProfileWidget,
      },
    ];
  }

  getHooks(): PluginHook[] {
    return [
      {
        event: 'user:created',
        handler: this.onUserCreated.bind(this),
        priority: 10,
      },
    ];
  }

  private async onUserCreated(userData: any): Promise<void> {
    // Create default profile
    await this.createDefaultProfile(userData);
  }
}
```

#### 2. Plugin Manager
```typescript
export class PluginManager {
  private plugins = new Map<string, Plugin>();
  private hooks = new Map<string, PluginHook[]>();
  private routes: PluginRoute[] = [];
  private components = new Map<string, PluginComponent>();

  constructor(private context: PluginContext) {}

  async registerPlugin(plugin: Plugin): Promise<void> {
    // Check dependencies
    if (plugin.dependencies) {
      for (const dep of plugin.dependencies) {
        if (!this.plugins.has(dep)) {
          throw new Error(`Plugin ${plugin.id} requires dependency ${dep}`);
        }
      }
    }

    try {
      await plugin.initialize(this.context);
      this.plugins.set(plugin.id, plugin);

      // Register routes
      const routes = plugin.getRoutes?.() ?? [];
      this.routes.push(...routes);

      // Register components
      const components = plugin.getComponents?.() ?? [];
      components.forEach(comp => {
        this.components.set(comp.name, comp);
      });

      // Register hooks
      const hooks = plugin.getHooks?.() ?? [];
      hooks.forEach(hook => {
        if (!this.hooks.has(hook.event)) {
          this.hooks.set(hook.event, []);
        }
        this.hooks.get(hook.event)!.push(hook);

        // Sort by priority
        this.hooks.get(hook.event)!.sort((a, b) => (b.priority ?? 0) - (a.priority ?? 0));
      });

      this.context.logger.info(`Plugin ${plugin.id} registered successfully`);
    } catch (error) {
      this.context.logger.error(`Failed to register plugin ${plugin.id}:`, error);
      throw error;
    }
  }

  async unregisterPlugin(pluginId: string): Promise<void> {
    const plugin = this.plugins.get(pluginId);
    if (!plugin) return;

    try {
      await plugin.destroy();
      this.plugins.delete(pluginId);

      // Remove routes, components, and hooks
      this.routes = this.routes.filter(route => !route.path.includes(pluginId));

      // Remove components
      plugin.getComponents?.().forEach(comp => {
        this.components.delete(comp.name);
      });

      // Remove hooks
      plugin.getHooks?.().forEach(hook => {
        const eventHooks = this.hooks.get(hook.event);
        if (eventHooks) {
          const index = eventHooks.findIndex(h => h === hook);
          if (index !== -1) {
            eventHooks.splice(index, 1);
          }
        }
      });

      this.context.logger.info(`Plugin ${pluginId} unregistered successfully`);
    } catch (error) {
      this.context.logger.error(`Failed to unregister plugin ${pluginId}:`, error);
      throw error;
    }
  }

  async executeHook(event: string, data: any): Promise<any> {
    const hooks = this.hooks.get(event) ?? [];
    let result = data;

    for (const hook of hooks) {
      try {
        result = await hook.handler(result);
      } catch (error) {
        this.context.logger.error(`Hook ${event} failed:`, error);
        // Continue with other hooks
      }
    }

    return result;
  }

  getRoutes(): PluginRoute[] {
    return [...this.routes];
  }

  getComponent(name: string): PluginComponent | undefined {
    return this.components.get(name);
  }

  getPlugins(): Plugin[] {
    return Array.from(this.plugins.values());
  }
}
```

### Feature Flag System

#### 1. Feature Flag Implementation
```typescript
export interface FeatureFlag {
  id: string;
  name: string;
  description: string;
  enabled: boolean;
  rolloutPercentage: number;
  userGroups?: string[];
  startDate?: Date;
  endDate?: Date;
  conditions?: FeatureCondition[];
}

export interface FeatureCondition {
  type: 'user_role' | 'user_attribute' | 'random' | 'custom';
  operator: 'equals' | 'not_equals' | 'contains' | 'greater_than' | 'less_than';
  value: any;
  attribute?: string;
}

export class FeatureFlagManager {
  private flags = new Map<string, FeatureFlag>();
  private userContext: UserContext | null = null;

  constructor(private db: Firestore) {}

  async initialize(): Promise<void> {
    // Load feature flags from Firestore
    const flagsSnapshot = await getDocs(collection(this.db, 'featureFlags'));

    flagsSnapshot.forEach(doc => {
      const flag = doc.data() as FeatureFlag;
      this.flags.set(flag.id, flag);
    });

    // Set up real-time updates
    onSnapshot(collection(this.db, 'featureFlags'), (snapshot) => {
      snapshot.docChanges().forEach(change => {
        const flag = change.doc.data() as FeatureFlag;

        if (change.type === 'added' || change.type === 'modified') {
          this.flags.set(flag.id, flag);
        } else if (change.type === 'removed') {
          this.flags.delete(flag.id);
        }
      });
    });
  }

  setUserContext(user: UserContext): void {
    this.userContext = user;
  }

  isEnabled(flagId: string): boolean {
    const flag = this.flags.get(flagId);
    if (!flag) return false;

    // Check if flag is globally enabled
    if (!flag.enabled) return false;

    // Check date range
    if (flag.startDate && new Date() < flag.startDate) return false;
    if (flag.endDate && new Date() > flag.endDate) return false;

    // Check user context
    if (!this.userContext) return false;

    // Check user groups
    if (flag.userGroups && flag.userGroups.length > 0) {
      if (!flag.userGroups.some(group => this.userContext!.groups.includes(group))) {
        return false;
      }
    }

    // Check conditions
    if (flag.conditions) {
      if (!this.evaluateConditions(flag.conditions)) {
        return false;
      }
    }

    // Check rollout percentage
    if (flag.rolloutPercentage < 100) {
      const hash = this.hashUserId(this.userContext.id + flagId);
      return (hash % 100) < flag.rolloutPercentage;
    }

    return true;
  }

  private evaluateConditions(conditions: FeatureCondition[]): boolean {
    return conditions.every(condition => this.evaluateCondition(condition));
  }

  private evaluateCondition(condition: FeatureCondition): boolean {
    if (!this.userContext) return false;

    let actual: any;

    switch (condition.type) {
      case 'user_role':
        actual = this.userContext.role;
        break;
      case 'user_attribute':
        actual = this.userContext.attributes[condition.attribute!];
        break;
      case 'random':
        actual = Math.random();
        break;
      case 'custom':
        // Implement custom condition logic
        return this.evaluateCustomCondition(condition);
      default:
        return false;
    }

    switch (condition.operator) {
      case 'equals':
        return actual === condition.value;
      case 'not_equals':
        return actual !== condition.value;
      case 'contains':
        return Array.isArray(actual) ? actual.includes(condition.value) :
               typeof actual === 'string' ? actual.includes(condition.value) : false;
      case 'greater_than':
        return actual > condition.value;
      case 'less_than':
        return actual < condition.value;
      default:
        return false;
    }
  }

  private hashUserId(input: string): number {
    let hash = 0;
    for (let i = 0; i < input.length; i++) {
      const char = input.charCodeAt(i);
      hash = ((hash << 5) - hash) + char;
      hash = hash & hash; // Convert to 32-bit integer
    }
    return Math.abs(hash);
  }
}

// React hook for feature flags
export function useFeatureFlag(flagId: string): boolean {
  const [enabled, setEnabled] = useState(false);
  const featureFlagManager = useContext(FeatureFlagContext);

  useEffect(() => {
    setEnabled(featureFlagManager.isEnabled(flagId));

    // Subscribe to flag changes
    const unsubscribe = featureFlagManager.onFlagChange(flagId, setEnabled);
    return unsubscribe;
  }, [flagId, featureFlagManager]);

  return enabled;
}

// Usage in components
export function ExperimentalFeature() {
  const isEnabled = useFeatureFlag('experimental-ui');

  if (!isEnabled) {
    return <div>Feature not available</div>;
  }

  return <NewUIComponent />;
}
```

### API Design for Extensibility

#### 1. Versioned API Design
```typescript
// API versioning strategy
export abstract class BaseAPIVersion {
  abstract readonly version: string;
  abstract readonly routes: APIRoute[];

  protected createResponse<T>(data: T, meta?: any): APIResponse<T> {
    return {
      data,
      meta: {
        version: this.version,
        timestamp: new Date().toISOString(),
        ...meta,
      },
    };
  }
}

export class APIv1 extends BaseAPIVersion {
  readonly version = 'v1';
  readonly routes: APIRoute[] = [
    {
      path: '/users',
      method: 'GET',
      handler: this.getUsers.bind(this),
    },
    {
      path: '/users/:id',
      method: 'GET',
      handler: this.getUser.bind(this),
    },
  ];

  async getUsers(req: APIRequest): Promise<APIResponse<User[]>> {
    const users = await getUsersFromDatabase();
    return this.createResponse(users, {
      total: users.length,
      page: 1,
    });
  }

  async getUser(req: APIRequest): Promise<APIResponse<User>> {
    const user = await getUserById(req.params.id);
    return this.createResponse(user);
  }
}

export class APIv2 extends BaseAPIVersion {
  readonly version = 'v2';
  readonly routes: APIRoute[] = [
    {
      path: '/users',
      method: 'GET',
      handler: this.getUsers.bind(this),
    },
    {
      path: '/users/:id',
      method: 'GET',
      handler: this.getUser.bind(this),
    },
    {
      path: '/users/:id/profile',
      method: 'GET',
      handler: this.getUserProfile.bind(this),
    },
  ];

  async getUsers(req: APIRequest): Promise<APIResponse<UserV2[]>> {
    const users = await getUsersFromDatabase();
    // Transform to v2 format
    const v2Users = users.map(user => this.transformUserToV2(user));

    return this.createResponse(v2Users, {
      total: users.length,
      page: req.query.page || 1,
      limit: req.query.limit || 10,
    });
  }

  private transformUserToV2(user: User): UserV2 {
    return {
      ...user,
      profile: {
        displayName: user.displayName,
        avatar: user.photoURL,
      },
      timestamps: {
        createdAt: user.createdAt,
        updatedAt: user.updatedAt,
      },
    };
  }
}

// API Router with versioning
export class APIRouter {
  private versions = new Map<string, BaseAPIVersion>();

  registerVersion(version: BaseAPIVersion): void {
    this.versions.set(version.version, version);
  }

  async handleRequest(req: APIRequest): Promise<APIResponse<any>> {
    const version = req.headers['api-version'] || 'v1';
    const apiVersion = this.versions.get(version);

    if (!apiVersion) {
      throw new Error(`API version ${version} not supported`);
    }

    const route = apiVersion.routes.find(r =>
      r.path === req.path && r.method === req.method
    );

    if (!route) {
      throw new Error(`Route ${req.method} ${req.path} not found in API ${version}`);
    }

    return route.handler(req);
  }
}
```

#### 2. Extensible Data Schemas
```typescript
// Base schema with extension points
export interface BaseDocument {
  id: string;
  createdAt: Timestamp;
  updatedAt: Timestamp;
  version: number;
  extensions?: Record<string, any>;
}

export interface User extends BaseDocument {
  email: string;
  displayName: string;
  role: UserRole;
  profile: UserProfile;
}

// Plugin can extend user with additional data
export interface UserProfile {
  avatar?: string;
  bio?: string;
  preferences: Record<string, any>;
  // Plugin extension point
  pluginData?: Record<string, any>;
}

// Schema validation with extensions
export const BaseDocumentSchema = z.object({
  id: z.string(),
  createdAt: z.custom<Timestamp>(),
  updatedAt: z.custom<Timestamp>(),
  version: z.number(),
  extensions: z.record(z.any()).optional(),
});

export const UserSchema = BaseDocumentSchema.extend({
  email: z.string().email(),
  displayName: z.string().min(1).max(50),
  role: z.enum(['admin', 'user', 'moderator']),
  profile: z.object({
    avatar: z.string().url().optional(),
    bio: z.string().max(500).optional(),
    preferences: z.record(z.any()),
    pluginData: z.record(z.any()).optional(),
  }),
});

// Extension registry for schema validation
export class SchemaExtensionRegistry {
  private extensions = new Map<string, z.ZodSchema>();

  registerExtension(name: string, schema: z.ZodSchema): void {
    this.extensions.set(name, schema);
  }

  getExtendedSchema(baseSchema: z.ZodSchema, extensionNames: string[]): z.ZodSchema {
    let extended = baseSchema;

    for (const name of extensionNames) {
      const extension = this.extensions.get(name);
      if (extension) {
        extended = extended.and(extension);
      }
    }

    return extended;
  }
}
```

### Component Composition Patterns

#### 1. Composable UI Components
```typescript
// Base composable component interfaces
export interface ComposableComponent {
  render(): React.ReactElement;
  getProps(): Record<string, any>;
  getChildren(): ComposableComponent[];
}

export interface ComponentSlot {
  name: string;
  component?: React.ComponentType;
  props?: Record<string, any>;
  fallback?: React.ComponentType;
}

// Dashboard composition system
export class DashboardComposer {
  private widgets = new Map<string, ComponentSlot>();
  private layout: DashboardLayout = { rows: [] };

  registerWidget(name: string, slot: ComponentSlot): void {
    this.widgets.set(name, slot);
  }

  setLayout(layout: DashboardLayout): void {
    this.layout = layout;
  }

  renderDashboard(): React.ReactElement {
    return (
      <div className="dashboard">
        {this.layout.rows.map((row, rowIndex) => (
          <div key={rowIndex} className="dashboard-row">
            {row.columns.map((col, colIndex) => {
              const widget = this.widgets.get(col.widget);
              const Component = widget?.component || widget?.fallback;

              return (
                <div key={colIndex} className={`dashboard-column ${col.size}`}>
                  {Component && <Component {...(widget?.props || {})} />}
                </div>
              );
            })}
          </div>
        ))}
      </div>
    );
  }
}

// Usage in plugins
export class AnalyticsPlugin implements Plugin {
  // ... plugin implementation

  getComponents(): PluginComponent[] {
    return [
      {
        name: 'AnalyticsWidget',
        component: AnalyticsWidget,
        props: {
          title: 'User Analytics',
          refreshInterval: 30000,
        },
      },
    ];
  }
}

// Register with dashboard
const dashboardComposer = new DashboardComposer();
dashboardComposer.registerWidget('analytics', {
  name: 'analytics',
  component: AnalyticsWidget,
  props: { timeRange: '7d' },
});
```

#### 2. Event-Driven Architecture
```typescript
// Event system for loose coupling
export interface AppEvent {
  type: string;
  payload: any;
  timestamp: Date;
  source: string;
}

export class EventBus {
  private listeners = new Map<string, Array<(event: AppEvent) => void>>();

  subscribe(eventType: string, handler: (event: AppEvent) => void): () => void {
    if (!this.listeners.has(eventType)) {
      this.listeners.set(eventType, []);
    }

    this.listeners.get(eventType)!.push(handler);

    // Return unsubscribe function
    return () => {
      const handlers = this.listeners.get(eventType);
      if (handlers) {
        const index = handlers.indexOf(handler);
        if (index !== -1) {
          handlers.splice(index, 1);
        }
      }
    };
  }

  emit(type: string, payload: any, source = 'unknown'): void {
    const event: AppEvent = {
      type,
      payload,
      timestamp: new Date(),
      source,
    };

    const handlers = this.listeners.get(type) || [];
    handlers.forEach(handler => {
      try {
        handler(event);
      } catch (error) {
        console.error(`Error in event handler for ${type}:`, error);
      }
    });
  }

  // Async event handling
  async emitAsync(type: string, payload: any, source = 'unknown'): Promise<any[]> {
    const event: AppEvent = {
      type,
      payload,
      timestamp: new Date(),
      source,
    };

    const handlers = this.listeners.get(type) || [];
    const results = await Promise.allSettled(
      handlers.map(handler => Promise.resolve(handler(event)))
    );

    return results.map(result =>
      result.status === 'fulfilled' ? result.value : result.reason
    );
  }
}

// Usage in application
export function useEventBus() {
  const eventBus = useContext(EventBusContext);

  const emit = useCallback((type: string, payload: any) => {
    eventBus.emit(type, payload, 'react-component');
  }, [eventBus]);

  const subscribe = useCallback((type: string, handler: (event: AppEvent) => void) => {
    return eventBus.subscribe(type, handler);
  }, [eventBus]);

  return { emit, subscribe };
}

// Example usage in components
export function UserProfile() {
  const { emit } = useEventBus();

  const handleProfileUpdate = async (userData: any) => {
    await updateUserProfile(userData);
    emit('user:profile:updated', { userId: userData.id, changes: userData });
  };

  return <ProfileForm onSubmit={handleProfileUpdate} />;
}

export function NotificationSystem() {
  const { subscribe } = useEventBus();

  useEffect(() => {
    const unsubscribe = subscribe('user:profile:updated', (event) => {
      showNotification(`Profile updated for user ${event.payload.userId}`);
    });

    return unsubscribe;
  }, [subscribe]);

  return <NotificationContainer />;
}
```

## Extensibility Checklist

### Architecture Design
- [ ] Plugin system implemented with clear interfaces
- [ ] Event-driven architecture for loose coupling
- [ ] Feature flag system for gradual rollouts
- [ ] API versioning strategy in place
- [ ] Component composition patterns established
- [ ] Extension points documented

### Code Organization
- [ ] Clear separation between core and plugin code
- [ ] Dependency injection patterns used
- [ ] Configuration-driven feature enablement
- [ ] Schema extension points defined
- [ ] Documentation for plugin developers

### Future-Proofing
- [ ] Backward compatibility considerations
- [ ] Migration strategies for breaking changes
- [ ] Performance monitoring for plugins
- [ ] Security boundaries between core and plugins
- [ ] Testing strategies for extensible features

## Development Commands

```bash
# Plugin development
npm run plugin:create [plugin-name]
npm run plugin:build [plugin-name]
npm run plugin:test [plugin-name]

# Feature flag management
npm run flags:list
npm run flags:enable [flag-name]
npm run flags:disable [flag-name]

# API versioning
npm run api:generate-docs
npm run api:test-compatibility

# Extension validation
npm run validate:plugins
npm run validate:schemas
```