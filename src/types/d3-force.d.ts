declare module "d3-force" {
  export interface SimulationNodeDatum {
    x?: number;
    y?: number;
    fx?: number | null;
    fy?: number | null;
    vx?: number;
    vy?: number;
  }

  export interface SimulationLinkDatum<NodeDatum extends SimulationNodeDatum> {
    source?: NodeDatum | string;
    target?: NodeDatum | string;
    index?: number;
  }

  export interface Force<NodeDatum extends SimulationNodeDatum> {
    (alpha: number): void;
    initialize?(nodes: NodeDatum[]): void;
  }

  export interface Simulation<NodeDatum extends SimulationNodeDatum, LinkDatum extends SimulationLinkDatum<NodeDatum>> {
    restart(): this;
    stop(): this;
    tick(iterations?: number): this;
    nodes(): NodeDatum[];
    nodes(nodes: NodeDatum[]): this;
    alpha(): number;
    alpha(alpha: number): this;
    alphaMin(): number;
    alphaMin(min: number): this;
    alphaDecay(): number;
    alphaDecay(decay: number): this;
    alphaTarget(): number;
    alphaTarget(target: number): this;
    velocityDecay(): number;
    velocityDecay(decay: number): this;
    force(name: string): Force<NodeDatum> | undefined;
    force(name: string, force: Force<NodeDatum> | null): this;
    find(x: number, y: number, radius?: number): NodeDatum | undefined;
    on(typenames: string): ((event: any) => void) | undefined;
    on(typenames: string, listener: ((event: any) => void) | null): this;
  }

  export function forceSimulation<NodeDatum extends SimulationNodeDatum>(
    nodesData?: NodeDatum[]
  ): Simulation<NodeDatum, SimulationLinkDatum<NodeDatum>>;

  export function forceSimulation<NodeDatum extends SimulationNodeDatum, LinkDatum extends SimulationLinkDatum<NodeDatum>>(
    nodesData?: NodeDatum[]
  ): Simulation<NodeDatum, LinkDatum>;

  export interface ForceCenter<NodeDatum extends SimulationNodeDatum> extends Force<NodeDatum> {
    x(): number;
    x(x: number): this;
    y(): number;
    y(y: number): this;
    strength(): number;
    strength(strength: number): this;
  }

  export function forceCenter<NodeDatum extends SimulationNodeDatum>(
    x?: number,
    y?: number
  ): ForceCenter<NodeDatum>;

  export interface ForceCollide<NodeDatum extends SimulationNodeDatum> extends Force<NodeDatum> {
    radius(): (node: NodeDatum, i: number, nodes: NodeDatum[]) => number;
    radius(radius: number | ((node: NodeDatum, i: number, nodes: NodeDatum[]) => number)): this;
    strength(): number;
    strength(strength: number): this;
    iterations(): number;
    iterations(iterations: number): this;
  }

  export function forceCollide<NodeDatum extends SimulationNodeDatum>(
    radius?: number | ((node: NodeDatum, i: number, nodes: NodeDatum[]) => number)
  ): ForceCollide<NodeDatum>;

  export interface ForceLink<NodeDatum extends SimulationNodeDatum, LinkDatum extends SimulationLinkDatum<NodeDatum>> extends Force<NodeDatum> {
    links(): LinkDatum[];
    links(links: LinkDatum[]): this;
    id(): (node: NodeDatum, i: number, nodesData: NodeDatum[]) => string | number;
    id(id: (node: NodeDatum, i: number, nodesData: NodeDatum[]) => string | number): this;
    distance(): number | ((link: LinkDatum, i: number, links: LinkDatum[]) => number);
    distance(distance: number | ((link: LinkDatum, i: number, links: LinkDatum[]) => number)): this;
    strength(): number | ((link: LinkDatum, i: number, links: LinkDatum[]) => number);
    strength(strength: number | ((link: LinkDatum, i: number, links: LinkDatum[]) => number)): this;
    iterations(): number;
    iterations(iterations: number): this;
  }

  export function forceLink<NodeDatum extends SimulationNodeDatum, LinkDatum extends SimulationLinkDatum<NodeDatum>>(
    links?: LinkDatum[]
  ): ForceLink<NodeDatum, LinkDatum>;

  export interface ForceManyBody<NodeDatum extends SimulationNodeDatum> extends Force<NodeDatum> {
    strength(): number | ((node: NodeDatum, i: number, nodes: NodeDatum[]) => number);
    strength(strength: number | ((node: NodeDatum, i: number, nodes: NodeDatum[]) => number)): this;
    theta(): number;
    theta(theta: number): this;
    distanceMin(): number;
    distanceMin(distance: number): this;
    distanceMax(): number;
    distanceMax(distance: number): this;
  }

  export function forceManyBody<NodeDatum extends SimulationNodeDatum>(): ForceManyBody<NodeDatum>;

  export interface ForceRadial<NodeDatum extends SimulationNodeDatum> extends Force<NodeDatum> {
    strength(): number | ((node: NodeDatum, i: number, nodes: NodeDatum[]) => number);
    strength(strength: number | ((node: NodeDatum, i: number, nodes: NodeDatum[]) => number)): this;
    radius(): number | ((node: NodeDatum, i: number, nodes: NodeDatum[]) => number);
    radius(radius: number | ((node: NodeDatum, i: number, nodes: NodeDatum[]) => number)): this;
    x(): number | ((node: NodeDatum, i: number, nodes: NodeDatum[]) => number);
    x(x: number | ((node: NodeDatum, i: number, nodes: NodeDatum[]) => number)): this;
    y(): number | ((node: NodeDatum, i: number, nodes: NodeDatum[]) => number);
    y(y: number | ((node: NodeDatum, i: number, nodes: NodeDatum[]) => number)): this;
  }

  export function forceRadial<NodeDatum extends SimulationNodeDatum>(
    radius: number | ((node: NodeDatum, i: number, nodes: NodeDatum[]) => number),
    x?: number | ((node: NodeDatum, i: number, nodes: NodeDatum[]) => number),
    y?: number | ((node: NodeDatum, i: number, nodes: NodeDatum[]) => number)
  ): ForceRadial<NodeDatum>;

  export interface ForceX<NodeDatum extends SimulationNodeDatum> extends Force<NodeDatum> {
    strength(): number | ((node: NodeDatum, i: number, nodes: NodeDatum[]) => number);
    strength(strength: number | ((node: NodeDatum, i: number, nodes: NodeDatum[]) => number)): this;
    x(): number | ((node: NodeDatum, i: number, nodes: NodeDatum[]) => number);
    x(x: number | ((node: NodeDatum, i: number, nodes: NodeDatum[]) => number)): this;
  }

  export function forceX<NodeDatum extends SimulationNodeDatum>(
    x?: number | ((node: NodeDatum, i: number, nodes: NodeDatum[]) => number)
  ): ForceX<NodeDatum>;

  export interface ForceY<NodeDatum extends SimulationNodeDatum> extends Force<NodeDatum> {
    strength(): number | ((node: NodeDatum, i: number, nodes: NodeDatum[]) => number);
    strength(strength: number | ((node: NodeDatum, i: number, nodes: NodeDatum[]) => number)): this;
    y(): number | ((node: NodeDatum, i: number, nodes: NodeDatum[]) => number);
    y(y: number | ((node: NodeDatum, i: number, nodes: NodeDatum[]) => number)): this;
  }

  export function forceY<NodeDatum extends SimulationNodeDatum>(
    y?: number | ((node: NodeDatum, i: number, nodes: NodeDatum[]) => number)
  ): ForceY<NodeDatum>;
}

