import { Link, useNavigate } from "react-router-dom";
import { useAuthStore } from "../store/auth";

export default function Navbar() {
  const { token, setToken, username } = useAuthStore();
  const navigate = useNavigate();

  const handleLogout = () => {
    setToken(null);
    navigate("/signin");
  };

  return (
    <nav className="bg-white shadow-md">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between h-16 items-center">
          <div className="flex items-center">
            <Link to="/" className="text-xl font-bold text-gray-800">
              Metaverse
            </Link>
          </div>

          <div className="flex items-center space-x-4">
            {token ? (
              <>
                <Link
                  to="/"
                  className="text-gray-600 hover:text-gray-800 px-3 py-2 rounded-md text-sm"
                >
                  Spaces
                </Link>
                <div className="flex items-center space-x-4">
                  <span className="text-gray-600 text-sm">Welcome, {username}</span>
                  <button
                    onClick={handleLogout}
                    className="bg-red-500 hover:bg-red-600 text-white px-3 py-2 rounded-md text-sm"
                  >
                    Logout
                  </button>
                </div>
              </>
            ) : (
              <div className="flex items-center space-x-4">
                <Link
                  to="/signin"
                  className="text-gray-600 hover:text-gray-800 px-3 py-2 rounded-md text-sm"
                >
                  Sign In
                </Link>
                <Link
                  to="/signup"
                  className="bg-blue-500 hover:bg-blue-600 text-white px-3 py-2 rounded-md text-sm"
                >
                  Sign Up
                </Link>
              </div>
            )}
          </div>
        </div>
      </div>
    </nav>
  );
}
