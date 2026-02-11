import { useState, useEffect } from 'react'
import axios from 'axios'
import './App.css'
import TaskForm from './components/TaskForm'
import TaskList from './components/TaskList'

function App() {
  const [tasks, setTasks] = useState([])
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState(null)

  // Fetch tasks from Database on load
  useEffect(() => {
    fetchTasks();
  }, []);

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

  const handleAddTask = async (newTask) => {
    setLoading(true);
    setError(null);
    try {
      const response = await axios.post('http://127.0.0.1:8000/tasks/', newTask);
      // Add the returned task (with ID from DB) to the list
      setTasks([...tasks, response.data]);
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
      // Refresh list to sort completed to bottom
      fetchTasks();
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
      // Update the specific task in the list
      setTasks(tasks.map(t => t.id === taskId ? response.data : t));
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
      // Call the prioritize endpoint which updates everything in DB and returns sorted list
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
          <h1><span className="brand-icon"></span> Task Prioritization System</h1>
          <p>Optimize your workflow with intelligent task scoring.</p>
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
