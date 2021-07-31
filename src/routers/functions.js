const applyQueryAsFilters = (query, allowed_queries, page, addOns) => {
  // Get page
  let max_rows = parseInt(process.env.SQL_LIMIT);
  page = page * max_rows || 0;

  var params = [];
  var str = "";
  addOns = addOns || new Array(allowed_queries.length);

  for (const idx in allowed_queries) {
    if (query[allowed_queries[idx]]) {
      if (
        allowed_queries[idx].includes("contains") &&
        query[allowed_queries[idx]] != ""
      ) {
        let value = allowed_queries[idx].replace("_contains", "");
        str += ` AND ${addOns[idx] || ""}${value} LIKE ?`;
        params.push("%" + query[allowed_queries[idx]] + "%");
      } else if (query[allowed_queries[idx]] != "") {
        str += ` AND ${addOns[idx] || ""}${allowed_queries[idx]}=?`;
        params.push(query[allowed_queries[idx]]);
      }
    }
  }

  str += ` LIMIT ?,${max_rows};`;
  params.push([page]);

  return [params, str];
};

const errOrRes = (res, result, errorCode, successCode, errMsg, successMsg) => {
  if (result && (result.affectedRows > 0 || result.length > 0))
    res.status(successCode).send(successMsg);
  else res.status(errorCode).json({ error: errMsg });
};

module.exports = {
  applyQueryAsFilters,
  errOrRes,
};
