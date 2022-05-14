import { Component } from '../Component';
import { Engine } from '../Engine';
import { Entity } from '../Entity';

describe('Component', () => {
    let world
    let entity: Entity
    let onDestroyedStub: typeof jest.fn
    let onAttachedStub: typeof jest.fn

    class EmptyComponent extends Component<any> {}

    class TestComponent extends Component<any> {
        onAttached() {
            onAttachedStub();
        }
        onDestroyed() {
            onDestroyedStub();
        }
    }

    class NestedComponent extends Component<any> {
        static properties = {
            name: 'test',
        };
        static allowMultiple = true;
        static keyProperty = 'name';
    }

    class ArrayComponent extends Component<any> {
        static properties = {
            name: 'a',
        };
        static allowMultiple = true;
    }

    beforeEach(() => {
        const engine = new Engine();

        world = engine.createWorld();

        onAttachedStub = jest.fn();
        onDestroyedStub = jest.fn();
        onDestroyedStub = jest.fn();

        engine.registerComponent(EmptyComponent);
        engine.registerComponent(TestComponent);
        engine.registerComponent(NestedComponent);
        engine.registerComponent(ArrayComponent);

        entity = world.createEntity();
    });

    describe('attach', () => {
        let component: Component<any>;

        beforeEach(() => {
            entity.add(TestComponent, {});
            component = entity.get(TestComponent)!;
        });

        it('should call the onAttached handler', () => {
            expect(onAttachedStub).toHaveBeenCalledTimes(1);
            expect(onAttachedStub).toHaveBeenCalledWith();
        });

        it('should set the entity', () => {
            expect(component.getEntity()).toBe(entity);
        });
    });

    describe('destroy', () => {
        let component: Component<any> | undefined;

        beforeEach(() => {
            entity.add(TestComponent, {});
            entity.add(NestedComponent, { name: 'a' });
            entity.add(NestedComponent, { name: 'b' });
            entity.add(ArrayComponent, []);
            entity.add(ArrayComponent, []);
        });

        describe('when destroying a simple component', () => {
            beforeEach(() => {
                component = entity.get(TestComponent);
                component?.destroy();
            });

            it('should remove the component from the entity', () => {
                expect(entity.has(TestComponent)).toBe(false);
            });

            it('should call the "onDestroyed" handler', () => {
                expect(onDestroyedStub).toHaveBeenCalledTimes(1);
                expect(onDestroyedStub).toHaveBeenCalledWith();
            });

            it('should call the "onDestroyed" handler', () => {
                expect(onDestroyedStub).toHaveBeenCalledTimes(1);
                expect(onDestroyedStub).toHaveBeenCalledWith();
            });

            it('should set the component "entity" to null', () => {
                expect(component?.getEntity()).toBeUndefined();
            });
        });
    });
});
