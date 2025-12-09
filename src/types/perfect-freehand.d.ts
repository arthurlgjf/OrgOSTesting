declare module "perfect-freehand" {
  export interface StrokeOptions {
    size?: number;
    thinning?: number;
    smoothing?: number;
    streamline?: number;
    easing?: (t: number) => number;
    start?: {
      taper?: number;
      easing?: (t: number) => number;
      cap?: boolean;
    };
    end?: {
      taper?: number;
      easing?: (t: number) => number;
      cap?: boolean;
    };
    simulatePressure?: boolean;
    last?: boolean;
  }

  export type Point = [number, number, number];

  export default function getStroke(
    points: Point[],
    options?: StrokeOptions
  ): number[][];
}

