import { Entity } from './Entity';
import { Filter, Query } from './Query';
import { camelString } from './util/string-util';
import { Engine } from "./Engine"

export class World {
    _id = 0;
    _queries: Query[] = [];
    _entities = new Map<string, Entity>();

    private engine: Engine

    constructor(engine: Engine ) {
        this.engine = engine;
    }

    createId() : string {
        return ++this._id + Math.random().toString(36).substr(2, 9);
    }

    getEntity(id: string): Entity | undefined {
        return this._entities.get(id);
    }

    getEntities() : Entity[] {
        return Array.from(this._entities.values());
    }

    createEntity(id = this.createId()): Entity {
        const entity = new Entity(this, id);

        this._entities.set(id, entity);

        return entity;
    }

    destroyEntity(id: string) {
        const entity = this.getEntity(id);

        if (entity) {
            entity.destroy();
        }
    }

    destroyEntities() {
        this._entities.forEach((entity) => {
            entity.destroy();
        });
    }

    destroy() {
        this.destroyEntities();
        this._id = 0;
        this._queries = [];
        this._entities = new Map();
    }

    createQuery(filters: Filter) {
        const query = new Query(this, filters);

        this._queries.push(query);

        return query;
    }

    serialize(list = this._entities) {
        const json : any[] = [];

        list.forEach((e) => {
            json.push(e.serialize());
        });

        return {
            entities: json,
        };
    }

    deserialize(data: any) {
        for (const entityData of data.entities) {
            this._createOrGetEntityById(entityData.id);
        }

        for (const entityData of data.entities) {
            this._deserializeEntity(entityData);
        }
    }

    _createOrGetEntityById(id: string) {
        return this.getEntity(id) || this.createEntity(id);
    }

    _deserializeEntity(data: any) {
        const { id, ...components } = data;
        const entity = this._createOrGetEntityById(id);
        entity._qeligible = false;

        Object.entries(components).forEach(([key, value]) => {
            const type = camelString(key);
            const def = this.engine._components.get(type);

            entity.add(def, value);
        });

        entity._qeligible = true;
        entity._candidacy();
    }

    _candidate(entity: Entity) {
        this._queries.forEach((q) => q.candidate(entity));
    }

    _destroyed(id: string) {
        return this._entities.delete(id);
    }
}
