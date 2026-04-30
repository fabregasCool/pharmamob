"use client";

import { Suspense, useEffect, useState } from "react";
import { useSearchParams } from "next/navigation";

function SuccessContent() {
  const [receiptUrl, setReceiptUrl] = useState<string | null>(null);
  const searchParams = useSearchParams();
  const token = searchParams.get("token");

  useEffect(() => {
    if (!token) return;

    fetch(`/api/clientbackend/paiement/paydunya/check?token=${token}`)
      .then((res) => res.json())
      .then((data) => {
        console.log("CHECK:", data);

        if (data.receiptUrl) {
          setReceiptUrl(data.receiptUrl);
        }
      })
      .catch((err) => console.error("Erreur check:", err));
  }, [token]);

  return (
    <div>
      <h2>✅ Paiement réussi</h2>
      <p>Votre paiement a été effectué avec succès.</p>

      {receiptUrl && (
        <a
          href={receiptUrl}
          target="_blank"
          rel="noopener noreferrer"
          style={{ color: "blue", textDecoration: "underline" }}
        >
          📄 Télécharger le reçu
        </a>
      )}
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
