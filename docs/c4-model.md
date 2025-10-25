# C4 Model Architecture Diagrams

The C4 model is a hierarchical way to describe software architecture, where each level provides a different perspective on the system.

## Level 1: System Context Diagram

```mermaid
graph TD
    A[Restaurant Manager] --> B[InteliFeed Hub]
    C[Restaurant Staff] --> B
    D[Restaurant Customer] --> B
    B --> E[Supabase Backend]
    B --> F[Stripe Payment]
    B --> G[Email Service]
    E --> H[PostgreSQL Database]
```

## Level 2: Container Diagram

```mermaid
graph TD
    A[Web Browser] --> B[React Frontend]
    B --> C[Supabase Client]
    C --> D[Supabase Backend]
    D --> E[PostgreSQL Database]
    D --> F[Auth Service]
    D --> G[Storage Service]
    D --> H[Realtime Service]
    B --> I[Stripe API]
    B --> J[Email Service]
    
    subgraph "Frontend"
        A
        B
    end
    
    subgraph "Backend"
        C
        D
        E
        F
        G
        H
    end
    
    subgraph "External Services"
        I
        J
    end
```

## Level 3: Component Diagram

```mermaid
graph TD
    A[React App] --> B[Auth Context]
    A --> C[Tenant Context]
    A --> D[Routing]
    A --> E[UI Components]
    A --> F[API Services]
    A --> G[State Management]
    
    B --> H[Supabase Auth]
    C --> I[Supabase Client]
    D --> J[React Router]
    E --> K[Shadcn UI]
    F --> L[Supabase Services]
    G --> M[Zustand]
    G --> N[React Query]
    
    L --> H
    L --> I
```

## Level 4: Code Diagram (Example Component)

```mermaid
graph TD
    A[DashboardLayout Component] --> B[Sidebar Component]
    A --> C[Header Component]
    A --> D[TenantSelector Component]
    A --> E[LocationSelector Component]
    A --> F[React Router Outlet]
    
    B --> G[Navigation Items]
    B --> H[User Profile]
    C --> I[Mobile Menu Toggle]
    C --> J[Notification Center]
    C --> K[User Menu]
```

## Key Architecture Patterns

### Multi-Tenant Architecture

The platform implements a single database, single schema multi-tenant architecture with row-level security (RLS) for data isolation:

```mermaid
graph TD
    A[Tenants] --> B[Locations]
    B --> C[Feedback]
    A --> D[Users]
    A --> E[Events]
    A --> F[Campaigns]
    A --> G[Segments]
```

### Data Flow Patterns

1. **Feedback Collection Flow**:
   ```mermaid
   graph LR
       A[Customer] --> B[Feedback Form]
       B --> C[Supabase Client]
       C --> D[Database]
       D --> E[Realtime Updates]
       E --> F[Dashboard]
   ```

2. **Analytics Processing Flow**:
   ```mermaid
   graph LR
       A[Feedback Data] --> B[Materialized Views]
       B --> C[Analytics Dashboard]
       A --> D[AI Insights Engine]
       D --> E[Insights Panel]
   ```

### Security Patterns

1. **Authentication Flow**:
   ```mermaid
   graph LR
       A[User] --> B[Login Form]
       B --> C[Supabase Auth]
       C --> D[JWT Token]
       D --> E[Protected Routes]
       E --> F[RLS Policies]
   ```

2. **Authorization Flow**:
   ```mermaid
   graph LR
       A[User Request] --> B[Auth Context]
       B --> C[Role Check]
       C --> D[Permission Check]
       D --> E[RLS Policy]
       E --> F[Database Access]
   ```