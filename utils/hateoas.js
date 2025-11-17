// ...existing code...
/**
 * Utilitaires pour générer les liens HATEOAS (Hypermedia As The Engine Of Application State)
 */

/**
 * Génère l'URL de base à partir de la requête
 * @param {Object} req - Objet requête Express
 * @returns {string} URL de base (ex: http://localhost:3000)
 */
function getBaseUrl(req) {
  return `${req.protocol}://${req.get('host')}`;
}

/**
 * Génère les liens HATEOAS pour une ressource livre
 * @param {Object} req - Objet requête Express
 * @param {Object} book - Objet livre (doit contenir .id)
 * @returns {Object} Objet contenant les liens HATEOAS
 */
function generateBookLinks(req, book) {
  const baseUrl = getBaseUrl(req);
  // Extraire la version du chemin de la requête (ex: /api/v2/books)
  const versionMatch = req.path.match(/\/(v\d+)\//);
  const version = versionMatch ? versionMatch[1] : 'v1';

  return {
    self: {
      href: `${baseUrl}/api/${version}/books/${book.id}`,
      method: 'GET',
      description: 'Récupérer ce livre'
    },
    update: {
      href: `${baseUrl}/api/${version}/books/${book.id}`,
      method: 'PUT',
      description: 'Mettre à jour ce livre'
    },
    delete: {
      href: `${baseUrl}/api/${version}/books/${book.id}`,
      method: 'DELETE',
      description: 'Supprimer ce livre'
    },
    collection: {
      href: `${baseUrl}/api/${version}/books`,
      method: 'GET',
      description: 'Récupérer tous les livres'
    }
  };
}

/**
 * Génère les liens HATEOAS pour la collection de livres
 * @param {Object} req - Objet requête Express
 * @param {number} page - Numéro de page actuelle
 * @param {number} totalPages - Nombre total de pages
 * @param {number} limit - Limite d'éléments par page
 * @returns {Object} Objet contenant les liens HATEOAS
 */
function generateCollectionLinks(req, page = 1, totalPages = 1, limit = 10) {
  const baseUrl = getBaseUrl(req);
  // Extraire la version du chemin de la requête
  const versionMatch = req.path.match(/\/(v\d+)\//);
  const version = versionMatch ? versionMatch[1] : 'v1';
  const basePath = `${baseUrl}/api/${version}/books`;

  const links = {
    self: {
      href: `${basePath}?page=${page}&limit=${limit}`,
      method: 'GET',
      description: 'Page actuelle'
    },
    create: {
      href: `${basePath}`,
      method: 'POST',
      description: 'Créer un nouveau livre'
    }
  };

  if (page > 1) {
    links.first = {
      href: `${basePath}?page=1&limit=${limit}`,
      method: 'GET',
      description: 'Première page'
    };
    links.prev = {
      href: `${basePath}?page=${page - 1}&limit=${limit}`,
      method: 'GET',
      description: 'Page précédente'
    };
  }

  if (page < totalPages) {
    links.next = {
      href: `${basePath}?page=${page + 1}&limit=${limit}`,
      method: 'GET',
      description: 'Page suivante'
    };
    links.last = {
      href: `${basePath}?page=${totalPages}&limit=${limit}`,
      method: 'GET',
      description: 'Dernière page'
    };
  }

  return links;
}

/**
 * Génère les liens HATEOAS pour une ressource utilisateur
 * @param {Object} req - Objet requête Express
 * @param {Object} user - Objet utilisateur (doit contenir .id)
 * @returns {Object} Objet contenant les liens HATEOAS
 */
function generateUserLinks(req, user) {
  const baseUrl = getBaseUrl(req);

  return {
    self: {
      href: `${baseUrl}/api/user/${user.id}`,
      method: 'GET',
      description: 'Récupérer cet utilisateur'
    },
    collection: {
      href: `${baseUrl}/api/users`,
      method: 'GET',
      description: 'Récupérer tous les utilisateurs'
    }
  };
}

/**
 * Génère les liens HATEOAS pour l'authentification
 * @param {Object} req - Objet requête Express
 * @returns {Object} Objet contenant les liens HATEOAS
 */
function generateAuthLinks(req) {
  const baseUrl = getBaseUrl(req);

  return {
    signin: {
      href: `${baseUrl}/api/signin`,
      method: 'POST',
      description: 'Se connecter'
    },
    signup: {
      href: `${baseUrl}/api/signup`,
      method: 'POST',
      description: 'Créer un compte'
    },
    users: {
      href: `${baseUrl}/api/users`,
      method: 'GET',
      description: 'Récupérer tous les utilisateurs'
    }
  };
}

/**
 * Génère les liens HATEOAS pour la collection d'utilisateurs
 * @param {Object} req - Objet requête Express
 * @returns {Object} Objet contenant les liens HATEOAS
 */
function generateUsersLinks(req) {
  const baseUrl = getBaseUrl(req);

  return {
    self: {
      href: `${baseUrl}/api/users`,
      method: 'GET',
      description: 'Collection des utilisateurs'
    },
    auth: {
      signin: {
        href: `${baseUrl}/api/signin`,
        method: 'POST',
        description: 'Se connecter'
      },
      signup: {
        href: `${baseUrl}/api/signup`,
        method: 'POST',
        description: 'Créer un compte'
      }
    }
  };
}

/**
 * Génère les liens racine de l'API pour l'auto-discovery
 * @param {Object} req - Objet requête Express
 * @returns {Object} Objet contenant tous les liens disponibles
 */
function generateApiRootLinks(req) {
  const baseUrl = getBaseUrl(req);

  return {
    self: {
      href: `${baseUrl}/api`,
      method: 'GET',
      description: "Point d'entrée de l'API"
    },
    documentation: {
      href: `${baseUrl}/api-docs`,
      method: 'GET',
      description: "Documentation Swagger de l'API"
    },
    auth: {
      signin: {
        href: `${baseUrl}/api/signin`,
        method: 'POST',
        description: 'Se connecter'
      },
      signup: {
        href: `${baseUrl}/api/signup`,
        method: 'POST',
        description: 'Créer un compte'
      }
    },
    users: {
      collection: {
        href: `${baseUrl}/api/users`,
        method: 'GET',
        description: 'Collection des utilisateurs'
      }
    },
    books: {
      v1: {
        collection: {
          href: `${baseUrl}/api/v1/books`,
          method: 'GET',
          description: 'Collection de livres (version 1)'
        },
        create: {
          href: `${baseUrl}/api/v1/books`,
          method: 'POST',
          description: 'Créer un nouveau livre (version 1)'
        }
      },
      v2: {
        collection: {
          href: `${baseUrl}/api/v2/books`,
          method: 'GET',
          description: 'Collection de livres avec pagination (version 2)'
        },
        create: {
          href: `${baseUrl}/api/v2/books`,
          method: 'POST',
          description: 'Créer un nouveau livre (version 2)'
        }
      }
    }
  };
}

/**
 * Ajoute les liens HATEOAS à un objet livre
 * @param {Object} req - Objet requête Express
 * @param {Object} book - Objet livre
 * @returns {Object} Livre avec les liens HATEOAS
 */
function addLinksToBook(req, book) {
  return {
    ...book,
    _links: generateBookLinks(req, book)
  };
}

/**
 * Ajoute les liens HATEOAS à une collection de livres
 * @param {Object} req - Objet requête Express
 * @param {Array} books - Tableau de livres
 * @returns {Array} Livres avec les liens HATEOAS
 */
function addLinksToBooks(req, books) {
  return books.map(book => addLinksToBook(req, book));
}

module.exports = {
  getBaseUrl,
  generateBookLinks,
  generateCollectionLinks,
  generateApiRootLinks,
  addLinksToBook,
  addLinksToBooks,
  generateUserLinks,
  generateAuthLinks,
  generateUsersLinks
};
// ...existing code...