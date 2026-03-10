import Link from 'next/link';

export default function ForbiddenPage() {
  return (
    <main className="mx-auto flex min-h-screen max-w-2xl items-center px-6 py-10">
      <div className="card w-full p-6">
        <p className="text-xs font-semibold uppercase tracking-[0.2em] text-red-700">403</p>
        <h1 className="mt-2 text-3xl font-bold">Pristup nije dozvoljen</h1>
        <p className="mt-3 text-sm text-slate-600">
          Ova stranica je zaključana za tvoju ulogu. Korisnici vide kalendar, admin vodi rezervacije, a super admin upravlja korisnicima i audit logom.
        </p>
        <div className="mt-5 flex flex-wrap gap-3">
          <Link href="/dashboard" className="rounded-xl bg-blue-700 px-5 py-3 font-medium text-white">Idi na kalendar</Link>
          <Link href="/login" className="rounded-xl bg-slate-100 px-5 py-3 font-medium text-slate-800">Prijava</Link>
        </div>
      </div>
    </main>
  );
}
