import { Component } from '../Component';
import { Engine } from '../Engine';
import { Entity } from '../Entity';
import { World } from '../World';

class EmptyComponent extends Component<any> {}

describe('Entity', () => {
    let world: World;

    class TestComponent extends Component<any> {}

    beforeEach(() => {
        const engine = new Engine();

        engine.registerComponent(EmptyComponent);
        engine.registerComponent(TestComponent);

        world = engine.createWorld();
    });

    describe('create', () => {
        let entity: Entity;

        beforeEach(() => {
            entity = world.createEntity();
        });

        it('should be able to recall by entity id', () => {
            const result = world.getEntity(entity.id);

            expect(result).toBe(entity);
        });

        it('should set the isDestroyed flag to FALSE', () => {
            expect(entity.isDestroyed).toBe(false);
        });

        it('should assign an ID', () => {
            expect(typeof entity.id).toBe('string');
        });
    });

    describe('destroy', () => {
        let entity: Entity
        let emptyComponentDestroySpy: jest.SpyInstance
        let testComponentDestroySpy: jest.SpyInstance

        beforeEach(() => {
            entity = world.createEntity();
            entity.add(EmptyComponent, {});
            entity.add(TestComponent, {});

            testComponentDestroySpy = jest.spyOn(
                entity.getOrErr(TestComponent),
                '_onDestroyed'
            );
            emptyComponentDestroySpy = jest.spyOn(
                entity.getOrErr(EmptyComponent),
                '_onDestroyed'
            );

            entity.destroy();
        });

        it('should no longer be able to recall by entity id', () => {
            const result = world.getEntity(entity.id);

            expect(result).toBeUndefined();
        });

        it('should set the entity "isDestroyed" flag to TRUE', () => {
            expect(entity.isDestroyed).toBe(true);
        });

        it('should call "onDestroyed" for all components', () => {
            expect(testComponentDestroySpy).toHaveBeenCalledTimes(1);
            expect(testComponentDestroySpy).toHaveBeenCalledWith();
            expect(emptyComponentDestroySpy).toHaveBeenCalledTimes(1);
            expect(emptyComponentDestroySpy).toHaveBeenCalledWith();
        });
    });

    describe('add', () => {
        let entity: Entity;

        beforeEach(() => {
            entity = world.createEntity();
        });

        describe('simple components', () => {
            beforeEach(() => {
                entity.add(TestComponent, {});
            });

            it('should add the component to the entity as a camel cased property', () => {
                expect(entity.getOrErr(TestComponent)).toBeDefined();
            });

            it('should include the component in the entity list', () => {
                expect(entity.components.testComponent).toBeTruthy();
            });

            it('should have the correct type of components', () => {
                expect(entity.getOrErr(TestComponent)).toBeInstanceOf(TestComponent);
            });
        });
    });

    describe('remove', () => {
        let entity: Entity;

        beforeEach(() => {
            entity = world.createEntity();
        });

        describe('simple components', () => {
            beforeEach(() => {
                const c = entity.add(TestComponent, {});
                entity.remove(c);
            });

            it('should set the component to undefined', () => {
                expect(entity.get(TestComponent)).toBeUndefined();
            });
        });
    });
});
