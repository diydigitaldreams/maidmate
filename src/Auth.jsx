import { useState } from "react";
import { useAuth } from "./useAuth";

const authStyles = `
  @import url('https://fonts.googleapis.com/css2?family=Playfair+Display:wght@400;600;700&family=DM+Sans:wght@300;400;500;600&display=swap');
  * { box-sizing: border-box; margin: 0; padding: 0; }
  body { font-family: 'DM Sans', sans-serif; background: #f5f2ee; }

  .auth-root {
    min-height: 100vh; display: flex; flex-direction: column;
    align-items: center; justify-content: center;
    background: linear-gradient(160deg, #4a7060 0%, #2d4a3e 60%, #1e3329 100%);
    padding: 24px 16px;
  }

  .auth-logo {
    text-align: center; margin-bottom: 32px;
  }
  .auth-logo-icon {
    font-size: 48px; display: block; margin-bottom: 10px;
    filter: drop-shadow(0 4px 12px rgba(0,0,0,0.3));
  }
  .auth-logo-title {
    font-family: 'Playfair Display', serif; font-size: 30px;
    font-weight: 700; color: white; letter-spacing: -0.5px;
  }
  .auth-logo-sub {
    font-size: 13px; color: rgba(255,255,255,0.65);
    letter-spacing: 2px; text-transform: uppercase; margin-top: 4px;
  }

  .auth-card {
    background: white; border-radius: 24px; padding: 28px 24px;
    width: 100%; max-width: 400px;
    box-shadow: 0 24px 60px rgba(0,0,0,0.25);
  }
  .auth-card-title {
    font-family: 'Playfair Display', serif; font-size: 20px;
    font-weight: 700; color: #2c2c2c; margin-bottom: 4px;
  }
  .auth-card-sub {
    font-size: 13px; color: #888; margin-bottom: 24px;
  }

  .google-btn {
    display: flex; align-items: center; justify-content: center; gap: 10px;
    width: 100%; padding: 13px; border-radius: 14px;
    border: 1.5px solid #e8e4de; background: white; cursor: pointer;
    font-family: 'DM Sans', sans-serif; font-size: 14px; font-weight: 600;
    color: #2c2c2c; transition: all 0.2s; margin-bottom: 20px;
  }
  .google-btn:hover { border-color: #4a7060; background: #f5f2ee; transform: translateY(-1px); }
  .google-btn:active { transform: translateY(0); }
  .google-icon { width: 20px; height: 20px; }

  .divider {
    display: flex; align-items: center; gap: 12px; margin-bottom: 20px;
  }
  .divider-line { flex: 1; height: 1px; background: #e8e4de; }
  .divider-text { font-size: 12px; color: #888; white-space: nowrap; }

  .form-group { margin-bottom: 14px; }
  .form-label {
    display: block; font-size: 11px; font-weight: 600; color: #888;
    text-transform: uppercase; letter-spacing: 1px; margin-bottom: 6px;
  }
  .form-input {
    width: 100%; padding: 13px 14px; border: 1.5px solid #e8e4de;
    border-radius: 12px; font-family: 'DM Sans', sans-serif; font-size: 14px;
    background: #faf8f4; outline: none; color: #2c2c2c; transition: all 0.2s;
    -webkit-appearance: none;
  }
  .form-input:focus { border-color: #4a7060; background: white; box-shadow: 0 0 0 3px rgba(74,112,96,0.1); }

  .submit-btn {
    width: 100%; padding: 14px; border-radius: 14px; border: none;
    background: #4a7060; color: white; font-family: 'DM Sans', sans-serif;
    font-size: 15px; font-weight: 600; cursor: pointer; transition: all 0.2s;
    margin-top: 4px;
  }
  .submit-btn:hover { background: #3d5d50; transform: translateY(-1px); }
  .submit-btn:active { transform: translateY(0); }
  .submit-btn:disabled { opacity: 0.6; cursor: not-allowed; transform: none; }

  .auth-toggle {
    text-align: center; margin-top: 20px; font-size: 13px; color: #888;
  }
  .auth-toggle-link {
    color: #4a7060; font-weight: 600; cursor: pointer; text-decoration: none;
    border: none; background: none; font-family: 'DM Sans', sans-serif;
    font-size: 13px; padding: 0;
  }
  .auth-toggle-link:hover { text-decoration: underline; }

  .forgot-link {
    display: block; text-align: right; font-size: 12px; color: #4a7060;
    font-weight: 500; cursor: pointer; margin-top: 6px; margin-bottom: 2px;
    border: none; background: none; font-family: 'DM Sans', sans-serif; padding: 0;
  }
  .forgot-link:hover { text-decoration: underline; }

  .error-box {
    background: #fde8e8; border-radius: 10px; padding: 10px 14px;
    font-size: 13px; color: #c0392b; margin-bottom: 14px; border: 1px solid #f5c6c6;
  }
  .success-box {
    background: #e8f5ed; border-radius: 10px; padding: 10px 14px;
    font-size: 13px; color: #2d7a4f; margin-bottom: 14px; border: 1px solid #b8d4c0;
  }

  .auth-footer {
    text-align: center; margin-top: 20px; font-size: 11px;
    color: rgba(255,255,255,0.4);
  }
`;

export default function Auth() {
  const { signInWithGoogle, signInWithEmail, signUpWithEmail, resetPassword } = useAuth();
  const [mode, setMode] = useState("signin"); // signin | signup | forgot
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [name, setName] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");

  const handleSubmit = async () => {
    if (!email) { setError("Email is required"); return; }
    if (mode !== "forgot" && !password) { setError("Password is required"); return; }
    setLoading(true);
    setError("");
    setSuccess("");
    try {
      if (mode === "signin") {
        const { error: e } = await signInWithEmail(email, password);
        if (e) throw e;
      } else if (mode === "signup") {
        if (!name) { setError("Name is required"); setLoading(false); return; }
        const { error: e } = await signUpWithEmail(email, password, name);
        if (e) throw e;
        setSuccess("Check your email to confirm your account!");
      } else if (mode === "forgot") {
        const { error: e } = await resetPassword(email);
        if (e) throw e;
        setSuccess("Password reset link sent to your email!");
      }
    } catch (e) {
      setError(e.message || "Something went wrong. Try again.");
    } finally {
      setLoading(false);
    }
  };

  const handleGoogle = async () => {
    setLoading(true);
    setError("");
    try {
      const { error: e } = await signInWithGoogle();
      if (e) throw e;
    } catch (e) {
      setError(e.message || "Google sign-in failed.");
      setLoading(false);
    }
  };

  const switchMode = (m) => {
    setMode(m);
    setError("");
    setSuccess("");
  };

  return (
    <>
      <style>{authStyles}</style>
      <div className="auth-root">
        <div className="auth-logo">
          <span className="auth-logo-icon">🧹</span>
          <div className="auth-logo-title">MaidMate</div>
          <div className="auth-logo-sub">Business Manager</div>
        </div>

        <div className="auth-card">
          <div className="auth-card-title">
            {mode === "signin" ? "Welcome back" : mode === "signup" ? "Create account" : "Reset password"}
          </div>
          <div className="auth-card-sub">
            {mode === "signin" ? "Sign in to your MaidMate account" :
             mode === "signup" ? "Start managing your cleaning business" :
             "We'll send you a reset link"}
          </div>

          {error && <div className="error-box">⚠️ {error}</div>}
          {success && <div className="success-box">✅ {success}</div>}

          {mode !== "forgot" && (
            <>
              <button className="google-btn" onClick={handleGoogle} disabled={loading}>
                <svg className="google-icon" viewBox="0 0 24 24">
                  <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"/>
                  <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"/>
                  <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"/>
                  <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"/>
                </svg>
                Continue with Google
              </button>

              <div className="divider">
                <div className="divider-line"></div>
                <div className="divider-text">or continue with email</div>
                <div className="divider-line"></div>
              </div>
            </>
          )}

          {mode === "signup" && (
            <div className="form-group">
              <label className="form-label">Your Name</label>
              <input className="form-input" type="text" placeholder="Maria Santos" value={name} onChange={e=>setName(e.target.value)} />
            </div>
          )}

          <div className="form-group">
            <label className="form-label">Email</label>
            <input className="form-input" type="email" placeholder="maria@example.com" value={email} onChange={e=>setEmail(e.target.value)} onKeyDown={e=>e.key==="Enter"&&handleSubmit()} />
          </div>

          {mode !== "forgot" && (
            <div className="form-group">
              <label className="form-label">Password</label>
              <input className="form-input" type="password" placeholder="••••••••" value={password} onChange={e=>setPassword(e.target.value)} onKeyDown={e=>e.key==="Enter"&&handleSubmit()} />
              {mode === "signin" && (
                <button className="forgot-link" onClick={()=>switchMode("forgot")}>Forgot password?</button>
              )}
            </div>
          )}

          <button className="submit-btn" onClick={handleSubmit} disabled={loading}>
            {loading ? "Please wait…" :
             mode === "signin" ? "Sign In" :
             mode === "signup" ? "Create Account" : "Send Reset Link"}
          </button>

          <div className="auth-toggle">
            {mode === "signin" ? (
              <>Don't have an account? <button className="auth-toggle-link" onClick={()=>switchMode("signup")}>Sign up free</button></>
            ) : mode === "signup" ? (
              <>Already have an account? <button className="auth-toggle-link" onClick={()=>switchMode("signin")}>Sign in</button></>
            ) : (
              <button className="auth-toggle-link" onClick={()=>switchMode("signin")}>← Back to sign in</button>
            )}
          </div>
        </div>

        <div className="auth-footer">
          By signing in, you agree to MaidMate's terms of service.
        </div>
      </div>
    </>
  );
}
