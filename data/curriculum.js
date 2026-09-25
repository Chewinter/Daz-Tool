/* ==========================================================================
   curriculum.js — LERNPFAD: welche Tests/Übungen es gibt und in welcher Reihenfolge.

   Reihenfolge = Freischalt-Reihenfolge (sequenziell). Jede Stufe hat:
     id     — stabile Kennung (NIE ändern; wird bei "Zugriff manuell freischalten" gespeichert)
     name   — Anzeigename
     niveau — "A1" | "A2" | "B1" (bestimmt die Niveau-Auswahl auf der Startseite)
     items  — IDs der Tests/Übungen in dieser Reihenfolge (die IDs kommen aus data/*.js)

   Neues Lernfeld: Inhalte in data/<datei>.js anlegen, Datei im Lader der beiden HTML-Dateien
   eintragen und hier eine neue Stufe ergänzen (am passenden Platz in der Liste).
   ========================================================================== */

const CURRICULUM = [
  // ---- A1: Lernfelder aus der Werkstattarbeit (vor dem Grammatik-Training) ----
  { id: "a1_lf1", name: "A1.1 Grundschrift", niveau: "A1", items: ["a1_lf1_schritt1", "a1_lf1_schritt2", "a1_lf1_memory", "a1_lf1_schritt3", "a1_lf1_schritt4", "a1_lf1_schritt5", "a1_lf1_wortbauen", "a1_lf1_abschlusstest"] },
  { id: "a1_lf2", name: "A1.2 Begrüßung", niveau: "A1", items: ["a1_lf2_schritt1", "a1_lf2_schritt2", "a1_lf2_schritt3", "a1_lf2_zahlenmemory", "a1_lf2_abschlusstest"] },
  { id: "a1_lf3", name: "A1.3 Personen", niveau: "A1", items: ["a1_lf3_schritt1", "a1_lf3_schritt2", "a1_lf3_schritt3", "a1_lf3_schritt4", "a1_lf3_schritt5", "a1_lf3_memory", "a1_lf3_abschlusstest"] },
  { id: "a1_lf4", name: "A1.4 Zahlen und Zeiten", niveau: "A1", items: ["a1_lf4_schritt1", "a1_lf4_schritt2", "a1_lf4_schritt3", "a1_lf4_schritt4", "a1_lf4_schritt5", "a1_lf4_immer3", "a1_lf4_schritt7", "a1_lf4_abschlusstest"] },
  { id: "a1_lf5", name: "A1.5 Schule", niveau: "A1", items: ["a1_lf5_schritt1", "a1_lf5_schritt2", "a1_lf5_memory", "a1_lf5_abschlusstest"] },
  // ---- A1: Grammatik-Training + Einstufung ----
  { id: "a1_grammatik", name: "Grammatik-Training", niveau: "A1", items: ["a1_grammatik_block1", "a1_grammatik_block2", "a1_grammatik_block3", "a1_grammatik_block4", "a1_grammatik_block5", "a1_grammatik_block6", "a1_grammatik_block7", "a1_grammatik_block8", "a1_grammatik_block9"] },
  { id: "a1_check", name: "Einstufungstest A1", niveau: "A1", items: ["eingangstest_a1"] },
  // ---- A2 ----
  { id: "a2_lf1", name: "Lernfeld 1: Freizeit", niveau: "A2", items: ["lf1_schritt1", "lf1_schritt2", "lf1_schritt3_domino", "lf1_schritt4_steigern", "lf1_schritt5_wortarten", "lf1_abschlusstest"] },
  { id: "a2_lf2", name: "Lernfeld 2: Wohnen", niveau: "A2", items: ["lf2_schritt1", "lf2_schritt2", "lf2_schritt3", "lf2_schritt4", "lf2_schritt5", "lf2_schritt6_brettspiel", "lf2_abschlusstest"] },
  { id: "a2_lf3", name: "Lernfeld 3: Körper", niveau: "A2", items: ["lf3_schritt1", "lf3_schritt2", "lf3_schritt3", "lf3_schritt4", "lf3_schritt5", "lf3_schritt6", "lf3_schritt7", "lf3_schritt8_quiz", "lf3_abschlusstest"] },
  { id: "a2_lf4", name: "Lernfeld 4: Essen", niveau: "A2", items: ["lf4_schritt1", "lf4_schritt2", "lf4_schritt3", "lf4_schritt4", "lf4_schritt5_schlange", "lf4_abschlusstest"] },
  { id: "a2_lf5", name: "Lernfeld 5: Einkaufen", niveau: "A2", items: ["lf5_schritt1", "lf5_schritt2", "lf5_schritt3", "lf5_abschlusstest"] },
  // ---- B1 (Fortgeschrittenenkurs) ----
  { id: "b1_lf1", name: "B1.1 Unterwegs", niveau: "B1", items: ["b1_lf1_schritt1", "b1_lf1_puzzle", "b1_lf1_schritt3", "b1_lf1_schritt4", "b1_lf1_schritt5", "b1_lf1_schritt6", "b1_lf1_abschlusstest"] },
  { id: "b1_lf2", name: "B1.2 Die Erde", niveau: "B1", items: ["b1_lf2_schritt1", "b1_lf2_schritt2", "b1_lf2_schritt3", "b1_lf2_schritt4", "b1_lf2_schritt5", "b1_lf2_abschlusstest"] },
];
const NIVEAUS = ["A1", "A2", "B1"]; // B1 aktuell ohne Inhalte, aber schon vorgesehen
