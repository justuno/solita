"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.deepLog = exports.deepInspect = void 0;
const util_1 = require("util");
function deepInspect(obj) {
    return (0, util_1.inspect)(obj, { depth: 15, colors: true, getters: true });
}
exports.deepInspect = deepInspect;
function deepLog(obj) {
    console.log(deepInspect(obj));
}
exports.deepLog = deepLog;
//# sourceMappingURL=helpers.js.map