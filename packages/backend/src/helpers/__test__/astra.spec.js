/* eslint-disable no-undef */
jest.mock('fs', () => {
  const fs = require.requireActual('fs');
  let fsWriteResults = {};
  return {
    ...fs,
    writeFile: (file, contents, callback) => {
      fsWriteResults[file] = contents;
      callback();
    },
    getFsWriteResults: () => fsWriteResults,
    resetFs: () => {
      fsWriteResults = {};
    },
  };
});

const path = require('path');
const astra = require('../astra').default;

describe('Astra', () => {
  let testAstra;
  const config1 = path.join(__dirname, 'astra', 'config1.json');
  const config2 = path.join(__dirname, 'astra', 'config2.json');

  beforeEach(() => {
    testAstra = new (astra.separate())();
  });

  describe('separate()', () => {
    test('returns class itself', () => {
      expect(astra instanceof astra.separate()).toBe(true);
    });
  });

  describe('file()', () => {
    beforeEach(() => {
      testAstra = new (astra.separate())();
    });

    test('loads JSON file', () => {
      testAstra.file(config1);
      expect(testAstra.config).toEqual([
        {
          filename: config1,
          data: { test: true, level: { two: { value: 'string' } } },
        },
      ]);
    });

    test('loads many JSON files', () => {
      testAstra.file(config1);
      testAstra.file(config2);
      expect(testAstra.config).toEqual([
        {
          filename: config1,
          data: { test: true, level: { two: { value: 'string' } } },
        },
        { filename: config2, data: { test: 'string', test2: 'string3' } },
      ]);
    });

    test('sets last JSON file as default', () => {
      testAstra.file(config1);
      testAstra.file(config2);
      expect(testAstra.defaultStorage).toEqual({ filename: config2, index: 1 });
    });

    test('purges cache when loading config', () => {
      testAstra.cache = { test: true };
      testAstra.file(config1);
      expect(testAstra.cache).toEqual({});
    });

    test('purges index when loading config', () => {
      testAstra.configIndex = { test: true };
      testAstra.file(config1);
      expect(testAstra.configIndex).toEqual({});
    });
  });

  describe('env()', () => {
    beforeEach(() => {
      testAstra = new (astra.separate())();
    });

    test('loads env variables into astra', () => {
      global.process.env.astra____test__value = true;
      testAstra.env();
      expect(testAstra.envvars).toEqual({ 'test.value': true });
    });
  });

  describe('has()', () => {
    beforeEach(() => {
      testAstra = new (astra.separate())();
    });

    test('returns true if key is present', () => {
      global.process.env.astra____test__value = true;
      testAstra.env();
      expect(testAstra.has('test.value')).toBe(true);
    });

    test('returns false if key is not present', () => {
      expect(testAstra.has('test.value')).toBe(false);
    });
  });

  describe('get()', () => {
    beforeEach(() => {
      testAstra = new (astra.separate())();
    });

    test('returns config value if it is present', () => {
      testAstra.file(config1);
      expect(testAstra.get('test')).toBe(true);
    });

    test('returns latest loaded config value if it is present and many files were loaded', () => {
      testAstra.file(config1);
      testAstra.file(config2);
      expect(testAstra.get('test')).toBe('string');
    });

    test('returns environment variable if it overrides settings files', () => {
      global.process.env.astra____test = 'string2';
      testAstra.file(config1);
      testAstra.env();
      expect(testAstra.get('test')).toBe('string2');
    });

    test('caches values that have already been queried', () => {
      testAstra.file(config1);
      testAstra.get('test');
      expect(testAstra.cache).toEqual({ test: true });
    });

    test('updates index for the values that have already been queried', () => {
      testAstra.file(config1);
      testAstra.get('test');
      expect(testAstra.configIndex.test).toEqual({
        filename: config1,
        index: 0,
      });
    });

    test('searches all the files until a value is found', () => {
      testAstra.file(config1);
      testAstra.file(config2);
      expect(testAstra.get('test2')).toBe('string3');
    });

    test('gets a value of any deepness', () => {
      testAstra.file(config1);
      expect(testAstra.get('level.two.value')).toBe('string');
    });

    test('returns default value if no value is found', () => {
      testAstra.file(config1);
      expect(testAstra.get('kek', 'mek')).toBe('mek');
    });
  });

  describe('set()', () => {
    beforeEach(() => {
      testAstra = new (astra.separate())();
    });

    test('sets the config value', () => {
      testAstra.file(config1);
      testAstra.set('key.key.key', 'value');
      expect(testAstra.get('key.key.key')).toBe('value');
    });
  });

  describe('save()', () => {
    // eslint-disable-next-line
    const fs = require('fs');

    beforeEach(() => {
      testAstra = new (astra.separate())();
      fs.resetFs();
    });

    test('saves configuration file', async () => {
      testAstra.file(config1);
      testAstra.set('key.key.key', 'value');
      await testAstra.save();
      expect(fs.getFsWriteResults()).toEqual({
        [config1]: JSON.stringify(
          {
            test: true,
            level: { two: { value: 'string' } },
            key: { key: { key: 'value' } },
          },
          null,
          2
        ),
      });
    });

    test('does not save env variables to configuration file', async () => {
      global.process.env.astra____test = 'string2';
      testAstra.file(config1).env();
      testAstra.set('test', 'string3');
      await testAstra.save();
      expect(fs.getFsWriteResults()).toEqual({
        [config1]: JSON.stringify(
          {
            test: true,
            level: { two: { value: 'string' } },
          },
          null,
          2
        ),
      });
    });
  });
});
