import { useState, useEffect } from "react";
import "../styles/main.css";
import API from "../api";
import { useNavigate } from "react-router-dom";

const Login = () => {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const navigate = useNavigate();

  useEffect(() => {
    const checkLoggedIn = async () => {
      try{
        const res = await API.get("/auth/me", { withCredentials: true });
        if(res.data){
          navigate("/dashboard");
        }
      } catch (err){
        // no valid session
      }
    }
    checkLoggedIn();
  }, []);

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      await API.post(
        "/auth/login",
        { email, password },
        { withCredentials: true }
      );
      alert("Login successful!");
      navigate("/dashboard");
    } catch (err) {
      alert(err.response?.data?.message || "Login failed");
    }
  };

  return (
    <div className="login-container">
      <h1>Login</h1>
      <form onSubmit={handleSubmit}>
        <div>
          <label>Email</label>
          <input
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            required
          />
        </div>
        <div>
          <label>Password</label>
          <input
            type="password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            required
          />
        </div>
        <button type="submit">Login</button>
      </form>
    </div>
  );
};

export default Login;