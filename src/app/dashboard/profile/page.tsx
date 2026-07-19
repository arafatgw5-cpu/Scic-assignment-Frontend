"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { useSession } from "@/lib/auth-client";
import { api } from "@/lib/api";
import { Card, CardContent, CardDescription, CardHeader, CardTitle, CardFooter } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Mail,
  Shield,
  Edit2,
  X,
  Loader2,
  Eye,
  EyeOff,
  CheckCircle2,
  AlertCircle,
  User,
} from "lucide-react";

/* ------------------------------------------------------------------ */
/* Types                                                              */
/* ------------------------------------------------------------------ */

interface ProfileForm {
  firstName: string;
  lastName: string;
  headline: string;
  location: string;
}

interface PasswordForm {
  currentPassword: string;
  newPassword: string;
  confirmPassword: string;
}

type ProfileErrors = Partial<Record<keyof ProfileForm, string>>;
type PasswordErrors = Partial<Record<keyof PasswordForm, string>>;

const EMPTY_PROFILE: ProfileForm = { firstName: "", lastName: "", headline: "", location: "" };
const EMPTY_PASSWORD: PasswordForm = { currentPassword: "", newPassword: "", confirmPassword: "" };

/* ------------------------------------------------------------------ */
/* Helpers                                                            */
/* ------------------------------------------------------------------ */

function getErrorMessage(err: unknown, fallback: string): string {
  if (err instanceof Error && err.message) return err.message;
  return fallback;
}

function splitName(fullName?: string | null): { firstName: string; lastName: string } {
  const parts = (fullName || "").trim().split(/\s+/).filter(Boolean);
  return {
    firstName: parts[0] || "",
    lastName: parts.slice(1).join(" "),
  };
}

function getInitials(name?: string | null, email?: string | null): string {
  if (name && name.trim()) {
    const parts = name.trim().split(/\s+/);
    const initials = parts.slice(0, 2).map((p) => p.charAt(0).toUpperCase());
    return initials.join("") || "U";
  }
  if (email) return email.charAt(0).toUpperCase();
  return "U";
}

function validateProfile(form: ProfileForm): ProfileErrors {
  const errors: ProfileErrors = {};
  if (!form.firstName.trim()) errors.firstName = "First name is required.";
  if (!form.lastName.trim()) errors.lastName = "Last name is required.";
  if (form.headline.length > 120) errors.headline = "Headline must be under 120 characters.";
  if (form.location.length > 100) errors.location = "Location must be under 100 characters.";
  return errors;
}

interface PasswordStrength {
  score: number; // 0-5
  label: string;
  colorClass: string;
}

function getPasswordStrength(password: string): PasswordStrength {
  let score = 0;
  if (password.length >= 8) score++;
  if (password.length >= 12) score++;
  if (/[A-Z]/.test(password)) score++;
  if (/[0-9]/.test(password)) score++;
  if (/[^A-Za-z0-9]/.test(password)) score++;

  const levels: PasswordStrength[] = [
    { score: 0, label: "Very weak", colorClass: "bg-destructive" },
    { score: 1, label: "Weak", colorClass: "bg-destructive" },
    { score: 2, label: "Fair", colorClass: "bg-yellow-500" },
    { score: 3, label: "Good", colorClass: "bg-yellow-500" },
    { score: 4, label: "Strong", colorClass: "bg-primary" },
    { score: 5, label: "Very strong", colorClass: "bg-primary" },
  ];

  return levels[Math.min(score, 5)];
}

/* ------------------------------------------------------------------ */
/* Motion variants                                                    */
/* ------------------------------------------------------------------ */

const fadeSlide = {
  initial: { opacity: 0, y: 10 },
  animate: { opacity: 1, y: 0 },
  exit: { opacity: 0, y: -10 },
  transition: { duration: 0.3, ease: "easeOut" as const },
};

/* ------------------------------------------------------------------ */
/* Small reusable bits                                                */
/* ------------------------------------------------------------------ */

function StatusBanner({
  type,
  message,
  onDismiss,
}: {
  type: "success" | "error";
  message: string;
  onDismiss: () => void;
}) {
  const isSuccess = type === "success";
  return (
    <motion.div
      layout
      initial={{ opacity: 0, y: -10 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, scale: 0.95 }}
      transition={{ duration: 0.2 }}
      className={`flex items-center gap-3 rounded-lg border px-4 py-3 text-sm shadow-sm ${
        isSuccess
          ? "border-primary/20 bg-primary/5 text-primary"
          : "border-destructive/20 bg-destructive/5 text-destructive"
      }`}
      role="alert"
    >
      {isSuccess ? <CheckCircle2 className="h-4 w-4 shrink-0" /> : <AlertCircle className="h-4 w-4 shrink-0" />}
      <span className="flex-1 font-medium">{message}</span>
      <button
        type="button"
        className="shrink-0 rounded-md p-1 opacity-70 transition-opacity hover:opacity-100 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
        onClick={onDismiss}
        aria-label="Dismiss"
      >
        <X className="h-4 w-4" />
      </button>
    </motion.div>
  );
}

function FieldError({ id, message }: { id: string; message?: string }) {
  if (!message) return null;
  return (
    <motion.p
      initial={{ opacity: 0, height: 0 }}
      animate={{ opacity: 1, height: "auto" }}
      id={id}
      className="mt-1.5 flex items-center gap-1.5 text-[13px] font-medium text-destructive"
    >
      <AlertCircle className="h-3.5 w-3.5 shrink-0" /> {message}
    </motion.p>
  );
}

function ProfileSkeleton() {
  return (
    <div className="mx-auto max-w-4xl space-y-8 p-6 md:p-10">
      <div className="space-y-2">
        <div className="h-8 w-48 animate-pulse rounded-md bg-muted" />
        <div className="h-4 w-72 animate-pulse rounded-md bg-muted" />
      </div>
      <div className="space-y-6">
        <div className="h-[400px] animate-pulse rounded-xl border border-border bg-card shadow-sm" />
        <div className="h-[350px] animate-pulse rounded-xl border border-border bg-card shadow-sm" />
      </div>
    </div>
  );
}

/* ------------------------------------------------------------------ */
/* Page                                                               */
/* ------------------------------------------------------------------ */

export default function ProfilePage() {
  const { data: session } = useSession();

  const [hasMounted, setHasMounted] = useState(false);
  useEffect(() => setHasMounted(true), []);
  const sessionLoading = !hasMounted || session === undefined;

  const user = session?.user;

  const [editing, setEditing] = useState(false);
  const [saving, setSaving] = useState(false);
  const [success, setSuccess] = useState("");
  const [error, setError] = useState("");

  const [form, setForm] = useState<ProfileForm>(EMPTY_PROFILE);
  const [profileErrors, setProfileErrors] = useState<ProfileErrors>({});
  const [profileInitialized, setProfileInitialized] = useState(false);

  useEffect(() => {
    if (user && !profileInitialized) {
      const { firstName, lastName } = splitName(user.name);
      setForm((prev) => ({ ...prev, firstName, lastName }));
      setProfileInitialized(true);
    }
  }, [user, profileInitialized]);

  const [passwordForm, setPasswordForm] = useState<PasswordForm>(EMPTY_PASSWORD);
  const [passwordErrors, setPasswordErrors] = useState<PasswordErrors>({});
  const [changingPassword, setChangingPassword] = useState(false);
  const [showCurrentPassword, setShowCurrentPassword] = useState(false);
  const [showNewPassword, setShowNewPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);

  const passwordStrength = useMemo(
    () => getPasswordStrength(passwordForm.newPassword),
    [passwordForm.newPassword]
  );

  const initials = useMemo(() => getInitials(user?.name, user?.email), [user?.name, user?.email]);

  const handleProfileFieldChange = useCallback(
    (field: keyof ProfileForm) => (e: React.ChangeEvent<HTMLInputElement>) => {
      const { value } = e.target;
      setForm((prev) => ({ ...prev, [field]: value }));
      setProfileErrors((prev) => ({ ...prev, [field]: undefined }));
    },
    []
  );

  const handlePasswordFieldChange = useCallback(
    (field: keyof PasswordForm) => (e: React.ChangeEvent<HTMLInputElement>) => {
      const { value } = e.target;
      setPasswordForm((prev) => ({ ...prev, [field]: value }));
      setPasswordErrors((prev) => ({ ...prev, [field]: undefined }));
    },
    []
  );

  const handleCancelEdit = useCallback(() => {
    if (user) {
      const { firstName, lastName } = splitName(user.name);
      setForm((prev) => ({ ...prev, firstName, lastName }));
    }
    setProfileErrors({});
    setEditing(false);
  }, [user]);

  const handleSaveProfile = useCallback(async () => {
    if (saving) return;

    const validationErrors = validateProfile(form);
    setProfileErrors(validationErrors);
    if (Object.keys(validationErrors).length > 0) return;

    setSaving(true);
    setError("");
    setSuccess("");
    try {
      await api.updateProfile(form);
      setSuccess("Profile updated successfully.");
      setEditing(false);
    } catch (err: unknown) {
      setError(getErrorMessage(err, "Failed to update profile."));
    } finally {
      setSaving(false);
    }
  }, [form, saving]);

  const handleChangePassword = useCallback(async () => {
    if (changingPassword) return;

    const errors: PasswordErrors = {};
    if (!passwordForm.currentPassword) errors.currentPassword = "Enter your current password.";
    if (!passwordForm.newPassword) {
      errors.newPassword = "Enter a new password.";
    } else if (passwordForm.newPassword.length < 8) {
      errors.newPassword = "Password must be at least 8 characters.";
    }
    if (passwordForm.newPassword !== passwordForm.confirmPassword) {
      errors.confirmPassword = "New passwords don't match.";
    }
    setPasswordErrors(errors);
    if (Object.keys(errors).length > 0) return;

    setChangingPassword(true);
    setError("");
    setSuccess("");
    try {
      await api.changePassword(passwordForm.currentPassword, passwordForm.newPassword);
      setSuccess("Password changed successfully.");
      setPasswordForm(EMPTY_PASSWORD);
      setShowCurrentPassword(false);
      setShowNewPassword(false);
      setShowConfirmPassword(false);
    } catch (err: unknown) {
      setError(getErrorMessage(err, "Failed to change password."));
      setPasswordForm(EMPTY_PASSWORD);
    } finally {
      setChangingPassword(false);
      setPasswordErrors({});
    }
  }, [passwordForm, changingPassword]);

  if (sessionLoading) {
    return <ProfileSkeleton />;
  }

  return (
    <div className="mx-auto max-w-4xl space-y-8 p-6 pb-20 md:p-10">
      {/* Header */}
      <motion.div {...fadeSlide}>
        <h1 className="text-2xl font-semibold tracking-tight text-foreground">Account Settings</h1>
        <p className="mt-1.5 text-sm text-muted-foreground">
          Manage your personal information, profile details, and security preferences.
        </p>
      </motion.div>

      {/* Global Alerts */}
      <div className="empty:hidden">
        <AnimatePresence mode="popLayout">
          {success && <StatusBanner key="success" type="success" message={success} onDismiss={() => setSuccess("")} />}
          {error && <StatusBanner key="error" type="error" message={error} onDismiss={() => setError("")} />}
        </AnimatePresence>
      </div>

      <div className="space-y-6">
        {/* Profile Card */}
        <motion.div {...fadeSlide} transition={{ delay: 0.05, duration: 0.3 }}>
          <Card className="overflow-hidden border-border bg-card shadow-sm">
            <CardHeader className="flex flex-row items-center justify-between border-b border-border/40 bg-muted/10 px-6 py-5">
              <div className="space-y-1">
                <CardTitle className="flex items-center gap-2 text-base font-medium">
                  <User className="h-4 w-4 text-muted-foreground" /> Profile Information
                </CardTitle>
                <CardDescription className="text-sm">Update your public profile and personal details.</CardDescription>
              </div>
              {!editing && (
                <Button variant="outline" size="sm" onClick={() => setEditing(true)} className="hidden sm:flex h-8 gap-1.5">
                  <Edit2 className="h-3.5 w-3.5" /> Edit Profile
                </Button>
              )}
            </CardHeader>

            <CardContent className="p-0">
              <div className="px-6 py-6">
                {/* Avatar Row */}
                <div className="mb-8 flex items-center gap-5">
                  <div className="flex h-16 w-16 shrink-0 items-center justify-center rounded-full bg-primary/10 text-xl font-semibold text-primary ring-1 ring-primary/20">
                    {initials}
                  </div>
                  <div>
                    <h3 className="text-base font-medium text-foreground">{user?.name || "Unnamed User"}</h3>
                    <p className="text-sm text-muted-foreground">{user?.email}</p>
                  </div>
                  {!editing && (
                    <Button variant="outline" size="icon" onClick={() => setEditing(true)} className="ml-auto sm:hidden h-8 w-8">
                      <Edit2 className="h-4 w-4" />
                    </Button>
                  )}
                </div>

                <AnimatePresence mode="wait">
                  {editing ? (
                    <motion.div
                      key="edit"
                      initial={{ opacity: 0, y: 10 }}
                      animate={{ opacity: 1, y: 0 }}
                      exit={{ opacity: 0, y: -10 }}
                      transition={{ duration: 0.2 }}
                      className="grid grid-cols-1 gap-6 sm:grid-cols-2"
                    >
                      <div className="space-y-2">
                        <Label htmlFor="firstName" className="text-sm font-medium">First Name</Label>
                        <Input
                          id="firstName"
                          value={form.firstName}
                          onChange={handleProfileFieldChange("firstName")}
                          aria-invalid={!!profileErrors.firstName}
                          className="h-10 transition-shadow focus-visible:ring-1 focus-visible:ring-primary"
                        />
                        <FieldError id="firstName-error" message={profileErrors.firstName} />
                      </div>
                      <div className="space-y-2">
                        <Label htmlFor="lastName" className="text-sm font-medium">Last Name</Label>
                        <Input
                          id="lastName"
                          value={form.lastName}
                          onChange={handleProfileFieldChange("lastName")}
                          aria-invalid={!!profileErrors.lastName}
                          className="h-10 transition-shadow focus-visible:ring-1 focus-visible:ring-primary"
                        />
                        <FieldError id="lastName-error" message={profileErrors.lastName} />
                      </div>
                      <div className="space-y-2 sm:col-span-2">
                        <Label htmlFor="headline" className="text-sm font-medium">Professional Headline</Label>
                        <Input
                          id="headline"
                          placeholder="e.g. Senior Frontend Engineer"
                          value={form.headline}
                          onChange={handleProfileFieldChange("headline")}
                          aria-invalid={!!profileErrors.headline}
                          className="h-10 transition-shadow focus-visible:ring-1 focus-visible:ring-primary"
                        />
                        <FieldError id="headline-error" message={profileErrors.headline} />
                      </div>
                      <div className="space-y-2 sm:col-span-2">
                        <Label htmlFor="location" className="text-sm font-medium">Location</Label>
                        <Input
                          id="location"
                          placeholder="e.g. San Francisco, CA"
                          value={form.location}
                          onChange={handleProfileFieldChange("location")}
                          aria-invalid={!!profileErrors.location}
                          className="h-10 transition-shadow focus-visible:ring-1 focus-visible:ring-primary"
                        />
                        <FieldError id="location-error" message={profileErrors.location} />
                      </div>
                    </motion.div>
                  ) : (
                    <motion.div
                      key="view"
                      initial={{ opacity: 0 }}
                      animate={{ opacity: 1 }}
                      exit={{ opacity: 0 }}
                      transition={{ duration: 0.2 }}
                      className="grid grid-cols-1 gap-y-6 sm:grid-cols-2 gap-x-4 border-t border-border/40 pt-6"
                    >
                      <div>
                        <dt className="text-[13px] font-medium text-muted-foreground">Full Name</dt>
                        <dd className="mt-1 text-sm font-medium text-foreground">{user?.name || "—"}</dd>
                      </div>
                      <div>
                        <dt className="text-[13px] font-medium text-muted-foreground">Email Address</dt>
                        <dd className="mt-1 flex items-center gap-1.5 text-sm font-medium text-foreground">
                           {user?.email}
                        </dd>
                      </div>
                      <div>
                        <dt className="text-[13px] font-medium text-muted-foreground">Headline</dt>
                        <dd className="mt-1 text-sm font-medium text-foreground">{form.headline || "—"}</dd>
                      </div>
                      <div>
                        <dt className="text-[13px] font-medium text-muted-foreground">Location</dt>
                        <dd className="mt-1 text-sm font-medium text-foreground">{form.location || "—"}</dd>
                      </div>
                    </motion.div>
                  )}
                </AnimatePresence>
              </div>
            </CardContent>

            {/* Profile Card Footer (Only when editing) */}
            <AnimatePresence>
              {editing && (
                <motion.div
                  initial={{ opacity: 0, height: 0 }}
                  animate={{ opacity: 1, height: "auto" }}
                  exit={{ opacity: 0, height: 0 }}
                >
                  <CardFooter className="flex items-center justify-end gap-3 border-t border-border/40 bg-muted/10 px-6 py-4">
                    <Button type="button" variant="ghost" onClick={handleCancelEdit} disabled={saving} className="h-9 px-4">
                      Cancel
                    </Button>
                    <Button type="button" onClick={handleSaveProfile} disabled={saving} className="h-9 px-4">
                      {saving && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                      {saving ? "Saving..." : "Save Changes"}
                    </Button>
                  </CardFooter>
                </motion.div>
              )}
            </AnimatePresence>
          </Card>
        </motion.div>

        {/* Security Card */}
        <motion.div {...fadeSlide} transition={{ delay: 0.1, duration: 0.3 }}>
          <Card className="overflow-hidden border-border bg-card shadow-sm">
            <CardHeader className="border-b border-border/40 bg-muted/10 px-6 py-5">
              <CardTitle className="flex items-center gap-2 text-base font-medium">
                <Shield className="h-4 w-4 text-muted-foreground" /> Security
              </CardTitle>
              <CardDescription className="text-sm">Update your password to keep your account secure.</CardDescription>
            </CardHeader>
            <CardContent className="px-6 py-6">
              <div className="grid grid-cols-1 gap-6 md:grid-cols-2">
                <div className="space-y-2 md:col-span-2 md:w-1/2 md:pr-3">
                  <Label htmlFor="currentPassword" className="text-sm font-medium">Current Password</Label>
                  <div className="relative">
                    <Input
                      id="currentPassword"
                      type={showCurrentPassword ? "text" : "password"}
                      value={passwordForm.currentPassword}
                      onChange={handlePasswordFieldChange("currentPassword")}
                      autoComplete="current-password"
                      aria-invalid={!!passwordErrors.currentPassword}
                      className="h-10 pr-10 transition-shadow focus-visible:ring-1 focus-visible:ring-primary"
                    />
                    <button
                      type="button"
                      onClick={() => setShowCurrentPassword((v) => !v)}
                      className="absolute right-0 top-0 flex h-full w-10 items-center justify-center text-muted-foreground hover:text-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring rounded-r-md"
                      aria-label={showCurrentPassword ? "Hide password" : "Show password"}
                    >
                      {showCurrentPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                    </button>
                  </div>
                  <FieldError id="currentPassword-error" message={passwordErrors.currentPassword} />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="newPassword" className="text-sm font-medium">New Password</Label>
                  <div className="relative">
                    <Input
                      id="newPassword"
                      type={showNewPassword ? "text" : "password"}
                      value={passwordForm.newPassword}
                      onChange={handlePasswordFieldChange("newPassword")}
                      autoComplete="new-password"
                      aria-invalid={!!passwordErrors.newPassword}
                      className="h-10 pr-10 transition-shadow focus-visible:ring-1 focus-visible:ring-primary"
                    />
                    <button
                      type="button"
                      onClick={() => setShowNewPassword((v) => !v)}
                      className="absolute right-0 top-0 flex h-full w-10 items-center justify-center text-muted-foreground hover:text-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring rounded-r-md"
                      aria-label={showNewPassword ? "Hide password" : "Show password"}
                    >
                      {showNewPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                    </button>
                  </div>
                  
                  {/* Password Strength Indicator */}
                  {passwordForm.newPassword && (
                    <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="pt-2">
                      <div className="flex h-1 gap-1">
                        {[0, 1, 2, 3, 4].map((i) => (
                          <span
                            key={i}
                            className={`h-full flex-1 rounded-full transition-colors duration-300 ${
                              i < passwordStrength.score ? passwordStrength.colorClass : "bg-muted"
                            }`}
                          />
                        ))}
                      </div>
                      <p className="mt-1.5 text-[12px] font-medium text-muted-foreground">
                        Strength: <span className="text-foreground">{passwordStrength.label}</span>
                      </p>
                    </motion.div>
                  )}
                  <FieldError id="newPassword-error" message={passwordErrors.newPassword} />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="confirmPassword" className="text-sm font-medium">Confirm New Password</Label>
                  <div className="relative">
                    <Input
                      id="confirmPassword"
                      type={showConfirmPassword ? "text" : "password"}
                      value={passwordForm.confirmPassword}
                      onChange={handlePasswordFieldChange("confirmPassword")}
                      autoComplete="new-password"
                      aria-invalid={!!passwordErrors.confirmPassword}
                      className="h-10 pr-10 transition-shadow focus-visible:ring-1 focus-visible:ring-primary"
                    />
                    <button
                      type="button"
                      onClick={() => setShowConfirmPassword((v) => !v)}
                      className="absolute right-0 top-0 flex h-full w-10 items-center justify-center text-muted-foreground hover:text-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring rounded-r-md"
                      aria-label={showConfirmPassword ? "Hide password" : "Show password"}
                    >
                      {showConfirmPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                    </button>
                  </div>
                  {passwordForm.confirmPassword && !passwordErrors.confirmPassword && (
                    <p
                      className={`mt-1.5 flex items-center gap-1.5 text-[13px] font-medium ${
                        passwordForm.confirmPassword === passwordForm.newPassword
                          ? "text-primary"
                          : "text-muted-foreground"
                      }`}
                    >
                      {passwordForm.confirmPassword === passwordForm.newPassword ? (
                        <>
                          <CheckCircle2 className="h-3.5 w-3.5" /> Passwords match
                        </>
                      ) : (
                        "Passwords must match"
                      )}
                    </p>
                  )}
                  <FieldError id="confirmPassword-error" message={passwordErrors.confirmPassword} />
                </div>
              </div>
            </CardContent>
            <CardFooter className="border-t border-border/40 bg-muted/10 px-6 py-4 flex justify-end">
              <Button
                type="button"
                onClick={handleChangePassword}
                disabled={changingPassword || !passwordForm.currentPassword || !passwordForm.newPassword}
                className="h-9 px-4"
              >
                {changingPassword && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                {changingPassword ? "Updating..." : "Update Password"}
              </Button>
            </CardFooter>
          </Card>
        </motion.div>
      </div>
    </div>
  );
}