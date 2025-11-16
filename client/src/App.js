import React from "react";
import { BrowserRouter as Router, Route, Routes } from "react-router-dom";
import Navbar from "./components/Navbar";
import Login from "./pages/Login";
import Register from "./pages/Register";
import Dashboard from "./pages/Dashboard";
import CourseView from "./pages/CourseView";
import NotFound from "./pages/NotFound";
import StudyGroupList from "./components/StudyGroup/StudyGroupList";
import StudyGroupDetails from "./components/StudyGroup/StudyGroupDetails";

const App = () => {
  return (
    <Router>
      <Navbar />
      <div>
        <Routes>
          <Route path="/" element={<Login />} />
          <Route path="/register" element={<Register />} />
          <Route path="/dashboard" element={<Dashboard />} />
          <Route path="/course/:id" element={<CourseView />} />
          <Route path="/study-groups" element={<StudyGroupList />} />
          <Route path="/study-groups/:id" element={<StudyGroupDetails />} />
          <Route path="*" element={<NotFound />} />
        </Routes>
      </div>
    </Router>
  );
};

export default App;