//src/app/paiement/jeko/merci/page.tsx
"use client";

import { Suspense, useEffect, useState } from "react";
import { useSearchParams } from "next/navigation";
import Link from "next/link";

interface PaiementInfo {
  statut: "PENDING" | "SUCCESS" | "ERROR" | "EXPIRE";
  montant: string;
  paymentMethod: string | null;
  errorReason: string | null;
}

const POLL_INTERVAL_MS = 3000;
const MAX_ATTEMPTS = 20;

export default function JekoMerciPage() {
  return (
    <Suspense fallback={<LoadingCard />}>
      <JekoMerciContent />
    </Suspense>
  );
}

function JekoMerciContent() {
  const searchParams = useSearchParams();
  const reference = searchParams.get("ref");

  const [paiement, setPaiement] = useState<PaiementInfo | null>(null);
  const [loading, setLoading] = useState(true);
  const [attempts, setAttempts] = useState(0);
  const [erreur, setErreur] = useState<string | null>(null);

  useEffect(() => {
    if (!reference) {
      setErreur("Référence de paiement manquante.");
      setLoading(false);
      return;
    }

    let cancelled = false;

    async function checkStatus() {
      try {
        const res = await fetch(`/api/payments/status?ref=${reference}`);
        const data = await res.json();
        if (cancelled) return;

        if (data.error) {
          setErreur(data.error);
          setLoading(false);
          return;
        }

        setPaiement(data.paiement);

        if (data.paiement.statut === "PENDING" && attempts < MAX_ATTEMPTS) {
          setAttempts((a) => a + 1);
        } else {
          setLoading(false);
        }
      } catch {
        if (!cancelled) {
          setErreur("Impossible de vérifier le paiement pour le moment.");
          setLoading(false);
        }
      }
    }

    checkStatus();
    return () => {
      cancelled = true;
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [reference, attempts]);

  useEffect(() => {
    if (paiement?.statut !== "PENDING" || attempts >= MAX_ATTEMPTS) return;
    const timer = setTimeout(() => setAttempts((a) => a + 1), POLL_INTERVAL_MS);
    return () => clearTimeout(timer);
  }, [paiement, attempts]);

  return (
    <div style={styles.container}>
      <div style={styles.card}>
        {erreur && (
          <>
            <div style={{ ...styles.icon, color: "#dc2626" }}>✕</div>
            <h1 style={styles.title}>Une erreur est survenue</h1>
            <p style={styles.text}>{erreur}</p>
            <Link href="/" style={styles.button}>
              Retour à l&apos;accueil
            </Link>
          </>
        )}

        {!erreur && loading && (
          <>
            <div style={styles.spinner} />
            <h1 style={styles.title}>Vérification du paiement…</h1>
            <p style={styles.text}>
              Merci de patienter, nous confirmons votre transaction.
            </p>
          </>
        )}

        {!erreur && !loading && paiement?.statut === "SUCCESS" && (
          <>
            <div style={{ ...styles.icon, color: "#16a34a" }}>✓</div>
            <h1 style={styles.title}>Paiement réussi</h1>
            <p style={styles.text}>
              Votre paiement de{" "}
              {Number(paiement.montant).toLocaleString("fr-FR")} FCFA
              {paiement.paymentMethod ? ` par ${paiement.paymentMethod}` : ""} a
              bien été confirmé.
            </p>
            <p style={styles.subtext}>
              Votre commande est en cours de préparation.
            </p>
            <Link href="" style={styles.button}>
              Retournez dans PharmaMob pour voir vos Commandes
            </Link>
          </>
        )}

        {!erreur && !loading && paiement?.statut === "ERROR" && (
          <>
            <div style={{ ...styles.icon, color: "#dc2626" }}>✕</div>
            <h1 style={styles.title}>Paiement échoué</h1>
            <p style={styles.text}>
              {paiement.errorReason || "Le paiement n'a pas pu être confirmé."}
            </p>
            <Link href="/commandes" style={styles.button}>
              Réessayer
            </Link>
          </>
        )}

        {!erreur && !loading && paiement?.statut === "PENDING" && (
          <>
            <div style={{ ...styles.icon, color: "#d97706" }}>⏳</div>
            <h1 style={styles.title}>Confirmation en cours</h1>
            <p style={styles.text}>
              Votre paiement est toujours en cours de traitement. Vous recevrez
              une notification dès qu&apos;il sera confirmé.
            </p>
            <Link href="/commandes" style={styles.button}>
              Voir mes commandes
            </Link>
          </>
        )}
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
  icon: { fontSize: 48, fontWeight: "bold", marginBottom: 16 },
  title: { fontSize: 22, fontWeight: 700, marginBottom: 12, color: "#111827" },
  text: { fontSize: 15, color: "#4b5563", marginBottom: 8, lineHeight: 1.5 },
  subtext: { fontSize: 13, color: "#9ca3af", marginBottom: 24 },
  button: {
    display: "inline-block",
    marginTop: 16,
    padding: "12px 24px",
    background: "#16a34a",
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
    borderTopColor: "#16a34a",
    borderRadius: "50%",
    animation: "spin 0.8s linear infinite",
  },
};
