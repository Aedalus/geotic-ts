import { Engine } from "../Engine";
import { Entity } from "../Entity";
import { World } from "../World";

describe("World", () => {
  let world: World;

  beforeEach(() => {
    const engine = new Engine();

    world = engine.createWorld();
  });

  describe("createEntity", () => {
    let entity: Entity;

    describe("without an ID", () => {
      beforeEach(() => {
        entity = world.createEntity();
      });

      it("should be able to recall the entity by id", () => {
        const result = world.getEntity(entity.id);

        expect(result).toBe(entity);
      });
    });

    describe("with an ID", () => {
      let givenId: string;

      beforeEach(() => {
        givenId = Math.random().toString();
        entity = world.createEntity(givenId);
      });

      it("should assign the ID to the entity", () => {
        expect(entity.id).toBe(givenId);
      });

      it("should be able to recall the entity by id", () => {
        const result = world.getEntity(givenId);

        expect(result).toBe(entity);
      });
    });
  });

  describe("destroyEntity", () => {
    let entity: Entity;

    beforeEach(() => {
      entity = world.createEntity();

      world.destroyEntity(entity.id);
    });

    it("should no longer be able to recall by entity id", () => {
      const result = world.getEntity(entity.id);

      expect(result).toBeUndefined();
    });
  });
});
