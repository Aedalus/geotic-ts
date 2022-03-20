import { Clazz, Component } from './Component';
import { EntityEvent } from './EntityEvent';
import { addBit, hasBit, subtractBit } from './util/bit-util';
import { World } from './World';

const attachComponent = <T>(entity: Entity, component: Component<T>) => {
    const key = component._ckey;

    entity.components[key] = component;
};

const removeComponent = <T>(entity: Entity, component: Component<T>) => {
    const key = component._ckey;

    delete entity.components[key];

    entity._cbits = subtractBit(entity._cbits, component._cbit);
    entity._candidacy();
};

const serializeComponent = <T>(component: Component<T>) => {
    return component.serialize();
};

export class Entity {
    world: World
    id: string
    isDestroyed: boolean
    components: {[index: string]: Component<any>}

    _cbits = 0n;
    _qeligible = true;

    constructor(world: World, id: string) {
        this.world = world;
        this.id = id;
        this.components = {};
        this.isDestroyed = false;
    }

    _candidacy() {
        if (this._qeligible) {
            this.world._candidate(this);
        }
    }

    add<D, C extends Component<D>>(clazz: Clazz<C>, data: D) {
        const component = new clazz(data);

        attachComponent(this, component);

        this._cbits = addBit(this._cbits, component._cbit);
        component._onAttached(this);

        this._candidacy();
    }

    has<C>(clazz: Clazz<C>) {
        return hasBit(this._cbits, clazz.prototype._cbit);
    }

    get<C extends Component<any>>(clazz: Clazz<C>): C | undefined {
        return this.components[clazz.prototype._ckey] as C
    }

    getOrErr<C extends Component<any>>(clazz: Clazz<C>) {
        const c = this.components[clazz.prototype._ckey]
        if(!c) throw new Error(`${clazz.prototype._ckey} does not exist on ${this.id}`)
        return c
    }

    remove<T>(component: Component<T>) {
        removeComponent(this, component);
        component._onDestroyed();
    }

    destroy() {
        for (const k in this.components) {
            const v = this.components[k];

            if (v instanceof Component) {
                this._cbits = subtractBit(this._cbits, v._cbit);
                v._onDestroyed();
            }
            delete this.components[k];
        }

        this._candidacy();
        this.world._destroyed(this.id);
        this.components = {};
        this.isDestroyed = true;
    }

    serialize() {
        const components : {[index: string]: any }= {};

        for (const k in this.components) {
            const v = this.components[k];

            components[k] = serializeComponent(v);
        }

        return {
            id: this.id,
            ...components,
        };
    }

    fireEvent(name: string, data: any) {
        const evt = new EntityEvent(name, data);

        for (const key in this.components) {
            const v = this.components[key];

            v._onEvent(evt);

            if (evt.prevented) {
                return evt;
            }

        }

        return evt;
    }
}
