"use client";

export default function GlobalError({ error, reset }: { error: Error; reset: () => void }) {
  return (
    <div style={{ padding: 40, color: 'red', background: '#1a1a1a', minHeight: '100vh' }}>
      <h2>Произошла ошибка</h2>
      <pre>{error.message}</pre>
      <button onClick={reset}>Попробовать снова</button>
    </div>
  );
}
