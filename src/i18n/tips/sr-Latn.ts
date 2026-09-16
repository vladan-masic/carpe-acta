import type { TipId, TipTranslation } from "../../types/tip";

export const srLatnTips = {
  "two-minute-start": {
    title: "Početak od dva minuta",
    text: "Smanji težinu početka sve dok prvi korak ne postane gotovo previše mali da bi mu se odupreo.",
    action: "Radi na svom najvažnijem zadatku tačno dva minuta.",
  },
  "phone-distance": {
    title: "Skloni telefon",
    text: "Dodatni napor pobeđuje snagu volje. Učini da do ometanja bude fizički teže doći.",
    action: "Ostavi telefon u drugoj prostoriji pre nego što započneš sledeći zadatak.",
  },
  "next-visible-step": {
    title: "Imenuj sledeći vidljivi korak",
    text: "Nejasni zadaci stvaraju otpor. Konkretne sledeće akcije daju mozgu jasan cilj.",
    action: "Napiši jednu rečenicu koja počinje sa: Sledeći vidljivi korak je...",
  },
  "messy-first-pass": {
    title: "Neuredna prva verzija",
    text: "Perfekcionizam često prikriva odlaganje. Dozvoli sebi da prva verzija bude loša.",
    action: "Deset minuta pravi grubu verziju bez ikakvog uređivanja.",
  },
  "single-tab-sprint": {
    title: "Sprint sa jednom karticom",
    text: "Prebacivanje između zadataka troši zamah. Jedan zadatak i jedna kartica dovoljni su za kratak sprint.",
    action: "Zatvori nepovezane kartice i petnaest minuta programiraj jedno malo poboljšanje.",
  },
  "study-recall": {
    title: "Priseti se pre ponavljanja",
    text: "Aktivno prisećanje pretvara pasivno čitanje u korisno vežbanje pamćenja.",
    action: "Pre ponovnog čitanja zapiši sve čega se sećaš o toj temi.",
  },
  "reset-desk": {
    title: "Raščisti radnu površinu",
    text: "Uredniji radni prostor smanjuje broj odluka koje se bore za tvoju pažnju.",
    action: "Raščisti sto tako da samo trenutni zadatak ostane vidljiv.",
  },
  "commitment-line": {
    title: "Rečenica obaveze",
    text: "Malo zapisano obećanje može učiniti akciju stvarnijom od namere koja ti je samo u glavi.",
    action: "Napiši: Radiću na ovome do sledeće prirodne tačke za zaustavljanje.",
  },
} satisfies Record<TipId, TipTranslation>;
