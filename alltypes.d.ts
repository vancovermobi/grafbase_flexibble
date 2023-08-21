declare module "cookie" {
  export function parse(str, options) {
    if (typeof str !== "string") {
      throw new TypeError("argument str must be a string");
    }

    var obj = {};
    var opt = options || {};
    var dec = opt.decode || decode;

    var index = 0;
    while (index < str.length) {
      var eqIdx = str.indexOf("=", index);

      // no more cookie pairs
      if (eqIdx === -1) {
        break;
      }

      var endIdx = str.indexOf(";", index);

      if (endIdx === -1) {
        endIdx = str.length;
      } else if (endIdx < eqIdx) {
        // backtrack on prior semicolon
        index = str.lastIndexOf(";", eqIdx - 1) + 1;
        continue;
      }

      var key = str.slice(index, eqIdx).trim();

      // only assign once
      if (undefined === obj[key]) {
        var val = str.slice(eqIdx + 1, endIdx).trim();

        // quoted values
        if (val.charCodeAt(0) === 0x22) {
          val = val.slice(1, -1);
        }

        obj[key] = tryDecode(val, dec);
      }

      index = endIdx + 1;
    }

    return obj;
  }
}
