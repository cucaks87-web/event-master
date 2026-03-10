# Hall Booking — go-live koraci (Supabase + Vercel)

## 1. Supabase projekat
1. Napravi novi Supabase projekat.
2. U `Authentication > Providers` ostavi Email uključen.
3. U `SQL Editor` pokreni `supabase/schema.sql`.
4. U `Table Editor` proveri da postoje sale: VIP, Restoran, Master sala.

## 2. Korisnički nalozi
1. U `Authentication > Users` napravi naloge za:
   - Safet
   - Goran
   - Šišić
   - Dušan
   - Tamara
   - Dejan
   - Saša
2. Kopiraj njihove `user id` vrednosti.
3. U `supabase/seed-users-template.sql` zameni placeholder UUID vrednosti pravim `auth.users.id` vrednostima.
4. Pokreni izmenjeni seed SQL.

## 3. Podešavanje aplikacije
1. U root folderu kopiraj `.env.example` u `.env.local`.
2. Popuni:
   - `NEXT_PUBLIC_SUPABASE_URL`
   - `NEXT_PUBLIC_SUPABASE_ANON_KEY`
3. Po potrebi zameni demo login stvarnim login ekranom pre produkcije.

## 4. Vercel deploy
1. Napravi novi Vercel projekat.
2. Importuj ovaj folder ili Git repozitorijum.
3. Dodaj env varijable iz `.env.local` u Vercel Project Settings.
4. Deploy.

## 5. Obavezna produkcijska provera
- običan korisnik vidi samo kalendar
- korisnik ne vidi finansije osim ako mu Saša to ne uključi
- korisnik ne može da briše rezervacije
- Dejan može da menja statuse, depozit i plaćanja
- Saša može da menja prava i vidi audit log
- konflikt termina vraća poruku: `Rezervacija već postoji za izabranu salu i termin`
- uspešan unos vraća poruku: `Uspešno ste uneli predlog rezervacije`

## 6. Šta još nedostaje pre pune produkcije
Ovaj paket je deployment starter, ali za potpunu produkciju i dalje preporučujem:
- zamenu demo izbora korisnika stvarnim Supabase Auth ekranom
- prebacivanje `localStorage` podataka na pravi Supabase CRUD tok
- server-side validacije kroz API layer ili server actions
- backup plan i domen
