import React, { useState } from 'react';
import { VscCheck, VscCalendar, VscHistory, VscStarFull } from "react-icons/vsc";


const TaskList = ({ tasks, onRemove, onComplete, onPrioritizeTask }) => {
    const [expandedTaskId, setExpandedTaskId] = useState(null);

    const toggleExpand = (id) => {
        setExpandedTaskId(expandedTaskId === id ? null : id);
    };

    if (!tasks || tasks.length === 0) {
        return (
            <div className="task-list-container empty-state">
                <h3 className="list-title">Task List</h3>
                <p>No tasks added yet. Use the form to get started.</p>
            </div>
        );
    }

    const getCategoryStyles = (category, isCompleted) => {
        if (isCompleted) return { bg: '#f3f4f6', border: '#9ca3af', badge: '#6b7280' };

        switch (category) {
            case 'High Priority':
                return { bg: '#fff1f2', border: '#f43f5e', badge: '#e11d48' };
            case 'Medium Priority':
                return { bg: '#fff7ed', border: '#f97316', badge: '#ea580c' };
            case 'Low Priority':
                return { bg: '#f0fdf4', border: '#22c55e', badge: '#16a34a' };
            default:
                return { bg: '#ffffff', border: '#e2e8f0', badge: '#94a3b8' };
        }
    };

    return (
        <div className="task-list-container">
            <h3 className="list-title">Task List ({tasks.length})</h3>
            <div className="task-cards">
                {tasks.map((task, index) => {
                    const styles = getCategoryStyles(task.category, task.is_completed);
                    const isPending = task.category === 'Pending';
                    const isCompleted = task.is_completed;
                    const isExpanded = expandedTaskId === task.id;

                    return (
                        <div
                            key={task.id || index}
                            className={`task-card ${isCompleted ? 'completed-task' : ''}`}
                            style={{
                                borderLeft: `4px solid ${styles.border}`,
                                backgroundColor: isPending ? 'white' : styles.bg,
                                opacity: isCompleted ? 0.8 : 1
                            }}
                        >
                            <div className="task-header">
                                <div className="title-area">
                                    <h4 style={{ textDecoration: isCompleted ? 'line-through' : 'none' }}>
                                        {task.title}
                                    </h4>
                                    <div style={{ display: 'flex', gap: '0.5rem', alignItems: 'center' }}>
                                        <span className="priority-badge" style={{
                                            backgroundColor: isPending ? '#f1f5f9' : 'rgba(255,255,255,0.9)',
                                            color: styles.badge,
                                            border: isPending ? '1px solid #e2e8f0' : `1px solid ${styles.border}44`,
                                            fontSize: '0.65rem',
                                            margin: 0
                                        }}>
                                            {isCompleted ? 'Done' : task.category}
                                        </span>
                                        {task.is_feasible === false && !isCompleted && (
                                            <div className="warning-badge-inline">
                                                ⚠️ Time Warning
                                            </div>
                                        )}
                                    </div>
                                </div>
                                <div className="card-actions">
                                    {!isCompleted && (
                                        <button
                                            className="complete-btn"
                                            onClick={() => onComplete(task.id)}
                                            title="Mark as Complete"
                                        >
                                            <VscCheck />
                                        </button>
                                    )}
                                    <button
                                        className="remove-card-btn"
                                        onClick={() => onRemove(task.id)}
                                        title="Remove Task"
                                    >
                                        &times;
                                    </button>
                                </div>
                            </div>

                            <div className="task-details">
                                <div className="detail-item prime-score">
                                    <span className="detail-label">Score</span>
                                    <span className={`detail-value big-score ${!task.priority_score ? 'score-placeholder' : ''}`}>
                                        {task.priority_score > 0 ? Math.round(task.priority_score) : '--'}
                                    </span>
                                </div>
                                <div className="detail-item">
                                    <span className="detail-label"><VscCalendar /> Deadline</span>
                                    <span className="detail-value">{task.deadline}d</span>
                                </div>
                                <div className="detail-item">
                                    <span className="detail-label"><VscHistory /> Effort</span>
                                    <span className="detail-value">{task.estimated_time}h</span>
                                </div>
                                <div className="detail-item">
                                    <span className="detail-label"><VscStarFull /> Rank</span>
                                    <span className="detail-value">{task.importance}/10</span>
                                </div>
                            </div>

                            {/* Action for Pending Tasks */}
                            {isPending && !isCompleted && (
                                <div className="pending-action-bar">
                                    <button
                                        className="individual-prioritize-btn-large"
                                        onClick={() => onPrioritizeTask(task.id)}
                                    >
                                        ⚡ Prioritize This Task
                                    </button>
                                </div>
                            )}

                            {/* Breakdown Toggle */}
                            {!isPending && !isCompleted && task.is_feasible !== false && (
                                <div className="breakdown-section">
                                    <button
                                        className="toggle-breakdown"
                                        onClick={() => toggleExpand(task.id)}
                                    >
                                        {isExpanded ? 'Hide Priority Logic ▲' : 'See Priority Logic ▼'}
                                    </button>

                                    {isExpanded && task.priority_details && (
                                        <div className="score-breakdown">
                                            <p><strong>Why this score?</strong></p>
                                            <div className="breakdown-row">
                                                <span>Urgency (45%)</span>
                                                <span className="score-val">+{(task.priority_details.urgency_score * 0.45).toFixed(1)}</span>
                                            </div>
                                            <div className="breakdown-row">
                                                <span>Importance (45%)</span>
                                                <span className="score-val">+{(task.priority_details.importance_score * 0.45).toFixed(1)}</span>
                                            </div>
                                            <div className="breakdown-row">
                                                <span>Effort (10%)</span>
                                                <span className="score-val">+{(task.priority_details.effort_score * 0.10).toFixed(1)}</span>
                                            </div>
                                            <div className="breakdown-total">
                                                <span>Calculated Total</span>
                                                <span className="score-val">{task.priority_score}</span>
                                            </div>
                                        </div>
                                    )}
                                </div>
                            )}

                            {task.is_feasible === false && (
                                <div className="reason-box">
                                    <span className="reason-label">Why Impossible:</span> {task.reason}
                                </div>
                            )}
                        </div>
                    );
                })}
            </div>
        </div>
    );
};

export default TaskList;
