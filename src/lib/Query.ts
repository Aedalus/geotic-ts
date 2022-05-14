import { Clazz } from './Component';
import { Entity } from './Entity';
import { World } from './World';
// import { addBit, bitIntersection } from './util/bit-util';

export interface Filter {
    any?: Clazz<any>[]
    all?: Clazz<any>[]
    none?: Clazz<any>[]
    immutableResult?: boolean
}

export class Query {
    private _any: Clazz<any>[]
    private _all: Clazz<any>[]
    private _none: Clazz<any>[]

    private _cache : Entity[] = [];
    private _onAddListeners: Array<(e: Entity) => void> = [];
    private _onRemoveListeners : Array<(e: Entity) => void> = [];
    private _immutableResult = true;

    private _world: World

    constructor(world: World, filters: Filter) {
        this._world = world;

        this._any = filters.any || [];
        this._all = filters.all || [];
        this._none = filters.none || [];

        this._immutableResult =
            filters.immutableResult == undefined
                ? true
                : filters.immutableResult;

        this.refresh();
    }

    onEntityAdded(fn: (e: Entity) => void) {
        this._onAddListeners.push(fn);
    }

    onEntityRemoved(fn: (e: Entity) => void) {
        this._onRemoveListeners.push(fn);
    }

    has(entity: Entity) {
        return this.idx(entity) >= 0;
    }

    idx(entity: Entity) {
        return this._cache.indexOf(entity);
    }

    matches(entity: Entity) {
        const any = this.matchesAny(entity)
        const all = this.matchesAll(entity)
        const none = this.matchesNone(entity)

        return any && all && none;
    }

    private matchesAny(entity: Entity): boolean {
      if(this._any.length === 0) return true

      for(const c of this._any) {
        if(entity.has(c)) return true
      }

      return false
    }

    private matchesAll(entity: Entity): boolean {
      if(this._all.length === 0) return true

      for(const c of this._all) {
        if(entity.has(c) === false) return false
      }

      return true
    }

    private matchesNone(entity: Entity): boolean {
      if(this._none.length === 0) return true

      for(const c of this._none) {
        if(entity.has(c)) return false
      }

      return true
    }

    candidate(entity: Entity) {
        const idx = this.idx(entity);
        const isTracking = idx >= 0;

        if (!entity.isDestroyed && this.matches(entity)) {
            if (!isTracking) {
                this._cache.push(entity);
                this._onAddListeners.forEach((cb) => cb(entity));
            }

            return true;
        }

        if (isTracking) {
            this._cache.splice(idx, 1);
            this._onRemoveListeners.forEach((cb) => cb(entity));
        }

        return false;
    }

    refresh() {
        this._cache = [];
        this._world._entities.forEach((entity) => {
            this.candidate(entity);
        });
    }

    get() {
        return this._immutableResult ? [...this._cache] : this._cache;
    }
}
