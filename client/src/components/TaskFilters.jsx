import React from 'react';
import { VscFilter, VscSettings } from "react-icons/vsc";

const TaskFilters = ({
    priorityFilter,
    setPriorityFilter,
    statusFilter,
    setStatusFilter,
    taskCount
}) => {
    return (
        <div className="filters-container">
            <div className="filters-header">
                <span className="filters-title">
                    <VscFilter className="filter-icon" /> Filter Tasks
                </span>
                <span className="task-count-badge">{taskCount} tasks</span>
            </div>

            <div className="filters-grid">
                <div className="filter-group">
                    <label className="filter-label">Priority</label>
                    <select
                        value={priorityFilter}
                        onChange={(e) => setPriorityFilter(e.target.value)}
                        className="filter-select"
                    >
                        <option value="All">All Priorities</option>
                        <option value="High Priority">High Priority</option>
                        <option value="Medium Priority">Medium Priority</option>
                        <option value="Low Priority">Low Priority</option>
                        <option value="Pending">Pending (Unranked)</option>
                    </select>
                </div>

                <div className="filter-group">
                    <label className="filter-label">Status</label>
                    <div className="filter-pills">
                        <button
                            className={`filter-pill ${statusFilter === 'All' ? 'active' : ''}`}
                            onClick={() => setStatusFilter('All')}
                        >
                            All
                        </button>
                        <button
                            className={`filter-pill ${statusFilter === 'Active' ? 'active' : ''}`}
                            onClick={() => setStatusFilter('Active')}
                        >
                            Active
                        </button>
                        <button
                            className={`filter-pill ${statusFilter === 'Completed' ? 'active' : ''}`}
                            onClick={() => setStatusFilter('Completed')}
                        >
                            Completed
                        </button>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default TaskFilters;
