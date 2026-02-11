import React, { useState } from 'react';

const TaskForm = ({ onAdd, onPrioritize, pendingCount, isLoading }) => {
    const [task, setTask] = useState({
        title: '',
        deadline: '',
        estimated_time: '',
        importance: 5
    });

    const handleChange = (field, value) => {
        setTask(prev => ({ ...prev, [field]: value }));
    };

    const handleSubmit = (e) => {
        e.preventDefault();
        onAdd(task); // Pass task without ID
        setTask({ title: '', deadline: '', estimated_time: '', importance: 5 });
    };

    return (
        <div className="task-form-container">
            <h3>Add New Task</h3>
            <form onSubmit={handleSubmit}>
                <div className="task-input-row">
                    <div className="task-input-group">
                        <label>Description</label>
                        <input
                            type="text"
                            placeholder="What needs to be done?"
                            value={task.title}
                            onChange={(e) => handleChange('title', e.target.value)}
                            required
                        />
                    </div>
                    <div className="task-input-group">
                        <label>Deadline (Days)</label>
                        <input
                            type="number"
                            placeholder="e.g. 5"
                            value={task.deadline}
                            onChange={(e) => handleChange('deadline', e.target.value)}
                            required
                            min="0"
                        />
                    </div>
                    <div className="task-input-group">
                        <label>Est. Hours</label>
                        <input
                            type="number"
                            placeholder="e.g. 2"
                            value={task.estimated_time}
                            onChange={(e) => handleChange('estimated_time', e.target.value)}
                            required
                            min="0.1"
                            step="0.1"
                        />
                    </div>
                    <div className="task-input-group">
                        <label>Importance (1-10)</label>
                        <input
                            type="number"
                            value={task.importance}
                            onChange={(e) => handleChange('importance', e.target.value)}
                            min="1"
                            max="10"
                        />
                    </div>
                </div>

                <div className="form-actions">
                    <button type="submit" className="add-btn" disabled={isLoading}>
                        {isLoading ? 'Adding...' : '+ Add to List'}
                    </button>
                </div>
            </form>

            {pendingCount > 0 && (
                <div className="prioritize-action">
                    <p>{pendingCount} tasks</p>
                    <button onClick={onPrioritize} className="prioritize-btn" disabled={isLoading}>
                        {isLoading ? 'Prioritizing...' : 'Prioritize All Tasks'}
                    </button>
                </div>
            )}
        </div>
    );
};

export default TaskForm;
