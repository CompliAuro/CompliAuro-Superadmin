"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { Shield, Lock, Mail, Zap, Eye, EyeOff } from "lucide-react";
import Link from "next/link";
import { motion, AnimatePresence } from "framer-motion";
import { API_BASE_URL } from "../config";

function parseJwt(token: string) {
  try {
    const base64Url = token.split(".")[1];
    const base64 = base64Url.replace(/-/g, "+").replace(/_/g, "/");
    const jsonPayload = decodeURIComponent(
      window.atob(base64)
        .split("")
        .map(c => "%" + ("00" + c.charCodeAt(0).toString(16)).slice(-2))
        .join("")
    );
    return JSON.parse(jsonPayload);
  } catch (e) {
    return null;
  }
}

export default function SuperAdminLogin() {
  const router = useRouter();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const token = localStorage.getItem("token");
    if (token) {
      if (token === "mock-superadmin-jwt-token") {
        router.push("/");
        return;
      }
      const decoded = parseJwt(token);
      if (decoded && decoded.role === "SUPER_ADMIN") {
        const now = Math.floor(Date.now() / 1000);
        if (!decoded.exp || decoded.exp > now) {
          router.push("/");
        }
      }
    }
  }, [router]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);

    try {
      const res = await fetch(`${API_BASE_URL}/superadmin/login`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, password }),
      });

      const body = await res.json();

      if (res.ok && body?.data?.accessToken) {
        localStorage.setItem("token", body.data.accessToken);
        localStorage.setItem("adminEmail", email);
        router.push("/");
      } else {
        setError(body?.message || "Invalid superadmin credentials. Please verify email and password.");
      }
    } catch (err) {
      console.warn("Authentication server offline, engaging mock bypass.", err);
      // Local Mock Login fallback for demo/development purposes
      if (email.trim().toLowerCase() === "admin@compliauro.com") {
        localStorage.setItem("token", "mock-superadmin-jwt-token");
        localStorage.setItem("adminEmail", email.trim());
        router.push("/");
      } else {
        setError("Offline Mode: Enter email 'admin@compliauro.com' (any password) to bypass authentication when the backend is offline.");
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-[#030303] flex items-center justify-center p-6 font-sans relative overflow-hidden">
      {/* Decorative Animated Glow Orbs */}
      <motion.div
        animate={{
          scale: [1, 1.2, 1],
          x: [0, 40, 0],
          y: [0, -30, 0],
        }}
        transition={{
          duration: 10,
          repeat: Infinity,
          ease: "easeInOut",
        }}
        className="absolute -top-[120px] -right-[120px] w-[350px] h-[350px] bg-[rgba(0,212,200,0.15)] blur-[90px] rounded-full pointer-events-none"
      />
      <motion.div
        animate={{
          scale: [1, 1.3, 1],
          x: [0, -50, 0],
          y: [0, 40, 0],
        }}
        transition={{
          duration: 12,
          repeat: Infinity,
          ease: "easeInOut",
        }}
        className="absolute -bottom-[150px] -left-[150px] w-[400px] h-[400px] bg-[rgba(168,85,247,0.12)] blur-[100px] rounded-full pointer-events-none"
      />

      <motion.div
        initial={{ opacity: 0, y: 30 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6, ease: "easeOut" }}
        className="w-full max-w-[440px] glass-panel relative overflow-hidden"
        style={{
          border: "1px solid rgba(0, 212, 200, 0.12)",
          boxShadow: "0 25px 50px -12px rgba(0, 0, 0, 0.6), 0 0 40px rgba(0, 212, 200, 0.03)",
          padding: "40px 36px 36px 36px",
          borderRadius: "16px",
          display: "flex",
          flexDirection: "column",
          gap: "28px"
        }}
      >
        {/* Glow accent bar at the top */}
        <div className="absolute top-0 left-0 right-0 h-[2px] bg-gradient-to-r from-transparent via-[#00D4C8] to-transparent opacity-80" />

        {/* Logo Header */}
        <div style={{ display: "flex", flexDirection: "column", alignItems: "center", gap: "12px", textAlign: "center" }}>
          <motion.div 
            whileHover={{ scale: 1.05, rotate: 5 }}
            className="w-14 h-14 rounded-2xl bg-gradient-to-br from-[#00D4C8] to-[#00A89E] flex items-center justify-center text-[#050505] shadow-[0_0_20px_rgba(0,212,200,0.3)] cursor-pointer"
          >
            <Shield size={28} />
          </motion.div>
          <div>
            <h1 className="text-2xl font-extrabold tracking-tight text-white font-heading" style={{ margin: 0, lineHeight: 1.2 }}>
              Platform Super Admin
            </h1>
            <p className="text-xs text-[#7FA8A3]" style={{ marginTop: "6px", marginBottom: 0, fontWeight: 500 }}>
              Access the central operations control panel
            </p>
          </div>
        </div>

        {/* Error notification */}
        <AnimatePresence>
          {error && (
            <motion.div 
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: "auto" }}
              exit={{ opacity: 0, height: 0 }}
              style={{ overflow: "hidden" }}
            >
              <div 
                className="flex items-center gap-3 rounded-xl border border-[rgba(239,68,68,0.2)] bg-[rgba(239,68,68,0.03)] text-xs text-[#ef4444] shadow-[0_4px_12px_rgba(239,68,68,0.05)]"
                style={{ padding: "12px 14px" }}
              >
                <Zap size={14} className="shrink-0" />
                <span className="font-medium leading-relaxed">{error}</span>
              </div>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Form */}
        <form onSubmit={handleSubmit} style={{ display: "flex", flexDirection: "column", gap: "20px" }}>
          <div style={{ display: "flex", flexDirection: "column", gap: "6px" }}>
            <label style={{ fontSize: "11px", fontWeight: 700, color: "#7FA8A3", textTransform: "uppercase", letterSpacing: "0.05em" }}>
              Administrator Email
            </label>
            <div className="relative">
              <input
                className="form-input"
                style={{ 
                  paddingLeft: "44px", 
                  paddingRight: "14px",
                  paddingTop: "12px", 
                  paddingBottom: "12px",
                  fontSize: "14px",
                  borderRadius: "10px",
                  border: "1px solid rgba(255, 255, 255, 0.08)",
                  background: "#080808",
                  width: "100%",
                  color: "#fff",
                  outline: "none"
                }}
                type="email"
                required
                placeholder="xyz@example.com"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
              />
              <Mail size={18} className="absolute left-4 top-1/2 -translate-y-1/2 text-[#7FA8A3] opacity-80" />
            </div>
          </div>

          <div style={{ display: "flex", flexDirection: "column", gap: "6px" }}>
            <label style={{ fontSize: "11px", fontWeight: 700, color: "#7FA8A3", textTransform: "uppercase", letterSpacing: "0.05em" }}>
              Security Password
            </label>
            <div className="relative">
              <input
                className="form-input"
                style={{ 
                  paddingLeft: "44px", 
                  paddingRight: "44px",
                  paddingTop: "12px", 
                  paddingBottom: "12px",
                  fontSize: "14px",
                  borderRadius: "10px",
                  border: "1px solid rgba(255, 255, 255, 0.08)",
                  background: "#080808",
                  width: "100%",
                  color: "#fff",
                  outline: "none"
                }}
                type={showPassword ? "text" : "password"}
                required
                placeholder="••••••••"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
              />
              <Lock size={18} className="absolute left-4 top-1/2 -translate-y-1/2 text-[#7FA8A3] opacity-80" />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="absolute right-4 top-1/2 -translate-y-1/2 text-[#7FA8A3] hover:text-white transition-colors duration-200"
                style={{ background: "none", border: "none", cursor: "pointer", padding: 0 }}
              >
                {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
              </button>
            </div>
          </div>

          <motion.button 
            whileHover={{ scale: 1.01 }}
            whileTap={{ scale: 0.99 }}
            type="submit" 
            disabled={loading} 
            className="btn btn-primary w-full mt-2 py-3 rounded-xl font-bold tracking-wide shadow-[0_4px_20px_rgba(0,212,200,0.2)]"
            style={{ fontSize: "14px", height: "46px" }}
          >
            {loading ? "Verifying Credentials..." : "Authenticate Session"}
          </motion.button>
        </form>

        {/* Links */}
        <div style={{ textAlign: "center", fontSize: "13px", color: "#7FA8A3", borderTop: "1px solid rgba(255,255,255,0.05)", paddingTop: "24px", marginTop: "4px", fontWeight: 500 }}>
          New deployment?{" "}
          <Link href="/register" className="text-[#00D4C8] hover:text-[#00BDB3] transition-colors duration-200 font-bold ml-1">
            Register Super Admin
          </Link>
        </div>
      </motion.div>
    </div>
  );
}
