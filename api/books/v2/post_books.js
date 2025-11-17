// ...existing code...
const db_books = require("../../../proxy/db_books");
const hateoas = require("../../../utils/hateoas");

module.exports = async function(req, res) {
   const { title, author } = req.body;
   try {
       const book = await db_books.postById(title, author);

       // on suppose que `book` contient un identifiant : on ajoute directement les liens HATEOAS
       const id = book.id || book.insertId || book;
       book._links = hateoas.generateBookLinks(req, 'v1', 'books', 'book', id);

       const response = {
           message: "Livre ajouté avec succès",
           book,
           _links: hateoas.generateBookLinks(req, 'v1', 'books')
       };

       return res.status(201).json(response);
   } catch (error) {
       return res.status(400).json({ message: "Titre et auteur sont requis."});
   }
}
