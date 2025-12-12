// import { BaseRenderer } from '../BaseRenderer';

import { BaseSequenceItemRenderer } from '../sequence/BaseSequenceItemRenderer';
import { SequenceNodeOptions } from '../sequence/types';

export interface Poolable<C> {
  id: number;
  poolGeneration: number;
  poolName?: string;
  inPool?: boolean;

  reset(): void;
  show(context: C): void;
  onRemove?: (e: Poolable<C>) => void;
  removeCompletely(): void;
}

export interface PoolOptions {
  maxSize: number;
  enableTelemetry?: boolean;
}

export interface PoolStats {
  totalCreated: number;
  totalAcquired: number;
  totalReleased: number;
  currentPoolSize: number;
  currentActive: number;
  hitRate: number;
}

export class RendererPool<C, T extends Poolable<C>> {
  private availableElements: T[] = [];

  private stats = {
    created: 0,
    acquired: 0,
    released: 0,
    hits: 0,
    misses: 0,
  };

  private readonly options: PoolOptions = {
    maxSize: 2048,
    enableTelemetry: true,
  };

  constructor(
    private readonly poolName: string,
    private readonly producer: (context: C) => T,
    options: Partial<PoolOptions> = {},
  ) {
    this.options = {
      ...this.options,
      ...options,
    };
  }

  /**
   * Acquire an element from the pool
   * Creates new if pool is empty
   */
  public acquire(context: C): T {
    this.stats.acquired++;

    let element = this.availableElements.pop();
    let action = 'acquiring';
    if (element) {
      this.stats.hits++;
      element.inPool = false;
      // TODO pool just return context here, do not pass to createElement if possible
      // element.show(context);
    } else {
      this.stats.misses++;
      element = this.createElement(context);
      action = 'creating';
    }
    element.poolGeneration = element.poolGeneration
      ? element.poolGeneration + 1
      : 1;
    element.poolName = this.poolName;
    element.onRemove = (e) => this.release(e as T);
    this.log(action, element, context);

    return element;
  }

  private createElement(context: C): T {
    this.stats.created++;

    const result = this.producer(context);

    return result;
  }

  /**
   * Release an element back to the pool
   */
  private release(element: T): void {
    if (element.inPool) {
      console.warn(
        `Trying to release an element that is already in pool: ${this.poolName} id:${element.id}`,
      );
      return;
    }
    this.stats.released++;

    element.reset();
    element.inPool = true;

    if (this.availableElements.length < this.options.maxSize) {
      this.availableElements.push(element);
      this.log('releasing', element);
    } else {
      element.removeCompletely();
      element.inPool = false;
      this.log('removing', element);
    }
  }

  /**
   * Clear all pooled elements
   * Call when renderer context changes (mode switch, etc)
   */
  public clear(): void {
    this.availableElements.forEach((element) => element.removeCompletely());
    this.availableElements = [];
  }

  public getStats(): PoolStats {
    const hitRate =
      this.stats.acquired > 0 ? this.stats.hits / this.stats.acquired : 0;

    return {
      totalCreated: this.stats.created,
      totalAcquired: this.stats.acquired,
      totalReleased: this.stats.released,
      currentPoolSize: this.availableElements.length,
      currentActive: this.stats.acquired - this.stats.released,
      hitRate: Math.round(hitRate * 100) / 100,
    };
  }

  public resetStats(): void {
    this.stats = {
      created: 0,
      acquired: 0,
      released: 0,
      hits: 0,
      misses: 0,
    };
  }

  private log(
    action: string,
    renderer: Poolable<C>,
    context: C | null = null,
  ): void {
    const urlParams = new URLSearchParams(window.location.search);
    if (!urlParams.has('pool-log')) return;

    const contextId =
      (context as SequenceNodeOptions)?.node?.monomer?.id ?? 'N/A';
    const r = renderer as unknown as BaseSequenceItemRenderer;

    const wd = window as unknown as {
      poolDict: Record<string, { n: SVGElement | null; p: ParentNode | null }>;
    };
    if (!wd.poolDict) wd.poolDict = {};
    wd.poolDict[`${r.symbolToDisplay || 'Emp'}-${renderer.id}`] = {
      n: r.rootElement?.node() ?? null,
      p: r.rootElement?.node()?.parentNode ?? null,
    };

    console.log(
      `${renderer.poolName}: ${r.symbolToDisplay || 'Emp'}-${
        r.id
      } ${action} gen ${renderer.poolGeneration} (monomer id: ${contextId})`,
      context,
      r.rootElement,
    );
  }
}
