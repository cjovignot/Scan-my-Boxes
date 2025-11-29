import axios from "axios";

export default function GoogleButton() {
  const login = async () => {
    const { data } = await axios.get("/api/auth/google/url");
    window.location.href = data.url; // redirection OAuth
  };

  return (
    // <button onClick={login} style={{ padding: 10 }}>
    //   🔐 Se connecter avec Google
    // </button>
    <button
      // disabled={!isLoaded}
      onClick={login}
      className="flex items-center w-[250px] h-[50px] px-1 py-3 transition-all duration-200 bg-[#131314] rounded-full shadow hover:shadow-lg hover:scale-105"
    >
      <img
        src="https://www.gstatic.com/firebasejs/ui/2.0.0/images/auth/google.svg"
        alt="Google"
        className="w-10 p-2 mr-3 bg-white rounded-full"
      />
      <span className="flex justify-center w-full text-sm font-medium text-white">
        Sign in with Google
      </span>
    </button>
  );
}
