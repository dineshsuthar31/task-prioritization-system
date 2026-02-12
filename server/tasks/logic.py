# --- Deterministic Priority Constants ---
# Weights determine the influence of each factor on the final score (Total must be 1.0)
IMPORTANCE_WEIGHT = 0.45
URGENCY_WEIGHT = 0.45
EFFORT_WEIGHT = 0.10

# Thresholds for categorization
HIGH_PRIORITY_THRESHOLD = 70.0
MEDIUM_PRIORITY_THRESHOLD = 40.0

# System assumptions
HOURS_PER_DAY = 8.0

def calculate_priority(task_data):
    """
    Calculates a deterministic priority score and category.
    The formula is: (Importance * 0.45) + (Urgency * 0.45) + (Effort * 0.10)
    """
    importance = task_data.get('importance', 5)
    deadline = task_data.get('deadline', 0)
    estimated_time = task_data.get('estimated_time', 0)

    # 1. Feasibility Check
    # available_hours is calculated as 8 hours per day of the deadline.
    available_hours = max(deadline, 1) * HOURS_PER_DAY
    is_feasible = estimated_time <= available_hours
        
    # 2. Urgency Score (0-100)
    # Calculated based on days remaining. Sharp increase for < 3 days.
    days = max(deadline, 0)
    if days <= 0:
        urgency_score = 100.0
    elif days <= 2:
        urgency_score = 90.0 - (days * 10.0) 
    else:
        urgency_score = 100.0 / (days * 0.5 + 1.0)
    
    # 3. Importance Score (Normalize 1-10 to 0-100)
    importance_score = importance * 10.0
    
    # 4. Effort Score (Favoring "Quick Wins")
    # Shorter tasks get slightly higher scores to encourage initial progress.
    effort_score = 100.0 / (max(estimated_time, 0.5) + 1.0)
    
    # 5. Weighted Final Score
    raw_score = (importance_score * IMPORTANCE_WEIGHT) + \
                (urgency_score * URGENCY_WEIGHT) + \
                (effort_score * EFFORT_WEIGHT)
    
    final_score = round(min(100.0, max(0.0, raw_score)), 2)
    
    # 6. Categorization
    if final_score >= HIGH_PRIORITY_THRESHOLD:
        category = "High Priority"
    elif final_score >= MEDIUM_PRIORITY_THRESHOLD:
        category = "Medium Priority"
    else:
        category = "Low Priority"
        
    return {
        **task_data,
        "priority_score": final_score,
        "category": category,
        "feasible": is_feasible,
        "reason": None if is_feasible else f"Estimated time ({estimated_time}h) exceeds available time ({available_hours}h at {HOURS_PER_DAY}h/day).",
        "details": {
            "urgency_score": round(urgency_score, 2),
            "importance_score": importance_score,
            "effort_score": round(effort_score, 2),
            "weights": {
                "importance": IMPORTANCE_WEIGHT,
                "urgency": URGENCY_WEIGHT,
                "effort": EFFORT_WEIGHT
            }
        }
    }

def prioritize_tasks(tasks):
    """Deterministic sorting of a list of tasks."""
    results = [calculate_priority(task) for task in tasks]
    # Secondary sorting by deadline and importance ensures stability if scores are identical
    results.sort(key=lambda x: (-x['priority_score'], x['deadline'], -x['importance']))
    return results
