# InteliFeed Hub - System Architecture Diagram

```mermaid
graph TD
    A[Restaurant Customer] --> B[Web Browser / Mobile App]
    C[Restaurant Staff] --> B
    D[Restaurant Manager] --> B
    
    B --> E[React Frontend]
    
    E --> F[Supabase Client]
    
    F --> G[Supabase Backend]
    
    G --> H[(PostgreSQL Database)]
    G --> I[Authentication Service]
    G --> J[Storage Service]
    G --> K[Realtime Service]
    G --> L[Edge Functions]
    
    E --> M[Capacitor]
    M --> N[Native Features]
    N --> O[Camera]
    N --> P[Geolocation]
    N --> Q[Haptics]
    N --> R[Push Notifications]
    
    E --> S[Vite PWA Plugin]
    S --> T[Service Worker]
    T --> U[Offline Cache]
    
    G --> V[Stripe API]
    G --> W[Email Service]
    
    subgraph "Frontend Layer"
        B
        E
        M
        S
    end
    
    subgraph "Native Mobile"
        N
        O
        P
        Q
        R
    end
    
    subgraph "PWA Features"
        T
        U
    end
    
    subgraph "Backend Layer"
        F
        G
        H
        I
        J
        K
        L
    end
    
    subgraph "External Services"
        V
        W
    end
    
    X[Monitoring] --> E
    X --> G
    
    Y[CI/CD Pipeline] --> E
    Y --> G
    
    subgraph "Operations"
        X
        Y
    end
```

This diagram shows the high-level architecture of the InteliFeed Hub platform, illustrating the relationships between different components and services.