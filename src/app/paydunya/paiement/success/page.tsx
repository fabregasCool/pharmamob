"use client";

import { Suspense, useEffect, useState } from "react";
import { useSearchParams } from "next/navigation";

function SuccessContent() {
  const searchParams = useSearchParams();
  const token = searchParams.get("token");

  const [receiptUrl, setReceiptUrl] = useState<string | null>(null);

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
      .catch((err) => console.error(err));
  }, [token]);

  return (
    <div>
      <h2>✅ Paiement réussi</h2>
      <p>Votre paiement a été effectué avec succès.</p>

      {receiptUrl ? (
        <a href={receiptUrl} target="_blank" rel="noopener noreferrer">
          📄 Télécharger le reçu
        </a>
      ) : (
        <p>⏳ Génération du reçu...</p>
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
