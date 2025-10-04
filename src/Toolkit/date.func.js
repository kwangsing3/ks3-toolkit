Date.prototype.convertToDateTime = function () {
  return this.toISOString().slice(0, 19).replace("T", " ");
};
