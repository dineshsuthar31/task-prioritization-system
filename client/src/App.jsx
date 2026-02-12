import { useState, useEffect } from 'react'
import axios from 'axios'
import './App.css'
import TaskForm from './components/TaskForm'
import TaskList from './components/TaskList'
import { VscTerminalTmux } from "react-icons/vsc";


function App() {
  const [tasks, setTasks] = useState([])
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState(null)
  const [systemHealth, setSystemHealth] = useState(null)

  useEffect(() => {
    fetchTasks();
    checkSystemHealth();
  }, []);

  const checkSystemHealth = async () => {
    try {
      const response = await axios.get('http://127.0.0.1:8000/tasks/health');
      setSystemHealth(response.data.status);
    } catch (err) {
      setSystemHealth('unavailable');
    }
  };

  const fetchTasks = async () => {
    setLoading(true);
    try {
      const response = await axios.get('http://127.0.0.1:8000/tasks/');
      setTasks(response.data);
    } catch (err) {
      console.error("Error fetching tasks:", err);
      setError("Failed to load tasks.");
    } finally {
      setLoading(false);
    }
  };

  const sortTasks = (taskList) => {
    return [...taskList].sort((a, b) => {
      if (a.is_completed !== b.is_completed) {
        return a.is_completed ? 1 : -1;
      }
      if (b.priority_score !== a.priority_score) {
        return b.priority_score - a.priority_score;
      }
      return a.deadline - b.deadline;
    });
  };

  const handleAddTask = async (newTask) => {
    setLoading(true);
    setError(null);
    try {
      const response = await axios.post('http://127.0.0.1:8000/tasks/', newTask);
      // Add the returned task (with ID and calculated priority) to the list
      const updatedTasks = [...tasks, response.data];
      setTasks(sortTasks(updatedTasks));
    } catch (err) {
      console.error("Error adding task:", err);
      setError("Failed to add task.");
    } finally {
      setLoading(false);
    }
  }

  const handleRemoveTask = async (taskId) => {
    try {
      await axios.delete(`http://127.0.0.1:8000/tasks/${taskId}/`);
      setTasks(tasks.filter(t => t.id !== taskId));
    } catch (err) {
      console.error("Error deleting task:", err);
      setError("Failed to delete task.");
    }
  }

  const handleCompleteTask = async (taskId) => {
    try {
      await axios.patch(`http://127.0.0.1:8000/tasks/${taskId}/`, { is_completed: true });
      // Update locally and re-sort
      const updatedTasks = tasks.map(t => t.id === taskId ? { ...t, is_completed: true } : t);
      setTasks(sortTasks(updatedTasks));
    } catch (err) {
      console.error("Error completing task:", err);
      setError("Failed to complete task.");
    }
  }

  const handlePrioritizeTask = async (taskId) => {
    setLoading(true);
    setError(null);
    try {
      const response = await axios.post(`http://127.0.0.1:8000/tasks/${taskId}/prioritize/`);
      // Update the specific task and re-sort
      const updatedTasks = tasks.map(t => t.id === taskId ? response.data : t);
      setTasks(sortTasks(updatedTasks));
    } catch (err) {
      console.error("Error prioritizing task:", err);
      setError("Failed to prioritize task.");
    } finally {
      setLoading(false);
    }
  }

  const handlePrioritize = async () => {
    if (tasks.length === 0) return;

    setLoading(true)
    setError(null)
    try {
      const response = await axios.post('http://127.0.0.1:8000/tasks/prioritize')
      setTasks(response.data)
    } catch (err) {
      console.error(err)
      setError("Failed to prioritize tasks. Please try again.")
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="app-container">
      <header className="app-header">
        <div className="header-content">
          <h1><span className="brand-icon"><VscTerminalTmux /></span> Task Prioritization System</h1>
          <div className="header-right">
            {systemHealth && (
              <span className={`health-status ${systemHealth}`}>
                System: {systemHealth}
              </span>
            )}
          </div>
        </div>
      </header>

      <main className="app-content">
        <section className="input-section">
          <TaskForm
            onAdd={handleAddTask}
            onPrioritize={handlePrioritize}
            pendingCount={tasks.length}
            isLoading={loading}
          />
        </section>

        <section className="results-section">
          {loading && <p className="loading-text">Processing...</p>}
          {error && <p className="error-text">{error}</p>}
          <TaskList tasks={tasks} onRemove={handleRemoveTask} onComplete={handleCompleteTask} onPrioritizeTask={handlePrioritizeTask} />
        </section>
      </main>
    </div>
  )
}

export default App
