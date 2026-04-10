"use client";

import { useQuery, useMutation } from "convex/react";
import { api } from "@/convex/_generated/api";
import { Id } from "@/convex/_generated/dataModel";
import GlassHeader from "@/components/GlassHeader";
import { useLanguage } from "@/context/LanguageContext";
import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { bellOffIcon as BellOffIcon, markAllAsReadIcon as MarkAllAsReadIcon, AllReadIcon } from "@/components/Icons";

function urlBase64ToUint8Array(base64String: string) {
    const padding = "=".repeat((4 - (base64String.length % 4)) % 4);
    const base64 = (base64String + padding).replace(/\-/g, "+").replace(/_/g, "/");
    const rawData = window.atob(base64);
    const outputArray = new Uint8Array(rawData.length);
    for (let i = 0; i < rawData.length; ++i) {
        outputArray[i] = rawData.charCodeAt(i);
    }
    return outputArray;
}

function arrayBufferToBase64(buffer: ArrayBuffer | null) {
    if (!buffer) return "";
    const bytes = new Uint8Array(buffer);
    let binary = "";
    for (let i = 0; i < bytes.byteLength; i++) {
        binary += String.fromCharCode(bytes[i]);
    }
    return window.btoa(binary);
}

export default function NotificationsPage() {
    const { t } = useLanguage();
    const router = useRouter();
    const [permission, setPermission] = useState<NotificationPermission | "default">("default");
    const notifications = useQuery(api.notifications.getNotifications);
    const markAsRead = useMutation(api.notifications.markAsRead);
    const markAllAsRead = useMutation(api.notifications.markAllAsRead);
    const saveSubscription = useMutation(api.notifications.saveSubscription);

    useEffect(() => {
        if ("Notification" in window) {
            setPermission(Notification.permission);
        }
        // Register SW and sync existing subscription
        if ("serviceWorker" in navigator) {
            navigator.serviceWorker.register("/sw.js").then((registration) => {
                registration.pushManager.getSubscription().then((sub) => {
                    if (sub) {
                        const p256dh = arrayBufferToBase64(sub.getKey("p256dh"));
                        const auth = arrayBufferToBase64(sub.getKey("auth"));
                        saveSubscription({ endpoint: sub.endpoint, p256dh, auth });
                    }
                });
            }).catch((err) => console.error("SW registration failed:", err));
        }
    }, []);

    const requestPushPermission = async () => {
        if (!("serviceWorker" in navigator) || !("PushManager" in window)) return;

        const perm = await Notification.requestPermission();
        setPermission(perm);

        if (perm === "granted") {
            try {
                // Check if SW is already registered, else register
                let registration = await navigator.serviceWorker.getRegistration();
                if (!registration) {
                    registration = await navigator.serviceWorker.register("/sw.js");
                }

                const _publicVapidKey = process.env.NEXT_PUBLIC_VAPID_PUBLIC_KEY;
                if (!_publicVapidKey) {
                    console.error("Missing NEXT_PUBLIC_VAPID_PUBLIC_KEY");
                    return;
                }

                const subscription = await registration.pushManager.subscribe({
                    userVisibleOnly: true,
                    applicationServerKey: urlBase64ToUint8Array(_publicVapidKey),
                });

                const p256dh = arrayBufferToBase64(subscription.getKey("p256dh"));
                const auth = arrayBufferToBase64(subscription.getKey("auth"));

                await saveSubscription({ endpoint: subscription.endpoint, p256dh, auth });
            } catch (err) {
                console.error("Push subscription error:", err);
            }
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
                                style={{ cursor: "pointer" }}
                                title="Enable Push Notifications"
                            >
                                <BellOffIcon />
                            </button>
                        )}
                        {"Notification" in window && permission === "granted" && (
                            <button
                                onClick={() => markAllAsRead()}
                                className="glass-pill"
                                style={{ cursor: "pointer" }}
                                title="Mark all as read"
                            >
                                {unreadCount > 0 ? <MarkAllAsReadIcon /> : <AllReadIcon />}
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
                                    if (notif.link) router.push(notif.link);
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
