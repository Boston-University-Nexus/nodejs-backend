const applyQueryAsFilters = (query, allowed_queries) => {
  var params = [];
  var str = "";

  for (const allowed of allowed_queries) {
    if (query[allowed]) {
      str += ` AND ${allowed}=?`;
      params.push(query[allowed]);
    }
  }

  return [params, str];
};

module.exports = {
  applyQueryAsFilters,
};
