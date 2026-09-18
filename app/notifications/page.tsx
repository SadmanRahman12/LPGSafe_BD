"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import {
  Bell,
  CheckCircle2,
  AlertTriangle,
  Award,
  DollarSign,
  Package,
  Clock,
  ArrowRight,
  CheckCheck,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { formatDate } from "@/lib/utils";

export default function NotificationsPage() {
  const [notifications, setNotifications] = useState<any[]>([]);
  const [unreadCount, setUnreadCount] = useState(0);
  const [isLoading, setIsLoading] = useState(true);
  const [filter, setFilter] = useState<"ALL" | "UNREAD">("ALL");

  useEffect(() => {
    fetchNotifications();
  }, []);

  const fetchNotifications = async () => {
    setIsLoading(true);
    try {
      const res = await fetch("/api/notifications");
      const data = await res.json();
      if (data.notifications) {
        setNotifications(data.notifications);
        setUnreadCount(data.unreadCount || 0);
      }
    } catch (err) {
      console.error("Error loading notifications:", err);
    } finally {
      setIsLoading(false);
    }
  };

  const markAllRead = async () => {
    try {
      await fetch("/api/notifications", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ markAll: true }),
      });
      fetchNotifications();
    } catch (err) {
      console.error("Error marking all read:", err);
    }
  };

  const markAsRead = async (id: string) => {
    try {
      await fetch("/api/notifications", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ notificationId: id }),
      });
      fetchNotifications();
    } catch (err) {
      console.error("Error marking read:", err);
    }
  };

  const getIcon = (type: string) => {
    switch (type) {
      case "CERTIFICATION":
        return <Award className="w-5 h-5 text-blue-600" />;
      case "COMPLAINT":
        return <AlertTriangle className="w-5 h-5 text-amber-600" />;
      case "PRICE":
        return <DollarSign className="w-5 h-5 text-emerald-600" />;
      case "SECURITY":
        return <AlertTriangle className="w-5 h-5 text-rose-600" />;
      default:
        return <Bell className="w-5 h-5 text-slate-600" />;
    }
  };

  const filtered = notifications.filter((n) => (filter === "UNREAD" ? !n.isRead : true));

  return (
    <div className="min-h-screen bg-slate-50 py-10">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 space-y-8">
        {/* Header */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-blue-50 text-blue-800 text-xs font-semibold mb-2">
              <Bell className="w-4 h-4 text-blue-600" />
              <span>Platform Activity Center</span>
            </div>
            <h1 className="text-3xl font-black text-navy-950 tracking-tight">
              Safety Alerts & System Notifications
            </h1>
            <p className="text-xs text-slate-500 mt-1">
              Statutory warnings, certification expiries, complaint investigation updates, and price alerts.
            </p>
          </div>

          {unreadCount > 0 && (
            <Button
              variant="outline"
              size="sm"
              onClick={markAllRead}
              className="text-xs font-bold gap-1.5 self-start"
            >
              <CheckCheck className="w-4 h-4" />
              Mark All Read
            </Button>
          )}
        </div>

        {/* Filter Pills */}
        <div className="flex items-center gap-2">
          <button
            onClick={() => setFilter("ALL")}
            className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all ${
              filter === "ALL"
                ? "bg-navy-950 text-white shadow-sm"
                : "bg-white border border-slate-200 text-slate-600 hover:bg-slate-100"
            }`}
          >
            All Notifications ({notifications.length})
          </button>
          <button
            onClick={() => setFilter("UNREAD")}
            className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all ${
              filter === "UNREAD"
                ? "bg-navy-950 text-white shadow-sm"
                : "bg-white border border-slate-200 text-slate-600 hover:bg-slate-100"
            }`}
          >
            Unread Only ({unreadCount})
          </button>
        </div>

        {/* Notification List */}
        <div className="bg-white rounded-3xl border border-slate-200 shadow-sm overflow-hidden">
          {isLoading ? (
            <div className="py-20 text-center text-xs text-slate-400">
              Loading notification feed...
            </div>
          ) : filtered.length === 0 ? (
            <div className="p-12 text-center text-slate-400 space-y-2">
              <CheckCircle2 className="w-10 h-10 text-emerald-500 mx-auto" />
              <h3 className="font-bold text-sm text-navy-950">You're All Caught Up</h3>
              <p className="text-xs text-slate-500">
                No active safety or administrative notifications require your attention.
              </p>
            </div>
          ) : (
            <div className="divide-y divide-slate-100">
              {filtered.map((n) => (
                <div
                  key={n.id}
                  className={`p-5 flex items-start justify-between gap-4 transition-colors ${
                    n.isRead ? "bg-white" : "bg-blue-50/40"
                  }`}
                >
                  <div className="flex items-start gap-3.5">
                    <div className="p-2.5 rounded-xl bg-slate-100 mt-0.5">
                      {getIcon(n.type)}
                    </div>
                    <div className="space-y-1">
                      <div className="flex items-center gap-2">
                        <h4 className="font-bold text-sm text-navy-950">{n.title}</h4>
                        {!n.isRead && (
                          <span className="w-2 h-2 rounded-full bg-blue-600" />
                        )}
                      </div>
                      <p className="text-xs text-slate-600 leading-relaxed max-w-xl">
                        {n.message}
                      </p>
                      <span className="text-[11px] text-slate-400 block pt-1 font-mono">
                        {formatDate(n.createdAt)}
                      </span>
                    </div>
                  </div>

                  <div className="flex items-center gap-2 self-start sm:self-center flex-shrink-0">
                    {n.linkUrl && (
                      <Link href={n.linkUrl}>
                        <Button
                          size="sm"
                          variant="outline"
                          onClick={() => {
                            if (!n.isRead) markAsRead(n.id);
                          }}
                          className="text-xs gap-1"
                        >
                          View <ArrowRight className="w-3 h-3" />
                        </Button>
                      </Link>
                    )}
                    {!n.isRead && (
                      <button
                        onClick={() => markAsRead(n.id)}
                        className="p-2 text-slate-400 hover:text-slate-600 rounded-lg"
                        title="Mark as read"
                      >
                        <CheckCircle2 className="w-4 h-4" />
                      </button>
                    )}
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
