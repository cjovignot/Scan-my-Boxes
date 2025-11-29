import { useEffect } from "react";
import { useNavigate } from "react-router-dom";
import axios from "axios";

const Callback = () => {
  const navigate = useNavigate();

  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    const code = params.get("code");

    if (code) {
      axios
        .post(
          `${import.meta.env.VITE_API_URL}/api/auth/google/callback`,
          { code },
          { withCredentials: true }
        )
        .then(() => navigate("/"))
        .catch((err) => console.error(err));
    }
  }, []);

  return <div>Loading...</div>;
};

export default Callback;
