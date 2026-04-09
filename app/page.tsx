"use client";
import Link from "next/link";
import GlassHeader from "@/components/GlassHeader";
import { ClipboardIcon, MoneyIcon, AttendanceIcon, PreschoolerIcon, SettingsIcon, bellIcon as BellIcon } from "@/components/Icons";
import KPIStats from "@/app/components/KPIStats";
import { useLanguage } from "@/context/LanguageContext";
// @ts-ignore
import { ViewTransition } from "react";

export default function Home() {
  const { t } = useLanguage();

  const cardStyle = {
    aspectRatio: "1/1",
    display: "flex",
    flexDirection: "column" as const,
    justifyContent: "center",
    alignItems: "center",
    gap: "0.5rem",
    padding: "2rem"
  };
  return (
    <>
      <GlassHeader
        title={t("home.title")}
        leftAction={
          <Link href="/settings" className="glass-pill">
            <SettingsIcon />
          </Link>
        }
        action={
          <Link href="/notifications" className="glass-pill">
            <BellIcon />
          </Link>
        }
      />
      <main className="animate-fade-in" style={{ paddingInline: '1rem', paddingBottom: '7rem', gap: '2rem' }}>
        <KPIStats />

        <div
          style={{
            display: "grid",
            gridTemplateColumns: "repeat(2, 1fr)",
            gap: "1rem",
            aspectRatio: "1/1",
          }}
        >
          <ViewTransition name="page-children">
            <Link href="/children" style={cardStyle} className="neo-box">
              <PreschoolerIcon />
              <span>{t("home.myChildren")}</span>
            </Link>
          </ViewTransition>
          <ViewTransition name="page-attendance">
            <Link href="/attendance" style={cardStyle} className="neo-box">
              <AttendanceIcon />
              <span>{t("home.attendance")}</span>
            </Link>
          </ViewTransition>
          <ViewTransition name="page-register">
            <Link href="/register" style={cardStyle} className="neo-box">
              <ClipboardIcon />
              <span>{t("home.registration")}</span>
            </Link>
          </ViewTransition>
          <ViewTransition name="page-payments">
            <Link href="/payments" style={cardStyle} className="neo-box">
              <MoneyIcon />
              <span>{t("home.payments")}</span>
            </Link>
          </ViewTransition>
        </div>
      </main>
    </>
  );
}
