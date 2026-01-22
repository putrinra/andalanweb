import { useState } from "react";
import "../styles/login.css";

export default function Login() {
  const [mode, setMode] = useState("password");
  const [isRegister, setIsRegister] = useState(false);
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [qrFile, setQrFile] = useState(null);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");

  // ===== REGISTER =====
  const handleRegister = (e) => {
    e.preventDefault();
    setError("");
    setSuccess("");

    if (!username || !password || !confirmPassword) {
      setError("Semua field harus diisi");
      return;
    }

    if (password !== confirmPassword) {
      setError("Password tidak cocok");
      return;
    }

    if (password.length < 4) {
      setError("Password minimal 4 karakter");
      return;
    }

    // Simpan user baru ke localStorage
    const users = JSON.parse(localStorage.getItem("users") || "[]");
    
    // Cek apakah username sudah ada
    if (users.find(u => u.username === username)) {
      setError("Username sudah terdaftar");
      return;
    }

    users.push({ username, password });
    localStorage.setItem("users", JSON.stringify(users));
    
    setSuccess("Akun berhasil dibuat! Silakan login.");
    setUsername("");
    setPassword("");
    setConfirmPassword("");
    
    // Kembali ke form login setelah 2 detik
    setTimeout(() => {
      setIsRegister(false);
      setSuccess("");
    }, 2000);
  };

  // ===== LOGIN =====
  const handleLogin = (e) => {
    e.preventDefault();
    setError("");

    // Cek default admin
    if (username === "admin" && password === "admin") {
      localStorage.setItem("auth", "true");
      window.location.reload();
      return;
    }

    // Cek user yang terdaftar
    const users = JSON.parse(localStorage.getItem("users") || "[]");
    const user = users.find(u => u.username === username && u.password === password);

    if (user) {
      localStorage.setItem("auth", "true");
      window.location.reload();
    } else {
      setError("Username atau password salah");
    }
  };

  const handleQRUpload = (e) => {
    const file = e.target.files[0];
    setQrFile(file);

    if (file) {
      localStorage.setItem("auth", "true");
      window.location.reload();
    }
  };

  const handleScan = () => {
    alert("Scan QR (dummy berhasil)");
    localStorage.setItem("auth", "true");
    window.location.reload();
  };

  return (
    <div className="login-container">
      <h1 className="brand-title">ENTER THE BRAND NAME HERE</h1>
      <p className="subtitle">
        {isRegister ? "Create your account" : "Sign in to start your new session"}
      </p>

      {/* Toggle Button - hanya tampil saat login */}
      {!isRegister && (
        <div className="toggle-wrapper">
          <button
            type="button"
            className={mode === "password" ? "active" : ""}
            onClick={() => setMode("password")}
          >
            Use Password
          </button>
          <button
            type="button"
            className={mode === "qr" ? "active" : ""}
            onClick={() => setMode("qr")}
          >
            Scan QR
          </button>
        </div>
      )}

      {/* REGISTER FORM */}
      {isRegister && (
        <form className="form" onSubmit={handleRegister}>
          <label>Username</label>
          <input
            type="text"
            placeholder="Enter username"
            value={username}
            onChange={(e) => setUsername(e.target.value)}
          />

          <label>Password</label>
          <input
            type="password"
            placeholder="Enter password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
          />

          <label>Confirm Password</label>
          <input
            type="password"
            placeholder="Re-enter password"
            value={confirmPassword}
            onChange={(e) => setConfirmPassword(e.target.value)}
          />

          {error && <p className="error-text">{error}</p>}
          {success && <p className="success-text">{success}</p>}

          <button type="submit" className="login-btn">
            Create Account
          </button>

          <button 
            type="button" 
            className="signin-btn"
            onClick={() => {
              setIsRegister(false);
              setError("");
              setSuccess("");
              setUsername("");
              setPassword("");
              setConfirmPassword("");
            }}
          >
            Back to Login
          </button>
        </form>
      )}

      {/* PASSWORD LOGIN */}
      {!isRegister && mode === "password" && (
        <form className="form" onSubmit={handleLogin}>
          <label>Username</label>
          <input
            type="text"
            placeholder="User"
            value={username}
            onChange={(e) => setUsername(e.target.value)}
          />

          <label>Password</label>
          <input
            type="password"
            placeholder="Password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
          />

          {error && <p className="error-text">{error}</p>}

          <button type="submit" className="login-btn">
            Login
          </button>

          <button 
            type="button" 
            className="signin-btn"
            onClick={() => {
              setIsRegister(true);
              setError("");
              setUsername("");
              setPassword("");
            }}
          >
            Sign In
          </button>
        </form>
      )}

      {/* QR LOGIN */}
      {!isRegister && mode === "qr" && (
        <div className="qr-section">
          <label className="upload-box">
            Drop File
            <input type="file" hidden onChange={handleQRUpload} />
          </label>

          <div className="divider">
            <span></span>
            <p>or</p>
            <span></span>
          </div>

          <button className="scan-btn" onClick={handleScan}>
            Scan
          </button>
        </div>
      )}
    </div>
  );
}