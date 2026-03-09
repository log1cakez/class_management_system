"use client";

import { useState } from "react";
import Image from "next/image";
import { IMAGES } from "@/assets/images/config";
import { useRouter } from "next/navigation";

export default function AuthPage() {
  const [isLogin, setIsLogin] = useState(true);
  const [showForgotPassword, setShowForgotPassword] = useState(false);
  const [forgotEmail, setForgotEmail] = useState("");
  const [forgotLoading, setForgotLoading] = useState(false);
  const [forgotMessage, setForgotMessage] = useState<{ type: "success" | "error"; text: string } | null>(null);
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    password: "",
    confirmPassword: "",
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const router = useRouter();

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value,
    });
  };

  const handleForgotPassword = async (e: React.FormEvent) => {
    e.preventDefault();
    setForgotLoading(true);
    setForgotMessage(null);
    try {
      const res = await fetch("/api/teachers/forgot-password", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email: forgotEmail.trim() }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Failed to send email");
      setForgotMessage({ type: "success", text: data.message });
      setForgotEmail("");
    } catch (err) {
      setForgotMessage({
        type: "error",
        text: err instanceof Error ? err.message : "Something went wrong",
      });
    } finally {
      setForgotLoading(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError("");

    try {
      if (!isLogin && formData.password !== formData.confirmPassword) {
        setError("Passwords do not match");
        setLoading(false);
        return;
      }

      const endpoint = isLogin ? "/api/teachers" : "/api/teachers";
      const method = isLogin ? "PUT" : "POST";

      const body = isLogin
        ? { email: formData.email, password: formData.password }
        : {
            name: formData.name,
            email: formData.email,
            password: formData.password,
          };

      const response = await fetch(endpoint, {
        method,
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(body),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || "Authentication failed");
      }

      // Store token in localStorage
      localStorage.setItem("token", data.token);
      localStorage.setItem("teacher", JSON.stringify(data.teacher));

      // Redirect to teacher dashboard
      router.push(`/teacher-dashboard?teacherId=${data.teacher.id}`);
    } catch (err) {
      setError(err instanceof Error ? err.message : "An error occurred");
    } finally {
      setLoading(false);
    }
  };

  return (
    <main className="min-h-screen relative overflow-hidden">
      {/* Background Video */}
      <div className="absolute inset-0 z-0">
        <video
          src={IMAGES.HOMEPAGE_BG}
          autoPlay
          loop
          muted
          playsInline
          className="absolute inset-0 w-full h-full object-cover object-center"
        />
      </div>

      {/* Content Overlay */}
      <div className="relative z-10 min-h-screen flex items-center justify-center p-8">
        <div className="bg-white bg-opacity-95 rounded-3xl p-8 max-w-md w-full shadow-2xl border-4 border-yellow-400">
          {/* Title */}
          <div className="text-center mb-8">
            <h1 className="text-3xl font-bold text-center drop-shadow-sm mb-2" style={{ color: "#FFDF73" }}>
              {isLogin ? "TEACHER LOGIN" : "TEACHER REGISTRATION"}
            </h1>
            <p className="text-gray-600">
              {isLogin ? "Welcome back!" : "Create your teacher account"}
            </p>
          </div>

          {/* Error Message */}
          {error && (
            <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded mb-4">
              {error}
            </div>
          )}

          {/* Form */}
          <form onSubmit={handleSubmit} className="space-y-4">
            {!isLogin && (
              <div>
                <label
                  htmlFor="name"
                  className="block text-sm font-medium text-gray-700 mb-1"
                >
                  Full Name
                </label>
                <input
                  type="text"
                  id="name"
                  name="name"
                  value={formData.name}
                  onChange={handleInputChange}
                  required={!isLogin}
                  className="w-full px-4 py-3 text-black border border-gray-300 rounded-lg focus:ring-2 focus:ring-yellow-500 focus:border-yellow-500"
                  placeholder="Enter your full name"
                />
              </div>
            )}

            <div>
              <label
                htmlFor="email"
                className="block text-sm font-medium text-gray-700 mb-1"
              >
                Email Address
              </label>
              <input
                type="email"
                id="email"
                name="email"
                value={formData.email}
                onChange={handleInputChange}
                required
                className="w-full px-4 py-3 text-black border border-gray-300 rounded-lg focus:ring-2 focus:ring-yellow-500 focus:border-yellow-500"
                placeholder="Enter your email"
              />
            </div>

            <div>
              <div className="flex items-center justify-between mb-1">
                <label
                  htmlFor="password"
                  className="block text-sm font-medium text-gray-700"
                >
                  Password
                </label>
                {isLogin && (
                  <button
                    type="button"
                    onClick={() => {
                      setShowForgotPassword(true);
                      setForgotMessage(null);
                      setForgotEmail(formData.email);
                    }}
                    className="text-sm text-yellow-600 hover:text-yellow-700 font-medium"
                  >
                    Forgot password?
                  </button>
                )}
              </div>
              <input
                type="password"
                id="password"
                name="password"
                value={formData.password}
                onChange={handleInputChange}
                required
                className="w-full px-4 py-3 text-black border border-gray-300 rounded-lg focus:ring-2 focus:ring-yellow-500 focus:border-yellow-500"
                placeholder="Enter your password"
              />
            </div>

            {!isLogin && (
              <div>
                <label
                  htmlFor="confirmPassword"
                  className="block text-sm font-medium text-gray-700 mb-1"
                >
                  Confirm Password
                </label>
                <input
                  type="password"
                  id="confirmPassword"
                  name="confirmPassword"
                  value={formData.confirmPassword}
                  onChange={handleInputChange}
                  required={!isLogin}
                  className="w-full px-4 py-3 text-black border border-gray-300 rounded-lg focus:ring-2 focus:ring-yellow-500 focus:border-yellow-500"
                  placeholder="Confirm your password"
                />
              </div>
            )}

            <button
              type="submit"
              disabled={loading}
              className="w-full bg-yellow-500 hover:bg-yellow-600 text-white font-bold py-4 px-6 rounded-lg shadow-lg border-2 border-yellow-600 transition-all duration-200 hover:scale-105 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {loading ? "Processing..." : isLogin ? "Login" : "Register"}
            </button>
          </form>

          {/* Forgot Password Modal */}
          {showForgotPassword && (
            <div className="fixed inset-0 z-40 flex items-center justify-center bg-black/50 p-4">
              <div className="bg-white rounded-2xl p-6 max-w-md w-full shadow-2xl border-4 border-yellow-400">
                <h2 className="text-xl font-bold text-yellow-700 mb-2">Forgot Password</h2>
                <p className="text-gray-600 text-sm mb-4">
                  Enter your registered email and we&apos;ll send you your password.
                </p>
                {forgotMessage && (
                  <div
                    className={`mb-4 p-3 rounded-lg text-sm ${
                      forgotMessage.type === "success"
                        ? "bg-green-100 border border-green-400 text-green-700"
                        : "bg-red-100 border border-red-400 text-red-700"
                    }`}
                  >
                    {forgotMessage.text}
                  </div>
                )}
                <form onSubmit={handleForgotPassword} className="space-y-4">
                  <input
                    type="email"
                    value={forgotEmail}
                    onChange={(e) => setForgotEmail(e.target.value)}
                    required
                    className="w-full px-4 py-3 text-black border border-gray-300 rounded-lg focus:ring-2 focus:ring-yellow-500 focus:border-yellow-500"
                    placeholder="Enter your email"
                  />
                  <div className="flex gap-3">
                    <button
                      type="submit"
                      disabled={forgotLoading}
                      className="flex-1 px-4 py-3 bg-yellow-500 hover:bg-yellow-600 text-white font-bold rounded-lg disabled:opacity-50"
                    >
                      {forgotLoading ? "Sending..." : "Send Password"}
                    </button>
                    <button
                      type="button"
                      onClick={() => {
                        setShowForgotPassword(false);
                        setForgotMessage(null);
                      }}
                      className="px-4 py-3 bg-gray-300 hover:bg-gray-400 text-gray-800 font-bold rounded-lg"
                    >
                      Cancel
                    </button>
                  </div>
                </form>
              </div>
            </div>
          )}

          {/* Toggle between login and register */}
          <div className="text-center mt-6">
            <p className="text-gray-600">
              {isLogin ? "Don't have an account?" : "Already have an account?"}
            </p>
            <button
              type="button"
              onClick={() => {
                setIsLogin(!isLogin);
                setError("");
                setFormData({
                  name: "",
                  email: "",
                  password: "",
                  confirmPassword: "",
                });
              }}
              className="text-yellow-600 hover:text-yellow-700 font-semibold underline"
            >
              {isLogin ? "Register here" : "Login here"}
            </button>
          </div>
        </div>
      </div>
    </main>
  );
}
