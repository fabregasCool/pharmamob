"use client";

import { useEffect } from "react";
import { useSearchParams } from "next/navigation";

export default function SuccessPage() {
  const searchParams = useSearchParams();
  const token = searchParams.get("token");

  useEffect(() => {
    if (!token) return;

    const verifyPayment = async () => {
      try {
        const res = await fetch(
          `/api/clientbackend/paiement/paydunya/check?token=${token}`,
        );

        const data = await res.json();
        console.log("VERIFY RESULT:", data);
      } catch (err) {
        console.error("Erreur vérification paiement", err);
      }
    };

    verifyPayment();
  }, [token]);

  return (
    <div>
      <h1>Paiement réussi ✅</h1>
      <p>Votre commande est en cours de traitement.</p>
    </div>
  );
}
