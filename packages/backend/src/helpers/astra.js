import fs from 'fs';
import lodashGet from 'lodash/get';
import lodashSet from 'lodash/set';

class AstraConfigurationHandler {
  constructor(opts) {
    this.options = opts;
    this.config = [];
    this.cache = {};
    this.envvars = {};
    this.configIndex = {};
    this.defaultStorage = null;
  }

  // all the loading is done synchronously.
  // I might implement async loading for now, but it's going to need workarounds
  // like loading queue, to ensure no race conditions happen, et cetera
  file(filename, asDefault = true) {
    const data = JSON.parse(fs.readFileSync(filename, 'utf-8'));
    const index = this.config.push({ filename, data }) - 1;
    if (asDefault || !this.defaultStorage)
      this.defaultStorage = { index, filename };
    this.cache = {};
    this.configIndex = {};
    return this;
  }

  // here the dot is __
  env(regex = /astra____(.*)/, dotReplacer = /__/) {
    Object.keys(process.env)
      .map(item => {
        const regexMatches = regex.exec(item);
        return regexMatches
          ? {
              orig: item,
              fixed: regexMatches[1].replace(dotReplacer, '.'),
            }
          : null;
      })
      .filter(item => item)
      .forEach(
        ({ orig, fixed }) =>
          (this.envvars[fixed] = JSON.parse(
            AstraConfigurationHandler._normalize(process.env[orig])
          ))
      );

    return this;
  }

  static _normalize(value) {
    if (
      value === 'true' ||
      value === 'false' ||
      value[0] === '[' ||
      value[0] === '{'
    )
      return value;
    return `"${value}"`;
  }

  get(key, defaultValue) {
    const value = this.envvars[key] || this.cache[key];
    if (typeof value !== 'undefined') return value;
    for (let i = this.config.length - 1; i >= 0; i -= 1) {
      const configData = this.config[i];
      const tValue = lodashGet(configData.data, key);
      if (typeof tValue !== 'undefined') {
        this._cacheKeyData(key, i, configData.filename, tValue);
        return tValue;
      }
    }
    return defaultValue;
  }

  set(key, value, toDefaultStore = false) {
    if (this.envvars[key]) {
      this.envvars[key] = value;
      return this;
    }
    const fileData = toDefaultStore
      ? this.defaultStorage
      : this._findExpectedFile(key.split('.'));
    lodashSet(this.config[fileData.index].data, key, value);
    this._cacheKeyData(key, fileData.index, fileData.filename, value);
    return this;
  }

  _findExpectedFile(keyAsArray) {
    keyAsArray.pop();
    if (keyAsArray.length === 0) return this.defaultStorage;

    const joinedKey = keyAsArray.join('.');
    const configIndexData = this.configIndex[joinedKey];

    if (configIndexData) return configIndexData;
    for (let i = this.config.length - 1; i >= 0; i -= 1) {
      const configData = this.config[i];
      const data = lodashGet(configData, joinedKey);
      if (typeof data !== 'undefined')
        return this._cacheKeyData(joinedKey, i, configData.filename, data);
    }
    return this._findExpectedFile(keyAsArray);
  }

  _cacheKeyData(key, index, filename, data) {
    const indexData = { index, filename };
    this.configIndex[key] = indexData;
    this.cache[key] = data;
    return indexData;
  }

  has(key) {
    return typeof this.get(key) !== 'undefined';
  }

  async save() {
    return Promise.all(
      this.config.map(
        ({ filename, data }) =>
          new Promise((resolve, reject) => {
            fs.writeFile(filename, JSON.stringify(data, null, 2), err => {
              if (err) return reject(err);
              return resolve();
            });
          })
      )
    );
  }

  // eslint-disable-next-line
  separate() {
    return AstraConfigurationHandler;
  }
}

export default new AstraConfigurationHandler();
