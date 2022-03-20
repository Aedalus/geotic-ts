import { Query } from "./Query";
import { World } from "./World";

export class QueryManager {
    private _world: World
    private _queries : Query[] = [];

    constructor(world: World) {
        this._world = world;
    }

    get world(): World {
      return this._world
    }

    addQuery(query: Query) {
      this._queries.push(query)
    }
}
