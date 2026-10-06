import Avatar from "@/components/_ui/avatar";
import type { ScoreCard as ScoreCardData } from "@/data/companies";
import ClockIcon from "@/assets/icons/companies/detail/clock.svg?react";
import StarFilledIcon from "@/assets/icons/companies/detail/star-filled.svg?react";
import StarEmptyIcon from "@/assets/icons/companies/detail/star-empty.svg?react";

type ScoreCardProps = {
  card: ScoreCardData;
};

export default function ScoreCard({ card }: ScoreCardProps) {
  return (
    <article className="bg-card ease-power3-out flex flex-col gap-4 rounded-lg p-4 shadow-[0px_4px_4px_0px_rgba(42,42,42,0.32),0px_0px_0px_1px_#0e0e0e,inset_0px_1px_0px_0px_rgba(255,255,255,0.08),inset_0px_0px_0px_1px_rgba(255,255,255,0.08)] transition-colors duration-150 hover:bg-[#252525]">
      <div className="flex flex-col gap-2">
        <h3>{card.title}</h3>
        <p className="text-soft">{card.description}</p>
      </div>
      <div className="caption-style flex flex-wrap items-center justify-between gap-2">
        <div className="flex items-center gap-2">
          <span className="flex items-center gap-1">
            <Avatar src={card.reviewerAvatar} alt="" className="size-3" />
            {card.reviewer}
          </span>
          <span className="text-soft flex items-center gap-1">
            <ClockIcon aria-hidden className="size-3" />
            {card.updated}
          </span>
        </div>
        <div className="flex items-center gap-1">
          {card.verdict}
          <span
            role="img"
            aria-label={`${card.stars} out of 5 stars`}
            className="text-line-strong flex items-center gap-px rounded-full border border-white/4 bg-white/6 px-[3px] py-[2px]"
          >
            {Array.from({ length: 5 }, (_, index) =>
              index < card.stars ? (
                <StarFilledIcon key={index} aria-hidden className="size-2.5" />
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
