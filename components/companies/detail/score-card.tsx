import Avatar from "@/components/_ui/avatar";
import type { ScoreCard as ScoreCardData } from "@/data/companies";
import ClockIcon from "@/public/assets/images/companies/detail/clock.svg";
import StarFilledIcon from "@/public/assets/images/companies/detail/star-filled.svg";
import StarEmptyIcon from "@/public/assets/images/companies/detail/star-empty.svg";

type ScoreCardProps = {
  card: ScoreCardData;
};

export default function ScoreCard({ card }: ScoreCardProps) {
  return (
    <article className="bg-card shadow-card duration-fast ease-power3-out hover:bg-raised flex flex-col gap-4 rounded-lg p-4 transition-colors">
      <div className="flex flex-col gap-2">
        <h3>{card.title}</h3>
        <p className="text-fg-secondary">{card.description}</p>
      </div>
      <div className="caption-style flex flex-wrap items-center justify-between gap-2">
        <div className="flex items-center gap-2">
          <span className="flex items-center gap-1">
            <Avatar src={card.reviewerAvatar} alt="" className="size-3" />
            {card.reviewer}
          </span>
          <span className="text-fg-secondary flex items-center gap-1">
            <ClockIcon aria-hidden className="size-3" />
            {card.updated}
          </span>
        </div>
        <div className="flex items-center gap-1">
          {card.verdict}
          <span
            role="img"
            aria-label={`${card.stars} out of 5 stars`}
            className="border-overlay-1 bg-overlay-2 text-fg-disabled flex items-center gap-px rounded-full border px-0.75 py-0.5"
          >
            {Array.from({ length: 5 }, (_, index) =>
              index < card.stars ? (
                <StarFilledIcon
                  key={index}
                  aria-hidden
                  className="text-success size-2.5"
                />
              ) : (
                <StarEmptyIcon key={index} aria-hidden className="size-2.5" />
              ),
            )}
          </span>
        </div>
      </div>
    </article>
  );
}
