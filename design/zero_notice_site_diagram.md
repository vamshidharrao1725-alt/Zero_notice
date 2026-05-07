# Zero Notice Period Platform - Site Flow

This diagram describes the platform flow for a marketplace where laid-off professionals and recruiters connect for immediate join roles.

```mermaid
flowchart TB
  subgraph Public[Landing Page]
    A[Landing Page with quote] --> B[Create account]
    A --> C[Login]
    B --> D[Choose role]
    D --> D1[Candidate]
    D --> D2[Recruiter]
  end

  subgraph Signup[Signup and Profile]
    D1 --> E[Sign up with username, email, password]
    D2 --> E
    E --> F[Profile setup]
    F --> G[Candidate profile complete]
    F --> H[Recruiter profile complete]
  end

  subgraph Verification[Verification + Activation]
    G --> I[Verify company email / domain]
    I --> J[Activate profile]
    J --> K[Candidate visible in recruiter search]
  end

  subgraph Candidate[Candidate Journey]
    K --> L[Candidate dashboard]
    L --> M[Set active status]
    L --> N[Search jobs]
    L --> O[Apply to jobs]
    L --> P[Upload resume / add LinkedIn URL]
  end

  subgraph Recruiter[Recruiter Journey]
    H --> Q[Recruiter dashboard]
    Q --> R[Post job anytime]
    Q --> S[Search active candidates]
    S --> T[Filter by location]
    S --> U[Filter by salary range]
    S --> V[Filter by status]
    Q --> W[Review applications]
  end

  subgraph Core[Backend Services]
    X[Auth API]
    Y[Profile + Verification Service]
    Z[Job / Candidate Search API]
    DB[(Database)]
  end

  C --> A
  X --> DB
  Y --> DB
  Z --> DB
  N --> Z
  S --> Z
  O --> Y
  R --> Y
```

## Key Requirements

- Landing page must communicate the zero-notice mission with a motivating quote.
- Users must sign up first, then complete their profile, then use the dashboard.
- Candidates must activate their profile to appear in recruiter search results.
- Recruiters can post jobs anytime after login.
- Candidate statuses should include: `Immediate Joiner`, `Actively Looking`, `Placed but Open`.
- Candidate profiles should support email/company domain verification to establish genuineness.
- Recruiters should search candidates by location, salary range, and availability status.
- The product must remain distinct from LinkedIn/Naukri, focusing on immediate, simple hiring.
- Provide a jobs section that candidates can apply to directly.
- Allow optional LinkedIn URL for candidate credibility and recruiter trust.
- Only active candidates should appear in search results for recruiters.
