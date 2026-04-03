export const diagrams = {
  systemArchitecture: `graph TB
  User[User Browser] --> FE[React Frontend<br/>Vercel]
  FE --> API[FastAPI Backend<br/>Render]
  API --> DB[(PostgreSQL + pgvector<br/>Neon)]
  API --> LLM[LLM Provider<br/>Groq]
  API --> EMB[Embedding Provider<br/>Jina AI]`,

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

  Note over API,LLM: Query Understanding Phase
  API->>Parser: parse_query(text)
  Parser->>LLM: Extract structured filters
  LLM-->>Parser: JSON response
  Parser-->>API: ParsedFilters

  Note over API,Embed: Embedding Generation
  API->>Embed: generate_embedding(query)
  Embed-->>API: vector[768 dims]

  Note over API,DB: Hybrid Search Phase
  API->>Engine: hybrid_search(filters, embedding)
  Engine->>DB: SQL filters + vector similarity
  DB-->>Engine: Ranked results
  Engine-->>API: Top 10 properties

  Note over API,User: Response Phase
  API-->>Store: SearchResponse
  Store-->>React: Update state
  React-->>User: Render results`,

  searchStrategy: `flowchart TD
  A[Exact Match<br/>All filters + vector similarity] -->|Results found| R[Return results]
  A -->|No results| B[Relax BHK<br/>Keep area + price]
  B -->|Results found| R
  B -->|No results| C[Relax Area<br/>Keep BHK + price]
  C -->|Results found| R
  C -->|No results| D[Price Only<br/>Keep city + price range]
  D -->|Results found| R
  D -->|No results| E[Semantic Fallback<br/>Pure vector similarity]
  E --> R`,

  componentTree: `graph TD
  App --> Layout
  Layout --> Header
  Layout --> Outlet
  Header --> CitySelector
  Outlet --> HomePage
  Outlet --> ArchitecturePage
  HomePage --> ChatContainer
  HomePage --> CompareView
  ChatContainer --> WelcomeMessage
  ChatContainer --> ChatMessage
  ChatContainer --> ChatInput
  ChatMessage --> FilterBadges
  ChatMessage --> MessagePropertyCard
  ChatMessage --> ChatMapWidget`,

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
  subgraph API["API Layer"]
    routes["Routes<br/>search, properties, cities"]
  end
  subgraph Core["Core Layer"]
    parser["Query Parser<br/>LLM-based extraction"]
    engine["Search Engine<br/>Hybrid search"]
    embeddings["Embeddings Service"]
  end
  subgraph Providers["Provider Layer"]
    llm_provider["LLM Provider<br/>Groq"]
    embed_provider["Embedding Provider<br/>Jina AI"]
  end
  subgraph Data["Data Layer"]
    repo["Property Repository"]
    db[("PostgreSQL + pgvector")]
  end
  routes --> parser
  routes --> engine
  parser --> llm_provider
  engine --> embeddings
  engine --> repo
  embeddings --> embed_provider
  repo --> db`,

  deploymentArchitecture: `graph LR
  subgraph Client
    browser["Browser"]
  end
  subgraph Vercel
    fe["React SPA<br/>Static + CDN"]
  end
  subgraph Render
    api["FastAPI<br/>Docker Container"]
  end
  subgraph Neon
    db[("PostgreSQL<br/>+ pgvector")]
  end
  subgraph External["External APIs"]
    groq["Groq API<br/>LLM"]
    jina["Jina AI<br/>Embeddings"]
  end
  browser --> fe
  fe --> api
  api --> db
  api --> groq
  api --> jina`,

  stateManagement: `flowchart LR
  subgraph Components["React Components"]
    direction TB
    CC["ChatContainer"]
    CV["CompareView"]
    MPC["MessagePropertyCard"]
    CI["ChatInput"]
  end

  subgraph Store["searchStore (Zustand)"]
    direction TB
    subgraph State["State"]
      city["city"]
      results["results"]
      messages["messages"]
      compareList["compareList"]
    end
    subgraph Actions["Actions"]
      search["search()"]
      toggle["toggleCompare()"]
      setCity["setCity()"]
    end
  end

  CC -->|"reads"| messages
  CC -->|"calls"| search
  CI -->|"calls"| search
  CV -->|"reads"| compareList
  MPC -->|"calls"| toggle`,
}
