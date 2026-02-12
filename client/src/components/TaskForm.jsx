import React, { useState } from 'react';

const TaskForm = ({ onAdd, onPrioritize, pendingCount, isLoading }) => {
    const [task, setTask] = useState({
        title: '',
        deadline: '',
        estimated_time: '',
        importance: 5
    });
    const [errors, setErrors] = useState({});

    const handleChange = (field, value) => {
        setTask(prev => ({ ...prev, [field]: value }));
        // Clear error when user starts typing
        if (errors[field]) {
            setErrors(prev => ({ ...prev, [field]: null }));
        }
    };

    const validate = () => {
        const newErrors = {};
        if (!task.title.trim()) {
            newErrors.title = 'Description is required';
        } else if (task.title.length < 3) {
            newErrors.title = 'Description must be at least 3 characters';
        }

        if (task.deadline === '') {
            newErrors.deadline = 'Deadline is required';
        } else if (parseFloat(task.deadline) < 0) {
            newErrors.deadline = 'Deadline cannot be negative';
        }

        if (task.estimated_time === '') {
            newErrors.estimated_time = 'Estimated time is required';
        } else if (parseFloat(task.estimated_time) <= 0) {
            newErrors.estimated_time = 'Must be greater than 0';
        }

        if (task.importance === '') {
            newErrors.importance = 'Importance is required';
        } else if (task.importance < 1 || task.importance > 10) {
            newErrors.importance = 'Scale must be 1-10';
        }

        setErrors(newErrors);
        return Object.keys(newErrors).length === 0;
    };

    const handleSubmit = (e) => {
        e.preventDefault();
        if (validate()) {
            onAdd(task);
            setTask({ title: '', deadline: '', estimated_time: '', importance: 5 });
            setErrors({});
        }
    };

    return (
        <div className="task-form-container">
            <h3>Add New Task</h3>
            <form onSubmit={handleSubmit} noValidate>
                <div className="task-input-row">
                    <div className="task-input-group">
                        <label>Description</label>
                        <input
                            type="text"
                            className={errors.title ? 'input-error' : ''}
                            placeholder="What needs to be done?"
                            value={task.title}
                            onChange={(e) => handleChange('title', e.target.value)}
                        />
                        {errors.title && <span className="field-error">{errors.title}</span>}
                    </div>
                    <div className="task-input-group">
                        <label>Deadline (Days)</label>
                        <input
                            type="number"
                            className={errors.deadline ? 'input-error' : ''}
                            placeholder="e.g. 5"
                            value={task.deadline}
                            onChange={(e) => handleChange('deadline', e.target.value)}
                        />
                        {errors.deadline && <span className="field-error">{errors.deadline}</span>}
                    </div>
                    <div className="task-input-group">
                        <label>Est. Hours</label>
                        <input
                            type="number"
                            className={errors.estimated_time ? 'input-error' : ''}
                            placeholder="e.g. 2"
                            value={task.estimated_time}
                            onChange={(e) => handleChange('estimated_time', e.target.value)}
                            step="0.1"
                        />
                        {errors.estimated_time && <span className="field-error">{errors.estimated_time}</span>}
                    </div>
                    <div className="task-input-group">
                        <label>Importance (1-10)</label>
                        <input
                            type="number"
                            className={errors.importance ? 'input-error' : ''}
                            value={task.importance}
                            onChange={(e) => handleChange('importance', e.target.value)}
                        />
                        {errors.importance && <span className="field-error">{errors.importance}</span>}
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
