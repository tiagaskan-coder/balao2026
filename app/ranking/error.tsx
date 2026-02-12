'use client';

import { useEffect } from 'react';

export default function Error({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  useEffect(() => {
    console.error(error);
  }, [error]);

  return (
    <div className="flex flex-col items-center justify-center min-h-screen bg-black text-[#E60012]">
      <h2 className="text-2xl font-bold mb-4">Algo deu errado no Ranking!</h2>
      <p className="text-gray-400 mb-8 max-w-md text-center">
        {error.message || "Ocorreu um erro inesperado ao carregar o ranking."}
      </p>
      <button
        onClick={() => reset()}
        className="px-6 py-3 bg-[#E60012] text-white font-bold rounded hover:bg-red-700 transition-colors uppercase tracking-widest"
      >
        Tentar novamente
      </button>
    </div>
  );
}
