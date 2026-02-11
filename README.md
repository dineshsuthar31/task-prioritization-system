# Task Prioritization System

## Project Overview
A productivity application designed to help users intelligently prioritize their workload. It uses a weighted formula to analyze Urgency, Importance, and Effort, ensuring that "Quick Wins" and "Critical Tasks" surface at the top.

## Architecture
- **Backend**: Django REST Framework (Python).
  - Business logic is isolated in `tasks/logic.py`.
  - Persistence Layer: SQLite (Chosen for simplicity, zero-config, and file-based portability suitable for a small productivity tool).
- **Frontend**: React (Vite) + Vanilla CSS.
  - Interactive dashboard with real-time feedback and priority breakdowns.

## Schema Design (SQLite)
The system uses a `Task` table with the following significant fields:
- `is_completed`: Boolean to distinguish active vs. finished work.
- `priority_score`: Computed float (0-100).
- `category`: Classification (High, Medium, Low, Impossible).
- `deadline`, `estimated_time`, `importance`: Raw input metrics.

## Prioritization Logic (Weighted Sum)
The priority score is calculated using the following weights:
- **Urgency (45%)**: Sharper exponential decay for 0-2 days, smoother logarithmic decay for 3+ days.
- **Importance (45%)**: Linear normalization of the 1-10 scale.
- **Effort (10%)**: Minor factor to favor "Quick Wins" (shorter tasks) when other factors are equal.

### Edge Case Handling
- **Deadlines of zero**: Treated as "Immediate" with maximum Urgency (100).
- **Impossible Tasks**: If `estimated_time > (deadline * 8)`, the task is flagged as "Impossible" because it cannot be finished within standard working hours before the deadline.
- **Ties**: Resolved by strictly sorting by: Score (Desc) -> Deadline (Asc) -> Importance (Desc).

## API Endpoints
- `GET /health`: System health status (Global).
- `POST /tasks/prioritize`:
  - **Stateless**: Send a JSON list of tasks to get scores in the response.
  - **Stateful**: Call with an empty body to re-calculate all tasks in the Database.
- `POST /tasks/validate`: Separates valid/invalid tasks with specific reasons.
- `GET /tasks/`: List all tasks (Sorted).
- `POST /tasks/`: Create a new task.
- `PATCH /tasks/{id}/`: Update status (e.g., mark as completed).

## Setup Instructions
1. **Backend**: 
   - `pip install -r requirements.txt`
   - `python manage.py migrate`
   - `python manage.py runserver`
2. **Frontend**:
   - `npm install`
   - `npm run dev`
