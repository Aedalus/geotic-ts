import { Clazz } from './Component';
import { ComponentRegistry } from './ComponentRegistry';
import { World } from './World';

export class Engine {
    _components = new ComponentRegistry();

    registerComponent<T>(clazz: Clazz<T>) {
        this._components.register(clazz);
    }

    createWorld() {
        return new World(this);
    }

    destroyWorld(world: World) {
        world.destroy();
    }
}
