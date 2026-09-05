import {
  useState,
} from "react";

import {
  useNavigate,
} from "react-router-dom";

import {
  Eye,
  EyeOff,
  LockKeyhole,
  UserRound,
} from "lucide-react";

import {
  loginUser,
  createUser,
} from "../services/dashboardApi";

import "./SignIn.css";

export default function SignIn() {
  const navigate = useNavigate();

  const [mode, setMode] =
    useState("signin");

  const [name, setName] =
    useState("");

  const [userId, setUserId] =
    useState("");

  const [password, setPassword] =
    useState("");

  const [
    confirmPassword,
    setConfirmPassword,
  ] = useState("");

  const [
    showPassword,
    setShowPassword,
  ] = useState(false);

  const [error, setError] =
    useState("");

  const [message, setMessage] =
    useState("");

  const [loading, setLoading] =
    useState(false);

  const resetMessages = () => {
    setError("");
    setMessage("");
  };

  const switchMode = (nextMode) => {
    setMode(nextMode);

    setName("");
    setUserId("");
    setPassword("");
    setConfirmPassword("");

    resetMessages();
  };

  const handleSignIn = async (
    event
  ) => {
    event.preventDefault();

    try {
      setLoading(true);
      resetMessages();

      if (
        !userId.trim() ||
        !password
      ) {
        setError(
          "Enter your user ID and password."
        );
        return;
      }

      const result =
        await loginUser(
          userId.trim(),
          password
        );

      localStorage.setItem(
        "demandiq-user",
        JSON.stringify(result.user)
      );

      navigate("/dashboard");
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const handleCreateAccount = async (
    event
  ) => {
    event.preventDefault();

    try {
      setLoading(true);
      resetMessages();

      if (!name.trim()) {
        setError(
          "Enter your name."
        );
        return;
      }

      if (!userId.trim()) {
        setError(
          "Choose a user ID."
        );
        return;
      }

      if (password.length < 6) {
        setError(
          "Password must contain at least 6 characters."
        );
        return;
      }

      if (
        password !==
        confirmPassword
      ) {
        setError(
          "Passwords do not match."
        );
        return;
      }

      await createUser(
        name.trim(),
        userId.trim(),
        password
      );

      setMessage(
        "Account created successfully. You can now sign in."
      );

      setPassword("");
      setConfirmPassword("");

      setMode("signin");
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <main className="signin-page">
      <button
  type="button"
  className="signin-back-btn"
  onClick={() => navigate("/")}
>
  ← Back
</button>
      <section className="signin-hero">
        <div className="signin-copy">
          <span className="signin-kicker">
            SECURE BUSINESS ACCESS
          </span>

          <h1>
            Smarter forecasts.
            <br />
            Better decisions.
            <br />

            <span>
              One workspace.
            </span>
          </h1>

          <p>
            Access demand forecasts,
            sales analytics, model
            performance and business
            intelligence from one secure
            platform.
          </p>

          <div className="signin-benefits">
            <div>
              <strong>01</strong>
              <span>
                AI-powered demand
                forecasting
              </span>
            </div>

            <div>
              <strong>02</strong>
              <span>
                Professional business
                intelligence analytics
              </span>
            </div>

            <div>
              <strong>03</strong>
              <span>
                Secure individual user
                accounts
              </span>
            </div>
          </div>
        </div>

        <div className="signin-card">
          <div className="signin-card-header">
            <span>
              USER PORTAL
            </span>

            <h2>
              {mode === "signin"
                ? "Welcome back."
                : "Create account."}
            </h2>

            <p>
              {mode === "signin"
                ? "Sign in with your authorized DemandIQ user account."
                : "Create your own DemandIQ account to access the forecasting workspace."}
            </p>
          </div>

          <div
            style={{
              display: "grid",
              gridTemplateColumns:
                "1fr 1fr",
              gap: "8px",
              marginBottom: "22px",
            }}
          >
            <button
              type="button"
              onClick={() =>
                switchMode("signin")
              }
              style={{
                padding: "11px",
                borderRadius: "9px",
                border:
                  mode === "signin"
                    ? "1px solid #d9ff3f"
                    : "1px solid rgba(255,255,255,.1)",
                background:
                  mode === "signin"
                    ? "rgba(217,255,63,.1)"
                    : "transparent",
                color:
                  mode === "signin"
                    ? "#d9ff3f"
                    : "#7f8b8e",
                cursor: "pointer",
                fontWeight: 700,
              }}
            >
              Sign In
            </button>

            <button
              type="button"
              onClick={() =>
                switchMode("signup")
              }
              style={{
                padding: "11px",
                borderRadius: "9px",
                border:
                  mode === "signup"
                    ? "1px solid #12d9ff"
                    : "1px solid rgba(255,255,255,.1)",
                background:
                  mode === "signup"
                    ? "rgba(18,217,255,.08)"
                    : "transparent",
                color:
                  mode === "signup"
                    ? "#12d9ff"
                    : "#7f8b8e",
                cursor: "pointer",
                fontWeight: 700,
              }}
            >
              Create Account
            </button>
          </div>

          <form
            onSubmit={
              mode === "signin"
                ? handleSignIn
                : handleCreateAccount
            }
          >
            {mode === "signup" && (
              <div className="signin-field">
                <label>
                  Name
                </label>

                <div className="signin-input-wrap">
                  <UserRound
                    size={18}
                  />

                  <input
                    type="text"
                    value={name}
                    onChange={(event) =>
                      setName(
                        event.target.value
                      )
                    }
                    placeholder="Your name"
                    autoComplete="name"
                  />
                </div>
              </div>
            )}

            <div className="signin-field">
              <label>
                User ID
              </label>

              <div className="signin-input-wrap">
                <UserRound
                  size={18}
                />

                <input
                  type="text"
                  value={userId}
                  onChange={(event) =>
                    setUserId(
                      event.target.value
                    )
                  }
                  placeholder={
                    mode === "signin"
                      ? "Enter your user ID(e.g. USR-1001)"
                      : "Choose your user ID(e.g. USR-1001"
                  }
                  autoComplete="username"
                />
              </div>
            </div>

            <div className="signin-field">
              <label>
                Password
              </label>

              <div className="signin-input-wrap">
                <LockKeyhole
                  size={18}
                />

                <input
                  type={
                    showPassword
                      ? "text"
                      : "password"
                  }
                  value={password}
                  onChange={(event) =>
                    setPassword(
                      event.target.value
                    )
                  }
                  placeholder="Enter password"
                  autoComplete={
                    mode === "signin"
                      ? "current-password"
                      : "new-password"
                  }
                />

                <button
                  type="button"
                  onClick={() =>
                    setShowPassword(
                      (current) =>
                        !current
                    )
                  }
                  className="signin-password-toggle"
                >
                  {showPassword ? (
                    <EyeOff
                      size={18}
                    />
                  ) : (
                    <Eye
                      size={18}
                    />
                  )}
                </button>
              </div>
            </div>

            {mode === "signup" && (
              <div className="signin-field">
                <label>
                  Confirm Password
                </label>

                <div className="signin-input-wrap">
                  <LockKeyhole
                    size={18}
                  />

                  <input
                    type="password"
                    value={
                      confirmPassword
                    }
                    onChange={(event) =>
                      setConfirmPassword(
                        event.target.value
                      )
                    }
                    placeholder="Confirm password"
                    autoComplete="new-password"
                  />
                </div>
              </div>
            )}

            {error && (
              <div
                style={{
                  marginBottom:
                    "14px",
                  padding: "10px 12px",
                  borderRadius: "8px",
                  background:
                    "rgba(255,80,80,.08)",
                  border:
                    "1px solid rgba(255,80,80,.25)",
                  color: "#ff8d8d",
                  fontSize: "13px",
                }}
              >
                {error}
              </div>
            )}

            {message && (
              <div
                style={{
                  marginBottom:
                    "14px",
                  padding: "10px 12px",
                  borderRadius: "8px",
                  background:
                    "rgba(217,255,63,.08)",
                  border:
                    "1px solid rgba(217,255,63,.25)",
                  color: "#d9ff3f",
                  fontSize: "13px",
                }}
              >
                {message}
              </div>
            )}

            <button
              type="submit"
              className="signin-submit"
              disabled={loading}
            >
              {loading
                ? "Please wait..."
                : mode === "signin"
                ? "Sign In"
                : "Create Account"}
            </button>
          </form>

          <div className="signin-authorized">
            <LockKeyhole
              size={14}
            />

            <span>
              Secure DemandIQ access
            </span>
          </div>
        </div>
      </section>

      <div className="signin-wave" />
    </main>
  );
}