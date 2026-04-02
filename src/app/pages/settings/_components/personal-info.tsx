"use client";

import {
  CallIcon,
  EmailIcon,
  PencilSquareIcon,
  UserIcon,
} from "@/assets/icons";
import InputGroup from "@/components/FormElements/InputGroup";
import { TextAreaGroup } from "@/components/FormElements/InputGroup/text-area";
import { ShowcaseSection } from "@/components/Layouts/showcase-section";
import { goldpayApi } from "@/lib/goldpay-api";
import { useAuth } from "@/contexts/auth-context";
import { useCallback, useEffect, useState } from "react";

function emptyToNull(s: string): string | null {
  const t = s.trim();
  return t === "" ? null : t;
}

export function PersonalInfoForm() {
  const { isAuthenticated, isLoading: authLoading, refreshUser } = useAuth();
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [phone, setPhone] = useState("");
  const [username, setUsername] = useState("");
  const [bio, setBio] = useState("");
  const [baseline, setBaseline] = useState({
    name: "",
    email: "",
    phone: "",
    username: "",
    bio: "",
  });

  const load = useCallback(async () => {
    setError(null);
    setLoading(true);
    try {
      const m = await goldpayApi.merchants.me();
      const next = {
        name: m.name ?? "",
        email: m.email ?? "",
        phone: m.phone ?? "",
        username: m.username ?? "",
        bio: m.bio ?? "",
      };
      setName(next.name);
      setEmail(next.email);
      setPhone(next.phone);
      setUsername(next.username);
      setBio(next.bio);
      setBaseline(next);
    } catch (e) {
      setError(e instanceof Error ? e.message : "Could not load profile");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    if (authLoading || !isAuthenticated) {
      setLoading(false);
      return;
    }
    void load();
  }, [authLoading, isAuthenticated, load]);

  const handleCancel = () => {
    setError(null);
    setName(baseline.name);
    setEmail(baseline.email);
    setPhone(baseline.phone);
    setUsername(baseline.username);
    setBio(baseline.bio);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    const trimmedEmail = email.trim();
    if (!trimmedEmail) {
      setError("Email is required.");
      return;
    }
    setSaving(true);
    try {
      await goldpayApi.merchants.updateMe({
        name: name.trim(),
        email: trimmedEmail.toLowerCase(),
        phone: emptyToNull(phone),
        username: emptyToNull(username),
        bio: emptyToNull(bio),
      });
      await refreshUser();
      await load();
    } catch (err) {
      setError(err instanceof Error ? err.message : "Save failed");
    } finally {
      setSaving(false);
    }
  };

  if (authLoading) {
    return (
      <ShowcaseSection title="Personal Information" className="!p-7">
        <p className="text-sm text-ink-muted">Checking merchant session…</p>
      </ShowcaseSection>
    );
  }

  if (!isAuthenticated) {
    return (
      <ShowcaseSection title="Personal Information" className="!p-7">
        <p className="text-sm text-ink-muted">
          Sign in with your API key to view and edit your profile.
        </p>
      </ShowcaseSection>
    );
  }

  return (
    <ShowcaseSection title="Personal Information" className="!p-7">
      <form onSubmit={handleSubmit}>
        {loading ? (
          <p className="mb-5 text-sm text-ink-muted">Loading profile…</p>
        ) : null}

        <div className="mb-5.5 flex flex-col gap-5.5 sm:flex-row">
          <InputGroup
            className="w-full sm:w-1/2"
            type="text"
            name="fullName"
            label="Full Name"
            placeholder="Your business or display name"
            value={name}
            handleChange={(e) => setName(e.target.value)}
            icon={<UserIcon />}
            iconPosition="left"
            height="sm"
            disabled={loading}
          />

          <InputGroup
            className="w-full sm:w-1/2"
            type="text"
            name="phoneNumber"
            label="Phone Number"
            placeholder="+1 234 567 8900"
            value={phone}
            handleChange={(e) => setPhone(e.target.value)}
            icon={<CallIcon />}
            iconPosition="left"
            height="sm"
            disabled={loading}
          />
        </div>

        <InputGroup
          className="mb-5.5"
          type="email"
          name="email"
          label="Email Address"
          placeholder="you@example.com"
          value={email}
          handleChange={(e) => setEmail(e.target.value)}
          icon={<EmailIcon />}
          iconPosition="left"
          height="sm"
          disabled={loading}
          required
        />

        <InputGroup
          className="mb-5.5"
          type="text"
          name="username"
          label="Username"
          placeholder="Short handle (optional)"
          value={username}
          handleChange={(e) => setUsername(e.target.value)}
          icon={<UserIcon />}
          iconPosition="left"
          height="sm"
          disabled={loading}
        />

        <TextAreaGroup
          className="mb-5.5"
          name="bio"
          label="BIO"
          placeholder="A short description of your business (optional)"
          icon={<PencilSquareIcon />}
          value={bio}
          onChange={(e) => setBio(e.target.value)}
          disabled={loading}
        />

        {error ? (
          <p className="mb-4 text-sm text-red-600 dark:text-red-400" role="alert">
            {error}
          </p>
        ) : null}

        <div className="flex justify-end gap-3">
          <button
            className="merchant-secondary-button"
            type="button"
            onClick={handleCancel}
            disabled={loading || saving}
          >
            Cancel
          </button>

          <button
            className="merchant-primary-button"
            type="submit"
            disabled={loading || saving}
          >
            {saving ? "Saving…" : "Save"}
          </button>
        </div>
      </form>
    </ShowcaseSection>
  );
}
