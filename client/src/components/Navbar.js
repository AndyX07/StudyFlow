import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import "../styles/main.css";
import API from '../api';
import { useNavigate } from 'react-router-dom';

const Navbar = () => {
  const [isOpen, setIsOpen] = useState(false);
  
  const toggleMenu = () => setIsOpen(!isOpen);
  const navigate = useNavigate();

  const handleLogout  = async() =>{
    try{
      const res = await API.post(`/auth/logout`, {}, {withCredentials: true});
      navigate('/');
    }
    catch(err){
      console.log("Cannot logout");
    }
  }

  return (
    <nav className="navbar">
      <Link to="/dashboard" onClick={() => setIsOpen(false)}>
        <img src="/logo.png" className="navbar-logo" alt="Logo" />
      </Link>

      <div className="nav-container">
        <div className="menu-toggle" onClick={toggleMenu}>
          {isOpen ? '×' : '☰'}
        </div>
        <ul className={`navbar-links ${isOpen ? 'active' : ''}`}>
          <li>
            <Link to="/" onClick={() => setIsOpen(false)}>
              Login
            </Link>
          </li>
          <li>
            <Link to="/register" onClick={() => setIsOpen(false)}>
              Register
            </Link>
          </li>
          <li>
            <Link to="/dashboard" onClick={() => setIsOpen(false)}>
              Dashboard
            </Link>
          </li>
          <li>
            <button onClick={handleLogout} className="logout-button">Logout</button>
          </li>
        </ul>
      </div>
    </nav>
  );
};

export default Navbar;
