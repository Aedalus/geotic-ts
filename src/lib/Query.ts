import { Clazz } from './Component';
import { Entity } from './Entity';
import { addBit, bitIntersection } from './util/bit-util';
import { World } from './World';

export interface Filter {
    any?: Clazz<any>[]
    all?: Clazz<any>[]
    none?: Clazz<any>[]
    immutableResult?: boolean
}

export class Query {
    private _any: bigint
    private _all: bigint
    private _none: bigint

    private _cache : Entity[] = [];
    private _onAddListeners: Array<(e: Entity) => void> = [];
    private _onRemoveListeners : Array<(e: Entity) => void> = [];
    private _immutableResult = true;

    private _world: World

    constructor(world: World, filters: Filter) {
        this._world = world;

        const any = filters.any || [];
        const all = filters.all || [];
        const none = filters.none || [];

        this._any = any.reduce((s, c) => {
            return addBit(s, c.prototype._cbit);
        }, 0n);

        this._all = all.reduce((s, c) => {
            return addBit(s, c.prototype._cbit);
        }, 0n);

        this._none = none.reduce((s, c) => {
            return addBit(s, c.prototype._cbit);
        }, 0n);

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
        const bits = entity._cbits;

        const any = this._any === 0n || bitIntersection(bits, this._any) > 0n;
        const all = bitIntersection(bits, this._all) === this._all;
        const none = bitIntersection(bits, this._none) === 0n;

        return any && all && none;
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
