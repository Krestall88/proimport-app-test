import Link from 'next/link';

export default function NotFound() {
  return (
    <html>
      <body style={{ padding: 40, color: 'gray', background: '#1a1a1a' }}>
        <h2>Страница не найдена (404)</h2>
        <p>Проверьте адрес или вернитесь на <Link href="/">главную</Link>.</p>
      </body>
    </html>
  );
}
