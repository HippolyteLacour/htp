const db_users = require("../../proxy/db_users");
const hateoas = require("../../utils/hateoas");

module.exports= async function(req, res){
 
    const idUser = parseInt(req.query.idUser);

  
  try {
        const users = await db_users.getAll(idUser);
        users.forEach(user => {
            user._links = hateoas.generateUserLinks(req, user);
        });

        res.json(users);
      } catch (error) {
          return res.status(400).json({ message: error });
      }

}
