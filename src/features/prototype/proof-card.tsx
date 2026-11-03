import { Check, CircleAlert, Minus } from "lucide-react";
import type { Proof } from "./model";
import {
  interviewQuestions,
  proofConcreteCount,
  proofFields,
  proofRatingLabels,
  rateProofField,
  type ProofRating,
} from "./proof";

const ratingIcons = { concrete: Check, vague: CircleAlert, missing: Minus } as const;

export function ProofTag({ rating }: { rating: ProofRating }) {
  const Icon = ratingIcons[rating];
  return (
    <span className="proof-tag" data-proof-rating={rating}>
      <Icon aria-hidden="true" />
      {proofRatingLabels[rating]}
    </span>
  );
}

/** List summary: how many of the three card fields are concrete, or that the card is missing. */
export function ProofSummary({ proof }: { proof: Proof | undefined }) {
  const count = proofConcreteCount(proof);
  const rating: ProofRating = !proof ? "missing" : count === 3 ? "concrete" : "vague";
  return (
    <span className="proof-tag" data-proof-rating={rating}>
      {proof ? `Karta: ${count}/3 konkretnie` : "Brak karty"}
    </span>
  );
}

/** "Co zrobiłem sam" reading panel. Employers also get two template interview questions. */
export function ProofCard({
  proof,
  audience,
}: {
  proof: Proof | undefined;
  audience: "candidate" | "employer";
}) {
  if (!proof)
    return (
      <>
        <h3>Co zrobił(a) sam(a)</h3>
        <p>
          {audience === "employer"
            ? "Kandydat nie wypełnił karty. Zapytaj na rozmowie o jeden projekt z AI."
            : "Nie dodano karty „Co zrobiłem sam” do tej aplikacji."}
        </p>
      </>
    );
  return (
    <>
      <h3>Co zrobił(a) sam(a)</h3>
      <dl className="proof-fields">
        {proofFields.map((field) => {
          const rating = rateProofField(proof[field.key]);
          return (
            <div className="proof-field" key={field.key} data-proof-rating={rating}>
              <dt>
                <span>{field.label}</span>
                <ProofTag rating={rating} />
              </dt>
              <dd>{proof[field.key].trim() || "Pole puste."}</dd>
            </div>
          );
        })}
      </dl>
      {audience === "employer" && (
        <section className="proof-questions" aria-labelledby="proof-questions-heading">
          <h3 id="proof-questions-heading">Zapytaj na pierwszej rozmowie</h3>
          <ol>
            {interviewQuestions(proof).map((question) => (
              <li key={question.field}>
                <p>{question.text}</p>
                <p className="record-caption">{question.reason}</p>
              </li>
            ))}
          </ol>
        </section>
      )}
      <p className="record-caption proof-disclaimer">
        Prototyp: „Konkret” oznacza tylko, że pole ma co najmniej 40 znaków i zawiera liczbę. To
        prosta reguła, nie ocena AI i nie sprawdzenie prawdziwości. Pytania pochodzą z gotowych
        szablonów.
      </p>
    </>
  );
}
