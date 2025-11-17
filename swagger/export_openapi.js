const fs = require('fs');
const path = require('path');
const yaml = require('js-yaml');

// récupère toutes les factories de routes
const booksRoutesModule = require('../api/books/routes');
const authRoutesModule = require('../api/login/routes');
const userRoutesModule = require('../api/users/routes');

const createBookRoutes = booksRoutesModule.createBookRoutes || (typeof booksRoutesModule === 'function' ? booksRoutesModule : null);
const createAuthRoutes = authRoutesModule.createAuthRoutes;
const createUserRoutes = userRoutesModule.createUserRoutes;

if (!createBookRoutes || typeof createBookRoutes !== 'function') {
    console.error('createBookRoutes not found in ../api/books/routes');
    process.exit(1);
}
if (!createAuthRoutes || typeof createAuthRoutes !== 'function') {
    console.error('createAuthRoutes not found in ../api/login/routes');
    process.exit(1);
}
if (!createUserRoutes || typeof createUserRoutes !== 'function') {
    console.error('createUserRoutes not found in ../api/users/routes');
    process.exit(1);
}

// dummy limiters suffisants pour la génération (les valeurs ne sont pas utilisées dans le spec)
const dummyLimiters = {
    ONE_SEC: null,
    FIVE_SEC: null,
    UNLIMITED_SEC: null,
    DOCS: null,
    API_DOCS: null
};

const bookRoutes = createBookRoutes(dummyLimiters);
const authRoutes = createAuthRoutes(dummyLimiters);
const userRoutes = createUserRoutes(dummyLimiters);

// build openapi spec (copié de swagger-generate logic)
function buildOpenApiSpec(bookRoutes, authRoutes, userRoutes) {
    const spec = {
        openapi: '3.0.0',
        info: {
            title: process.env.OPENAPI_TITLE || 'HackTonPote API (auto-generated)',
            version: process.env.OPENAPI_VERSION || '1.0.0',
            description: process.env.OPENAPI_DESC || 'OpenAPI 3.0 specification - Books, Authentication & Users API',
            contact: { name: 'Rogliano Hina' }
        },
        servers: [
            { url: process.env.API_URL || 'http://localhost:3000', description: 'Local server' }
        ],
        components: {
            securitySchemes: {
                bearerAuth: { type: 'http', scheme: 'bearer', bearerFormat: 'JWT' }
            },
            parameters: {
                IdParam: {
                    name: 'id',
                    in: 'path',
                    required: true,
                    schema: { type: 'integer' },
                    description: 'Resource identifier'
                }
            },
            schemas: {
                Book: {
                    type: 'object',
                    properties: {
                        id: { type: 'integer', example: 1 },
                        title: { type: 'string', example: 'Le titre' },
                        author: { type: 'string', example: 'Auteur' },
                        _links: { type: 'object', description: 'HATEOAS links' }
                    },
                    required: ['title', 'author']
                },
                User: {
                    type: 'object',
                    properties: {
                        id: { type: 'integer', example: 1 },
                        username: { type: 'string', example: 'john_doe' },
                        password: { type: 'string', example: 'secret123' },
                        _links: { type: 'object', description: 'HATEOAS links' }
                    },
                    required: ['username', 'password']
                },
                AuthRequest: {
                    type: 'object',
                    properties: {
                        username: { type: 'string', example: 'john_doe' },
                        password: { type: 'string', example: 'secret123' }
                    },
                    required: ['username', 'password']
                },
                AuthResponse: {
                    type: 'object',
                    properties: {
                        message: { type: 'string' },
                        user: { $ref: '#/components/schemas/User' },
                        _links: { type: 'object', description: 'HATEOAS links' }
                    }
                },
                Error: {
                    type: 'object',
                    properties: {
                        error: { type: 'string' },
                        message: { type: 'string' }
                    }
                }
            }
        },
        tags: [],
        paths: {}
    };

    // Helper function to process routes
    function processRoutes(routes, resourceType, schemaRef) {
        for (const key in routes) {
            const route = routes[key];
            // attach metadata so addOperation can make special-case decisions
            route._routeKey = key;
            route._resourceType = resourceType;
            const derived = route.basePath ? route.basePath : key.replace(/(_create|_update|_delete)$/, '');
            const resourceBase = derived;

            route.versions.forEach(version => {
                // For versioned routes (books)
                if (version.vnumber) {
                    // Tag name for books should be 'Books V1', 'Books V2', etc.
                    const versionTag = `Books ${version.vnumber.toUpperCase()}`;
                    if (!spec.tags.find(t => t.name === versionTag)) {
                        spec.tags.push({ name: versionTag, description: `Books ${version.vnumber.toUpperCase()}` });
                    }

                    const basePath = `/api/${version.vnumber}/${resourceBase}`;
                    const paramsFlag = !!route.params;
                    const pathKey = paramsFlag ? `${basePath}/{id}` : basePath;
                    spec.paths[pathKey] = spec.paths[pathKey] || {};

                    const method = route.method.toLowerCase();
                    const operationId = `${version.vnumber}_${key}_${method}`;

                    addOperation(spec.paths[pathKey], method, operationId, route, [versionTag], schemaRef, paramsFlag);
                } else {
                    // For non-versioned routes (auth, users)
                    const tagName = resourceType;
                    if (!spec.tags.find(t => t.name === tagName)) {
                        spec.tags.push({ name: tagName, description: `${resourceType.charAt(0).toUpperCase() + resourceType.slice(1)} endpoints` });
                    }

                    // Determine resource base - force plural 'users' for the collection
                    const resourceBaseName = (resourceType === 'users' && key === 'users') ? 'users' : resourceBase;
                    const basePath = `/api/${resourceBaseName}`;
                    // For the users collection (key 'users') we want the collection path (no {id})
                    const paramsFlag = (resourceType === 'users' && key === 'users') ? false : !!route.params;
                    const pathKey = paramsFlag ? `${basePath}/{id}` : basePath;
                    spec.paths[pathKey] = spec.paths[pathKey] || {};

                    const method = route.method.toLowerCase();
                    // Build more explicit operationId for auth and users routes
                    let operationId;
                    if (resourceType === 'authentication') {
                        // e.g. post_signin, post_signup
                        operationId = `${method}_${route.basePath || resourceBase}`;
                    } else if (resourceType === 'users') {
                        // For users: collection -> get_users, single -> getuser (no underscore)
                        if (key === 'user' && method === 'get') {
                            operationId = 'getuser';
                        } else {
                            operationId = `${method}_${key}`;
                        }
                    } else {
                        operationId = `${resourceBase}_${method}`;
                    }

                    addOperation(spec.paths[pathKey], method, operationId, route, [tagName], schemaRef, paramsFlag);
                }
            });
        }
    }

    function addOperation(pathObj, method, operationId, route, tags, schemaRef, hasParams) {
        const operation = {
            tags: tags,
            summary: `${route.method} endpoint`,
            operationId,
            responses: {}
        };

        // Special-case description for GET single-user: only user with id=1 can view other users
        try {
            if (route && route._resourceType === 'users' && route._routeKey === 'user' && method === 'get') {
                operation.description = 'Access control: only the user with id=1 can view other users. Other users can only view their own profile.';
            }
        } catch (e) {}

        // use hasParams (passed by caller) instead of route.params
        if (hasParams) {
            operation.parameters = [{ $ref: '#/components/parameters/IdParam' }];
        }

        // Special-case: for the single user GET (key 'user') support an optional
        // query parameter 'idUser' so requests like /api/user/1?idUser=1 are valid
        try {
            if (route && route._resourceType === 'users' && route._routeKey === 'user' && method === 'get') {
                operation.parameters = operation.parameters || [];
                operation.parameters.push({
                    name: 'idUser',
                    in: 'query',
                    required: false,
                    schema: { type: 'integer' },
                    description: 'Optional duplicate identifier as query parameter'
                });
            }
        } catch (e) {
            // defensive: skip if metadata missing
        }

        // Handle different methods and schemas
        if (method === 'get' && !hasParams) {
            operation.responses['200'] = {
                description: 'Liste des ressources',
                content: {
                    'application/json': { schema: { type: 'array', items: { $ref: schemaRef } } }
                }
            };
        } else if (method === 'get') {
            operation.responses['200'] = {
                description: 'Ressource trouvée',
                content: { 'application/json': { schema: { $ref: schemaRef } } }
            };
            operation.responses['404'] = {
                description: 'Not found',
                content: { 'application/json': { schema: { $ref: '#/components/schemas/Error' } } }
            };
        } else if (method === 'post') {
            // Special handling for auth endpoints
            if (schemaRef === '#/components/schemas/AuthResponse') {
                operation.requestBody = {
                    required: true,
                    content: {
                        'application/json': { schema: { $ref: '#/components/schemas/AuthRequest' } }
                    }
                };
                operation.responses['201'] = {
                    description: 'Authentification réussie',
                    content: { 'application/json': { schema: { $ref: schemaRef } } }
                };
                operation.responses['400'] = {
                    description: 'Bad request',
                    content: { 'application/json': { schema: { $ref: '#/components/schemas/Error' } } }
                };
            } else {
                operation.requestBody = {
                    required: true,
                    content: {
                        'application/json': { schema: { $ref: schemaRef } }
                    }
                };
                operation.responses['201'] = {
                    description: 'Created',
                    content: { 'application/json': { schema: { $ref: schemaRef } } }
                };
            }
        } else if (method === 'put') {
            operation.requestBody = {
                required: true,
                content: {
                    'application/json': { schema: { $ref: schemaRef } }
                }
            };
            operation.responses['200'] = {
                description: 'Updated',
                content: { 'application/json': { schema: { $ref: schemaRef } } }
            };
            operation.responses['404'] = {
                description: 'Not found',
                content: { 'application/json': { schema: { $ref: '#/components/schemas/Error' } } }
            };
        } else if (method === 'delete') {
            operation.responses['204'] = { description: 'Deleted' };
            operation.responses['404'] = {
                description: 'Not found',
                content: { 'application/json': { schema: { $ref: '#/components/schemas/Error' } } }
            };
        }

        if (route.protected) {
            operation.security = [{ bearerAuth: [] }];
            operation.responses['401'] = {
                description: 'Unauthorized',
                content: { 'application/json': { schema: { $ref: '#/components/schemas/Error' } } }
            };
        }

        pathObj[method] = operation;
    }

    // Process all route types
    processRoutes(bookRoutes, 'books', '#/components/schemas/Book');
    processRoutes(authRoutes, 'authentication', '#/components/schemas/AuthResponse');
    processRoutes(userRoutes, 'users', '#/components/schemas/User');

    return spec;
}

const openApiSpec = buildOpenApiSpec(bookRoutes, authRoutes, userRoutes);
const yamlText = yaml.dump(openApiSpec, { noRefs: true, lineWidth: 120 });

// output path
const outDir = path.join(__dirname);
const outFile = path.join(outDir, 'openapi.yaml');

fs.writeFileSync(outFile, yamlText, 'utf8');
console.log(`openapi.yaml generated -> ${outFile}`);