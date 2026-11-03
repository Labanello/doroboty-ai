import type { Proof } from "./model";

/**
 * Prototype rule for the "Co zrobiłem sam" card. Deterministic and transparent on purpose:
 * it is not an AI assessment and does not judge whether the statement is true.
 */
export const PROOF_MIN_CONCRETE_LENGTH = 40;

export type ProofField = keyof Proof;
export type ProofRating = "concrete" | "vague" | "missing";

export const proofFields: { key: ProofField; label: string; hint: string }[] = [
  {
    key: "own",
    label: "Twoja część pracy (a co zrobiło AI lub zespół)",
    hint: "Np. które prompty, reguły albo kod są Twoje, a co dało AI, kurs lub zespół.",
  },
  {
    key: "usage",
    label: "Kto z tego korzystał i jak sprawdzono efekt",
    hint: "Np. ile osób korzystało, jak długo i jaki był efekt w liczbach.",
  },
  {
    key: "fix",
    label: "Co nie działało i jak to naprawiono",
    hint: "Np. jaki błąd się pojawił i co zostało zmienione.",
  },
];

export const proofRatingLabels: Record<ProofRating, string> = {
  concrete: "Konkret",
  vague: "Ogólnie",
  missing: "Brak",
};

export function rateProofField(value: string): ProofRating {
  const trimmed = value.trim();
  if (!trimmed) return "missing";
  return trimmed.length >= PROOF_MIN_CONCRETE_LENGTH && /\d/.test(trimmed) ? "concrete" : "vague";
}

export function proofConcreteCount(proof: Proof | undefined) {
  if (!proof) return 0;
  return proofFields.filter(({ key }) => rateProofField(proof[key]) === "concrete").length;
}

const questionTemplates: Record<ProofField, Record<"follow" | "probe", string>> = {
  own: {
    probe: "Która część tego projektu była Twoja, a którą zrobiło AI, kurs albo zespół?",
    follow: "Opowiedz o jednej decyzji w tym projekcie, która należała do Ciebie.",
  },
  usage: {
    probe: "Kto poza Tobą korzystał z tego rozwiązania i skąd wiesz, że działało?",
    follow: "Jak mierzony był efekt, o którym piszesz, i co jeszcze mogło na niego wpłynąć?",
  },
  fix: {
    probe: "Co w tym projekcie poszło nie tak i co wtedy zrobiono?",
    follow: "Jak sprawdzasz dziś, że ta poprawka nadal działa?",
  },
};

const questionOrder: ProofField[] = ["usage", "own", "fix"];

/** Exactly two template questions: vague or missing fields first, then follow-ups to concrete ones. */
export function interviewQuestions(proof: Proof) {
  const ranked = questionOrder.map((key) => ({ key, rating: rateProofField(proof[key]) }));
  const ordered = [
    ...ranked.filter((x) => x.rating !== "concrete"),
    ...ranked.filter((x) => x.rating === "concrete"),
  ];
  return ordered.slice(0, 2).map(({ key, rating }) => ({
    field: key,
    text: questionTemplates[key][rating === "concrete" ? "follow" : "probe"],
    reason:
      rating === "concrete"
        ? `Dopytaj o pole „${proofFields.find((f) => f.key === key)!.label}”.`
        : `Pole „${proofFields.find((f) => f.key === key)!.label}” jest ${rating === "missing" ? "puste" : "ogólne"}.`,
  }));
}
