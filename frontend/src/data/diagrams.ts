export const diagrams = {
  systemArchitecture: `graph TB
  classDef frontend fill:#0891B2,stroke:#0E7490,color:#FFFFFF
  classDef backend fill:#059669,stroke:#047857,color:#FFFFFF
  classDef database fill:#7C3AED,stroke:#6D28D9,color:#FFFFFF
  classDef external fill:#F59E0B,stroke:#D97706,color:#FFFFFF
  classDef user fill:#6B7280,stroke:#4B5563,color:#FFFFFF

  User[User Browser]:::user --> FE[React Frontend<br/>Vercel]:::frontend
  FE --> API[FastAPI Backend<br/>Render]:::backend
  API --> DB[(PostgreSQL + pgvector<br/>Neon)]:::database
  API --> LLM[LLM Provider<br/>Groq]:::external
  API --> EMB[Embedding Provider<br/>Jina AI]:::external`,

  ragPipeline: `sequenceDiagram
  autonumber
  participant User as User Browser
  participant React as React Frontend
  participant Store as Zustand Store
  participant API as FastAPI Backend
  participant Parser as Query Parser
  participant LLM as LLM Provider<br/>(Groq)
  participant Embed as Embedding Provider<br/>(Jina AI)
  participant Engine as Search Engine
  participant DB as PostgreSQL<br/>+ pgvector

  User->>React: Types "2BHK under 1Cr with gym"
  React->>Store: dispatch search(query)
  Store->>API: POST /api/v1/search

  rect rgba(34, 197, 94, 0.15)
    Note over API,LLM: Query Understanding Phase
    API->>Parser: parse_query(text)
    Parser->>LLM: Extract structured filters
    LLM-->>Parser: JSON response
    Parser-->>API: ParsedFilters
  end

  rect rgba(59, 130, 246, 0.15)
    Note over API,Embed: Embedding Generation
    API->>Embed: generate_embedding(query)
    Embed-->>API: vector[768 dims]
  end

  rect rgba(139, 92, 246, 0.15)
    Note over API,DB: Hybrid Search Phase
    API->>Engine: hybrid_search(filters, embedding)
    Engine->>DB: SQL filters + vector similarity
    DB-->>Engine: Ranked results
    Engine-->>API: Top 10 properties
  end

  rect rgba(249, 115, 22, 0.15)
    Note over API,User: Response Phase
    API-->>Store: SearchResponse
    Store-->>React: Update state
    React-->>User: Render results
  end`,

  searchStrategy: `flowchart TD
  classDef success fill:#22C55E,stroke:#16A34A,color:#FFFFFF
  classDef process fill:#3B82F6,stroke:#2563EB,color:#FFFFFF
  classDef fallback fill:#F59E0B,stroke:#D97706,color:#FFFFFF
  classDef semantic fill:#8B5CF6,stroke:#7C3AED,color:#FFFFFF

  A[Exact Match<br/>All filters + vector similarity]:::process -->|Results found| R[Return results]:::success
  A -->|No results| B[Relax BHK<br/>Keep area + price]:::process
  B -->|Results found| R
  B -->|No results| C[Relax Area<br/>Keep BHK + price]:::process
  C -->|Results found| R
  C -->|No results| D[Price Only<br/>Keep city + price range]:::fallback
  D -->|Results found| R
  D -->|No results| E[Semantic Fallback<br/>Pure vector similarity]:::semantic
  E --> R`,

  componentTree: `graph TD
  classDef layout fill:#6B7280,stroke:#4B5563,color:#FFFFFF
  classDef page fill:#0891B2,stroke:#0E7490,color:#FFFFFF
  classDef container fill:#059669,stroke:#047857,color:#FFFFFF
  classDef component fill:#8B5CF6,stroke:#7C3AED,color:#FFFFFF

  App:::layout --> Layout:::layout
  Layout --> Header:::layout
  Layout --> Outlet:::layout
  Header --> CitySelector:::component
  Outlet --> HomePage:::page
  Outlet --> ArchitecturePage:::page
  HomePage --> ChatContainer:::container
  HomePage --> CompareView:::container
  ChatContainer --> WelcomeMessage:::component
  ChatContainer --> ChatMessage:::component
  ChatContainer --> ChatInput:::component
  ChatMessage --> FilterBadges:::component
  ChatMessage --> MessagePropertyCard:::component
  ChatMessage --> ChatMapWidget:::component`,

  databaseSchema: `erDiagram
  PROPERTIES {
    uuid id PK
    varchar city
    varchar title
    varchar area
    int bhk
    int sqft
    int bathrooms
    decimal price_lakhs
    text_array amenities
    decimal latitude
    decimal longitude
    vector embedding "768 dims"
  }`,

  backendArchitecture: `graph TB
  classDef apiLayer fill:#0891B2,stroke:#0E7490,color:#FFFFFF
  classDef coreLayer fill:#059669,stroke:#047857,color:#FFFFFF
  classDef providerLayer fill:#F59E0B,stroke:#D97706,color:#FFFFFF
  classDef dataLayer fill:#7C3AED,stroke:#6D28D9,color:#FFFFFF

  subgraph API["API Layer"]
    routes["Routes<br/>search, properties, cities"]:::apiLayer
  end
  subgraph Core["Core Layer"]
    parser["Query Parser<br/>LLM-based extraction"]:::coreLayer
    engine["Search Engine<br/>Hybrid search"]:::coreLayer
    embeddings["Embeddings Service"]:::coreLayer
  end
  subgraph Providers["Provider Layer"]
    llm_provider["LLM Provider<br/>Groq"]:::providerLayer
    embed_provider["Embedding Provider<br/>Jina AI"]:::providerLayer
  end
  subgraph Data["Data Layer"]
    repo["Property Repository"]:::dataLayer
    db[("PostgreSQL + pgvector")]:::dataLayer
  end
  routes --> parser
  routes --> engine
  parser --> llm_provider
  engine --> embeddings
  engine --> repo
  embeddings --> embed_provider
  repo --> db`,

  deploymentArchitecture: `graph LR
  classDef client fill:#6B7280,stroke:#4B5563,color:#FFFFFF
  classDef frontend fill:#0891B2,stroke:#0E7490,color:#FFFFFF
  classDef backend fill:#059669,stroke:#047857,color:#FFFFFF
  classDef database fill:#7C3AED,stroke:#6D28D9,color:#FFFFFF
  classDef external fill:#F59E0B,stroke:#D97706,color:#FFFFFF

  subgraph Client
    browser["Browser"]:::client
  end
  subgraph Vercel
    fe["React SPA<br/>Static + CDN"]:::frontend
  end
  subgraph Render
    api["FastAPI<br/>Docker Container"]:::backend
  end
  subgraph Neon
    db[("PostgreSQL<br/>+ pgvector")]:::database
  end
  subgraph External["External APIs"]
    groq["Groq API<br/>LLM"]:::external
    jina["Jina AI<br/>Embeddings"]:::external
  end
  browser --> fe
  fe --> api
  api --> db
  api --> groq
  api --> jina`,

  stateManagement: `flowchart LR
  classDef component fill:#0891B2,stroke:#0E7490,color:#FFFFFF
  classDef state fill:#22C55E,stroke:#16A34A,color:#FFFFFF
  classDef action fill:#F59E0B,stroke:#D97706,color:#FFFFFF

  subgraph Components["React Components"]
    direction TB
    CC["ChatContainer"]:::component
    CV["CompareView"]:::component
    MPC["MessagePropertyCard"]:::component
    CI["ChatInput"]:::component
  end

  subgraph Store["searchStore (Zustand)"]
    direction TB
    subgraph State["State"]
      city["city"]:::state
      results["results"]:::state
      messages["messages"]:::state
      compareList["compareList"]:::state
    end
    subgraph Actions["Actions"]
      search["search()"]:::action
      toggle["toggleCompare()"]:::action
      setCity["setCity()"]:::action
    end
  end

  CC -->|"reads"| messages
  CC -->|"calls"| search
  CI -->|"calls"| search
  CV -->|"reads"| compareList
  MPC -->|"calls"| toggle`,
}
