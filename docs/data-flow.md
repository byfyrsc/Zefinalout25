# InteliFeed Hub - Data Flow Diagram

```mermaid
graph TD
    A[Customer Feedback] --> B[Feedback Collection Interface]
    B --> C[Supabase Client]
    C --> D[Database Storage]
    D --> E[Real-time Updates]
    E --> F[Dashboard UI]
    D --> G[Analytics Processing]
    G --> H[Materialized Views]
    H --> I[Analytics Dashboard]
    D --> J[Notification Engine]
    J --> K[User Notifications]
    K --> L[Push Notifications]
    K --> M[Email Notifications]
    D --> N[AI Insights Engine]
    N --> O[Insights Panel]
    
    P[User Actions] --> Q[Auth Service]
    Q --> R[Session Management]
    R --> S[Protected Routes]
    S --> T[RLS Policies]
    T --> D
    
    U[Administrative Actions] --> V[Admin UI]
    V --> W[Supabase Client]
    W --> D
    
    X[Reporting] --> Y[Report Generator]
    Y --> D
    Y --> Z[Exported Reports]
    
    subgraph "Feedback Collection"
        A
        B
        C
    end
    
    subgraph "Data Storage"
        D
    end
    
    subgraph "Real-time Processing"
        E
        F
    end
    
    subgraph "Analytics Pipeline"
        G
        H
        I
    end
    
    subgraph "Notification System"
        J
        K
        L
        M
    end
    
    subgraph "AI Processing"
        N
        O
    end
    
    subgraph "Authentication & Authorization"
        P
        Q
        R
        S
        T
    end
    
    subgraph "Administration"
        U
        V
        W
    end
    
    subgraph "Reporting"
        X
        Y
        Z
    end
```

This diagram illustrates the main data flows within the InteliFeed Hub platform, showing how customer feedback moves through the system and how various components interact with the database.