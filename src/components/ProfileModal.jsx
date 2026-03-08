import React, { useState } from "react";
import { C } from "../constants/colors";
import { Btn, Inp, PasswordInp, Sel } from "./ui";

const GENDER_OPTIONS = [
  { value: "", label: "Select" },
  { value: "male", label: "Male" },
  { value: "female", label: "Female" },
  { value: "other", label: "Other" },
  { value: "prefer_not_to_say", label: "Prefer not to say" },
];

function ChangePasswordModal({ onVerifyCurrentPassword, onChangePassword, onClose }) {
  const [currentPassword, setCurrentPassword] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [verified, setVerified] = useState(false);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");

  const verifyCurrent = async () => {
    if (!currentPassword) {
      setError("Old password is required.");
      return;
    }

    setError("");
    setSaving(true);
    try {
      await onVerifyCurrentPassword(currentPassword);
      setVerified(true);
    } catch (err) {
      setError(err?.message || "Old password is incorrect.");
    } finally {
      setSaving(false);
    }
  };

  const updatePassword = async () => {
    if (!newPassword || !confirmPassword) {
      setError("Enter new password and repeat password.");
      return;
    }
    if (newPassword.length < 6) {
      setError("New password must be at least 6 characters.");
      return;
    }
    if (newPassword !== confirmPassword) {
      setError("New password and repeat password do not match.");
      return;
    }

    setError("");
    setSaving(true);
    try {
      await onChangePassword(newPassword);
      onClose();
    } catch (err) {
      setError(err?.message || "Failed to update password.");
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="fadein" style={{ position: "fixed", inset: 0, background: "#00000080", display: "flex", alignItems: "center", justifyContent: "center", zIndex: 1200, backdropFilter: "blur(4px)" }}>
      <div className="fadeup" style={{ width: 420, maxWidth: "92vw", background: C.card, border: `1px solid ${C.border2}`, borderRadius: 16, padding: 22 }}>
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 16 }}>
          <div style={{ color: C.text, fontSize: 17, fontWeight: 800 }}>Change Password</div>
          <button onClick={onClose} style={{ border: "none", background: "none", color: C.faint, cursor: "pointer", fontSize: 18 }}>
            X
          </button>
        </div>

        {!verified ? (
          <div style={{ display: "grid", gap: 10 }}>
            <div>
              <label style={{ fontSize: 11, color: C.muted, display: "block", marginBottom: 5 }}>Old Password</label>
              <PasswordInp value={currentPassword} onChange={(e) => setCurrentPassword(e.target.value)} />
            </div>
          </div>
        ) : (
          <div style={{ display: "grid", gap: 10 }}>
            <div style={{ color: C.ok, fontSize: 12 }}>Old password verified.</div>
            <div>
              <label style={{ fontSize: 11, color: C.muted, display: "block", marginBottom: 5 }}>New Password</label>
              <PasswordInp value={newPassword} onChange={(e) => setNewPassword(e.target.value)} />
            </div>
            <div>
              <label style={{ fontSize: 11, color: C.muted, display: "block", marginBottom: 5 }}>Repeat New Password</label>
              <PasswordInp value={confirmPassword} onChange={(e) => setConfirmPassword(e.target.value)} />
            </div>
          </div>
        )}

        {error && <div style={{ color: C.danger, fontSize: 12, marginTop: 10 }}>{error}</div>}

        <div style={{ marginTop: 16, display: "flex", gap: 8 }}>
          <Btn variant="ghost" onClick={onClose} style={{ flex: 1, justifyContent: "center" }}>
            Cancel
          </Btn>
          {!verified ? (
            <Btn onClick={verifyCurrent} disabled={saving} style={{ flex: 1, justifyContent: "center", opacity: saving ? 0.7 : 1 }}>
              {saving ? "Verifying..." : "Verify"}
            </Btn>
          ) : (
            <Btn onClick={updatePassword} disabled={saving} style={{ flex: 1, justifyContent: "center", opacity: saving ? 0.7 : 1 }}>
              {saving ? "Updating..." : "Update Password"}
            </Btn>
          )}
        </div>
      </div>
    </div>
  );
}

export default function ProfileModal({ profile, userEmail, onSave, onVerifyCurrentPassword, onChangePassword, onClose }) {
  const [username, setUsername] = useState(profile?.display_name || "");
  const [age, setAge] = useState(profile?.age == null ? "" : String(profile.age));
  const [gender, setGender] = useState(profile?.gender || "");
  const [email, setEmail] = useState(userEmail || "");
  const [showChangePassword, setShowChangePassword] = useState(false);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");

  const submit = async () => {
    if (!username.trim()) {
      setError("Username is required.");
      return;
    }
    if (!email.trim()) {
      setError("Email is required.");
      return;
    }
    if (age && (Number.isNaN(Number(age)) || Number(age) < 1 || Number(age) > 120)) {
      setError("Age must be between 1 and 120.");
      return;
    }

    setError("");
    setSaving(true);
    try {
      await onSave({
        username: username.trim(),
        age: age ? Number(age) : null,
        gender: gender || null,
        email: email.trim().toLowerCase(),
      });
      onClose();
    } catch (err) {
      setError(err?.message || "Failed to update profile.");
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="fadein" style={{ position: "fixed", inset: 0, background: "#00000080", display: "flex", alignItems: "center", justifyContent: "center", zIndex: 1100, backdropFilter: "blur(4px)" }}>
      <div className="fadeup" style={{ width: 460, maxWidth: "92vw", background: C.card, border: `1px solid ${C.border2}`, borderRadius: 16, padding: 22 }}>
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 16 }}>
          <div style={{ color: C.text, fontSize: 17, fontWeight: 800 }}>Edit Profile</div>
          <button onClick={onClose} style={{ border: "none", background: "none", color: C.faint, cursor: "pointer", fontSize: 18 }}>
            X
          </button>
        </div>

        <div style={{ display: "grid", gap: 10 }}>
          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 10 }}>
            <div>
              <label style={{ fontSize: 11, color: C.muted, display: "block", marginBottom: 5 }}>Username</label>
              <Inp value={username} onChange={(e) => setUsername(e.target.value)} />
            </div>
            <div>
              <label style={{ fontSize: 11, color: C.muted, display: "block", marginBottom: 5 }}>Age</label>
              <Inp type="number" min="1" max="120" value={age} onChange={(e) => setAge(e.target.value)} />
            </div>
          </div>

          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 10 }}>
            <div>
              <label style={{ fontSize: 11, color: C.muted, display: "block", marginBottom: 5 }}>Gender</label>
              <Sel value={gender} onChange={(e) => setGender(e.target.value)} style={{ width: "100%" }}>
                {GENDER_OPTIONS.map((item) => (
                  <option key={item.value || "empty"} value={item.value}>
                    {item.label}
                  </option>
                ))}
              </Sel>
            </div>
            <div>
              <label style={{ fontSize: 11, color: C.muted, display: "block", marginBottom: 5 }}>Email</label>
              <Inp type="email" value={email} onChange={(e) => setEmail(e.target.value)} />
            </div>
          </div>

          <div>
            <span
              role="button"
              tabIndex={0}
              onClick={() => setShowChangePassword(true)}
              onKeyDown={(e) => {
                if (e.key === "Enter" || e.key === " ") {
                  e.preventDefault();
                  setShowChangePassword(true);
                }
              }}
              style={{ color: C.primary, fontSize: 13, fontWeight: 700, cursor: "pointer" }}
            >
              Change Password
            </span>
          </div>

          {error && <div style={{ color: C.danger, fontSize: 12 }}>{error}</div>}
        </div>

        <div style={{ marginTop: 16, display: "flex", gap: 8 }}>
          <Btn variant="ghost" onClick={onClose} style={{ flex: 1, justifyContent: "center" }}>
            Cancel
          </Btn>
          <Btn onClick={submit} disabled={saving} style={{ flex: 1, justifyContent: "center", opacity: saving ? 0.7 : 1 }}>
            {saving ? "Saving..." : "Save"}
          </Btn>
        </div>
      </div>
      {showChangePassword && (
        <ChangePasswordModal
          onVerifyCurrentPassword={onVerifyCurrentPassword}
          onChangePassword={onChangePassword}
          onClose={() => setShowChangePassword(false)}
        />
      )}
    </div>
  );
}
