def calculate_priority(task_data):
    """
    Calculate priority score and category for a task.
    """
    importance = task_data.get('importance', 5)
    deadline = task_data.get('deadline', 0)
    estimated_time = task_data.get('estimated_time', 0)

    # 1. Feasibility Check (assuming 8 working hours/day)
    # If deadline is 0, we assume it's due today, so we have maybe 8 hours left?
    # Let's say deadline=0 means "Due today".
    available_hours = max(deadline, 1) * 8
    is_feasible = estimated_time <= available_hours

        
    # 2. Urgency Score
    # Use a sharper curve for very close deadlines (0-3 days)
    days = max(deadline, 0)
    if days <= 0:
        urgency_score = 100
    elif days <= 2:
        urgency_score = 90 - (days * 10) # 1->80, 2->70
    else:
        urgency_score = 100 / (days * 0.5 + 1) # Smoother decay
    
    # 3. Importance Score (Normalize 1-10 to 0-100)
    importance_score = importance * 10
    
    # 4. Effort Score (Preference for quick wins? Or just a factor?)
    # Let's favor Quick Wins slightly: shorter time -> higher score
    effort_score = 100 / (max(estimated_time, 0.5) + 1)
    
    # 5. Weighted Sum
    # Adjusted weights: Importance is key (45%), Urgency is critical (45%), Effort is minor (10%)
    raw_score = (importance_score * 0.45) + (urgency_score * 0.45) + (effort_score * 0.10)
    
    final_score = round(min(100, max(0, raw_score)), 2)
    
    # 6. Categorization
    if final_score >= 70:
        category = "High Priority"
    elif final_score >= 40:
        category = "Medium Priority"
    else:
        category = "Low Priority"
        
    return {
        **task_data,
        "priority_score": final_score,
        "category": category,
        "feasible": is_feasible,
        "reason": None if is_feasible else "Estimated time exceeds available time.",
        "details": {
            "urgency_score": round(urgency_score, 2),
            "importance_score": importance_score,
            "effort_score": round(effort_score, 2)
        }
    }

def prioritize_tasks(tasks):
    return [calculate_priority(task) for task in tasks]
