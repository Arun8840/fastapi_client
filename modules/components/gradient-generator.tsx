"use client";

import { cn } from "cn";
import { Check, Copy, Plus, RotateCcw, Trash2 } from "lucide-react";
import { useRef, useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Slider } from "@/components/ui/slider";

export interface ColorStop {
  id: string;
  color: string;
  position: number;
}

export interface GradientGeneratorProps {
  onChange?: (cssValue: string) => void;
  initialValue?: {
    colors?: ColorStop[];
    angle?: number;
    noiseOpacity?: number;
  };
}

interface GradientState {
  colors: ColorStop[];
  angle: number;
  noiseOpacity: number;
}

const DEFAULT_COLORS: ColorStop[] = [
  { id: "stop-1", color: "#ff0080", position: 0 },
  { id: "stop-2", color: "#7928ca", position: 50 },
  { id: "stop-3", color: "#00d4ff", position: 100 },
];

const DEFAULT_ANGLE = 135;
const DEFAULT_NOISE = 18;

const clamp = (value: number, min: number, max: number) =>
  Math.min(Math.max(value, min), max);

const isHexColor = (value: string) =>
  /^#(?:[0-9a-f]{3}|[0-9a-f]{6})$/i.test(value.trim());

const createId = () =>
  globalThis.crypto?.randomUUID?.() ??
  `stop-${Date.now()}-${Math.random().toString(36).slice(2, 7)}`;

const createNoiseDataUri = (opacity: number) => {
  const alpha = clamp(opacity, 0, 100) / 100;
  const svg = `<svg xmlns="http://www.w3.org/2000/svg" width="160" height="160" viewBox="0 0 160 160"><filter id="noise"><feTurbulence type="fractalNoise" baseFrequency="0.85" numOctaves="4" stitchTiles="stitch"/><feColorMatrix type="saturate" values="0"/></filter><rect width="100%" height="100%" filter="url(#noise)" opacity="${alpha}"/></svg>`;

  return `url("data:image/svg+xml,${encodeURIComponent(svg)}")`;
};

const buildLinearGradient = (colors: ColorStop[], angle: number) => {
  const stops = [...colors]
    .sort((a, b) => a.position - b.position)
    .map((stop) => `${stop.color} ${Math.round(stop.position)}%`)
    .join(", ");

  return `linear-gradient(${angle}deg, ${stops})`;
};

const toCss = (state: GradientState) => {
  const linear = buildLinearGradient(state.colors, state.angle);
  const noise =
    state.noiseOpacity > 0 ? createNoiseDataUri(state.noiseOpacity) : null;
  const backgroundImage = noise ? `${noise}, ${linear}` : linear;

  return {
    backgroundImage,
    css: `background: ${backgroundImage};`,
  };
};

const createInitialState = (
  initialValue?: GradientGeneratorProps["initialValue"],
): GradientState => ({
  colors: (initialValue?.colors?.length
    ? initialValue.colors
    : DEFAULT_COLORS
  ).map((stop) => ({ ...stop })),
  angle: clamp(initialValue?.angle ?? DEFAULT_ANGLE, 0, 360),
  noiseOpacity: clamp(initialValue?.noiseOpacity ?? DEFAULT_NOISE, 0, 100),
});

const createDefaultState = (): GradientState => ({
  colors: DEFAULT_COLORS.map((stop) => ({ ...stop })),
  angle: DEFAULT_ANGLE,
  noiseOpacity: DEFAULT_NOISE,
});

export default function GradientGenerator({
  onChange,
  initialValue,
}: GradientGeneratorProps) {
  const [state, setState] = useState<GradientState>(() =>
    createInitialState(initialValue),
  );
  const [copied, setCopied] = useState(false);
  const copyTimeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  const { colors, angle, noiseOpacity } = state;
  const { backgroundImage, css: cssValue } = toCss(state);

  const commit = (next: GradientState) => {
    setState(next);
    onChange?.(toCss(next).css);
  };

  const updateStop = (id: string, patch: Partial<Omit<ColorStop, "id">>) => {
    commit({
      ...state,
      colors: state.colors.map((stop) =>
        stop.id === id ? { ...stop, ...patch } : stop,
      ),
    });
  };

  const removeStop = (id: string) => {
    if (colors.length <= 2) return;
    commit({
      ...state,
      colors: colors.filter((stop) => stop.id !== id),
    });
  };

  const addStop = () => {
    const sorted = [...colors].sort((a, b) => a.position - b.position);
    let position = 50;

    if (sorted.length >= 2) {
      let largestGap = 0;
      for (let index = 0; index < sorted.length - 1; index += 1) {
        const gap = sorted[index + 1].position - sorted[index].position;
        if (gap > largestGap) {
          largestGap = gap;
          position = sorted[index].position + gap / 2;
        }
      }
    }

    commit({
      ...state,
      colors: [
        ...colors,
        {
          id: createId(),
          color: `#${Math.floor(Math.random() * 0xffffff)
            .toString(16)
            .padStart(6, "0")}`,
          position: Math.round(position),
        },
      ],
    });
  };

  const setAngle = (value: number) => {
    commit({ ...state, angle: clamp(value, 0, 360) });
  };

  const setNoiseOpacity = (value: number) => {
    commit({ ...state, noiseOpacity: clamp(value, 0, 100) });
  };

  const reset = () => {
    commit(createDefaultState());
  };

  const copyCss = async () => {
    try {
      await navigator.clipboard.writeText(cssValue);
      setCopied(true);
      if (copyTimeoutRef.current) clearTimeout(copyTimeoutRef.current);
      copyTimeoutRef.current = setTimeout(() => setCopied(false), 1600);
    } catch {
      setCopied(false);
    }
  };

  return (
    <div className="mx-auto flex w-full max-w-2xl flex-col gap-4">
      <div
        className="relative h-56 w-full overflow-hidden rounded-xl border"
        style={{ backgroundImage }}
      >
        <div className="absolute inset-x-0 bottom-0 flex items-center justify-between gap-2 bg-background/60 px-3 py-2 text-xs font-medium backdrop-blur-sm">
          <span>{angle}deg</span>
          <span>{colors.length} stops</span>
          <span>{Math.round(noiseOpacity)}% noise</span>
        </div>
      </div>

      <div className="flex flex-col gap-3 rounded-xl border p-4">
        <div className="flex items-center justify-between">
          <h2 className="text-sm font-semibold">Color stops</h2>
          <Button variant="outline" size="sm" onClick={addStop}>
            <Plus />
            Add stop
          </Button>
        </div>

        <div className="flex flex-col gap-3">
          {colors.map((stop) => (
            <div key={stop.id} className="flex flex-col gap-2">
              <div className="flex items-center gap-2">
                <input
                  type="color"
                  aria-label={`Pick color for stop at ${Math.round(stop.position)}%`}
                  value={isHexColor(stop.color) ? stop.color : "#000000"}
                  onChange={(event) =>
                    updateStop(stop.id, { color: event.target.value })
                  }
                  className="size-8 shrink-0 cursor-pointer rounded-md border border-input bg-transparent p-0 [&::-webkit-color-swatch-wrapper]:p-0 [&::-webkit-color-swatch]:rounded-[5px] [&::-webkit-color-swatch]:border-none"
                />
                <Input
                  aria-label="Color value"
                  value={stop.color}
                  onChange={(event) =>
                    updateStop(stop.id, { color: event.target.value })
                  }
                  placeholder="#ff0080, rgb(0 0 0), hsl(0 0% 0%)"
                  className="font-mono"
                />
                <div className="flex w-20 shrink-0 items-center gap-1">
                  <Input
                    aria-label="Stop position"
                    type="number"
                    min={0}
                    max={100}
                    value={Math.round(stop.position)}
                    onChange={(event) =>
                      updateStop(stop.id, {
                        position: clamp(
                          Number(event.target.value) || 0,
                          0,
                          100,
                        ),
                      })
                    }
                    className="text-right"
                  />
                  <span className="text-xs text-muted-foreground">%</span>
                </div>
                <Button
                  variant="ghost"
                  size="icon-sm"
                  aria-label="Remove color stop"
                  disabled={colors.length <= 2}
                  onClick={() => removeStop(stop.id)}
                >
                  <Trash2 />
                </Button>
              </div>
              <Slider
                value={stop.position}
                min={0}
                max={100}
                step={1}
                aria-label={`Position for ${stop.color}`}
                onValueChange={(value) =>
                  updateStop(stop.id, {
                    position: Array.isArray(value) ? value[0] : value,
                  })
                }
              />
            </div>
          ))}
        </div>
      </div>

      <div className="grid gap-4 rounded-xl border p-4 sm:grid-cols-2">
        <div className="flex flex-col gap-2">
          <div className="flex items-center justify-between">
            <Label htmlFor="gradient-angle">Angle</Label>
            <span className="text-xs text-muted-foreground">{angle}deg</span>
          </div>
          <Slider
            id="gradient-angle"
            value={angle}
            min={0}
            max={360}
            step={1}
            onValueChange={(value) =>
              setAngle(Array.isArray(value) ? value[0] : value)
            }
          />
        </div>

        <div className="flex flex-col gap-2">
          <div className="flex items-center justify-between">
            <Label htmlFor="gradient-noise">Grain</Label>
            <span className="text-xs text-muted-foreground">
              {Math.round(noiseOpacity)}%
            </span>
          </div>
          <Slider
            id="gradient-noise"
            value={noiseOpacity}
            min={0}
            max={100}
            step={1}
            onValueChange={(value) =>
              setNoiseOpacity(Array.isArray(value) ? value[0] : value)
            }
          />
        </div>
      </div>

      <div className="flex flex-col gap-2 rounded-xl border p-4">
        <div className="flex items-center justify-between">
          <h2 className="text-sm font-semibold">CSS</h2>
          <div className="flex items-center gap-2">
            <Button variant="ghost" size="sm" onClick={reset}>
              <RotateCcw />
              Reset
            </Button>
            <Button variant="outline" size="sm" onClick={copyCss}>
              {copied ? <Check /> : <Copy />}
              {copied ? "Copied" : "Copy"}
            </Button>
          </div>
        </div>
        <pre
          className={cn(
            "max-h-32 overflow-auto rounded-lg bg-muted p-3 font-mono text-xs break-all whitespace-pre-wrap select-all",
          )}
        >
          {cssValue}
        </pre>
      </div>
    </div>
  );
}
