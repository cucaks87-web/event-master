'use client';

import { useEffect } from 'react';
import Link from 'next/link';
import { usePathname, useRouter } from 'next/navigation';
import { useAppStore } from '@/lib/store';
import { Role } from '@/lib/types';

export function RouteGuard({ allow, children }: { allow: Role[]; children: React.ReactNode }) {
  const router = useRouter();
  const pathname = usePathname();
  const { ready, currentUser } = useAppStore();

  const permitted = !!currentUser && allow.includes(currentUser.role);

  useEffect(() => {
    if (!ready) return;
    if (!permitted) {
      router.replace(`/forbidden?from=${encodeURIComponent(pathname || '/')}`);
    }
  }, [ready, permitted, pathname, router]);

  if (!ready) return <main className="p-6">Učitavanje...</main>;
  if (!permitted) {
    return (
      <main className="mx-auto flex min-h-screen max-w-2xl items-center px-6 py-10">
        <div className="card w-full p-6">
          <p className="text-xs font-semibold uppercase tracking-[0.2em] text-red-700">Zabranjen pristup</p>
          <h1 className="mt-2 text-2xl font-bold">Nemaš pravo pristupa ovoj stranici.</h1>
          <p className="mt-3 text-sm text-slate-600">Bićeš preusmeren na odgovarajuću stranicu. Ako se to ne desi, vrati se na kalendar.</p>
          <div className="mt-5 flex gap-3">
            <Link href="/dashboard" className="rounded-xl bg-blue-700 px-5 py-3 font-medium text-white">Nazad na kalendar</Link>
            <Link href="/login" className="rounded-xl bg-slate-100 px-5 py-3 font-medium text-slate-800">Promeni korisnika</Link>
          </div>
        </div>
      </main>
    );
  }

  return <>{children}</>;
}
