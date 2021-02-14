import { EJSON } from 'meteor/ejson'

// Make all typed arrays EJSON compatible.
[
  Int8Array,
  Uint8ClampedArray,
  Int16Array,
  Uint16Array,
  Int32Array,
  Uint32Array,
  Float32Array,
  Float64Array,
].forEach((TypedArray) => {
  TypedArray.prototype.toJSONValue = function () {
    return EJSON.toJSONValue(new Uint8Array(this.buffer));
  }
  TypedArray.prototype.typeName = function () {
    return TypedArray.name;
  }
  EJSON.addType(TypedArray.name, (json) => {
    return new TypedArray(EJSON.fromJSONValue(json).buffer);
  });
})