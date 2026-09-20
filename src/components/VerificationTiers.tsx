"use client";

import {
  CONFIRM_STATUS_META,
  GRADE_META,
  MEDIA_TIER_META,
  classifyMediaTier,
  tagToConfirmStatus,
  type ConfirmStatus,
  type MediaTier,
} from "@/lib/verificationTiers";
import type { ConfirmationTag, EvidenceGrade } from "@/types";

type Props = {
  tag?: ConfirmationTag;
  grade?: EvidenceGrade;
  sourceName?: string;
  compact?: boolean;
};

export default function VerificationTiers({
  tag,
  grade,
  sourceName,
  compact,
}: Props) {
  const status: ConfirmStatus | null = tag ? tagToConfirmStatus(tag) : null;
  const statusMeta = status ? CONFIRM_STATUS_META[status] : null;
  const gradeMeta = grade ? GRADE_META[grade] : null;
  const mediaTier: MediaTier | null = sourceName
    ? classifyMediaTier(sourceName)
    : null;
  const mediaMeta = mediaTier ? MEDIA_TIER_META[mediaTier] : null;

  return (
    <div className={compact ? "tier-board compact" : "tier-board"}>
      <div className="tier-board-head">
        <strong className="tier-kicker">4단계 교차검증</strong>
        <h3>티어를 한눈에</h3>
        <p className="muted">
          T1→T4로 갈수록 편집 독립성이 약해져요. 아래 색 칸이 이 출처의 자리예요.
        </p>
      </div>

      <div className="tier-ladder" aria-label="매체 티어 T1~T4">
        {(["T1", "T2", "T3", "T4"] as MediaTier[]).map((t, i) => {
          const m = MEDIA_TIER_META[t];
          const on = mediaTier === t;
          return (
            <div
              key={t}
              className={on ? "tier-step on" : "tier-step"}
              style={{ ["--tier-c" as string]: m.color }}
              title={m.tip}
            >
              <span className="tier-step-idx">{i + 1}</span>
              <span className="tier-step-code">{m.short}</span>
              <span className="tier-step-name">
                {m.label.replace(/^T\d · /, "")}
              </span>
              {on && <span className="tier-step-now">지금</span>}
            </div>
          );
        })}
      </div>
      {mediaTier === "TX" && (
        <p className="tier-tx-note">이 출처는 T1~T4 목록 밖이에요 (TX).</p>
      )}

      <div className="tier-badges">
        {statusMeta && (
          <span
            className="tier-pill"
            style={{ background: statusMeta.color }}
            title={statusMeta.tip}
          >
            상태 · {statusMeta.label}
          </span>
        )}
        {gradeMeta && (
          <span className="tier-pill outline" title={gradeMeta.tip}>
            근거 · {gradeMeta.label}
          </span>
        )}
        {mediaMeta && (
          <span
            className="tier-pill outline"
            style={{ borderColor: mediaMeta.color, color: mediaMeta.color }}
            title={mediaMeta.tip}
          >
            매체 · {mediaMeta.label}
          </span>
        )}
      </div>

      {(statusMeta || gradeMeta || mediaMeta) && (
        <ul className="tier-tips">
          {statusMeta && <li>{statusMeta.tip}</li>}
          {gradeMeta && <li>{gradeMeta.tip}</li>}
          {mediaMeta && <li>{mediaMeta.tip}</li>}
        </ul>
      )}
    </div>
  );
}
