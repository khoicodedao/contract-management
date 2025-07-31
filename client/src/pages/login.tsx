import { useState, useEffect } from "react";
import { useLocation } from "wouter";
import { login } from "@/lib/auth";
import { User, Lock } from "lucide-react"; // 👈 Icon

export default function LoginPage() {
  const [, navigate] = useLocation();
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");

  const handleLogin = () => {
    if (username === "admin" && password === "admin") {
      login("fake-token");
      navigate("/");
    } else {
      setError("Sai tên đăng nhập hoặc mật khẩu");
    }
  };

  useEffect(() => {
    document.title = "Đăng nhập";
  }, []);

  return (
    <div className="flex items-center justify-center min-h-screen bg-gradient-to-br from-slate-100 to-slate-300 px-4">
      <div className="bg-white shadow-lg rounded-xl px-10 py-8 w-full max-w-lg">
        <h2 className="text-2xl font-bold mb-6 text-center text-gray-800">
          Đăng nhập hệ thống
        </h2>

        <div className="mb-5">
          <label className="block text-sm font-medium mb-1 text-gray-600">
            Tên đăng nhập
          </label>
          <div className="flex items-center border rounded px-3 py-2 bg-white">
            <User className="w-4 h-4 text-gray-500 mr-2" />
            <input
              type="text"
              className="w-full focus:outline-none"
              value={username}
              onChange={(e) => setUsername(e.target.value)}
              placeholder="admin"
            />
          </div>
        </div>

        <div className="mb-5">
          <label className="block text-sm font-medium mb-1 text-gray-600">
            Mật khẩu
          </label>
          <div className="flex items-center border rounded px-3 py-2 bg-white">
            <Lock className="w-4 h-4 text-gray-500 mr-2" />
            <input
              type="password"
              className="w-full focus:outline-none"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="admin"
            />
          </div>
        </div>

        {error && (
          <div className="text-red-600 text-sm mb-4 text-center font-medium">
            {error}
          </div>
        )}

        <button
          onClick={handleLogin}
          className="w-full bg-blue-600 text-white py-2 rounded-lg hover:bg-blue-700 transition font-medium"
        >
          Đăng nhập
        </button>
      </div>
    </div>
  );
}
