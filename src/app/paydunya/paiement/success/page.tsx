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
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-green-50 to-emerald-100 px-4">
      <div className="w-full max-w-md bg-white rounded-3xl shadow-2xl p-8 text-center border border-green-100">
        {/* Icône */}
        <div className="flex justify-center mb-6">
          <div className="w-20 h-20 rounded-full bg-green-100 flex items-center justify-center shadow-inner">
            <span className="text-4xl">✅</span>
          </div>
        </div>

        {/* Titre */}
        <h2 className="text-3xl font-bold text-gray-800 mb-3">
          Paiement réussi
        </h2>

        {/* Description */}
        <p className="text-gray-600 text-base leading-relaxed mb-8">
          Votre paiement a été effectué avec succès. Merci pour votre confiance.
        </p>

        {/* Bouton reçu */}
        {receiptUrl ? (
          <a
            href={receiptUrl}
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center justify-center gap-2 bg-green-600 hover:bg-green-700 transition-all duration-300 text-white font-semibold px-6 py-3 rounded-2xl shadow-lg hover:scale-105"
          >
            📄 Télécharger le reçu
          </a>
        ) : (
          <div className="flex items-center justify-center gap-3 text-gray-500">
            <div className="w-5 h-5 border-2 border-green-500 border-t-transparent rounded-full animate-spin"></div>
            <p>Génération du reçu...</p>
          </div>
        )}

        {/* Petit texte */}
        <p className="mt-8 text-sm text-gray-400">
          Vous pouvez fermer cette page en toute sécurité.
        </p>
      </div>
    </div>
  );
}
