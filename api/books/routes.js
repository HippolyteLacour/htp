

const requireWriteAccess = require("../../middleware/middleware");

function createBookRoutes(limiters) {
    return {
        'books': {
            method : 'GET',
            versions : [
                
                {
                    vnumber : 'v1',
                    limiters: limiters.ONE_SEC,
                    routeCall : require ('./v1/get_books')
                },
                {
                    vnumber : 'v2',
                    limiters: limiters.ONE_SEC,
                    routeCall : require ('./v2/get_books')
                }
            ],
        },

        // GET /books/:id
        'book': {
            basePath: 'book',
            method: 'GET',
            versions: [
                {
                    vnumber: 'v1',
                    // limiters: limiters.FIVE_SEC,
                    routeCall: require('./v1/get_book')
                },
                {
                    vnumber: 'v2',
                    // limiters: limiters.FIVE_SEC,
                    routeCall: require('./v2/get_book')
                }
            ]
        },

        // POST /books (protégé)
        'books_create': {
            method: 'POST',
            versions: [
                {
                    vnumber: 'v1',
                    limiters: limiters.FIVE_SEC,
                    routeCall: require('./v1/post_books')
                },
                {
                    vnumber: 'v2',
                    limiters: limiters.FIVE_SEC,
                    routeCall: require('./v2/post_books')
                }
            ]
        },

        // PUT /books/:id (protégé)
        'books_update': {
            method: 'PUT',
            params: true,
            protected: true,
            versions: [
                {
                    vnumber: 'v1',
                    limiters: limiters.FIVE_SEC,
                    routeCall: require('./v1/put_books')
                },
                {
                    vnumber: 'v2',
                    limiters: limiters.FIVE_SEC,
                    routeCall: require('./v2/put_books')
                }
            ]
        },

        // DELETE /books/:id (protégé)
        'books_delete': {
            method: 'DELETE',
            params: true,
            protected: true,
            versions: [
                {
                    vnumber: 'v1',
                    limiters: limiters.FIVE_SEC,
                    routeCall: require('./v1/delete_books')
                },
                {
                    vnumber: 'v2',
                    limiters: limiters.FIVE_SEC,
                    routeCall: require('./v2/delete_books')
                }
            ]
        }
    }
};

function initRoutes(app, limiters) {

    const bookRoutes = createBookRoutes(limiters);

    /** 
    const bookRoutes = {
        'v1' : {
            'books' : {
                method : 'GET',
                limiters: limiters.FIVE_SEC,
                routeCall : require('./v1/get_books'),
            },
        },
        'v2' : {
            'books' : {
                method : 'GET',
                limiters: limiters.FIVE_SEC,
                routeCall : require('./v2/get_books'),
            }
        }
    }

*/


    for (let key in bookRoutes) {
        const route = bookRoutes[key];
        route.versions.forEach(version => {
            const base = "/api/" + version.vnumber + "/" + (route.basePath || "books");
            const path = route.params ? base + "/:id" : base;

            const handlers = [version.limiters];
            if (route.protected) handlers.push(requireWriteAccess);
            handlers.push(version.routeCall);

            app[route.method.toLowerCase()](path, ...handlers);
        });
    }


}

module.exports = { createBookRoutes,initRoutes}