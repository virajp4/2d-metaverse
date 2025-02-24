import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import SignIn from "./pages/SignIn";
import SignUp from "./pages/SignUp";
import Arena from "./pages/Arena";
import Home from "./pages/Home";
import Navbar from "./components/Navbar";
import { useAuthStore } from "./store/auth";

function App() {
  const { token } = useAuthStore();

  return (
    <BrowserRouter>
      <div className="min-h-screen bg-gray-100">
        <Navbar />
        <main className="pt-6">
          <Routes>
            <Route path="/signin" element={!token ? <SignIn /> : <Navigate to="/" />} />
            <Route path="/signup" element={!token ? <SignUp /> : <Navigate to="/" />} />
            <Route path="/arena/:spaceId" element={token ? <Arena /> : <Navigate to="/signin" />} />
            <Route path="/" element={token ? <Home /> : <Navigate to="/signin" />} />
          </Routes>
        </main>
      </div>
    </BrowserRouter>
  );
}

export default App;
