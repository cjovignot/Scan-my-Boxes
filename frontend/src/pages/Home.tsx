import React, { useEffect, useState } from "react";
import axios from "axios";
import { useNavigate } from "react-router-dom";

const Home = () => {
  const [user, setUser] = useState<any>(null);
  const navigate = useNavigate();

  useEffect(() => {
    axios
      .get(`${import.meta.env.VITE_API_URL}/api/auth/me`, {
        withCredentials: true,
      })
      .then((res) => setUser(res.data.user))
      .catch(() => setUser(null));
  }, []);

  const logout = () => {
    axios
      .post(
        `${import.meta.env.VITE_API_URL}/api/auth/logout`,
        {},
        { withCredentials: true }
      )
      .then(() => setUser(null));
  };

  return (
    <div>
      <h1>Home</h1>

      {user ? (
        <div>
          <p>Welcome {user.name}</p>
          <button onClick={logout}>Logout</button>
        </div>
      ) : (
        <div>
          <p>You are not logged in</p>
          <button onClick={() => navigate("/login")}>Go to Login</button>
        </div>
      )}
    </div>
  );
};

export default Home;
