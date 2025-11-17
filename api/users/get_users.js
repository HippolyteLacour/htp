const db_users = require("../../../mockDB/users");
const hateoas = require("../../../utils/hateoas");

module.exports= async function(req, res){
  const limit = parseInt(req.query.limit) || 2;
  const page = parseInt(req.query.page) || 1;

  const users = await db_users.getAll(limit,page)
  users.forEach(user => {
      user._links = hateoas.generateUsersLinks(req);
  });

  res.json(users);
}
