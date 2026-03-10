# Hall Booking v2.9

Ovo je samostalni demo prototip za upravljanje rezervacijama sala.

## Pokretanje

Dovoljno je otvoriti `index.html` u browseru.

## Šta postoji

- jedan kalendar sa više rezervacija po salama u istom danu
- sale: VIP, Restoran, Master sala
- korisnici, admin i super admin
- super admin podešava prava korisnika
- super admin može uključiti/isključiti više događaja istog dana po sali
- korisnici vide jednostavan kalendar i mogu slati predlog ako imaju pravo
- admin može dodavati, menjati, brisati i prevlačiti rezervacije na drugi datum
- poruke o uspešnom unosu i konfliktu termina
- pregled slobodnih vikend termina
- najtraženiji termini

## Čuvanje podataka

Podaci se čuvaju lokalno u browseru (`localStorage`).
