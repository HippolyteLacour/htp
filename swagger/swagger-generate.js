// ...existing code...
const swaggerUi = require('swagger-ui-express');

function buildOpenApiSpec(bookRoutes) {
    // ...existing code...
    const spec = {
        openapi: '3.0.0',
        info: {
            title: 'Books API (auto-generated)',
            version: '1.0.0',
            description: 'OpenAPI 3.0 specification generated from createBookRoutes factory',
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
                        author: { type: 'string', example: 'Auteur' }
                    },
                    required: ['title', 'author']
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

    // iterate routes produced by createBookRoutes
    for (const key in bookRoutes) {
        const route = bookRoutes[key];

        // decide resource segment used in URL
        // allow explicit override by route.basePath, otherwise strip _create/_update/_delete suffix
        const derived = route.basePath ? route.basePath : key.replace(/(_create|_update|_delete)$/, '');
        const resourceBase = derived; // keep singular/plural as defined in factory

        route.versions.forEach(version => {
            const versionTag = `apiv${version.vnumber.replace(/^v/, '')}`;
            if (!spec.tags.find(t => t.name === versionTag)) {
                spec.tags.push({ name: versionTag, description: `API ${version.vnumber}` });
            }

            const basePath = `/api/${version.vnumber}/${resourceBase}`;
            const pathKey = route.params ? `${basePath}/{id}` : basePath;
            spec.paths[pathKey] = spec.paths[pathKey] || {};

            const method = route.method.toLowerCase();
            const operationId = `${version.vnumber}_${key}_${method}`;

            const operation = {
                tags: [versionTag],
                summary: `${route.method} ${pathKey}`,
                operationId,
                responses: {}
            };

            // add path parameter when route.params === true
            if (route.params) {
                operation.parameters = [{ $ref: '#/components/parameters/IdParam' }];
            }

            // fill request/response depending on method
            if (method === 'get' && !route.params) {
                operation.responses['200'] = {
                    description: 'Successful response - list',
                    content: {
                        'application/json': { schema: { type: 'array', items: { $ref: '#/components/schemas/Book' } } }
                    }
                };
            } else if (method === 'get') {
                operation.responses['200'] = {
                    description: 'Successful response - single item',
                    content: { 'application/json': { schema: { $ref: '#/components/schemas/Book' } } }
                };
                operation.responses['404'] = {
                    description: 'Not found',
                    content: { 'application/json': { schema: { $ref: '#/components/schemas/Error' } } }
                };
            } else if (method === 'post') {
                operation.requestBody = {
                    required: true,
                    content: {
                        'application/json': { schema: { $ref: '#/components/schemas/Book' } }
                    }
                };
                operation.responses['201'] = {
                    description: 'Created',
                    content: { 'application/json': { schema: { $ref: '#/components/schemas/Book' } } }
                };
            } else if (method === 'put') {
                operation.requestBody = {
                    required: true,
                    content: {
                        'application/json': { schema: { $ref: '#/components/schemas/Book' } }
                    }
                };
                operation.responses['200'] = {
                    description: 'Updated',
                    content: { 'application/json': { schema: { $ref: '#/components/schemas/Book' } } }
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

            // add security for protected routes
            if (route.protected) {
                operation.security = [{ bearerAuth: [] }];
                operation.responses['401'] = {
                    description: 'Unauthorized',
                    content: { 'application/json': { schema: { $ref: '#/components/schemas/Error' } } }
                };
            }

            spec.paths[pathKey][method] = operation;
        });
    }

    return spec;
}

// ...existing code...
module.exports = function(app, limiters) {
    // reuse factory to keep single source of truth
    const routesModule = require('../api/books/routes');
    const createBookRoutes = routesModule.createBookRoutes || (typeof routesModule === 'function' ? routesModule : null);

    if (!createBookRoutes || typeof createBookRoutes !== 'function') {
        throw new Error('createBookRoutes factory not found in ../api/books/routes');
    }

    const bookRoutes = createBookRoutes(limiters);
    const openApiSpec = buildOpenApiSpec(bookRoutes);

    // mount swagger WITHOUT any limiter so assets (css/js/png) are not rate-limited
    app.use('/api-docs', swaggerUi.serve, swaggerUi.setup(openApiSpec));
};
// ...existing code...
// ...existing code...