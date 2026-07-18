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
  Edit,
  Save,
  X,
  Loader2,
  Lock,
  MapPin,
  Briefcase,
  Eye,
  EyeOff,
  CheckCircle2,
  AlertCircle,
  BadgeCheck,
  Sparkles,
  User,
} from "lucide-react";

/* ------------------------------------------------------------------ */
/* Types                                                               */
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
/* Helpers                                                             */
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
    { score: 4, label: "Strong", colorClass: "bg-green-500" },
    { score: 5, label: "Very strong", colorClass: "bg-green-500" },
  ];

  return levels[Math.min(score, 5)];
}

/* ------------------------------------------------------------------ */
/* Motion variants                                                     */
/* ------------------------------------------------------------------ */

const fadeInUp = {
  initial: { opacity: 0, y: 16 },
  animate: { opacity: 1, y: 0 },
  transition: { duration: 0.4 },
};

/* ------------------------------------------------------------------ */
/* Small reusable bits                                                 */
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
      initial={{ opacity: 0, y: -8, height: 0 }}
      animate={{ opacity: 1, y: 0, height: "auto" }}
      exit={{ opacity: 0, y: -8, height: 0 }}
      transition={{ duration: 0.25 }}
      className={`flex items-center gap-2 overflow-hidden rounded-xl border p-3 text-sm shadow-sm ${
        isSuccess
          ? "border-green-500/30 bg-green-500/10 text-green-700 dark:text-green-400"
          : "border-destructive/30 bg-destructive/10 text-destructive"
      }`}
      role="alert"
    >
      {isSuccess ? <CheckCircle2 className="h-4 w-4 shrink-0" /> : <AlertCircle className="h-4 w-4 shrink-0" />}
      <span className="flex-1">{message}</span>
      <Button
        type="button"
        variant="ghost"
        size="sm"
        className="ml-auto h-6 w-6 shrink-0 p-0"
        onClick={onDismiss}
        aria-label="Dismiss"
      >
        <X className="h-3.5 w-3.5" />
      </Button>
    </motion.div>
  );
}

function FieldError({ id, message }: { id: string; message?: string }) {
  if (!message) return null;
  return (
    <p id={id} className="flex items-center gap-1 text-xs text-destructive">
      <AlertCircle className="h-3.5 w-3.5 shrink-0" /> {message}
    </p>
  );
}

function ProfileSkeleton() {
  return (
    <div className="mx-auto max-w-4xl space-y-6 p-6 md:p-8">
      <div className="space-y-2">
        <div className="h-8 w-48 animate-pulse rounded-md bg-muted" />
        <div className="h-4 w-72 animate-pulse rounded-md bg-muted" />
      </div>
      <div className="rounded-2xl border border-border/50 bg-card/60 p-6 md:p-8">
        <div className="flex items-center gap-4">
          <div className="h-20 w-20 animate-pulse rounded-full bg-muted" />
          <div className="space-y-2">
            <div className="h-5 w-40 animate-pulse rounded-md bg-muted" />
            <div className="h-4 w-56 animate-pulse rounded-md bg-muted" />
          </div>
        </div>
      </div>
      <div className="h-64 animate-pulse rounded-2xl border border-border/50 bg-card/60" />
    </div>
  );
}

/* ------------------------------------------------------------------ */
/* Page                                                                 */
/* ------------------------------------------------------------------ */

export default function ProfilePage() {
  const { data: session } = useSession();

  // Session hooks that expose `undefined` while pending and either a
  // session object or `null` once resolved are common; we use that shape
  // without assuming extra fields to avoid guessing at an unknown type.
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

  // Initialize the form from session data once it becomes available,
  // instead of reading it directly in useState (which can mismatch
  // between server and client render passes).
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
    if (saving) return; // guard against duplicate submissions

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
    if (changingPassword) return; // guard against duplicate submissions

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
    } catch (err: unknown) {
      setError(getErrorMessage(err, "Failed to change password."));
      setPasswordForm(EMPTY_PASSWORD); // clear sensitive fields on failure too
    } finally {
      setChangingPassword(false);
      setPasswordErrors({});
    }
  }, [passwordForm, changingPassword]);

  if (sessionLoading) {
    return <ProfileSkeleton />;
  }

  return (
    <div className="mx-auto max-w-4xl space-y-6 p-6 md:p-8">
      <motion.div {...fadeInUp} className="mb-2">
        <h1 className="text-3xl font-bold tracking-tight">My Profile</h1>
        <p className="mt-1 text-muted-foreground">Manage your account details and personal information.</p>
      </motion.div>

      {/* Status Messages */}
      <AnimatePresence mode="popLayout">
        {success && <StatusBanner key="success" type="success" message={success} onDismiss={() => setSuccess("")} />}
        {error && <StatusBanner key="error" type="error" message={error} onDismiss={() => setError("")} />}
      </AnimatePresence>

      {/* Profile Header / Hero */}
      <motion.div {...fadeInUp}>
        <Card className="overflow-hidden border-border/50 bg-card/60 shadow-sm backdrop-blur-sm">
          <div className="relative">
            <div className="h-24 w-full bg-gradient-to-r from-primary/20 via-accent/20 to-primary/10" />
            <CardContent className="relative -mt-12 pb-6 pt-0">
              <div className="flex flex-col items-start gap-4 sm:flex-row sm:items-end sm:justify-between">
                <div className="flex flex-col items-start gap-4 sm:flex-row sm:items-end">
                  <div className="flex h-20 w-20 shrink-0 items-center justify-center rounded-full bg-gradient-to-br from-primary to-accent text-2xl font-bold text-primary-foreground shadow-lg ring-4 ring-background">
                    {initials}
                  </div>
                  <div className="pb-1">
                    <div className="flex flex-wrap items-center gap-2">
                      <p className="text-lg font-semibold">{user?.name || "Unnamed User"}</p>
                      <span className="inline-flex items-center gap-1 rounded-full bg-primary/10 px-2 py-0.5 text-xs font-medium text-primary">
                        <BadgeCheck className="h-3 w-3" /> Active
                      </span>
                    </div>
                    <div className="mt-1 flex items-center gap-1.5 text-sm text-muted-foreground">
                      <Mail className="h-3.5 w-3.5 shrink-0" />
                      <span className="truncate">{user?.email}</span>
                    </div>
                  </div>
                </div>
                <Button
                  type="button"
                  variant={editing ? "ghost" : "outline"}
                  size="sm"
                  className="gap-2"
                  onClick={() => (editing ? handleCancelEdit() : setEditing(true))}
                >
                  {editing ? (
                    <>
                      <X className="h-4 w-4" /> Cancel
                    </>
                  ) : (
                    <>
                      <Edit className="h-4 w-4" /> Edit Profile
                    </>
                  )}
                </Button>
              </div>
            </CardContent>
          </div>
        </Card>
      </motion.div>

      {/* Personal Information Card */}
      <motion.div {...fadeInUp}>
        <Card className="border-border/50 bg-card/60 shadow-sm backdrop-blur-sm">
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-lg">
              <User className="h-5 w-5 text-primary" /> Personal Information
            </CardTitle>
            <CardDescription>Your basic account details</CardDescription>
          </CardHeader>
          <CardContent>
            <AnimatePresence mode="wait" initial={false}>
              {editing ? (
                <motion.div
                  key="edit"
                  initial={{ opacity: 0, height: 0 }}
                  animate={{ opacity: 1, height: "auto" }}
                  exit={{ opacity: 0, height: 0 }}
                  transition={{ duration: 0.25 }}
                  className="space-y-4 overflow-hidden"
                >
                  <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
                    <div className="space-y-2">
                      <Label htmlFor="firstName">First Name</Label>
                      <div className="relative">
                        <User className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
                        <Input
                          id="firstName"
                          className="pl-9"
                          value={form.firstName}
                          onChange={handleProfileFieldChange("firstName")}
                          aria-invalid={!!profileErrors.firstName}
                          aria-describedby={profileErrors.firstName ? "firstName-error" : undefined}
                        />
                      </div>
                      <FieldError id="firstName-error" message={profileErrors.firstName} />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="lastName">Last Name</Label>
                      <div className="relative">
                        <User className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
                        <Input
                          id="lastName"
                          className="pl-9"
                          value={form.lastName}
                          onChange={handleProfileFieldChange("lastName")}
                          aria-invalid={!!profileErrors.lastName}
                          aria-describedby={profileErrors.lastName ? "lastName-error" : undefined}
                        />
                      </div>
                      <FieldError id="lastName-error" message={profileErrors.lastName} />
                    </div>
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="headline" className="flex items-center gap-1">
                      <Briefcase className="h-3 w-3" /> Professional Headline
                    </Label>
                    <div className="relative">
                      <Briefcase className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
                      <Input
                        id="headline"
                        className="pl-9"
                        placeholder="e.g. Senior Frontend Engineer"
                        value={form.headline}
                        onChange={handleProfileFieldChange("headline")}
                        aria-invalid={!!profileErrors.headline}
                        aria-describedby={profileErrors.headline ? "headline-error" : undefined}
                      />
                    </div>
                    <FieldError id="headline-error" message={profileErrors.headline} />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="location" className="flex items-center gap-1">
                      <MapPin className="h-3 w-3" /> Location
                    </Label>
                    <div className="relative">
                      <MapPin className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
                      <Input
                        id="location"
                        className="pl-9"
                        placeholder="e.g. San Francisco, CA"
                        value={form.location}
                        onChange={handleProfileFieldChange("location")}
                        aria-invalid={!!profileErrors.location}
                        aria-describedby={profileErrors.location ? "location-error" : undefined}
                      />
                    </div>
                    <FieldError id="location-error" message={profileErrors.location} />
                  </div>

                  <div className="flex items-center gap-2 pt-2">
                    <Button type="button" onClick={handleSaveProfile} disabled={saving} className="gap-2">
                      {saving ? <Loader2 className="h-4 w-4 animate-spin" /> : <Save className="h-4 w-4" />}
                      {saving ? "Saving..." : "Save Changes"}
                    </Button>
                    <Button type="button" variant="ghost" onClick={handleCancelEdit} disabled={saving}>
                      Cancel
                    </Button>
                  </div>
                </motion.div>
              ) : (
                <motion.div
                  key="view"
                  initial={{ opacity: 0, height: 0 }}
                  animate={{ opacity: 1, height: "auto" }}
                  exit={{ opacity: 0, height: 0 }}
                  transition={{ duration: 0.25 }}
                  className="grid grid-cols-1 gap-4 overflow-hidden sm:grid-cols-2"
                >
                  <div className="rounded-xl border border-border/50 bg-muted/20 p-4">
                    <p className="flex items-center gap-1.5 text-xs font-medium text-muted-foreground">
                      <Briefcase className="h-3.5 w-3.5" /> Headline
                    </p>
                    <p className="mt-1 text-sm">{form.headline || <span className="text-muted-foreground">Not set</span>}</p>
                  </div>
                  <div className="rounded-xl border border-border/50 bg-muted/20 p-4">
                    <p className="flex items-center gap-1.5 text-xs font-medium text-muted-foreground">
                      <MapPin className="h-3.5 w-3.5" /> Location
                    </p>
                    <p className="mt-1 text-sm">{form.location || <span className="text-muted-foreground">Not set</span>}</p>
                  </div>
                  <div className="rounded-xl border border-border/50 bg-muted/20 p-4 sm:col-span-2">
                    <p className="flex items-center gap-1.5 text-xs font-medium text-muted-foreground">
                      <Mail className="h-3.5 w-3.5" /> Email
                    </p>
                    <p className="mt-1 text-sm">{user?.email}</p>
                  </div>
                </motion.div>
              )}
            </AnimatePresence>
          </CardContent>
        </Card>
      </motion.div>

      {/* Change Password Card */}
      <motion.div {...fadeInUp}>
        <Card className="border-border/50 bg-card/60 shadow-sm backdrop-blur-sm">
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-lg">
              <Lock className="h-5 w-5 text-primary" /> Change Password
            </CardTitle>
            <CardDescription>Update your account password</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="currentPassword">Current Password</Label>
              <div className="relative">
                <Lock className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
                <Input
                  id="currentPassword"
                  type={showCurrentPassword ? "text" : "password"}
                  className="pl-9 pr-10"
                  value={passwordForm.currentPassword}
                  onChange={handlePasswordFieldChange("currentPassword")}
                  autoComplete="current-password"
                  aria-invalid={!!passwordErrors.currentPassword}
                  aria-describedby={passwordErrors.currentPassword ? "currentPassword-error" : undefined}
                />
                <button
                  type="button"
                  onClick={() => setShowCurrentPassword((v) => !v)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground"
                  aria-label={showCurrentPassword ? "Hide password" : "Show password"}
                >
                  {showCurrentPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                </button>
              </div>
              <FieldError id="currentPassword-error" message={passwordErrors.currentPassword} />
            </div>

            <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
              <div className="space-y-2">
                <Label htmlFor="newPassword">New Password</Label>
                <div className="relative">
                  <Lock className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
                  <Input
                    id="newPassword"
                    type={showNewPassword ? "text" : "password"}
                    className="pl-9 pr-10"
                    value={passwordForm.newPassword}
                    onChange={handlePasswordFieldChange("newPassword")}
                    autoComplete="new-password"
                    aria-invalid={!!passwordErrors.newPassword}
                    aria-describedby={passwordErrors.newPassword ? "newPassword-error" : "newPassword-strength"}
                  />
                  <button
                    type="button"
                    onClick={() => setShowNewPassword((v) => !v)}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground"
                    aria-label={showNewPassword ? "Hide password" : "Show password"}
                  >
                    {showNewPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                  </button>
                </div>
                {passwordForm.newPassword && (
                  <div id="newPassword-strength" className="space-y-1 pt-1">
                    <div className="flex h-1.5 gap-1">
                      {[0, 1, 2, 3, 4].map((i) => (
                        <span
                          key={i}
                          className={`h-full flex-1 rounded-full transition-colors ${
                            i < passwordStrength.score ? passwordStrength.colorClass : "bg-muted"
                          }`}
                        />
                      ))}
                    </div>
                    <p className="text-xs text-muted-foreground">{passwordStrength.label}</p>
                  </div>
                )}
                <FieldError id="newPassword-error" message={passwordErrors.newPassword} />
              </div>

              <div className="space-y-2">
                <Label htmlFor="confirmPassword">Confirm New Password</Label>
                <div className="relative">
                  <Lock className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
                  <Input
                    id="confirmPassword"
                    type={showConfirmPassword ? "text" : "password"}
                    className="pl-9 pr-10"
                    value={passwordForm.confirmPassword}
                    onChange={handlePasswordFieldChange("confirmPassword")}
                    autoComplete="new-password"
                    aria-invalid={!!passwordErrors.confirmPassword}
                    aria-describedby={passwordErrors.confirmPassword ? "confirmPassword-error" : undefined}
                  />
                  <button
                    type="button"
                    onClick={() => setShowConfirmPassword((v) => !v)}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground"
                    aria-label={showConfirmPassword ? "Hide password" : "Show password"}
                  >
                    {showConfirmPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                  </button>
                </div>
                {passwordForm.confirmPassword && !passwordErrors.confirmPassword && (
                  <p
                    className={`flex items-center gap-1 text-xs ${
                      passwordForm.confirmPassword === passwordForm.newPassword
                        ? "text-green-600 dark:text-green-400"
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
          <CardFooter className="border-t border-border/50 bg-muted/20 pt-4">
            <Button
              type="button"
              onClick={handleChangePassword}
              disabled={changingPassword || !passwordForm.currentPassword || !passwordForm.newPassword}
              className="gap-2"
            >
              {changingPassword ? <Loader2 className="h-4 w-4 animate-spin" /> : <Shield className="h-4 w-4" />}
              {changingPassword ? "Updating..." : "Update Password"}
            </Button>
          </CardFooter>
        </Card>
      </motion.div>

      <motion.p {...fadeInUp} className="flex items-center justify-center gap-1.5 text-center text-xs text-muted-foreground">
        <Sparkles className="h-3.5 w-3.5" /> Your information is kept private and secure.
      </motion.p>
    </div>
  );
}