"use client";

import { Suspense, useEffect } from "react";
import { useSearchParams } from "next/navigation";

function SuccessContent() {
  const searchParams = useSearchParams();
  const token = searchParams.get("token");

  useEffect(() => {
    if (!token) return;

    fetch(`/api/clientbackend/paiement/paydunya/check?token=${token}`)
      .then((res) => res.json())
      .then((data) => {
        console.log("CHECK:", data);

        // 🔥 option : ouvrir le reçu automatiquement
        if (data.receiptUrl) {
          console.log("📄 Reçu dispo:", data.receiptUrl);
        }
      })
      .catch((err) => console.error("Erreur check:", err));
  }, [token]);

  return (
    <div>
      <h2>✅ Paiement réussi</h2>
      <p>Votre paiement a été effectué avec succès.</p>
    </div>
  );
}

export default function Page() {
  return (
    <Suspense fallback={<div>Chargement...</div>}>
      <SuccessContent />
    </Suspense>
  );
}
