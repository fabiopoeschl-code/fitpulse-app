# FitPulse – Dein 3-Säulen Sport & Gesundheits-Begleiter (Web & Android)

Komplettpaket für **Krafttraining (mit & ohne Geräte)**, **isometrische Übungen**, **Dehnung**, **Ausdauer-Tracking (Laufen & Radfahren)** und **interaktive Line-Chart-Statistiken**.

## Die 3 Säulen im Überblick

1. **Säule 1: Animierte Übungsbibliothek & Adaptive Trainingspläne**
   - Flüssige SVG-Bewegungs- und Haltungsanimationen mit hervorgehobenen Zielmuskeln und 4s-Ein/4s-Aus-Atem-Pacer (besonders wichtig gegen Pressatmung bei Blutdruck-Übungen).
   - Fokus auf **isometrische Übungen** (Wandsitz / Wall Sit, Plank, Side Plank, Glute Bridge Hold, Hollow Body Hold, Dead Hang), **Kraft mit Geräten**, **Kraft ohne Geräte** sowie **Dehnübungen & Mobility**.
   - **Trainingsplan-Generator & Editor** für 4 Ziele (*Blutdruck senken*, *Muskelaufbau*, *Fit im Alter*, *Ausdauer*) und 3 Level (*Anfänger*, *Fortgeschritten*, *Profi*).
   - **Automatische Fortschritts-Anpassung**: Erreichst du im Tracker dein Ziel, hebt der Plan das Zielgewicht (`+2,5 kg`) bzw. die Haltedauer (`+10 Sek.`) automatisch für die nächste Einheit an.

2. **Säule 2: Smart-Tracker mit Auto-Prefill, Countdown & Sonntags-Wiegen**
   - **Auto-Prefill vom letzten Mal**: Beim Auswählen einer Übung werden Gewicht (`kg`), Sätze und Dauer (`Sekunden`)/Wiederholungen vom letzten Training automatisch voreingestellt.
   - **Integrierter Countdown-Timer**: Mit 3-Sekunden-Vorbereitungsphase, Satzpausen-Timer, Fortschrittsring und akustischem Signal.
   - **Ausdauer-Tracker**: Logge Laufen & Radfahren (`km`, `Zeit`, `Höhenmeter`) inkl. automatischer Pace- (`min/km`) und Geschwindigkeitsberechnung (`km/h`).
   - **Sonntags-Gewichts-Erinnerung**: Wöchentlicher Check-in für Körpergewicht (`kg`) und optional Ruhe-Blutdruck (`mmHg`).

3. **Säule 3: Interaktives Statistik-Dashboard (Line-Charts)**
   - **Frei wählbare X-Achse (Zeitraum)**: *7 Tage*, *30 Tage*, *3 Monate*, *1 Jahr*, *Gesamt* oder *Eigener Datumsbereich (Von – Bis)*.
   - **Frei wählbare Disziplin & Übung**:
     - *Ausdauer*: Laufen oder Radfahren (Distanz, Pace/Speed, Dauer, Höhenmeter)
     - *Kraft & Isometrie*: Jede einzelne Übung (Haltedauer in Sekunden, Max. Gewicht in kg, Gesamtvolumen)
     - *Gesundheit*: Körpergewicht & Ruhe-Blutdruck

---

## Schnellstart (Lokal, Vercel, Supabase & Android)

### 1. Lokal starten
```bash
npm install
npm run dev
```
Öffne anschließend `http://localhost:3000`.

### 2. Supabase Datenbank & Google/Gmail-Login verbinden
1. Führe das SQL-Schema aus [`supabase/migrations/20261103000000_fitpulse_schema.sql`](./supabase/migrations/20261103000000_fitpulse_schema.sql) im SQL-Editor deines Supabase-Projekts aus (inkl. Row Level Security & Performance-Indizes).
2. Aktiviere in Supabase unter **Authentication → Providers → Google** den Google OAuth Provider.
3. Lege eine `.env.local` (bzw. Environment Variables in Vercel) an:
   ```env
   NEXT_PUBLIC_SUPABASE_URL=https://dein-projekt.supabase.co
   NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY=dein-publishable-oder-anon-key
   ```

### 3. Als Android-App nutzen
- **Option A (Direkt über Chrome auf Android als PWA installieren)**: Öffne deine Vercel-URL auf dem Android-Smartphone und tippe auf **„Zum Startbildschirm hinzufügen / App installieren“**.
- **Option B (Native Android APK über Capacitor bauen)**:
  ```bash
  npx cap add android
  npm run build
  npx cap sync android
  npx cap open android
  ```
