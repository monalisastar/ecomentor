"use client";

import { useState, useMemo, useEffect } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Button } from "@/components/ui/button";
import { Select, SelectTrigger, SelectValue, SelectContent, SelectItem } from "@/components/ui/select";

interface Announcement {
  id: string;
  title: string;
  content: string;
  audience: string;
  createdAt: string; // Dates come as strings from the API
}

const AUDIENCES = [
  "All Climate Students",
  "Climate Science",
  "Sustainability",
  "Renewable Energy",
  "Environmental Policy",
];

export default function StaffAnnouncementsPage() {
  const [announcements, setAnnouncements] = useState<Announcement[]>([]);
  const [loading, setLoading] = useState(false);
  const [form, setForm] = useState({ title: "", content: "", audience: AUDIENCES[0], editingId: "" });
  const [search, setSearch] = useState("");

  // Fetch announcements on mount
  useEffect(() => {
    const fetchAnnouncements = async () => {
      setLoading(true);
      try {
        const res = await fetch("/api/announcements");
        const data: Announcement[] = await res.json();
        setAnnouncements(data);
      } catch (err) {
        console.error(err);
      } finally {
        setLoading(false);
      }
    };
    fetchAnnouncements();
  }, []);

  const filteredAnnouncements = useMemo(
    () =>
      announcements.filter(
        (a) =>
          a.title.toLowerCase().includes(search.toLowerCase()) ||
          a.content.toLowerCase().includes(search.toLowerCase())
      ),
    [announcements, search]
  );

  const handleSubmit = async () => {
    if (!form.title || !form.content) return;

    try {
      const method = form.editingId ? "PATCH" : "POST";
      const url = form.editingId ? `/api/announcements/${form.editingId}` : "/api/announcements";

      const res = await fetch(url, {
        method,
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ title: form.title, content: form.content, audience: form.audience }),
      });
      const saved: Announcement = await res.json();

      setAnnouncements((prev) => {
        if (form.editingId) return prev.map((a) => (a.id === saved.id ? saved : a));
        return [saved, ...prev];
      });

      setForm({ title: "", content: "", audience: AUDIENCES[0], editingId: "" });
    } catch (err) {
      console.error(err);
    }
  };

  const handleEdit = (a: Announcement) => {
    setForm({ title: a.title, content: a.content, audience: a.audience, editingId: a.id });
  };

  const handleDelete = async (id: string) => {
    try {
      await fetch(`/api/announcements/${id}`, { method: "DELETE" });
      setAnnouncements((prev) => prev.filter((a) => a.id !== id));
    } catch (err) {
      console.error(err);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-b from-[#cce7ff] to-[#e6f3ff] p-8">
      <div className="flex justify-between items-center mb-8">
        <h1 className="text-3xl font-bold text-gray-800">Climate Announcements</h1>
        <Button variant="outline" onClick={() => (window.location.href = "/staff/dashboard")}>
          Return to Dashboard
        </Button>
      </div>

      <Card className="mb-8 backdrop-blur-lg bg-white/20 border border-white/30 shadow-lg">
        <CardContent>
          <h2 className="text-xl font-bold mb-4">{form.editingId ? "Edit Announcement" : "Create Announcement"}</h2>
          <div className="flex flex-col md:flex-row gap-4 mb-4">
            <Input
              placeholder="Title"
              value={form.title}
              onChange={(e) => setForm({ ...form, title: e.target.value })}
              className="backdrop-blur-lg bg-white/20 border border-white/30"
            />
            <Select value={form.audience} onValueChange={(val) => setForm({ ...form, audience: val })}>
              <SelectTrigger className="w-64 backdrop-blur-lg bg-white/20 border border-white/30">
                <SelectValue placeholder="Select Audience" />
              </SelectTrigger>
              <SelectContent>
                {AUDIENCES.map((aud) => (
                  <SelectItem key={aud} value={aud}>
                    {aud}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
          <Textarea
            placeholder="Content"
            value={form.content}
            onChange={(e) => setForm({ ...form, content: e.target.value })}
            className="backdrop-blur-lg bg-white/20 border border-white/30 mb-4"
            rows={4}
          />
          <Button onClick={handleSubmit}>{form.editingId ? "Update Announcement" : "Post Announcement"}</Button>
        </CardContent>
      </Card>

      <Input
        placeholder="Search announcements..."
        value={search}
        onChange={(e) => setSearch(e.target.value)}
        className="backdrop-blur-lg bg-white/20 border border-white/30 mb-6"
      />

      {loading ? (
        <p className="text-gray-800">Loading announcements...</p>
      ) : filteredAnnouncements.length === 0 ? (
        <p className="text-gray-800">No announcements found.</p>
      ) : (
        <div className="space-y-4">
          {filteredAnnouncements.map((a) => (
            <Card key={a.id} className="backdrop-blur-lg bg-white/20 border border-white/30 shadow-lg">
              <CardContent>
                <div className="flex justify-between items-start mb-2">
                  <h3 className="text-lg font-semibold text-gray-800">{a.title}</h3>
                  <div className="flex gap-2">
                    <Button size="sm" variant="outline" onClick={() => handleEdit(a)}>
                      Edit
                    </Button>
                    <Button size="sm" variant="destructive" onClick={() => handleDelete(a.id)}>
                      Delete
                    </Button>
                  </div>
                </div>
                <p className="text-gray-700 mb-2">{a.content}</p>
                <p className="text-sm text-gray-500">
                  Audience: {a.audience} | Posted: {new Date(a.createdAt).toLocaleDateString()}
                </p>
              </CardContent>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
}
