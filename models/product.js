function updateProductByID(id, cols) {
  var query = ["UPDATE products"];
  query.push("SET");

  var set = [];
  Object.keys(cols).forEach(function (key, i) {
    set.push(key + " = ($" + (i + 1) + ")");
  });
  query.push(set.join(", "));

  query.push(`WHERE product_id =  '${id}' returning *`);

  return query.join(" ");
}

module.exports = { updateProductByID };
