import React, { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import "../styles/main.css";
import API from "../api";

const CourseView = () => {
  const { id } = useParams();
  const [course, setCourse] = useState(null);
  const [tasks, setTasks] = useState([]);
  const [filteredTasks, setFilteredTasks] = useState([]);
  const [showEditModal, setShowEditModal] = useState(false);
  const [showAddTaskModal, setShowAddTaskModal] = useState(false);
  const [courseDetails, setCourseDetails] = useState({ name: "", code: "" });
  const [newTask, setNewTask] = useState({
    title: "",
    description: "",
    dueDate: "",
    status: "pending",
  });
  const [searchTerm, setSearchTerm] = useState("");
  const [filterStatus, setFilterStatus] = useState("all");
  const [sortByDate, setSortByDate] = useState(true);
  const navigate = useNavigate();

  useEffect(() => {
    const fetchData = async () => {
      try {
        const courseRes = await API.get(`/courses/${id}`, { withCredentials: true });
        setCourse(courseRes.data);
        setCourseDetails({name: courseRes.data.name, code: courseRes.data.code});

        const tasksRes = await API.get(`/courses/${id}/tasks`, { withCredentials: true });
        setTasks(tasksRes.data);
      } catch (err) {
        alert("Failed to load course or tasks");
      }
    };
    fetchData();
  }, [id]);

  useEffect(() => {
    let tasksToFilter = [...tasks];

    if (filterStatus !== "all") {
      tasksToFilter = tasksToFilter.filter((task) => task.status === filterStatus);
    }

    if (searchTerm) {
      tasksToFilter = tasksToFilter.filter((task) =>
        task.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
        task.description.toLowerCase().includes(searchTerm.toLowerCase())
      );
    }

    tasksToFilter.sort((a, b) =>
      sortByDate
        ? new Date(a.dueDate) - new Date(b.dueDate)
        : new Date(b.dueDate) - new Date(a.dueDate)
    );

    setFilteredTasks(tasksToFilter);
  }, [tasks, searchTerm, filterStatus, sortByDate]);

  const handleTaskToggle = async (taskId, currentStatus) => {
    const newStatus = currentStatus === "completed" ? "pending" : "completed";
    try {
      await API.put(`/tasks/${taskId}`, { status: newStatus }, { withCredentials: true });
      setTasks((prevTasks) =>
        prevTasks.map((task) =>
          task._id === taskId ? { ...task, status: newStatus } : task
        )
      );
    } catch (err) {
      console.error("Task toggle failed");
    }
  };

  const handleCourseUpdate = async () => {
    if (courseDetails.name && courseDetails.code) {
      try {
        const res = await API.put(`/courses/${id}`, courseDetails, { withCredentials: true });
        setCourse(res.data);
        setShowEditModal(false);
      } catch (err) {
        alert("Failed to update course");
      }
    } else {
      alert("Please fill out all course fields!");
    }
  };

  const handleAddTask = async () => {
    if (newTask.title && newTask.description && newTask.dueDate) {
      try {
        const res = await API.post(`/tasks/${id}`, newTask, { withCredentials: true });
        console.log(res);
        setTasks([...tasks, res.data]);
        setNewTask({ title: "", description: "", dueDate: "", status: "pending" });
        setShowAddTaskModal(false);
      } catch (err) {
        alert("Failed to add task");
      }
    } else {
      alert("Please fill out all task fields!");
    }
  };

  const handleDeleteCourse = async () => {
    if (window.confirm("Are you sure you want to delete this course?")) {
      try {
        await API.delete(`/courses/${id}`, { withCredentials: true });
        navigate("/dashboard");
      } catch (err) {
        console.error("Course deletion failed");
      }
    }
  };

  const handleSearchChange = (e) => setSearchTerm(e.target.value);
  const handleFilterChange = (e) => setFilterStatus(e.target.value);
  const handleSortByDateChange = () => setSortByDate(!sortByDate);

  if (!course) {
    return (
      <div className="course-view-container">
        <h2>Course not found</h2>
        <p>Sorry, the course you're looking for doesn't exist.</p>
      </div>
    );
  }

  return (
    <div className="course-view-container">
      <h1>{course.name}</h1>
      <p className="course-code">{course.code}</p>
      <div className="edit-container">
        <button className="edit-course-btn" onClick={() => setShowEditModal(true)}>
          Manage Course
        </button>
        <button className="delete-course-btn" onClick={handleDeleteCourse}>
          Delete Course
        </button>
      </div>

      <h3>Tasks</h3>

      <div className="taskBar">
        <input
          type="text"
          placeholder="Search tasks"
          value={searchTerm}
          onChange={handleSearchChange}
          className="search-input"
        />
        <select onChange={handleFilterChange} value={filterStatus}>
          <option value="all">All Tasks</option>
          <option value="completed">Completed</option>
          <option value="pending">Pending</option>
        </select>
        <button onClick={handleSortByDateChange}>
          {sortByDate ? "Sort by Due Date (Earliest First)" : "Sort by Due Date (Latest First)"}
        </button>
        <button className="add-task-btn" onClick={() => setShowAddTaskModal(true)}>
          Add Task
        </button>
      </div>

      <div className="tasks-container">
        {filteredTasks.length === 0 ? (
          <p>No tasks available for this course.</p>
        ) : (
          filteredTasks.map((task) => (
            <div key={task._id} className="task-card">
              <h4>{task.title}</h4>
              <p>{task.description}</p>
              <p><strong>Due:</strong> {new Date(task.dueDate).toLocaleDateString("en-US")}</p>
              <p><strong>Status:</strong> {task.status}</p>
              <button
                className={`task-status-btn ${task.status}`}
                onClick={() => handleTaskToggle(task._id, task.status)}
              >
                {task.status === "completed" ? "Mark as Pending" : "Mark as Completed"}
              </button>
            </div>
          ))
        )}
      </div>

      {showEditModal && (
        <div className="modal">
          <div className="modal-content">
            <h2>Edit Course</h2>
            <input
              type="text"
              placeholder="Course Name"
              value={courseDetails.name}
              onChange={(e) => setCourseDetails({ ...courseDetails, name: e.target.value })}
            />
            <input
              type="text"
              placeholder="Course Code"
              value={courseDetails.code}
              onChange={(e) => setCourseDetails({ ...courseDetails, code: e.target.value })}
            />
            <button onClick={handleCourseUpdate}>Update Course</button>
            <button onClick={() => setShowEditModal(false)}>Close</button>
          </div>
        </div>
      )}

      {showAddTaskModal && (
        <div className="modal">
          <div className="modal-content">
            <h2>Add New Task</h2>
            <input
              type="text"
              placeholder="Task Title"
              value={newTask.title}
              onChange={(e) => setNewTask({ ...newTask, title: e.target.value })}
            />
            <textarea
              placeholder="Task Description"
              value={newTask.description}
              onChange={(e) => setNewTask({ ...newTask, description: e.target.value })}
            />
            <input
              type="date"
              value={newTask.dueDate}
              onChange={(e) => setNewTask({ ...newTask, dueDate: e.target.value })}
            />
            <button onClick={handleAddTask}>Add Task</button>
            <button onClick={() => setShowAddTaskModal(false)}>Close</button>
          </div>
        </div>
      )}
    </div>
  );
};

export default CourseView;
