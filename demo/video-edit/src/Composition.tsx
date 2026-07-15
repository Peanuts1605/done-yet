import { Video } from "@remotion/media";
import {
  AbsoluteFill,
  Composition,
  Easing,
  interpolate,
  staticFile,
  useCurrentFrame,
  useVideoConfig,
} from "remotion";

const CAPTIONS = [
  { startMs: 0, endMs: 8000, text: "An agent can sound certain and still leave the job half done." },
  { startMs: 8000, endMs: 20000, text: "The contract names the requested result and the changes that are forbidden." },
  { startMs: 20000, endMs: 35000, text: "The refund posted, but the ticket stayed open and unlinked: FAIL, 9 of 11." },
  { startMs: 35000, endMs: 52000, text: "A timeout sounds like failure. Canonical state says otherwise: PASS, 11 of 11." },
  { startMs: 52000, endMs: 64000, text: "Every verdict keeps the contract, observed values, checks, and evidence digests." },
  { startMs: 64000, endMs: 82000, text: "The Codex plugin adds an opt-in skill and Stop hook to participating projects." },
  { startMs: 82000, endMs: 92000, text: "GPT-5.6 interprets intent. Deterministic checks issue the verdict." },
  { startMs: 92000, endMs: 103000, text: "No universal trust score. One inspectable postcondition loop." },
  { startMs: 103000, endMs: 108000, text: "The agent said done. Done Yet? checks the systems." },
] as const;

const DoneYetVideo: React.FC = () => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();
  const nowMs = (frame / fps) * 1000;
  const caption = CAPTIONS.find(({ startMs, endMs }) => nowMs >= startMs && nowMs < endMs);
  const captionOpacity = caption
    ? interpolate(
        nowMs,
        [caption.startMs, caption.startMs + 220, caption.endMs - 220, caption.endMs],
        [0, 1, 1, 0],
        {
          extrapolateLeft: "clamp",
          extrapolateRight: "clamp",
          easing: Easing.bezier(0.16, 1, 0.3, 1),
        },
      )
    : 0;
  const cornerOpacity = interpolate(frame, [0, fps / 2, fps * 2.5, fps * 3.5], [0, 1, 1, 0], {
    extrapolateLeft: "clamp",
    extrapolateRight: "clamp",
  });

  return (
    <AbsoluteFill style={{ backgroundColor: "#071113", fontFamily: '"Avenir Next", Avenir, Arial, sans-serif' }}>
      <Video
        src={staticFile("done-yet-base.mp4")}
        objectFit="cover"
        style={{ width: "100%", height: "100%" }}
      />

      <div
        style={{
          position: "absolute",
          top: 40,
          left: 48,
          opacity: cornerOpacity,
          padding: "12px 16px",
          border: "1px solid rgba(247, 244, 238, 0.22)",
          borderRadius: 6,
          background: "rgba(7, 17, 19, 0.88)",
          color: "#f7f4ee",
          fontSize: 24,
          fontWeight: 700,
        }}
      >
        DONE YET? · DEVELOPER TOOLS
      </div>

      {caption ? (
        <div
          style={{
            position: "absolute",
            left: 90,
            right: 90,
            bottom: 52,
            display: "flex",
            justifyContent: "center",
            opacity: captionOpacity,
            translate: interpolate(captionOpacity, [0, 1], ["0px 10px", "0px 0px"], {
              extrapolateLeft: "clamp",
              extrapolateRight: "clamp",
            }),
          }}
        >
          <div
            style={{
              maxWidth: 1560,
              padding: "17px 25px 18px",
              border: "1px solid rgba(247, 244, 238, 0.2)",
              borderRadius: 6,
              background: "rgba(7, 17, 19, 0.9)",
              boxShadow: "0 16px 42px rgba(0, 0, 0, 0.28)",
              color: "#f7f4ee",
              fontSize: 44,
              fontWeight: 650,
              lineHeight: 1.2,
              textAlign: "center",
            }}
          >
            {caption.text}
          </div>
        </div>
      ) : null}
    </AbsoluteFill>
  );
};

export const DoneYetComposition: React.FC = () => (
  <Composition
    id="DoneYetBuildWeek"
    component={DoneYetVideo}
    durationInFrames={2707}
    fps={25}
    width={1920}
    height={1080}
  />
);
