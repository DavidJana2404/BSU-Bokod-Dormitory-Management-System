import { queryParams, type RouteQueryOptions, type RouteDefinition, type RouteFormDefinition } from './../../wayfinder'
/**
 * @see routes/web.php:207
 * @route '/debug-inertia'
 */
export const inertia = (options?: RouteQueryOptions): RouteDefinition<'get'> => ({
    url: inertia.url(options),
    method: 'get',
})

inertia.definition = {
    methods: ["get","head"],
    url: '/debug-inertia',
} satisfies RouteDefinition<["get","head"]>

/**
 * @see routes/web.php:207
 * @route '/debug-inertia'
 */
inertia.url = (options?: RouteQueryOptions) => {
    return inertia.definition.url + queryParams(options)
}

/**
 * @see routes/web.php:207
 * @route '/debug-inertia'
 */
inertia.get = (options?: RouteQueryOptions): RouteDefinition<'get'> => ({
    url: inertia.url(options),
    method: 'get',
})
/**
 * @see routes/web.php:207
 * @route '/debug-inertia'
 */
inertia.head = (options?: RouteQueryOptions): RouteDefinition<'head'> => ({
    url: inertia.url(options),
    method: 'head',
})

    /**
 * @see routes/web.php:207
 * @route '/debug-inertia'
 */
    const inertiaForm = (options?: RouteQueryOptions): RouteFormDefinition<'get'> => ({
        action: inertia.url(options),
        method: 'get',
    })

            /**
 * @see routes/web.php:207
 * @route '/debug-inertia'
 */
        inertiaForm.get = (options?: RouteQueryOptions): RouteFormDefinition<'get'> => ({
            action: inertia.url(options),
            method: 'get',
        })
            /**
 * @see routes/web.php:207
 * @route '/debug-inertia'
 */
        inertiaForm.head = (options?: RouteQueryOptions): RouteFormDefinition<'get'> => ({
            action: inertia.url({
                        [options?.mergeQuery ? 'mergeQuery' : 'query']: {
                            _method: 'HEAD',
                            ...(options?.query ?? options?.mergeQuery ?? {}),
                        }
                    }),
            method: 'get',
        })
    
    inertia.form = inertiaForm
const debug = {
    inertia: Object.assign(inertia, inertia),
}

export default debug