const db_books = require("../../../proxy/db_books");
const hateoas = require("../../../utils/hateoas");

module.exports= async function(req, res){
  const limit = parseInt(req.query.limit) || 2;
  const page = parseInt(req.query.page) || 1;

  const books = await db_books.getAll(limit,page)
  books.forEach(book => {
      book._links = hateoas.generateBookLinks(req,book);
  });

  res.json(books);
}
