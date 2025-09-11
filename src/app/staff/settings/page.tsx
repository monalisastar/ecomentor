"use client";

import { useState } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Switch } from "@/components/ui/switch";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";

export default function StaffSettingsPage() {
  // Personal Info
  const [name, setName] = useState("Jane Doe");
  const [email, setEmail] = useState("jane.doe@example.com");
  const [phone, setPhone] = useState("");
  const [profilePic, setProfilePic] = useState<File | null>(null);
  const [profilePreview, setProfilePreview] = useState<string | null>(null);

  // Security
  const [currentPassword, setCurrentPassword] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [twoFactor, setTwoFactor] = useState(false);

  // Notifications
  const [emailNotifications, setEmailNotifications] = useState(true);
  const [smsNotifications, setSmsNotifications] = useState(false);
  const [announcementAlerts, setAnnouncementAlerts] = useState(true);

  // UI Preferences
  const [darkMode, setDarkMode] = useState(false);
  const [compactTables, setCompactTables] = useState(false);

  // Handle profile picture upload
  const handleProfileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      setProfilePic(file);
      setProfilePreview(URL.createObjectURL(file));
    }
  };

  // Email validation
  const isEmailValid = (email: string) =>
    /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);

  const handleSave = async () => {
    if (!isEmailValid(email)) {
      alert("Please enter a valid email address.");
      return;
    }

    // Mock API call
    const formData = new FormData();
    formData.append("name", name);
    formData.append("email", email);
    formData.append("phone", phone);
    if (profilePic) formData.append("profilePic", profilePic);
    formData.append("twoFactor", String(twoFactor));
    formData.append("emailNotifications", String(emailNotifications));
    formData.append("smsNotifications", String(smsNotifications));
    formData.append("announcementAlerts", String(announcementAlerts));
    formData.append("darkMode", String(darkMode));
    formData.append("compactTables", String(compactTables));

    try {
      const res = await fetch("/api/staff/settings", {
        method: "POST",
        body: formData,
      });

      if (res.ok) {
        alert("Settings saved successfully!");
      } else {
        alert("Failed to save settings. Try again.");
      }
    } catch (err) {
      console.error(err);
      alert("An error occurred while saving settings.");
    }
  };

  const handleReset = () => {
    setName("Jane Doe");
    setEmail("jane.doe@example.com");
    setPhone("");
    setProfilePic(null);
    setProfilePreview(null);
    setCurrentPassword("");
    setNewPassword("");
    setTwoFactor(false);
    setEmailNotifications(true);
    setSmsNotifications(false);
    setAnnouncementAlerts(true);
    setDarkMode(false);
    setCompactTables(false);
  };

  return (
    <div className="min-h-screen bg-gradient-to-b from-[#cce7ff] to-[#e6f3ff] p-8">
      {/* Header */}
      <div className="flex justify-between items-center mb-8">
        <h1 className="text-3xl font-bold text-gray-800">Staff Settings</h1>
        <Button
          variant="outline"
          onClick={() => (window.location.href = "/staff/dashboard")}
        >
          Return to Dashboard
        </Button>
      </div>

      <Tabs defaultValue="personal" className="space-y-6">
        <TabsList className="backdrop-blur-lg bg-white/20 border border-white/30 rounded-lg p-1">
          <TabsTrigger value="personal">Personal Info</TabsTrigger>
          <TabsTrigger value="security">Security</TabsTrigger>
          <TabsTrigger value="notifications">Notifications</TabsTrigger>
          <TabsTrigger value="ui">UI Preferences</TabsTrigger>
        </TabsList>

        {/* Personal Info */}
        <TabsContent value="personal">
          <Card className="backdrop-blur-lg bg-white/30 border border-white/40 shadow-lg">
            <CardContent className="space-y-4">
              <h2 className="text-xl font-bold mb-2">Personal Information</h2>

              {/* Profile Picture */}
              <div className="flex items-center gap-4">
                {profilePreview ? (
                  <img
                    src={profilePreview}
                    alt="Profile Preview"
                    className="w-20 h-20 rounded-full object-cover border border-white/40"
                  />
                ) : (
                  <div className="w-20 h-20 rounded-full bg-white/20 flex items-center justify-center border border-white/40">
                    No Image
                  </div>
                )}
                <Input
                  type="file"
                  accept="image/*"
                  onChange={handleProfileUpload}
                  className="backdrop-blur-lg bg-white/20 border border-white/30 text-gray-800"
                />
              </div>

              <Input
                label="Name"
                placeholder="Full Name"
                value={name}
                onChange={(e) => setName(e.target.value)}
                className="backdrop-blur-lg bg-white/20 border border-white/30 text-gray-800"
              />
              <Input
                label="Email"
                placeholder="Email Address"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="backdrop-blur-lg bg-white/20 border border-white/30 text-gray-800"
              />
              <Input
                label="Phone (Optional)"
                placeholder="Phone Number"
                value={phone}
                onChange={(e) => setPhone(e.target.value)}
                className="backdrop-blur-lg bg-white/20 border border-white/30 text-gray-800"
              />
            </CardContent>
          </Card>
        </TabsContent>

        {/* Security */}
        <TabsContent value="security">
          <Card className="backdrop-blur-lg bg-white/30 border border-white/40 shadow-lg space-y-4 p-4">
            <h2 className="text-xl font-bold mb-2">Account Security</h2>
            <Input
              label="Current Password"
              type="password"
              placeholder="********"
              value={currentPassword}
              onChange={(e) => setCurrentPassword(e.target.value)}
              className="backdrop-blur-lg bg-white/20 border border-white/30 text-gray-800"
            />
            <Input
              label="New Password"
              type="password"
              placeholder="********"
              value={newPassword}
              onChange={(e) => setNewPassword(e.target.value)}
              className="backdrop-blur-lg bg-white/20 border border-white/30 text-gray-800"
            />
            <div className="flex items-center gap-4 mt-2">
              <Switch
                checked={twoFactor}
                onCheckedChange={setTwoFactor}
                className="bg-blue-400"
              />
              <span className="text-gray-800">Enable Two-Factor Authentication</span>
            </div>
          </Card>
        </TabsContent>

        {/* Notifications */}
        <TabsContent value="notifications">
          <Card className="backdrop-blur-lg bg-white/30 border border-white/40 shadow-lg space-y-4 p-4">
            <h2 className="text-xl font-bold mb-2">Notification Preferences</h2>
            <div className="flex items-center gap-4">
              <Switch
                checked={emailNotifications}
                onCheckedChange={setEmailNotifications}
                className="bg-blue-400"
              />
              <span>Email Notifications</span>
            </div>
            <div className="flex items-center gap-4">
              <Switch
                checked={smsNotifications}
                onCheckedChange={setSmsNotifications}
                className="bg-blue-400"
              />
              <span>SMS Notifications</span>
            </div>
            <div className="flex items-center gap-4">
              <Switch
                checked={announcementAlerts}
                onCheckedChange={setAnnouncementAlerts}
                className="bg-blue-400"
              />
              <span>Announcement Alerts</span>
            </div>
          </Card>
        </TabsContent>

        {/* UI Preferences */}
        <TabsContent value="ui">
          <Card className="backdrop-blur-lg bg-white/30 border border-white/40 shadow-lg space-y-4 p-4">
            <h2 className="text-xl font-bold mb-2">UI Preferences</h2>
            <div className="flex items-center gap-4">
              <Switch
                checked={darkMode}
                onCheckedChange={setDarkMode}
                className="bg-blue-400"
              />
              <span>Enable Dark Mode</span>
            </div>
            <div className="flex items-center gap-4">
              <Switch
                checked={compactTables}
                onCheckedChange={setCompactTables}
                className="bg-blue-400"
              />
              <span>Compact Table Layout</span>
            </div>
          </Card>
        </TabsContent>
      </Tabs>

      {/* Save & Reset Buttons */}
      <div className="flex gap-4 mt-6">
        <Button onClick={handleSave} className="bg-blue-400 text-white hover:bg-blue-500">
          Save Changes
        </Button>
        <Button
          variant="outline"
          onClick={handleReset}
          className="text-gray-800 border-gray-300 hover:bg-white/20"
        >
          Reset to Default
        </Button>
      </div>
    </div>
  );
}
