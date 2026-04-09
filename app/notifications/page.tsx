"use client";

import { useQuery, useMutation } from "convex/react";
import { api } from "@/convex/_generated/api";
import { Id } from "@/convex/_generated/dataModel";
import GlassHeader from "@/components/GlassHeader";
import { useLanguage } from "@/context/LanguageContext";
import { useState, useEffect } from "react";
import { bellIcon as BellIcon, bellOffIcon as BellOffIcon } from "@/components/Icons";

export default function NotificationsPage() {
    const { t } = useLanguage();
    const [permission, setPermission] = useState<NotificationPermission | "default">("default");
    const notifications = useQuery(api.notifications.getNotifications);
    const markAsRead = useMutation(api.notifications.markAsRead);
    const markAllAsRead = useMutation(api.notifications.markAllAsRead);
    const saveSubscription = useMutation(api.notifications.saveSubscription);

    useEffect(() => {
        if ("serviceWorker" in navigator && "PushManager" in window) {
            navigator.serviceWorker.ready.then((registration) => {
                registration.pushManager.getSubscription().then((sub) => {
                    if (sub) {
                        // Already subscribed, save it to sync
                        const p256dh = sub.getKey ? btoa(String.fromCharCode.apply(null, new Uint8Array(sub.getKey("p256dh")!) as any)) : "";
                        const auth = sub.getKey ? btoa(String.fromCharCode.apply(null, new Uint8Array(sub.getKey("auth")!) as any)) : "";
                        saveSubscription({ endpoint: sub.endpoint, p256dh, auth });
                    }
                });
            });
        }
    }, [saveSubscription]);

    const requestPushPermission = async () => {
        if (!("serviceWorker" in navigator) || !("PushManager" in window)) return;

        const perm = await Notification.requestPermission();
        setPermission(perm);

        if (perm === "granted") {
            const registration = await navigator.serviceWorker.ready;
            /* Replace generic VAPID key with actual via env or prop */
            const _publicVapidKey = process.env.NEXT_PUBLIC_VAPID_PUBLIC_KEY;
            if (!_publicVapidKey) return;

            const sub = await registration.pushManager.subscribe({
                userVisibleOnly: true,
                applicationServerKey: _publicVapidKey,
            });

            const p256dh = sub.getKey ? btoa(String.fromCharCode.apply(null, new Uint8Array(sub.getKey("p256dh")!) as any)) : "";
            const auth = sub.getKey ? btoa(String.fromCharCode.apply(null, new Uint8Array(sub.getKey("auth")!) as any)) : "";

            await saveSubscription({ endpoint: sub.endpoint, p256dh, auth });
        }
    };

    if (!notifications) {
        return <main className="centered-container "><div className="loader" /></main>;
    }

    const unreadCount = notifications.filter(n => !n.isRead).length;

    return (
        <>
            <GlassHeader
                title="Notifications"
                backHref="/"
                action={
                    <div style={{ display: "flex", gap: "0.5rem", alignItems: "center" }}>
                        {"Notification" in window && permission !== "granted" && (
                            <button
                                onClick={requestPushPermission}
                                className="glass-pill"
                                style={{ cursor: "pointer", border: "none", background: "none" }}
                                title="Enable Push Notifications"
                            >
                                <BellOffIcon />
                            </button>
                        )}
                        {"Notification" in window && permission === "granted" && (
                            <div className="glass-pill" title="Push Notifications Enabled">
                                <BellIcon />
                            </div>
                        )}
                        {unreadCount > 0 && (
                            <button
                                onClick={() => markAllAsRead()}
                                className="glass-pill"
                                style={{ fontSize: "0.8rem", cursor: "pointer", border: "none", background: "none" }}
                            >
                                Mark all read
                            </button>
                        )}
                    </div>
                }
            />

            <main className="animate-fade-in" style={{ paddingInline: "1rem", paddingBottom: "1rem" }}>
                <div style={{ display: "flex", flexDirection: "column", gap: "0.8rem", marginTop: "1rem" }}>
                    {notifications.length === 0 ? (
                        <div className="neo-box" style={{ textAlign: "center", opacity: 0.5, padding: "3rem" }}>
                            No notifications yet.
                        </div>
                    ) : (
                        notifications.map((notif) => (
                            <div
                                key={notif._id}
                                className="neo-box"
                                style={{
                                    opacity: notif.isRead ? 0.6 : 1,
                                    borderLeft: notif.isRead ? "none" : "4px solid var(--accent-color)",
                                    padding: "1rem"
                                }}
                                onClick={() => {
                                    if (!notif.isRead) markAsRead({ notificationId: notif._id });
                                    if (notif.link) window.location.href = notif.link;
                                }}
                            >
                                <div style={{ display: "flex", justifyContent: "space-between" }}>
                                    <h4 style={{ margin: 0, fontSize: "1rem" }}>{notif.title}</h4>
                                    <span style={{ fontSize: "0.7rem", opacity: 0.7 }}>
                                        {new Date(notif.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                                    </span>
                                </div>
                                <p style={{ margin: "0.5rem 0 0 0", fontSize: "0.9rem", opacity: 0.8 }}>
                                    {notif.body}
                                </p>
                            </div>
                        ))
                    )}
                </div>
            </main>
        </>
    );
}
