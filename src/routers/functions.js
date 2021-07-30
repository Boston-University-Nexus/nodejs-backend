const applyQueryAsFilters = (query, allowed_queries, addOns, contains) => {
  var params = [];
  var str = "";
  addOns = addOns || new Array(allowed_queries.length);

  for (const idx in allowed_queries) {
    if (query[allowed_queries[idx]]) {
      if (allowed_queries[idx].includes("contains")) {
        let value = allowed_queries[idx].replace("_contains", "");
        str += ` AND ${addOns[idx] || ""}${value} LIKE ?`;
        params.push("%" + query[allowed_queries[idx]] + "%");
      } else {
        str += ` AND ${addOns[idx] || ""}${allowed_queries[idx]}=?`;
        params.push(query[allowed_queries[idx]]);
      }
    }
  }

  return [params, str];
};

module.exports = {
  applyQueryAsFilters,
};
