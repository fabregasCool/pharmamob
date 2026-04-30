"use client";

import { Suspense, useEffect } from "react";
import { useSearchParams } from "next/navigation";

function SuccessContent() {
  const searchParams = useSearchParams();
  const token = searchParams.get("token");

  useEffect(() => {
    if (token) {
      fetch(`/api/clientbackend/paiement/paydunya/check?token=${token}`)
        .then((res) => res.json())
        .then((data) => console.log("CHECK:", data));
    }
  }, [token]);

  return <div>Paiement réussie</div>;
}

export default function Page() {
  return (
    <Suspense fallback={<div>Chargement...</div>}>
      <SuccessContent />
    </Suspense>
  );
}
