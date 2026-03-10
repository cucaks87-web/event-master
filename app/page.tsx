import Link from 'next/link';

export default function HomePage() {
  return (
    <main className="mx-auto flex min-h-screen max-w-6xl flex-col justify-center gap-8 px-6 py-10">
      <div className="max-w-3xl">
        <p className="mb-3 text-sm font-semibold uppercase tracking-[0.2em] text-blue-700">Hall Booking v2.6</p>
        <h1 className="text-4xl font-bold tracking-tight text-slate-900">Sistem za rezervacije sala sa zaključanim rutama, ulogama i Supabase prijavom</h1>
        <p className="mt-4 text-lg text-slate-600">
          Projekat radi odmah u demo modu preko localStorage, a u v2.4 dodat je i role-based pristup: korisnik vidi kalendar, admin uređuje rezervacije, a super admin upravlja korisnicima, pravilima i audit logom.
        </p>
      </div>

      <div className="grid gap-4 md:grid-cols-3">
        <div className="card p-5">
          <h2 className="text-lg font-semibold">Jednostavan pregled</h2>
          <p className="mt-2 text-sm text-slate-600">Kalendar kao glavni ekran za Safeta, Gorana, Šišića, Dušana i Tamaru.</p>
        </div>
        <div className="card p-5">
          <h2 className="text-lg font-semibold">Admin rad</h2>
          <p className="mt-2 text-sm text-slate-600">Dejan može da dodaje događaje, menja statuse, depozit, uplate i napomene.</p>
        </div>
        <div className="card p-5">
          <h2 className="text-lg font-semibold">Super admin kontrola</h2>
          <p className="mt-2 text-sm text-slate-600">Saša dobija audit log, upravljanje korisnicima i podešavanje prava.</p>
        </div>
      </div>

      <div className="flex flex-wrap gap-3">
        <Link href="/login" className="rounded-xl bg-blue-700 px-5 py-3 font-medium text-white">Otvori aplikaciju</Link>
        <Link href="/dashboard" className="rounded-xl bg-white px-5 py-3 font-medium text-slate-800 ring-1 ring-slate-300">Direktno na dashboard</Link>
      </div>
    </main>
  );
}
