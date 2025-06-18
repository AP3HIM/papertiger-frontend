// src/components/ResendEmail.js
import { useState } from "react";
import { toast } from "react-toastify";
import { request } from "../services/api";    // <- generic helper

export default function ResendEmail() {
  const [email, setEmail] = useState("");
  const onResend = async (e) => {
    e.preventDefault();
    try {
      await request("/resend-confirm/", { method: "POST", body: { email } });
      toast.info("If that address exists, a new confirmation e-mail was sent.");
      setEmail("");
    } catch (err) {
      toast.error("Failed to resend.");
    }
  };
  return (
    <form onSubmit={onResend} className="resend-form">
      <input
        type="email"
        placeholder="E-mail address"
        value={email}
        onChange={(e) => setEmail(e.target.value)}
        required
      />
      <button type="submit">Resend confirmation</button>
    </form>
  );
}
