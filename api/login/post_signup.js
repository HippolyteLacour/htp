// ...existing code...
const db_users = require("../../../proxy/db_users");
const hateoas = require("../../../utils/hateoas");

module.exports = async function(req, res) {
   const { username, password } = req.body;
   try {
       const user = await db_users.postById(username, password);
       const id = user.id || user.insertId || user;
       user._links = hateoas.generateAuthLinks(req);

       const response = {
           message: "User créé avec succès",
           user,
           _links: hateoas.generateAuthLinks(req)
       };

       return res.status(201).json(response);
   } catch (error) {
       return res.status(400).json({ message: "l'identifiant et le mot de passe sont requis."});
   }
}
