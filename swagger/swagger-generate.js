// ...existing code...
const swaggerUi = require('swagger-ui-express');

function buildOpenApiSpec(bookRoutes, authRoutes, userRoutes) {
    // ...existing code...
    const spec = {
        openapi: '3.0.0',
        info: {
            title: 'HackTonPote API (auto-generated)',
            version: '1.0.0',
            description: 'OpenAPI 3.0 specification - Books, Authentication & Users API',
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
            const derived = route.basePath ? route.basePath : key.replace(/(_create|_update|_delete)$/, '');
            const resourceBase = derived;

            route.versions.forEach(version => {
                // For versioned routes (books)
                if (version.vnumber) {
                    const versionTag = `apiv${version.vnumber.replace(/^v/, '')}`;
                    if (!spec.tags.find(t => t.name === versionTag)) {
                        spec.tags.push({ name: versionTag, description: `API ${version.vnumber}` });
                    }

                    const basePath = `/api/${version.vnumber}/${resourceBase}`;
                    const pathKey = route.params ? `${basePath}/{id}` : basePath;
                    spec.paths[pathKey] = spec.paths[pathKey] || {};

                    const method = route.method.toLowerCase();
                    const operationId = `${version.vnumber}_${key}_${method}`;

                    addOperation(spec.paths[pathKey], method, operationId, route, [versionTag], schemaRef);
                } else {
                    // For non-versioned routes (auth, users)
                    const tagName = resourceType;
                    if (!spec.tags.find(t => t.name === tagName)) {
                        spec.tags.push({ name: tagName, description: `${resourceType.charAt(0).toUpperCase() + resourceType.slice(1)} endpoints` });
                    }

                    const basePath = `/api/${resourceBase}`;
                    const pathKey = route.params ? `${basePath}/{id}` : basePath;
                    spec.paths[pathKey] = spec.paths[pathKey] || {};

                    const method = route.method.toLowerCase();
                    const operationId = `${resourceBase}_${method}`;

                    addOperation(spec.paths[pathKey], method, operationId, route, [tagName], schemaRef);
                }
            });
        }
    }

    function addOperation(pathObj, method, operationId, route, tags, schemaRef) {
        const operation = {
            tags: tags,
            summary: `${route.method} ${Object.keys(pathObj).length > 0 ? '' : 'endpoint'}`,
            operationId,
            responses: {}
        };

        if (route.params) {
            operation.parameters = [{ $ref: '#/components/parameters/IdParam' }];
        }

        // Handle different methods and schemas
        if (method === 'get' && !route.params) {
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

// ...existing code...
module.exports = function(app, limiters) {
    // Import all route factories
    const booksRoutesModule = require('../api/books/routes');
    const authRoutesModule = require('../api/login/routes');
    const userRoutesModule = require('../api/users/routes');

    const createBookRoutes = booksRoutesModule.createBookRoutes || (typeof booksRoutesModule === 'function' ? booksRoutesModule : null);
    const createAuthRoutes = authRoutesModule.createAuthRoutes;
    const createUserRoutes = userRoutesModule.createUserRoutes;

    if (!createBookRoutes || typeof createBookRoutes !== 'function') {
        throw new Error('createBookRoutes factory not found in ../api/books/routes');
    }
    if (!createAuthRoutes || typeof createAuthRoutes !== 'function') {
        throw new Error('createAuthRoutes factory not found in ../api/login/routes');
    }
    if (!createUserRoutes || typeof createUserRoutes !== 'function') {
        throw new Error('createUserRoutes factory not found in ../api/users/routes');
    }

    const bookRoutes = createBookRoutes(limiters);
    const authRoutes = createAuthRoutes(limiters);
    const userRoutes = createUserRoutes(limiters);

    const openApiSpec = buildOpenApiSpec(bookRoutes, authRoutes, userRoutes);

    // mount swagger WITHOUT any limiter so assets (css/js/png) are not rate-limited
    app.use('/api-docs', swaggerUi.serve, swaggerUi.setup(openApiSpec));
};
// ...existing code...
// ...existing code...