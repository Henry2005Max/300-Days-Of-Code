import React, { useState } from "react";
import { useForm, SubmitHandler } from "react-hook-form";
import "./App.css";

// ─── Types ───────────────────────────────────────────────────────────────────

interface RegisterForm {
  fullName: string;
  email: string;
  phone: string;
  password: string;
  confirmPassword: string;
  age: number;
  website: string;
  bio: string;
  terms: boolean;
}

// ─── Field Components ─────────────────────────────────────────────────────────

const Field: React.FC<{
  label: string;
  error?: string;
  required?: boolean;
  children: React.ReactNode;
}> = ({ label, error, required, children }) => (
  <div className={`field ${error ? "field-error" : ""}`}>
    <label className="field-label">
      {label}
      {required && <span className="required">*</span>}
    </label>
    {children}
    {error && <span className="error-msg">{error}</span>}
  </div>
);

const PasswordStrength: React.FC<{ password: string }> = ({ password }) => {
  const checks = [
    { label: "8+ characters", pass: password.length >= 8 },
    { label: "Uppercase", pass: /[A-Z]/.test(password) },
    { label: "Lowercase", pass: /[a-z]/.test(password) },
    { label: "Number", pass: /\d/.test(password) },
    { label: "Symbol", pass: /[^A-Za-z0-9]/.test(password) },
  ];

  const score = checks.filter((c) => c.pass).length;
  const strength =
    score <= 1 ? "Weak" : score <= 3 ? "Fair" : score === 4 ? "Good" : "Strong";
  const strengthClass =
    score <= 1 ? "weak" : score <= 3 ? "fair" : score === 4 ? "good" : "strong";

  if (!password) return null;

  return (
    <div className="password-strength">
      <div className="strength-bar">
        {[1, 2, 3, 4, 5].map((i) => (
          <div
            key={i}
            className={`strength-segment ${i <= score ? strengthClass : ""}`}
          />
        ))}
      </div>
      <div className="strength-checks">
        {checks.map((c) => (
          <span key={c.label} className={`strength-check ${c.pass ? "pass" : "fail"}`}>
            {c.pass ? "✓" : "✗"} {c.label}
          </span>
        ))}
        <span className={`strength-label ${strengthClass}`}>{strength}</span>
      </div>
    </div>
  );
};

// ─── Success Screen ───────────────────────────────────────────────────────────

const SuccessScreen: React.FC<{
  data: RegisterForm;
  onReset: () => void;
}> = ({ data, onReset }) => (
  <div className="success-screen">
    <div className="success-icon">✓</div>
    <h2 className="success-title">Registration Complete</h2>
    <p className="success-sub">Your form was validated and submitted successfully.</p>

    <div className="success-data">
      <h3 className="success-data-title">Submitted Data</h3>
      {Object.entries(data)
        .filter(([key]) => key !== "password" && key !== "confirmPassword" && key !== "terms")
        .map(([key, value]) => (
          <div key={key} className="success-row">
            <span className="success-key">{key}</span>
            <span className="success-val">{String(value)}</span>
          </div>
        ))}
    </div>

    <button className="submit-btn" onClick={onReset}>
      Register Another
    </button>
  </div>
);

// ─── App ─────────────────────────────────────────────────────────────────────

const App: React.FC = () => {
  const [submitted, setSubmitted] = useState<RegisterForm | null>(null);

  const {
    register,
    handleSubmit,
    watch,
    formState: { errors, isSubmitting, dirtyFields, touchedFields },
    reset,
  } = useForm<RegisterForm>({ mode: "onChange" });

  const password = watch("password", "");
  const bio = watch("bio", "");

  const onSubmit: SubmitHandler<RegisterForm> = async (data) => {
    await new Promise((res) => setTimeout(res, 800));
    setSubmitted(data);
  };

  const handleReset = () => {
    reset();
    setSubmitted(null);
  };

  const totalFields = 9;
  const filledFields = Object.keys(dirtyFields).length;
  const progress = Math.round((filledFields / totalFields) * 100);

  if (submitted) {
    return (
      <div className="app">
        <Header />
        <main className="main">
          <SuccessScreen data={submitted} onReset={handleReset} />
        </main>
      </div>
    );
  }

  return (
    <div className="app">
      <Header />
      <main className="main">
        <div className="form-layout">

          {/* Form */}
          <div className="form-card">
            <div className="form-head">
              <h2 className="form-title">Create Account</h2>
              <div className="progress-wrap">
                <div className="progress-track">
                  <div className="progress-fill" style={{ width: `${progress}%` }} />
                </div>
                <span className="progress-label">{progress}% complete</span>
              </div>
            </div>

            <form onSubmit={handleSubmit(onSubmit)} noValidate>

              {/* Full Name */}
              <Field label="Full Name" error={errors.fullName?.message} required>
                <input
                  className={`input ${errors.fullName ? "input-err" : dirtyFields.fullName ? "input-ok" : ""}`}
                  placeholder="Chidi Okeke"
                  {...register("fullName", {
                    required: "Full name is required",
                    minLength: { value: 3, message: "Name must be at least 3 characters" },
                    pattern: {
                      value: /^[a-zA-Z\s'-]+$/,
                      message: "Name can only contain letters, spaces, hyphens, apostrophes",
                    },
                  })}
                />
              </Field>

              {/* Email */}
              <Field label="Email Address" error={errors.email?.message} required>
                <input
                  type="email"
                  className={`input ${errors.email ? "input-err" : dirtyFields.email ? "input-ok" : ""}`}
                  placeholder="chidi@example.com"
                  {...register("email", {
                    required: "Email is required",
                    pattern: {
                      value: /^[^\s@]+@[^\s@]+\.[^\s@]+$/,
                      message: "Enter a valid email address",
                    },
                  })}
                />
              </Field>

              {/* Phone */}
              <Field label="Phone Number" error={errors.phone?.message} required>
                <input
                  className={`input ${errors.phone ? "input-err" : dirtyFields.phone ? "input-ok" : ""}`}
                  placeholder="+234 801 234 5678"
                  {...register("phone", {
                    required: "Phone number is required",
                    pattern: {
                      value: /^(\+?[\d\s\-()]{7,15})$/,
                      message: "Enter a valid phone number",
                    },
                  })}
                />
              </Field>

              {/* Age */}
              <Field label="Age" error={errors.age?.message} required>
                <input
                  type="number"
                  className={`input ${errors.age ? "input-err" : dirtyFields.age ? "input-ok" : ""}`}
                  placeholder="25"
                  {...register("age", {
                    required: "Age is required",
                    min: { value: 18, message: "You must be at least 18 years old" },
                    max: { value: 120, message: "Enter a valid age" },
                    valueAsNumber: true,
                  })}
                />
              </Field>

              {/* Website */}
              <Field label="Website" error={errors.website?.message}>
                <input
                  className={`input ${errors.website ? "input-err" : dirtyFields.website ? "input-ok" : ""}`}
                  placeholder="https://henry.dev"
                  {...register("website", {
                    pattern: {
                      value: /^(https?:\/\/)?([\w-]+\.)+[\w-]+(\/[\w-./?%&=]*)?$/,
                      message: "Enter a valid URL",
                    },
                  })}
                />
              </Field>

              {/* Password */}
              <Field label="Password" error={errors.password?.message} required>
                <input
                  type="password"
                  className={`input ${errors.password ? "input-err" : dirtyFields.password ? "input-ok" : ""}`}
                  placeholder="••••••••"
                  {...register("password", {
                    required: "Password is required",
                    minLength: { value: 8, message: "Password must be at least 8 characters" },
                    pattern: {
                      value: /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)/,
                      message: "Must include uppercase, lowercase, and a number",
                    },
                  })}
                />
                <PasswordStrength password={password} />
              </Field>

              {/* Confirm Password */}
              <Field label="Confirm Password" error={errors.confirmPassword?.message} required>
                <input
                  type="password"
                  className={`input ${errors.confirmPassword ? "input-err" : dirtyFields.confirmPassword ? "input-ok" : ""}`}
                  placeholder="••••••••"
                  {...register("confirmPassword", {
                    required: "Please confirm your password",
                    validate: (val) =>
                      val === password || "Passwords do not match",
                  })}
                />
              </Field>

              {/* Bio */}
              <Field label="Bio" error={errors.bio?.message}>
                <textarea
                  className={`input textarea ${errors.bio ? "input-err" : dirtyFields.bio ? "input-ok" : ""}`}
                  placeholder="Tell us a little about yourself..."
                  rows={3}
                  {...register("bio", {
                    maxLength: { value: 200, message: "Bio must be under 200 characters" },
                  })}
                />
                <span className="char-count">{bio.length}/200</span>
              </Field>

              {/* Terms */}
              <Field label="" error={errors.terms?.message}>
                <label className="checkbox-label">
                  <input
                    type="checkbox"
                    className="checkbox"
                    {...register("terms", {
                      required: "You must accept the terms to continue",
                    })}
                  />
                  <span>
                    I agree to the <span className="link">Terms of Service</span> and{" "}
                    <span className="link">Privacy Policy</span>
                  </span>
                </label>
              </Field>

              <button
                type="submit"
                className={`submit-btn ${isSubmitting ? "submitting" : ""}`}
                disabled={isSubmitting}
              >
                {isSubmitting ? "Submitting..." : "Create Account"}
              </button>
            </form>
          </div>

          {/* Validation Status Panel */}
          <div className="status-panel">
            <h3 className="status-title">Validation Status</h3>
            {[
              { key: "fullName", label: "Full Name" },
              { key: "email", label: "Email" },
              { key: "phone", label: "Phone" },
              { key: "age", label: "Age" },
              { key: "website", label: "Website" },
              { key: "password", label: "Password" },
              { key: "confirmPassword", label: "Confirm Password" },
              { key: "bio", label: "Bio" },
              { key: "terms", label: "Terms" },
            ].map(({ key, label }) => {
              const hasError = !!errors[key as keyof RegisterForm];
              const isTouched = !!touchedFields[key as keyof RegisterForm];
              const isDirty = !!dirtyFields[key as keyof RegisterForm];
              const status = hasError
                ? "error"
                : isDirty && !hasError
                ? "valid"
                : isTouched
                ? "touched"
                : "idle";

              return (
                <div key={key} className={`status-row status-${status}`}>
                  <span className="status-icon">
                    {status === "valid" ? "✓" : status === "error" ? "✗" : "○"}
                  </span>
                  <span className="status-label">{label}</span>
                  <span className="status-badge">{status}</span>
                </div>
              );
            })}

            <div className="rules-block">
              <h4 className="rules-title">Rules</h4>
              <ul className="rules-list">
                <li>Name: letters only, min 3 chars</li>
                <li>Email: valid format required</li>
                <li>Phone: 7-15 digits, +country code ok</li>
                <li>Age: 18 or older</li>
                <li>Website: optional, valid URL</li>
                <li>Password: 8+ chars, upper + lower + number</li>
                <li>Confirm: must match password</li>
                <li>Bio: optional, max 200 chars</li>
                <li>Terms: must be accepted</li>
              </ul>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
};

const Header: React.FC = () => (
  <header className="header">
    <div className="header-inner">
      <span className="header-day">Day 34</span>
      <h1 className="header-title">Form Validator</h1>
      <span className="header-sprint">Sprint 2 — Web Basics</span>
    </div>
  </header>
);

export default App;
