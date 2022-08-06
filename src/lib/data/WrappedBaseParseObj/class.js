class BaseObjectClass {
  static KEYS = require("./struct").WrappedBaseParseObjStruct;

  /**
   *
   * @param obj{Parse.ParseObject}
   */
  constructor(obj) {
    /**
     * @type {Parse.ParseObject}
     */
    this.linkedObject = obj;
    this.keys = BaseObjectClass.KEYS;
    this.isDirty = false;
  }

  getCreatedAd = () => this.linkedObject.get(this.keys.createdAt);
  getLastModified = () => this.linkedObject.get(this.keys.lastModified);

  _set = (key, value) => {
    this.linkedObject.set(key, value, {});
    return this.setDirty();
  };

  setDirty = () => {
    this.isDirty = true;
    return this;
  };

  save = async (useMaster = true) => {
    await this.linkedObject.save(null, { useMasterKey: useMaster }, undefined);
    return this;
  };

  /**
   *
   * @param master{boolean}
   * @return {Promise<this>}
   */
  destroy = async (master = true) => {
    await this.linkedObject.destroy({ useMasterKey: master });
    return this;
  };
}

module.exports.BaseObjectClass = BaseObjectClass;
