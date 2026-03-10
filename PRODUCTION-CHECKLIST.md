# Produkcijska checklist

## Kritično
- [ ] Supabase schema pokrenuta bez grešaka
- [ ] RLS uključen na svim tabelama
- [ ] auth korisnici kreirani
- [ ] profiles povezani sa auth korisnicima
- [ ] hall podaci provereni
- [ ] allow_multiple_events_per_day default = false
- [ ] Vercel env varijable podešene
- [ ] custom domen podešen
- [ ] HTTPS aktivan

## Poslovna pravila
- [ ] po defaultu jedan događaj po sali po danu
- [ ] Saša može uključiti više događaja po sali u istom danu
- [ ] obični korisnik ne vidi depozit ni cenu
- [ ] korisnik dobija poruke o uspešnom i neuspešnom unosu
- [ ] audit log radi za insert/update/delete

## Test scenariji
- [ ] korisnik doda predlog
- [ ] admin potvrdi rezervaciju
- [ ] admin unese depozit
- [ ] super admin isključi pravo korisniku za unos
- [ ] super admin uključi pregled finansija jednom korisniku
- [ ] pokušaj konflikta termina bude blokiran
