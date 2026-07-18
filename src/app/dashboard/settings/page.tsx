"use client";

import { Card, CardContent, CardDescription, CardHeader, CardTitle, CardFooter } from "@/components/ui/card";
import { Settings, Moon, Sun, Monitor, Bell, BellOff, UserX, AlertTriangle, ShieldCheck } from "lucide-react";
import { useTheme } from "next-themes";
import { Button } from "@/components/ui/button";
import { useEffect, useState } from "react";
import { Label } from "@/components/ui/label";

export default function SettingsPage() {
  const { theme, setTheme } = useTheme();
  const [mounted, setMounted] = useState(false);
  const [notificationsEnabled, setNotificationsEnabled] = useState(true);

  useEffect(() => {
    setMounted(true);
  }, []);

  if (!mounted) return null;

  return (
    <div className="p-6 md:p-8 max-w-4xl mx-auto space-y-6">
      <div className="mb-2">
        <h1 className="text-3xl font-bold tracking-tight flex items-center gap-3">
          <Settings className="h-8 w-8 text-primary" />
          Settings
        </h1>
        <p className="text-muted-foreground mt-1">Manage your application preferences and account settings.</p>
      </div>
      
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Monitor className="h-5 w-5 text-primary" /> Appearance
          </CardTitle>
          <CardDescription>Customize the look and feel of the application.</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex gap-4">
            <Button 
              variant={theme === "light" ? "default" : "outline"}
              className="gap-2"
              onClick={() => setTheme("light")}
            >
              <Sun className="h-4 w-4" /> Light
            </Button>
            <Button 
              variant={theme === "dark" ? "default" : "outline"}
              className="gap-2"
              onClick={() => setTheme("dark")}
            >
              <Moon className="h-4 w-4" /> Dark
            </Button>
            <Button 
              variant={theme === "system" ? "default" : "outline"}
              className="gap-2"
              onClick={() => setTheme("system")}
            >
              <Monitor className="h-4 w-4" /> System
            </Button>
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Bell className="h-5 w-5 text-accent" /> Notifications
          </CardTitle>
          <CardDescription>Manage how you receive alerts and updates.</CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          <div className="flex items-center justify-between p-4 border rounded-lg bg-muted/20">
            <div className="space-y-0.5">
              <Label className="text-base font-semibold">Email Notifications</Label>
              <p className="text-sm text-muted-foreground">Receive weekly career matches and resume tips.</p>
            </div>
            <Button 
              variant={notificationsEnabled ? "default" : "outline"} 
              size="sm"
              onClick={() => setNotificationsEnabled(!notificationsEnabled)}
              className={notificationsEnabled ? "bg-accent hover:bg-accent/90 text-accent-foreground" : ""}
            >
              {notificationsEnabled ? <Bell className="h-4 w-4 mr-2" /> : <BellOff className="h-4 w-4 mr-2" />}
              {notificationsEnabled ? "Enabled" : "Disabled"}
            </Button>
          </div>
          <div className="flex items-center justify-between p-4 border rounded-lg bg-muted/20 opacity-50 cursor-not-allowed">
            <div className="space-y-0.5">
              <Label className="text-base font-semibold">SMS Alerts</Label>
              <p className="text-sm text-muted-foreground">Get text messages for important account updates.</p>
            </div>
            <Badge variant="outline">Coming Soon</Badge>
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <ShieldCheck className="h-5 w-5 text-green-500" /> Account Settings
          </CardTitle>
          <CardDescription>Manage data privacy and connected accounts.</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex items-center justify-between py-2 border-b">
            <div>
              <p className="font-medium">Data Export</p>
              <p className="text-sm text-muted-foreground">Download all your personal data in JSON format.</p>
            </div>
            <Button variant="outline" size="sm">Export Data</Button>
          </div>
          <div className="flex items-center justify-between py-2">
            <div>
              <p className="font-medium">Connected Accounts</p>
              <p className="text-sm text-muted-foreground">Manage your Google or GitHub OAuth connections.</p>
            </div>
            <Button variant="outline" size="sm">Manage</Button>
          </div>
        </CardContent>
      </Card>

      <Card className="border-destructive/30">
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-destructive">
            <AlertTriangle className="h-5 w-5" /> Danger Zone
          </CardTitle>
          <CardDescription>Irreversible actions related to your account.</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="p-4 border border-destructive/20 bg-destructive/5 rounded-lg flex flex-col sm:flex-row gap-4 items-start sm:items-center justify-between">
            <div>
              <h4 className="font-semibold text-destructive">Delete Account</h4>
              <p className="text-sm text-muted-foreground mt-1">
                Permanently delete your account, all generated resumes, saved careers, and chat history. This action cannot be undone.
              </p>
            </div>
            <Button variant="destructive" className="shrink-0 gap-2" onClick={() => {
              if (confirm("Are you ABSOLUTELY sure? This will delete all your data permanently.")) {
                alert("Account deletion initiated. (Mock action)");
              }
            }}>
              <UserX className="h-4 w-4" /> Delete Account
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}

function Badge({ children, className, variant = "default" }: any) {
  return (
    <span className={`inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-semibold transition-colors focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2 ${className} ${variant === 'outline' ? 'border border-border text-foreground' : 'bg-primary text-primary-foreground'}`}>
      {children}
    </span>
  )
}
