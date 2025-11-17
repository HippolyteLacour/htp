const db_users = require("../../proxy/db_users");
const hateoas = require("../../utils/hateoas");

module.exports= async function(req, res){
  const limit = parseInt(req.query.limit) || 2;
  const page = parseInt(req.query.page) || 1;

  const users = await db_users.getAll(limit, page);
  users.forEach(user => {
      user._links = hateoas.generateUserLinks(req, user);
  });

  res.json(users);
}
