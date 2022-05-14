import { Entity } from "./Entity";
import { EntityEvent } from "./EntityEvent";

export interface Clazz<T> {
    new(...args: any[]): T;
}

export type GetDataType<T> = T extends Component<infer U> ? U : never;

export abstract class Component<T> {
    static allowMultiple = false;
    _ckey!: string
    _cbit!: bigint

    private entity?: Entity
    private data: T

    get world() {
        return this.entity?.world;
    }

    get allowMultiple() {
        return (this.constructor as typeof Component).allowMultiple;
    }

    constructor(data: T) {
        this.data = data
    }

    getEntity() {
      return this.entity
    }

    destroy() {
        this.entity?.remove(this);
    }

    _onDestroyed() {
        this.onDestroyed();
        delete this.entity;
    }

    _onEvent(evt: EntityEvent) {
        this.onEvent(evt);

        const func = (this as any)[evt.handlerName]
        // const func = this[evt.handlerName]
        if (typeof func === 'function') {
            func(evt as any)
        }
    }

    _onAttached(entity: Entity) {
        this.entity = entity;
        this.onAttached(entity);
    }

    serialize() : T {
        return this.data
    }

    // eslint-disable-next-line @typescript-eslint/no-empty-function
    onAttached(_: Entity) {}
    // eslint-disable-next-line @typescript-eslint/no-empty-function
    onDestroyed() {}
    // eslint-disable-next-line @typescript-eslint/no-empty-function
    onEvent(_: EntityEvent) {}
}
