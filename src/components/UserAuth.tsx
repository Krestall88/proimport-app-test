'use client';

'use client';

import { createClient } from '@/lib/supabase/client';
import Link from 'next/link';
import { useEffect, useState } from 'react';
import { User } from '@supabase/supabase-js';
import { useRouter } from 'next/navigation';

export default function UserAuth() {
  const router = useRouter();
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchUser = async () => {
      const supabase = createClient();
      const { data: { user } } = await supabase.auth.getUser();
      setUser(user);
      setLoading(false);
    };

    fetchUser();
  }, []);

  if (loading) {
    return <div className="h-6"></div>; // Заглушка для загрузки
  }

  const handleSignOut = async () => {
    await fetch('/auth/sign-out', { method: 'POST' });
    router.refresh();
  };

  if (user) {
    return (
      <div className="flex items-center gap-4 text-sm">
        <span className="hidden sm:block text-gray-300">{user.email}</span>
        <button 
          onClick={handleSignOut}
          className="bg-gray-700 hover:bg-gray-600 text-white py-1.5 px-3 rounded-lg text-sm"
        >
          Выйти
        </button>
      </div>
    );
  }

  return (
    <Link href="/login" className="bg-purple-600 hover:bg-purple-700 text-white py-1.5 px-3 rounded-lg text-sm">Войти</Link>
  );
}
