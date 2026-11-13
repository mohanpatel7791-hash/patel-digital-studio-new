
import React, { useState } from "react";

export default function CustomerLogin({ onLogin }) {
  const [mode, setMode] = useState("login");
  const [mobile, setMobile] = useState("");
  const [password, setPassword] = useState("");
  const [name, setName] = useState("");
  const [error, setError] = useState("");

  const submit = (e) => {
    e.preventDefault();
    setError("");

    if (!/^[6-9]\d{9}$/.test(mobile)) {
      setError("Valid 10 digit mobile number enter karein");
      return;
    }

    if (password.length < 6) {
      setError("Password kam se kam 6 characters ka ho");
      return;
    }

    const users = JSON.parse(
      localStorage.getItem("pds_customers") || "{}"
    );

    if (mode === "signup") {
      if (!name.trim()) {
        setError("Apna naam enter karein");
        return;
      }

      if (users[mobile]) {
        setError("Account pehle se bana hua hai. Login karein.");
        return;
      }

      users[mobile] = { name: name.trim(), password };
      localStorage.setItem("pds_customers", JSON.stringify(users));
    } else {
      if (!users[mobile] || users[mobile].password !== password) {
        setError("Mobile number ya password galat hai");
        return;
      }
    }

    const customer = { mobile, name: users[mobile].name };
    localStorage.setItem("pds_customer_session", JSON.stringify(customer));
    onLogin(customer);
  };

  return (
    <div style={{
      minHeight: "100vh",
      display: "flex",
      alignItems: "center",
      justifyContent: "center",
      background: "#080d1c",
      padding: 20,
      color: "white"
    }}>
      <form onSubmit={submit} style={{
        width: "100%",
        maxWidth: 390,
        padding: 28,
        borderRadius: 22,
        background: "#151e33",
        boxShadow: "0 15px 50px #0008"
      }}>
        <h1 style={{ color: "#e8bd65", textAlign: "center" }}>
          PATEL DIGITAL STUDIO
        </h1>
        <h2 style={{ textAlign: "center" }}>
          {mode === "login" ? "Customer Login" : "Create Account"}
        </h2>

        {mode === "signup" && (
          <input
            placeholder="Full Name"
            value={name}
            onChange={e => setName(e.target.value)}
            required
            style={field}
          />
        )}

        <input
          placeholder="10 Digit Mobile Number"
          inputMode="numeric"
          maxLength={10}
          value={mobile}
          onChange={e => setMobile(e.target.value.replace(/\D/g, ""))}
          required
          style={field}
        />

        <input
          type="password"
          placeholder="Password (Minimum 6 Characters)"
          value={password}
          onChange={e => setPassword(e.target.value)}
          required
          style={field}
        />

        {error && <p style={{ color: "#ff7777" }}>{error}</p>}

        <button type="submit" style={btn}>
          {mode === "login" ? "LOGIN" : "CREATE ACCOUNT"}
        </button>

        <p style={{ textAlign: "center", marginTop: 20 }}>
          {mode === "login"
            ? "New Customer? "
            : "Already have an account? "}
          <span
            onClick={() => {
              setMode(mode === "login" ? "signup" : "login");
              setError("");
            }}
            style={{ color: "#e8bd65", cursor: "pointer" }}
          >
            {mode === "login" ? "Sign Up" : "Login"}
          </span>
        </p>
      </form>
    </div>
  );
}

const field = {
  width: "100%",
  padding: 14,
  margin: "10px 0",
  boxSizing: "border-box",
  borderRadius: 9,
  border: "1px solid #40506c",
  background: "#0b1428",
  color: "white"
};

const btn = {
  width: "100%",
  padding: 15,
  marginTop: 15,
  border: 0,
  borderRadius: 10,
  background: "#d8ad55",
  color: "#101827",
  fontWeight: "bold",
  cursor: "pointer"
};
