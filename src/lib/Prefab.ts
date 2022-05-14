import { Clazz, Component,GetDataType } from "./Component";
import { Entity } from "./Entity";

interface PrefabFunction {
  (e: Entity): Entity
}

class Prefab {

    private inherit: Prefab[] = []
    private funcs: PrefabFunction[] = []

    component<C extends Component<any>>(clazz: Clazz<C>, data: GetDataType<C>) {
      this.funcs.push(e => {
        e.add(clazz, data)
        return e
      })
    }

    build(e: Entity): Entity {
      for(const p of [...this.inherit, this]) {
        for(const f of p.funcs) {
          f(e)
        }
      }

      return e
    }
}
