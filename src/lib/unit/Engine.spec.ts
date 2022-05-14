import { Engine } from '../Engine';
import { World } from '../World';

describe('Engine', () => {
    let engine: Engine;

    beforeEach(() => {
        engine = new Engine();
    });

    describe('createWorld', () => {
        let result : World;

        beforeEach(() => {
            result = engine.createWorld();
        });

        it('should create a World instance', () => {
            expect(result).toBeInstanceOf(World);
        });
    });
});
