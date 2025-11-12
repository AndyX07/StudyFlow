import { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import "../styles/main.css";
import API from "../api";

const Dashboard = () => {
  const [courses, setCourses] = useState([]);
  const [newCourse, setNewCourse] = useState({ name: "", code: "" });
  const [showModal, setShowModal] = useState(false);
  const [isAuthenticated, setIsAuthenticated] = useState(true);

  useEffect(() => {
    const fetchCourses = async () => {
      try {
        await API.get("/auth/me", { withCredentials: true });
        const coursesRes = await API.get("/courses", { withCredentials: true });
        setCourses(coursesRes.data);
      } catch (err) {
        setIsAuthenticated(false);
      }
    };
    fetchCourses();
  }, []);

  const handleAddCourse = async () => {
    const { name, code } = newCourse;

    if (!name || !code) {
      return alert("Please fill out both name and course code!");
    }

    try {
      const res = await API.post(
        "/courses",
        { name, code },
        { withCredentials: true }
      );
      setCourses([...courses, res.data]);
      setNewCourse({ name: "", code: "" });
      setShowModal(false);
    } catch (err) {
      alert("Failed to add course");
    }
  };

  return (
    <div className="dashboard-container">
      <h1>Dashboard</h1>
      {!isAuthenticated ? (
        <p>User is not authenticated. Please log in to access the dashboard.</p>
      ) : (
        <>
          <p>Welcome to your study dashboard!</p>
          <button className="add-course-btn" onClick={() => setShowModal(true)}>
            Add Course
          </button>

          <div className="courses-container">
            {courses.map((course) => (
              <div key={course._id} className="course-card">
                <h3>{course.name}</h3>
                <p>{course.code}</p>
                <Link to={`/course/${course._id}`} className="course-link">
                  Go to {course.name}
                </Link>
              </div>
            ))}
          </div>

          {showModal && (
            <div className="modal">
              <div className="modal-content">
                <h2>Add New Course</h2>
                <input
                  type="text"
                  placeholder="Course Name"
                  value={newCourse.name}
                  onChange={(e) =>
                    setNewCourse({ ...newCourse, name: e.target.value })
                  }
                />
                <input
                  type="text"
                  placeholder="Course Code"
                  value={newCourse.code}
                  onChange={(e) =>
                    setNewCourse({ ...newCourse, code: e.target.value })
                  }
                />
                <button onClick={handleAddCourse}>Add Course</button>
                <button onClick={() => setShowModal(false)}>Close</button>
              </div>
            </div>
          )}
        </>
      )}
    </div>
  );
};

export default Dashboard;
