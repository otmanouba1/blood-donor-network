"use client";
import { useState } from "react";
import { useNavigate } from "react-router-dom";
import Header from "../../components/Header";
import Footer from "../../components/Footer";
import { api } from "../../config/api";


export default function Login() {
  const [formData, setFormData] = useState({ email: "", password: "" });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const navigate = useNavigate();

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
    if (error) setError(""); // clear error on typing
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError("");

    if (!formData.email || !formData.password) {
      setError("Please fill in all fields");
      setLoading(false);
      return;
    }

    try {
      const res = await api.post('/auth/login', formData);
      const data = res.data;
      console.log("Login response:", data);

      // 🔒 Handle facility waiting approval or rejected cases
      if (data.message?.includes("awaiting admin approval")) {
        setError("Your account is awaiting admin approval. Please wait for confirmation.");
        return;
      }
      if (data.message?.includes("rejected")) {
        setError("Your registration has been rejected by admin.");
        return;
      }

      // ✅ Save token and role from response
      const role = data.user?.role || "unknown";
      console.log("Login successful, user role:", role);
      console.log("Redirect path:", data.redirect);
      
      localStorage.setItem("token", data.token);
      localStorage.setItem("role", role);

      // ✅ Redirect based on backend response or fallback
      const targetPath =
        data.redirect ||
        (role === "donor"
          ? "/donor"
          : role === "hospital"
          ? "/hospital"
          : role === "blood-lab"
          ? "/lab"
          : role === "admin"
          ? "/admin"
          : "/");

      console.log("Navigating to:", targetPath);
      // ✅ Navigate to the dashboard or home
      navigate(targetPath, { replace: true });
    } catch (err) {
      console.error("Login error:", err);
      setError(err.response?.data?.message || err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-slate-50 px-4">
      <Header />
      <div className="bg-white shadow-sm rounded-3xl border border-slate-200 p-8 w-full max-w-md hover:shadow-lg transition-all duration-300">
        <h2 className="text-2xl font-bold text-slate-900 tracking-tight text-center mb-4">
          Login to Blood Bank
        </h2>
        <p className="text-center text-slate-500 font-medium mb-6">
          Access your donor, hospital, or lab dashboard
        </p>

        {error && (
          <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-xl mb-4 flex items-center">
            <div className="bg-red-50 p-3 rounded-xl text-red-600 mr-3">
              <span>⚠</span>
            </div>
            {error}
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-6">
          <div>
            <label className="block text-sm font-bold text-slate-900 mb-2">
              Email
            </label>
            <input
              type="email"
              name="email"
              placeholder="Enter your email"
              value={formData.email}
              onChange={handleChange}
              required
              disabled={loading}
              className="w-full px-4 py-3 bg-white border border-slate-200 focus:ring-2 focus:ring-red-100 rounded-xl outline-none transition disabled:opacity-50"
            />
          </div>

          <div>
            <label className="block text-sm font-bold text-slate-900 mb-2">
              Password
            </label>
            <input
              type="password"
              name="password"
              placeholder="Enter your password"
              value={formData.password}
              onChange={handleChange}
              required
              disabled={loading}
              className="w-full px-4 py-3 bg-white border border-slate-200 focus:ring-2 focus:ring-red-100 rounded-xl outline-none transition disabled:opacity-50"
            />
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full py-3 bg-red-600 hover:bg-red-700 text-white rounded-xl font-medium shadow-red-200 transition disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center"
          >
            {loading ? (
              <>
                <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin mr-2"></div>
                Logging in...
              </>
            ) : (
              "Login"
            )}
          </button>
        </form>

        <p className="mt-6 text-center text-slate-500 font-medium text-sm">
          Don't have an account?{" "}
          <a
            href="/"
            className="text-red-600 font-bold hover:underline"
          >
            Register
          </a>
        </p>
      </div>
    </div>
  );
}
