import type { Locale } from "./locales";

type Copy = {
  label: string; available: string; undo: string; undoing: string;
  error: string; retry: string; done: string; dismiss: string;
};
export const undoMessages: Record<Locale, Copy> = {
  en: {
    label: "Undo completion",
    available: "Marked complete. Undo is available briefly and also removes feedback for this completion.",
    undo: "Undo",
    undoing: "Undoing completion…",
    error: "Couldn’t confirm the undo. Retry before leaving or dismissing this message.",
    retry: "Retry undo",
    done: "Completion undone. Its feedback was removed too.",
    dismiss: "Dismiss",
  },
  "sr-Latn": {
    label: "Poništi završavanje",
    available: "Radnja je označena kao završena. Kratko je dostupno poništavanje, koje uklanja i odgovor o korisnosti za ovu radnju.",
    undo: "Poništi",
    undoing: "Poništavanje…",
    error: "Nismo uspeli da potvrdimo poništavanje. Pokušaj ponovo pre nego što odeš ili zatvoriš ovu poruku.",
    retry: "Ponovi poništavanje",
    done: "Završavanje je poništeno. Uklonjen je i odgovor o korisnosti za tu radnju.",
    dismiss: "Zatvori",
  },
};
