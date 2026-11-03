import { describe, expect, it } from "vitest";
import { initialState, stateSchema, transition } from "./model";
import { interviewQuestions, proofConcreteCount, rateProofField } from "./proof";

const concrete = {
  own: "Sama napisałam 12 promptów i reguły sortowania; integrację zrobił informatyk.",
  usage: "14 osób z obsługi klienta przez 3 miesiące; czas odpowiedzi spadł z 6 h do 2 h.",
  fix: "Automat mylił 1 na 10 reklamacji; dodałam przekazanie niepewnych maili człowiekowi.",
};

describe("proof card rule", () => {
  it("rates a field by length and a number, not by meaning", () => {
    expect(rateProofField("")).toBe("missing");
    expect(rateProofField("   ")).toBe("missing");
    expect(rateProofField("Rozwiązanie było używane w firmie i bardzo pomogło.")).toBe("vague");
    expect(rateProofField("12 osób")).toBe("vague");
    expect(rateProofField(concrete.usage)).toBe("concrete");
  });

  it("counts concrete fields", () => {
    expect(proofConcreteCount(undefined)).toBe(0);
    expect(proofConcreteCount(concrete)).toBe(3);
    expect(proofConcreteCount({ ...concrete, fix: "" })).toBe(2);
  });

  it("returns exactly two questions, probing vague fields first", () => {
    const vague = interviewQuestions({ own: concrete.own, usage: "Używali go wszyscy.", fix: "" });
    expect(vague).toHaveLength(2);
    expect(vague.map((q) => q.field)).toEqual(["usage", "fix"]);
    expect(vague[1].reason).toContain("puste");
    const full = interviewQuestions(concrete);
    expect(full.map((q) => q.field)).toEqual(["usage", "own"]);
    expect(full[0].reason).toContain("Dopytaj");
  });
});

describe("proof card in applications", () => {
  const asAnna = () => transition(initialState(), { type: "select_person", id: "candidate-anna" });
  const job = () => initialState().jobs[0];
  const base = {
    notes: "",
    generated: "",
    answer: "Prowadziłam wdrożenie asystenta.",
    consent: true,
  };

  it("stores a submitted card with the application", () => {
    const s = transition(asAnna(), { type: "submit", jobId: job().id, ...base, proof: concrete });
    const application = s.applications.find((a) => a.candidateId === "candidate-anna")!;
    expect(application.proof).toEqual(concrete);
  });

  it("keeps submission without a card working", () => {
    const empty = { own: " ", usage: "", fix: "" };
    const s = transition(asAnna(), { type: "submit", jobId: job().id, ...base, proof: empty });
    expect(s.applications.find((a) => a.candidateId === "candidate-anna")!.proof).toBeUndefined();
    const t = transition(asAnna(), { type: "submit", jobId: job().id, ...base });
    expect(t.applications.find((a) => a.candidateId === "candidate-anna")!.proof).toBeUndefined();
  });

  it("saves the card in a draft and loads old saves without a card", () => {
    const s = transition(asAnna(), {
      type: "draft",
      jobId: job().id,
      notes: "",
      generated: "",
      answer: "",
      proof: concrete,
    });
    expect(s.drafts[0].proof).toEqual(concrete);
    const old = structuredClone(initialState());
    delete old.applications[0].proof;
    expect(stateSchema.parse(old).applications[0].proof).toBeUndefined();
  });

  it("gives the example application a vague card", () => {
    expect(proofConcreteCount(initialState().applications[0].proof)).toBe(0);
  });
});
