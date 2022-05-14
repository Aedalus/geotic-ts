import { Component } from '../Component';
import { ComponentRegistry } from '../ComponentRegistry';

class EmptyComponent extends Component<any> {}

describe('ComponentRegistry', () => {
    let registry: ComponentRegistry;

    beforeEach(() => {
        registry = new ComponentRegistry();
    });

    describe('get', () => {
        const expectedKey = 'emptyComponent';

        beforeEach(() => {
            registry.register(EmptyComponent);
        });

        it('should assign a _ckey', () => {
            expect(EmptyComponent.prototype._ckey).toBe(expectedKey);
        });

        it('should return the component by key', () => {
            expect(registry.get(expectedKey)).toBe(EmptyComponent);
        });
    });
});
