# LEARNOVA - System Flowcharts

## 1. User Registration Flow

```mermaid
flowchart TD
    A[Start] --> B[Open /signup page]
    B --> C[Fill Registration Form]
    C --> D{Client-side Validation}
    D -->|Invalid Email Domain| E[Show Error: Use college email]
    D -->|Password Too Short| F[Show Error: Min 8 characters]
    D -->|Passwords Don't Match| G[Show Error: Passwords must match]
    D -->|Valid| H[Submit to POST /api/auth/register]
    E --> C
    F --> C
    G --> C
    H --> I{Backend Validation}
    I -->|Duplicate Email| J[Show Error: Email already exists]
    I -->|Validation Failed| K[Show Error: Invalid input]
    I -->|Valid| L[Hash Password with bcrypt]
    L --> M[Generate Membership ID: LRN-YYYY-XXXXXX]
    M --> N[Insert User into Database]
    N --> O[Generate JWT Token]
    O --> P[Return Token + User Data]
    P --> Q[Store Token in localStorage]
    Q --> R[Navigate to /home]
    R --> S[End]
    J --> C
    K --> C
```

---

## 2. User Login Flow

```mermaid
flowchart TD
    A[Start] --> B[Open /login page]
    B --> C[Enter Email/MemberID + Password]
    C --> D[Submit to POST /api/auth/login]
    D --> E{Backend Validation}
    E -->|User Not Found| F[Show Error: Invalid credentials]
    E -->|Wrong Password| F
    E -->|Valid| G[Generate JWT Token]
    G --> H[Return Token + User Data]
    H --> I[Store Token in localStorage]
    I --> J[Navigate to /home]
    J --> K[End]
    F --> C
```

---

## 3. Authentication & Authorization Flow

```mermaid
flowchart TD
    A[User Action] --> B[Component calls API]
    B --> C{Token in localStorage?}
    C -->|No| D[Redirect to /login]
    C -->|Yes| E[Attach Bearer Token to Header]
    E --> F[Send Request to Backend]
    F --> G{protect Middleware}
    G -->|No Token| H[Return 401 Unauthorized]
    G -->|Invalid Token| H
    G -->|Expired Token| H
    G -->|Valid Token| I[Set req.userId and req.membershipId]
    I --> J[Execute Route Handler]
    J --> K[Return JSON Response]
    K --> L[Component Updates State]
    D --> M[End]
    H --> N[Clear Token from localStorage]
    N --> O[Redirect to /login]
```

---

## 4. Book Browsing & Search Flow

```mermaid
flowchart TD
    A[Open /books page] --> B[Load Books from GET /api/books]
    B --> C[Display Book Grid]
    C --> D{User Action}
    D -->|Search| E[Enter Search Query]
    E --> F[Filter by Title/Author]
    F --> G[Update Book Grid]
    D -->|Filter by Category| H[Click Category Button]
    H --> I[Filter by Category]
    I --> G
    D -->|Filter by Level| J[Click Level Filter]
    J --> K[Filter by Level]
    K --> G
    D -->|Sort| L[Click Sort Option]
    L --> M[Sort Books]
    M --> G
    D -->|View Book| N[Click Book Card]
    N --> O[Log Viewed Action in History]
    O --> P[Display Book Details]
    D -->|Start Reading| Q[Click Start Reading]
    Q --> R[Create Reading Progress]
    R --> S[Navigate to Reading View]
    G --> D
```

---

## 5. Reading Progress Tracking Flow

```mermaid
flowchart TD
    A[Start Reading Book] --> B[POST /api/reading/start]
    B --> C[Create Reading Progress Record]
    C --> D[Log 'opened' in History]
    D --> E[Display Reading View]
    E --> F{User Action}
    F -->|Update Progress| G[PUT /api/reading/:bookId/progress]
    G --> H[Update current_page]
    H --> I{currentPage >= pageCount?}
    I -->|Yes| J[Set status = 'completed']
    J --> K[Log 'completed' in History]
    K --> L[Show Completion Message]
    I -->|No| M[Update reading_time_minutes]
    M --> N[Update last_read_at]
    N --> O[Continue Reading]
    F -->|Complete Book| P[POST /api/reading/:bookId/complete]
    P --> J
    F -->|Pause Reading| Q[Update status = 'paused']
    Q --> R[Save Progress]
    F -->|View History| S[GET /api/reading/history]
    S --> T[Display Reading History]
    O --> F
    L --> F
    R --> F
```

---

## 6. Bookmark & Favorite Flow

```mermaid
flowchart TD
    A[View Book] --> B{User Action}
    B -->|Bookmark| C[POST /api/bookmarks/:bookId]
    C --> D[INSERT IGNORE into bookmarks]
    D --> E[Log 'bookmarked' in History]
    E --> F[Show Bookmark Icon Filled]
    B -->|Unbookmark| G[DELETE /api/bookmarks/:bookId]
    G --> H[Remove from bookmarks]
    H --> I[Show Bookmark Icon Empty]
    B -->|Favorite| J[POST /api/favorites/:bookId]
    J --> K[INSERT IGNORE into favorites]
    K --> L[Log 'favorited' in History]
    L --> M[Show Favorite Icon Filled]
    B -->|Unfavorite| N[DELETE /api/favorites/:bookId]
    N --> O[Remove from favorites]
    O --> P[Show Favorite Icon Empty]
    F --> Q[End]
    I --> Q
    M --> Q
    P --> Q
```

---

## 7. Dashboard Statistics Flow

```mermaid
flowchart TD
    A[Open /home] --> B[GET /api/dashboard/stats]
    B --> C[Query Completed Books Count]
    C --> D[Query Currently Reading Count]
    D --> E[Query Bookmarks Count]
    E --> F[Query Favorites Count]
    F --> G[Query Total Pages Read]
    G --> H[Query Total Reading Minutes]
    H --> I[Calculate Reading Streak]
    I --> J[Query Activity for Last 7 Days]
    J --> K[Return Stats Object]
    K --> L[Display Stats Cards]
    L --> M[Display Activity Chart]
    M --> N[Display Recommendations]
    N --> O[End]
```

---

## 8. Recommendation Engine Flow

```mermaid
flowchart TD
    A[GET /api/recommendations] --> B[Get User Interests]
    B --> C[Get User Favorites]
    C --> D[Get User Reading Progress]
    D --> E[Get User History]
    E --> F[Calculate Category Scores]
    F --> G[Interests: +3 per match]
    G --> H[Favorites: +2 per category]
    H --> I[Progress: +2 per category]
    I --> J[History: +1 per category]
    J --> K[Apply Rating Boost]
    K --> L[Exclude Already Read Books]
    L --> M[Sort by Score Descending]
    M --> N[Return Top 8 Recommendations]
    N --> O[Display with Reason String]
    O --> P[End]
```

---

## 9. Complete System Architecture Flow

```mermaid
flowchart LR
    subgraph Frontend
        A[React App] --> B[api.js]
        B --> C[localStorage - JWT]
    end

    subgraph Nginx
        D[Port 80] --> E[Static Files]
        D --> F[Proxy /api]
    end

    subgraph Backend
        G[Express] --> H[Middleware Chain]
        H --> I[Routes]
        I --> J[Controllers]
    end

    subgraph Database
        K[MySQL 8] --> L[Users]
        K --> M[Books]
        K --> N[Reading Progress]
        K --> O[Bookmarks]
        K --> P[Favorites]
        K --> Q[History]
    end

    A --> D
    F --> G
    J --> K
```

---

## 10. Docker Deployment Flow

```mermaid
flowchart TD
    A[git clone repository] --> B[docker compose up --build]
    B --> C[Build Backend Image]
    B --> D[Build Frontend Image]
    B --> E[Pull MySQL Image]
    C --> F[Start MySQL Container]
    D --> G[Start Frontend Container]
    E --> F
    F --> H[Health Check: mysqladmin ping]
    H -->|Healthy| I[Start Backend Container]
    H -->|Not Ready| H
    I --> J[Wait for DB Connection]
    J --> K[Backend Ready on Port 5000]
    K --> L[Frontend Ready on Port 80]
    L --> M[Application Running]
    M --> N[Access at http://localhost]
```

---

## 11. Data Flow Summary

```mermaid
flowchart TD
    A[User Browser] -->|HTTP Request| B[Nginx :80]
    B -->|Static Files| A
    B -->|API Proxy| C[Express :5000]
    C -->|JWT Validation| D{Auth Middleware}
    D -->|Valid| E[Route Handler]
    D -->|Invalid| F[401 Response]
    E -->|SQL Query| G[MySQL :3306]
    G -->|Result Set| E
    E -->|JSON Response| C
    C -->|JSON Response| B
    B -->|JSON Response| A
    A -->|Update UI| H[React State]
```
