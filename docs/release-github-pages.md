# Publikacja prototypu na GitHub Pages

Instrukcja dla fikcyjnego case'u AIPH 3: prototyp DoRoboty.ai z kartą „Co zrobiłem sam”.

**Kontekst:**

- **Właściciel:** Paweł Laban.
- **Odbiorcy:** uczestnicy kursu i testerzy.
- **Dane:** tylko fikcyjne. Wszystko zostaje w przeglądarce osoby testującej, na serwerze nie ma żadnych danych.

**Adres po publikacji:** `https://labanello.github.io/doroboty-ai/`. Repozytorium: `github.com/Labanello/doroboty-ai`.

Aplikacja to statyczne pliki z `dist/`:

- nie ma serwera, bazy, kont ani kluczy do ustawienia;
- linki działają dzięki `#` w adresie, a `vite.config.ts` ma `base: "./"`, więc działa też pod podścieżką `/doroboty-ai/`.

## Przed publikacją

1. **Wersja:** publikujemy tylko zatwierdzony commit. Nadaj mu tag, np. `git tag v0.2.0-proof-card` i `git push origin v0.2.0-proof-card`.
2. **Czysta instalacja:** `npm ci` (Node 24 z `.nvmrc`, wersje paczek z `package-lock.json`).
3. **Kontrole:** `npm run check` albo `./scripts/verify`. Muszą przejść formatowanie, design system, lint, typy, testy, pakiet uczestnika, build i testy przeglądarkowe.
4. **Raport gotowości:** `docs/production-readiness.html` dla tej wersji pokazuje „Gotowe do wdrożenia”.

## Publikacja

Strona jest budowana i publikowana przez GitHub Actions (workflow `.github/workflows/pages.yml`). Ustawienie **Settings → Pages → Build and deployment → Source: GitHub Actions** jest włączone od 2026-11-12.

**Pierwsze wdrożenie:** 2026-11-12, commit `761a4ff` na `main`. Workflow zielony, adres odpowiada przez HTTPS.

Jak publikować kolejne wersje:

1. Zatwierdzoną zmianę scal do `main` i wypchnij: `git push origin main`.
2. Workflow sam robi `npm ci` i `npm run build`, a potem publikuje `dist/` akcjami `actions/upload-pages-artifact` i `actions/deploy-pages`. Publikacja z innej gałęzi niż `main` jest zablokowana przez ustawienia środowiska `github-pages`.
3. Poczekaj na zielony przebieg „Publish to GitHub Pages” w zakładce **Actions** (zwykle 1–3 minuty). Wdrożenie trwające dłużej niż 10 minut GitHub przerywa.
4. Wykonaj „Kontrolę po publikacji”.

Ręczne uruchomienie bez nowego commita: **Actions → Publish to GitHub Pages → Run workflow** (na gałęzi `main`).

**Limity GitHub Pages** (dokumentacja GitHuba, sprawdzone 2026-11-11):

- strona do 1 GB (nasz `dist/` ma ok. 16 MB);
- miękki limit ok. 100 GB transferu na miesiąc.

## Kontrola po publikacji (ok. 5 minut)

Sprawdź w oknie prywatnym przeglądarki, na komputerze i na telefonie:

1. **Strona główna:** `https://labanello.github.io/doroboty-ai/` otwiera się przez **https** i pokazuje oferty.
2. **Ścieżka kandydata:**
   - „Wybierz osobę” → **Anna Kowalska** → oferta **AI Product Manager** → „Aplikuj”;
   - wypełnij odpowiedź i kartę „Co zrobiłem sam”, zaznacz zgodę, wyślij;
   - widzisz „Aplikacja została wysłana”.
3. **Ścieżka rekrutera:**
   - „Zmień osobę” → **Karolina Wiśniewska** → „Kandydaci”;
   - przy Annie jest „Karta: …/3 konkretnie”;
   - po otwarciu Anny pierwsza zakładka to „Karta” z dwoma pytaniami;
   - „W przeglądzie” → „Zaproszenie na rozmowę” zmienia etap.
4. **Odświeżenie strony (F5):** dane zostają.
5. **Narzędzia deweloperskie (F12) → Konsola:** brak czerwonych błędów. W zakładce Sieć brak odpowiedzi 404.

**Warunek wycofania:** jeśli punkt 1, 2 albo 3 nie działa, wróć do poprzedniej wersji (niżej) i dopiero potem szukaj przyczyny.

## Powrót do poprzedniej wersji

1. W zakładce **Actions** uruchom ponownie workflow publikacji dla poprzedniego tagu albo commita, który działał. Inna droga: przywróć zmianę na gałęzi publikacji (`git revert`) i wypchnij.
2. Po zakończeniu wykonaj znowu „Kontrolę po publikacji”.

**Dane:** na serwerze nie ma żadnych danych do cofania. Każdy tester ma swoje dane w swojej przeglądarce:

- starsza wersja wczyta zapis bez pola karty;
- jeśli coś się nie wczyta, tester może zrobić „Resetuj scenariusz” w Ustawieniach (przedtem może użyć „Eksportuj dane”).

## Skąd dowiemy się o błędzie

- **Zgłoszenia od testerów:**
  - **GitHub Issues** w forku, z gotowym szablonem zgłoszenia błędu (`.github/ISSUE_TEMPLATE/bug.yml`);
  - albo komentarz pod postem w **AI Prototype Arena na Circle**.

  W zgłoszeniu: co robiłeś, czego oczekiwałeś, co się stało, przeglądarka i telefon albo komputer. **Bez prawdziwych danych osobowych.**

- **Komunikaty w aplikacji:** aplikacja sama pokazuje błąd zapisu w przeglądarce, z instrukcją pobrania danych.
- **Przy diagnozie właściciel sprawdza:**
  - przebieg w zakładce **Actions** (czy wdrożenie się udało);
  - konsolę przeglądarki na komputerze i telefonie.
- **Świadoma decyzja dla prototypu kursowego:** aplikacja nie wysyła błędów do żadnej usługi, więc problem widzimy dopiero po zgłoszeniu.

## Gdy coś nie działa

- **Właściciel:** Paweł Laban, kontakt przez GitHub Issues w forku i Circle. Ma uprawnienia do repozytorium i ustawień Pages.

**Kroki:**

1. Odtwórz problem w oknie prywatnym na adresie strony.
2. Sprawdź **Actions** i **Settings → Pages**, czy ostatnie wdrożenie się udało.
3. Jeśli główna ścieżka nie działa, cofnij wersję (sekcja wyżej) i wykonaj kontrolę po publikacji.
4. Napisz testerom pod postem w Circle, czy działa i od kiedy, oraz czy powinni zresetować scenariusz.
5. Popraw błąd na osobnej gałęzi, uruchom `npm run check`, zaktualizuj raport gotowości i opublikuj nowy tag.
