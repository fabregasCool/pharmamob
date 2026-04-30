"use client";

import { Suspense, useEffect, useState } from "react";
import { useSearchParams } from "next/navigation";

function SuccessContent() {
  const searchParams = useSearchParams();
  const token = searchParams.get("token");

  const [status, setStatus] = useState("loading");

  useEffect(() => {
    if (!token) return;

    const checkPaiement = async () => {
      try {
        const res = await fetch(
          `/api/clientbackend/paiement/paydunya/check?token=${token}`,
        );
        const data = await res.json();

        console.log("CHECK:", data);

        if (data.statut === "SUCCES") {
          setStatus("success");
        } else if (data.statut === "EN_COURS") {
          setStatus("pending");
        } else {
          setStatus("error");
        }
      } catch (err) {
        console.error(err);
        setStatus("error");
      }
    };

    checkPaiement();

    // 🔁 option : recheck toutes les 3 secondes
    const interval = setInterval(checkPaiement, 3000);

    return () => clearInterval(interval);
  }, [token]);

  // 🎨 affichage dynamique
  if (status === "loading") {
    return <div>⏳ Vérification du paiement...</div>;
  }

  if (status === "pending") {
    return <div>⏳ Paiement en cours de validation...</div>;
  }

  if (status === "success") {
    return <div>✅ Paiement validé avec succès !</div>;
  }

  return <div>❌ Une erreur est survenue</div>;
}

export default function Page() {
  return (
    <Suspense fallback={<div>Chargement...</div>}>
      <SuccessContent />
    </Suspense>
  );
}
