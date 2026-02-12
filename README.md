# Task Prioritization System

## Project Overview

The Task Prioritization System is a productivity-focused web application designed to intelligently rank tasks using a deterministic weighted scoring algorithm.

Each task is evaluated based on:

- Urgency (deadline proximity)
- Importance (business impact)
- Effort (estimated time required)

The system assigns a priority score between **0 and 100**, classifies tasks into predefined categories, and flags infeasible tasks when they cannot realistically be completed before their deadline.

---

## Architecture

### Backend
- **Framework:** Django + Django REST Framework
- **Business Logic Isolation:** `tasks/logic.py`
- **Database:** SQLite (chosen for simplicity, zero configuration, and portability)

Layers:
- Models → Persistence
- Serializers → Validation
- Views → API Layer
- Logic → Pure deterministic scoring engine

### Frontend
- **Framework:** React (Vite)
- **Package Manager:** Yarn
- Interactive dashboard with:
  - Real-time task prioritization
  - Score breakdown display
  - Feasibility warnings
  - Completion tracking

---

## Database Schema (Task Model)

| Field | Type | Description |
|-------|------|------------|
| title | String | Task description |
| deadline | Integer | Days remaining |
| estimated_time | Float | Required hours |
| importance | Integer (1–10) | Business priority |
| priority_score | Float | Computed (0–100) |
| category | String | High / Medium / Low |
| feasible | Boolean | Indicates if task can be completed before deadline |
| is_completed | Boolean | Task completion status |
| created_at | DateTime | Auto timestamp |

---

## Prioritization Logic

### Weighted Scoring Formula

Final Score:

```
Final Score =
(Importance Score × 0.45) +
(Urgency Score × 0.45) +
(Effort Score × 0.10)
```

### Score Components

#### 1. Urgency (45%)
- Deadline = 0 → 100
- 1–2 days → sharp decay
- 3+ days → smooth decay curve

#### 2. Importance (45%)
- Normalized from 1–10 scale to 0–100

#### 3. Effort (10%)
- Shorter tasks receive slightly higher weight (Quick Win bias)

---

## Categorization Rules

| Score Range | Category |
|-------------|----------|
| ≥ 70 | High Priority |
| 40–69 | Medium Priority |
| < 40 | Low Priority |

---

## Feasibility Rule

A task is flagged as infeasible if:

```
estimated_time > (deadline × 8 working hours)
```

Instead of rejecting such tasks, the system:
- Calculates the score normally
- Sets `feasible = false`
- Displays a warning in the UI

This preserves deterministic scoring while providing user awareness.

---

## Edge Case Handling

- Deadline = 0 → Treated as immediate (max urgency)
- Negative deadline → Validation error
- Importance outside 1–10 → Validation error
- Non-positive estimated_time → Validation error
- Equal scores → Deterministic sorting applied

Sorting order:
```
Score (Descending)
→ Deadline (Ascending)
→ Importance (Descending)
```

---

## API Endpoints

### Health Check
```
GET /health
```
Returns system status.

---

### Task Validation
```
POST /tasks/validate
```
Separates valid and invalid tasks with detailed error messages.

Returns:
- valid_count
- invalid_count
- validation reasons

---

### Task Prioritization
```
POST /tasks/prioritize
```

Supports:

- Stateless mode → Send JSON array
- Stateful mode → Recalculate all DB tasks

Returns scored & categorized tasks.

---

### CRUD & Special Operations

| Method | Endpoint | Purpose |
|--------|----------|----------|
| GET | /tasks/ | List all tasks |
| POST | /tasks/ | Create a new task |
| GET | /tasks/{id}/ | Get task details |
| PATCH | /tasks/{id}/ | Update task status/details |
| DELETE | /tasks/{id}/ | Remove a task |
| POST | /tasks/{id}/prioritize/ | **(New)** Prioritize a specific task by ID |

---

### Bulk Operations

| Method | Endpoint | Purpose |
|--------|----------|----------|
| POST | /tasks/prioritize | Bulk prioritize (Stateless or DB-wide) |
| POST | /tasks/validate | Separate valid/invalid tasks |
| GET | /health | System health check |

---

## HTTP Status Codes

| Code | Meaning |
|------|--------|
| 200 | Success |
| 400 | Validation error |
| 404 | Task not found |
| 500 | Internal error |

---

## Setup Instructions

# Clone repository
git clone <repository-url>

### Backend

```bash
cd task-prioritization-system/server

# Create virtual environment
python -m venv venv

# Activate virtual environment

# Windows
venv\Scripts\activate

# Mac/Linux
source venv/bin/activate

# Install dependencies
pip install -r requirements.txt

# Apply migrations
python manage.py migrate


# Run server
python manage.py runserver
```

Runs at:
```
http://127.0.0.1:8000
```

---

### Frontend (Yarn)

```bash
cd client
yarn install
yarn dev
```

Runs at:
```
http://localhost:5173
```

---

## Design Decisions

- Deterministic scoring ensures same input always produces same output.
- Feasibility handled as a flag instead of separate category (to remain spec compliant).
- Business logic separated from API layer for maintainability.
- SQLite chosen for lightweight local deployment.

---

## Conclusion

This system demonstrates:

- Clean architecture separation
- Deterministic algorithm design
- Robust validation
- Edge case handling
- Full-stack integration
- Production-style API structuring
