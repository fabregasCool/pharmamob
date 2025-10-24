"use client";

import { useState, useEffect } from "react";
import { useSearchParams, useRouter } from "next/navigation";

export default function ResetPasswordPage() {
  const searchParams = useSearchParams();
  const router = useRouter();
  const token = searchParams.get("token");

  const [password, setPassword] = useState("");
  const [confirm, setConfirm] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");

  // 👁️ toggle visibility states
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirm, setShowConfirm] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (password !== confirm) {
      setError("Les mots de passe ne correspondent pas");
      return;
    }

    setError("");
    setLoading(true);

    try {
      const res = await fetch("/api/auth/reset-password", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ token, newPassword: password }),
      });

      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Erreur inconnue");

      setSuccess(data.message);
      setPassword("");
      setConfirm("");
    } catch (err: unknown) {
      if (err instanceof Error) {
        setError(err.message);
      } else {
        setError("Une erreur inconnue est survenue");
      }
    } finally {
      setLoading(false);
    }
  };

  if (!token) {
    return <p className="error-text">Lien invalide ou expiré</p>;
  }

  return (
    <>
      <style>{`
        body {
          font-family: 'Segoe UI', sans-serif;
          background: linear-gradient(to bottom right, #e8f9f1, #ffffff, #e8f3fc);
          margin: 0;
          padding: 0;
        }
        .container {
          min-height: 100vh;
          display: flex;
          justify-content: center;
          align-items: center;
          padding: 20px;
        }
        .card {
          width: 100%;
          max-width: 400px;
          background: #fff;
          border-radius: 16px;
          box-shadow: 0 4px 16px rgba(0,0,0,0.08);
          padding: 32px;
          border-top: 6px solid #2ECC71;
        }
        .title {
          font-size: 24px;
          font-weight: 700;
          text-align: center;
          color: #2ECC71;
          margin-bottom: 24px;
        }
        .error-text {
          color: #d9534f;
          font-size: 14px;
          text-align: center;
          background: #fdecea;
          padding: 8px;
          border-radius: 8px;
          margin-bottom: 14px;
        }
        .success-text {
          color: #2ECC71;
          font-size: 15px;
          text-align: center;
          background: #eafaf1;
          padding: 10px;
          border-radius: 8px;
          margin-bottom: 14px;
          font-weight: 500;
        }
        .form-group {
          margin-bottom: 18px;
        }
        .label {
          display: block;
          font-size: 14px;
          font-weight: 500;
          margin-bottom: 6px;
          color: #7F8C8D;
        }
        .input {
          width: 100%;
          padding: 12px;
          border: 1px solid #d0d7de;
          border-radius: 10px;
          font-size: 14px;
          outline: none;
          transition: all 0.3s ease;
        }
        .input:focus {
          border-color: #3498DB;
          box-shadow: 0 0 0 3px rgba(52,152,219,0.15);
        }
        .button {
          width: 100%;
          padding: 12px;
          background: #2ECC71;
          border: none;
          border-radius: 10px;
          color: #fff;
          font-size: 16px;
          font-weight: bold;
          cursor: pointer;
          transition: all 0.3s ease;
          margin-top: 6px;
        }
        .button:hover {
          background: #27ae60;
        }
        .button:disabled {
          background: #a9e4c2;
          cursor: not-allowed;
        }
        .loading-spinner {
          border: 3px solid #f3f3f3;
          border-top: 3px solid white;
          border-radius: 50%;
          width: 18px;
          height: 18px;
          animation: spin 1s linear infinite;
          display: inline-block;
          margin-right: 8px;
        }
        @keyframes spin {
          0% { transform: rotate(0deg); }
          100% { transform: rotate(360deg); }
        }
        .input-wrapper {
          position: relative;
        }
        .toggle-visibility {
          position: absolute;
          right: 10px;
          top: 50%;
          transform: translateY(-50%);
          cursor: pointer;
          font-size: 14px;
          color: #3498DB;
          background: none;
          border: none;
        }
      `}</style>

      <div className="container">
        <div className="card">
          <h1 className="title">🔑 Réinitialiser le mot de passe</h1>

          {error && <p className="error-text">{error}</p>}
          {success && (
            <p className="success-text">
              {success}
              <br />
            </p>
          )}

          {!success && (
            <form onSubmit={handleSubmit}>
              <div className="form-group">
                <label className="label">Nouveau mot de passe</label>
                <div className="input-wrapper">
                  <input
                    type={showPassword ? "text" : "password"}
                    placeholder="••••••••"
                    className="input"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    required
                  />
                  <button
                    type="button"
                    className="toggle-visibility"
                    onClick={() => setShowPassword(!showPassword)}
                  >
                    {showPassword ? "🙈" : "👁️"}
                  </button>
                </div>
              </div>

              <div className="form-group">
                <label className="label">Confirmez le mot de passe</label>
                <div className="input-wrapper">
                  <input
                    type={showConfirm ? "text" : "password"}
                    placeholder="••••••••"
                    className="input"
                    value={confirm}
                    onChange={(e) => setConfirm(e.target.value)}
                    required
                  />
                  <button
                    type="button"
                    className="toggle-visibility"
                    onClick={() => setShowConfirm(!showConfirm)}
                  >
                    {showConfirm ? "🙈" : "👁️"}
                  </button>
                </div>
              </div>

              <button type="submit" disabled={loading} className="button">
                {loading ? (
                  <>
                    <span className="loading-spinner"></span>{" "}
                    Réinitialisation...
                  </>
                ) : (
                  "Réinitialiser"
                )}
              </button>
            </form>
          )}
        </div>
      </div>
    </>
  );
}
