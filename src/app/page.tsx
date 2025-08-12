// Эта страница больше не используется для залогиненных пользователей.
// Middleware перенаправляет их на соответствующие страницы ролей.
// Неавторизованные пользователи будут перенаправлены на /login.

export default function Home() {
  return (
    <div className="flex flex-col items-center justify-center min-h-screen">
      <p className="text-gray-400">Загрузка...</p>
    </div>
  );
}
