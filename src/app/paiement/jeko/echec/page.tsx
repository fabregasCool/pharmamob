//src/app/paiement/jeko/echec/page.tsx

"use client";

import { Suspense, useEffect, useState } from "react";
import { useSearchParams } from "next/navigation";
import Link from "next/link";

export default function JekoEchecPage() {
  return (
    <Suspense fallback={<LoadingCard />}>
      <JekoEchecContent />
    </Suspense>
  );
}

function JekoEchecContent() {
  const searchParams = useSearchParams();
  const reference = searchParams.get("ref");

  const [errorReason, setErrorReason] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!reference) {
      setLoading(false);
      return;
    }

    fetch(`/api/payments/status?ref=${reference}`)
      .then((res) => res.json())
      .then((data) => {
        if (data.paiement?.errorReason) {
          setErrorReason(data.paiement.errorReason);
        }
      })
      .catch(() => {})
      .finally(() => setLoading(false));
  }, [reference]);

  return (
    <div style={styles.container}>
      <div style={styles.card}>
        <div style={styles.icon}>✕</div>
        <h1 style={styles.title}>Paiement non abouti</h1>
        <p style={styles.text}>
          {loading
            ? "Vérification en cours…"
            : errorReason || "Le paiement a été annulé ou n'a pas pu aboutir."}
        </p>
        <p style={styles.subtext}>
          Aucun montant n&apos;a été débité si la transaction n&apos;a pas été
          validée jusqu&apos;au bout. Vous pouvez réessayer avec le même moyen
          de paiement ou un autre.
        </p>
        <Link href="/commandes" style={styles.button}>
          Retour à mes commandes
        </Link>
      </div>
    </div>
  );
}

function LoadingCard() {
  return (
    <div style={styles.container}>
      <div style={styles.card}>
        <div style={styles.spinner} />
        <h1 style={styles.title}>Chargement…</h1>
      </div>
    </div>
  );
}

const styles: Record<string, React.CSSProperties> = {
  container: {
    minHeight: "100vh",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    background: "#f3f4f6",
    padding: 16,
  },
  card: {
    background: "#fff",
    borderRadius: 16,
    padding: "40px 32px",
    maxWidth: 420,
    width: "100%",
    textAlign: "center",
    boxShadow: "0 4px 24px rgba(0,0,0,0.08)",
  },
  icon: {
    fontSize: 48,
    fontWeight: "bold",
    marginBottom: 16,
    color: "#dc2626",
  },
  title: { fontSize: 22, fontWeight: 700, marginBottom: 12, color: "#111827" },
  text: { fontSize: 15, color: "#4b5563", marginBottom: 8, lineHeight: 1.5 },
  subtext: { fontSize: 13, color: "#9ca3af", marginBottom: 24 },
  button: {
    display: "inline-block",
    marginTop: 16,
    padding: "12px 24px",
    background: "#dc2626",
    color: "#fff",
    borderRadius: 8,
    textDecoration: "none",
    fontWeight: 600,
  },
  spinner: {
    width: 40,
    height: 40,
    margin: "0 auto 16px",
    border: "4px solid #e5e7eb",
    borderTopColor: "#dc2626",
    borderRadius: "50%",
    animation: "spin 0.8s linear infinite",
  },
};
