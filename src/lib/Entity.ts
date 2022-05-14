import { Clazz, Component, GetDataType } from './Component';
import { EntityEvent } from './EntityEvent';
import { World } from './World';
// import { addBit, hasBit, subtractBit } from './util/bit-util';

const attachComponent = <T>(entity: Entity, component: Component<T>) => {
    const key = component._ckey;

    entity.components[key] = component;
};

const removeComponent = <T>(entity: Entity, component: Component<T>) => {
    const key = component._ckey;

    delete entity.components[key];

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

    add<C extends Component<unknown>>(clazz: Clazz<C>, data: GetDataType<C>): C {
        const component = new clazz(data);

        attachComponent(this, component);

        component._onAttached(this);

        this._candidacy();

        return component
    }

    has<C>(clazz: Clazz<C>) {
      return !!this.components[clazz.prototype._ckey]
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
