import { queryParams, type RouteQueryOptions, type RouteDefinition, type RouteFormDefinition } from './../../../wayfinder'
/**
 * @see routes/web.php:56
 * @route '/fix-booking-schema'
 */
export const schema = (options?: RouteQueryOptions): RouteDefinition<'get'> => ({
    url: schema.url(options),
    method: 'get',
})

schema.definition = {
    methods: ["get","head"],
    url: '/fix-booking-schema',
} satisfies RouteDefinition<["get","head"]>

/**
 * @see routes/web.php:56
 * @route '/fix-booking-schema'
 */
schema.url = (options?: RouteQueryOptions) => {
    return schema.definition.url + queryParams(options)
}

/**
 * @see routes/web.php:56
 * @route '/fix-booking-schema'
 */
schema.get = (options?: RouteQueryOptions): RouteDefinition<'get'> => ({
    url: schema.url(options),
    method: 'get',
})
/**
 * @see routes/web.php:56
 * @route '/fix-booking-schema'
 */
schema.head = (options?: RouteQueryOptions): RouteDefinition<'head'> => ({
    url: schema.url(options),
    method: 'head',
})

    /**
 * @see routes/web.php:56
 * @route '/fix-booking-schema'
 */
    const schemaForm = (options?: RouteQueryOptions): RouteFormDefinition<'get'> => ({
        action: schema.url(options),
        method: 'get',
    })

            /**
 * @see routes/web.php:56
 * @route '/fix-booking-schema'
 */
        schemaForm.get = (options?: RouteQueryOptions): RouteFormDefinition<'get'> => ({
            action: schema.url(options),
            method: 'get',
        })
            /**
 * @see routes/web.php:56
 * @route '/fix-booking-schema'
 */
        schemaForm.head = (options?: RouteQueryOptions): RouteFormDefinition<'get'> => ({
            action: schema.url({
                        [options?.mergeQuery ? 'mergeQuery' : 'query']: {
                            _method: 'HEAD',
                            ...(options?.query ?? options?.mergeQuery ?? {}),
                        }
                    }),
            method: 'get',
        })
    
    schema.form = schemaForm
const booking = {
    schema: Object.assign(schema, schema),
}

export default booking