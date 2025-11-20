import { queryParams, type RouteQueryOptions, type RouteDefinition, type RouteFormDefinition, applyUrlDefaults } from './../../../../wayfinder'
/**
* @see \App\Http\Controllers\PaymentRecordsController::index
 * @see app/Http/Controllers/PaymentRecordsController.php:16
 * @route '/cashier/records'
 */
export const index = (options?: RouteQueryOptions): RouteDefinition<'get'> => ({
    url: index.url(options),
    method: 'get',
})

index.definition = {
    methods: ["get","head"],
    url: '/cashier/records',
} satisfies RouteDefinition<["get","head"]>

/**
* @see \App\Http\Controllers\PaymentRecordsController::index
 * @see app/Http/Controllers/PaymentRecordsController.php:16
 * @route '/cashier/records'
 */
index.url = (options?: RouteQueryOptions) => {
    return index.definition.url + queryParams(options)
}

/**
* @see \App\Http\Controllers\PaymentRecordsController::index
 * @see app/Http/Controllers/PaymentRecordsController.php:16
 * @route '/cashier/records'
 */
index.get = (options?: RouteQueryOptions): RouteDefinition<'get'> => ({
    url: index.url(options),
    method: 'get',
})
/**
* @see \App\Http\Controllers\PaymentRecordsController::index
 * @see app/Http/Controllers/PaymentRecordsController.php:16
 * @route '/cashier/records'
 */
index.head = (options?: RouteQueryOptions): RouteDefinition<'head'> => ({
    url: index.url(options),
    method: 'head',
})

    /**
* @see \App\Http\Controllers\PaymentRecordsController::index
 * @see app/Http/Controllers/PaymentRecordsController.php:16
 * @route '/cashier/records'
 */
    const indexForm = (options?: RouteQueryOptions): RouteFormDefinition<'get'> => ({
        action: index.url(options),
        method: 'get',
    })

            /**
* @see \App\Http\Controllers\PaymentRecordsController::index
 * @see app/Http/Controllers/PaymentRecordsController.php:16
 * @route '/cashier/records'
 */
        indexForm.get = (options?: RouteQueryOptions): RouteFormDefinition<'get'> => ({
            action: index.url(options),
            method: 'get',
        })
            /**
* @see \App\Http\Controllers\PaymentRecordsController::index
 * @see app/Http/Controllers/PaymentRecordsController.php:16
 * @route '/cashier/records'
 */
        indexForm.head = (options?: RouteQueryOptions): RouteFormDefinition<'get'> => ({
            action: index.url({
                        [options?.mergeQuery ? 'mergeQuery' : 'query']: {
                            _method: 'HEAD',
                            ...(options?.query ?? options?.mergeQuery ?? {}),
                        }
                    }),
            method: 'get',
        })
    
    index.form = indexForm
/**
* @see \App\Http\Controllers\PaymentRecordsController::archive
 * @see app/Http/Controllers/PaymentRecordsController.php:70
 * @route '/cashier/records/{record}/archive'
 */
export const archive = (args: { record: string | number } | [record: string | number ] | string | number, options?: RouteQueryOptions): RouteDefinition<'post'> => ({
    url: archive.url(args, options),
    method: 'post',
})

archive.definition = {
    methods: ["post"],
    url: '/cashier/records/{record}/archive',
} satisfies RouteDefinition<["post"]>

/**
* @see \App\Http\Controllers\PaymentRecordsController::archive
 * @see app/Http/Controllers/PaymentRecordsController.php:70
 * @route '/cashier/records/{record}/archive'
 */
archive.url = (args: { record: string | number } | [record: string | number ] | string | number, options?: RouteQueryOptions) => {
    if (typeof args === 'string' || typeof args === 'number') {
        args = { record: args }
    }

    
    if (Array.isArray(args)) {
        args = {
                    record: args[0],
                }
    }

    args = applyUrlDefaults(args)

    const parsedArgs = {
                        record: args.record,
                }

    return archive.definition.url
            .replace('{record}', parsedArgs.record.toString())
            .replace(/\/+$/, '') + queryParams(options)
}

/**
* @see \App\Http\Controllers\PaymentRecordsController::archive
 * @see app/Http/Controllers/PaymentRecordsController.php:70
 * @route '/cashier/records/{record}/archive'
 */
archive.post = (args: { record: string | number } | [record: string | number ] | string | number, options?: RouteQueryOptions): RouteDefinition<'post'> => ({
    url: archive.url(args, options),
    method: 'post',
})

    /**
* @see \App\Http\Controllers\PaymentRecordsController::archive
 * @see app/Http/Controllers/PaymentRecordsController.php:70
 * @route '/cashier/records/{record}/archive'
 */
    const archiveForm = (args: { record: string | number } | [record: string | number ] | string | number, options?: RouteQueryOptions): RouteFormDefinition<'post'> => ({
        action: archive.url(args, options),
        method: 'post',
    })

            /**
* @see \App\Http\Controllers\PaymentRecordsController::archive
 * @see app/Http/Controllers/PaymentRecordsController.php:70
 * @route '/cashier/records/{record}/archive'
 */
        archiveForm.post = (args: { record: string | number } | [record: string | number ] | string | number, options?: RouteQueryOptions): RouteFormDefinition<'post'> => ({
            action: archive.url(args, options),
            method: 'post',
        })
    
    archive.form = archiveForm
/**
* @see \App\Http\Controllers\PaymentRecordsController::archived
 * @see app/Http/Controllers/PaymentRecordsController.php:81
 * @route '/cashier/archived-records'
 */
export const archived = (options?: RouteQueryOptions): RouteDefinition<'get'> => ({
    url: archived.url(options),
    method: 'get',
})

archived.definition = {
    methods: ["get","head"],
    url: '/cashier/archived-records',
} satisfies RouteDefinition<["get","head"]>

/**
* @see \App\Http\Controllers\PaymentRecordsController::archived
 * @see app/Http/Controllers/PaymentRecordsController.php:81
 * @route '/cashier/archived-records'
 */
archived.url = (options?: RouteQueryOptions) => {
    return archived.definition.url + queryParams(options)
}

/**
* @see \App\Http\Controllers\PaymentRecordsController::archived
 * @see app/Http/Controllers/PaymentRecordsController.php:81
 * @route '/cashier/archived-records'
 */
archived.get = (options?: RouteQueryOptions): RouteDefinition<'get'> => ({
    url: archived.url(options),
    method: 'get',
})
/**
* @see \App\Http\Controllers\PaymentRecordsController::archived
 * @see app/Http/Controllers/PaymentRecordsController.php:81
 * @route '/cashier/archived-records'
 */
archived.head = (options?: RouteQueryOptions): RouteDefinition<'head'> => ({
    url: archived.url(options),
    method: 'head',
})

    /**
* @see \App\Http\Controllers\PaymentRecordsController::archived
 * @see app/Http/Controllers/PaymentRecordsController.php:81
 * @route '/cashier/archived-records'
 */
    const archivedForm = (options?: RouteQueryOptions): RouteFormDefinition<'get'> => ({
        action: archived.url(options),
        method: 'get',
    })

            /**
* @see \App\Http\Controllers\PaymentRecordsController::archived
 * @see app/Http/Controllers/PaymentRecordsController.php:81
 * @route '/cashier/archived-records'
 */
        archivedForm.get = (options?: RouteQueryOptions): RouteFormDefinition<'get'> => ({
            action: archived.url(options),
            method: 'get',
        })
            /**
* @see \App\Http\Controllers\PaymentRecordsController::archived
 * @see app/Http/Controllers/PaymentRecordsController.php:81
 * @route '/cashier/archived-records'
 */
        archivedForm.head = (options?: RouteQueryOptions): RouteFormDefinition<'get'> => ({
            action: archived.url({
                        [options?.mergeQuery ? 'mergeQuery' : 'query']: {
                            _method: 'HEAD',
                            ...(options?.query ?? options?.mergeQuery ?? {}),
                        }
                    }),
            method: 'get',
        })
    
    archived.form = archivedForm
/**
* @see \App\Http\Controllers\PaymentRecordsController::restore
 * @see app/Http/Controllers/PaymentRecordsController.php:136
 * @route '/cashier/records/{record}/restore'
 */
export const restore = (args: { record: string | number } | [record: string | number ] | string | number, options?: RouteQueryOptions): RouteDefinition<'post'> => ({
    url: restore.url(args, options),
    method: 'post',
})

restore.definition = {
    methods: ["post"],
    url: '/cashier/records/{record}/restore',
} satisfies RouteDefinition<["post"]>

/**
* @see \App\Http\Controllers\PaymentRecordsController::restore
 * @see app/Http/Controllers/PaymentRecordsController.php:136
 * @route '/cashier/records/{record}/restore'
 */
restore.url = (args: { record: string | number } | [record: string | number ] | string | number, options?: RouteQueryOptions) => {
    if (typeof args === 'string' || typeof args === 'number') {
        args = { record: args }
    }

    
    if (Array.isArray(args)) {
        args = {
                    record: args[0],
                }
    }

    args = applyUrlDefaults(args)

    const parsedArgs = {
                        record: args.record,
                }

    return restore.definition.url
            .replace('{record}', parsedArgs.record.toString())
            .replace(/\/+$/, '') + queryParams(options)
}

/**
* @see \App\Http\Controllers\PaymentRecordsController::restore
 * @see app/Http/Controllers/PaymentRecordsController.php:136
 * @route '/cashier/records/{record}/restore'
 */
restore.post = (args: { record: string | number } | [record: string | number ] | string | number, options?: RouteQueryOptions): RouteDefinition<'post'> => ({
    url: restore.url(args, options),
    method: 'post',
})

    /**
* @see \App\Http\Controllers\PaymentRecordsController::restore
 * @see app/Http/Controllers/PaymentRecordsController.php:136
 * @route '/cashier/records/{record}/restore'
 */
    const restoreForm = (args: { record: string | number } | [record: string | number ] | string | number, options?: RouteQueryOptions): RouteFormDefinition<'post'> => ({
        action: restore.url(args, options),
        method: 'post',
    })

            /**
* @see \App\Http\Controllers\PaymentRecordsController::restore
 * @see app/Http/Controllers/PaymentRecordsController.php:136
 * @route '/cashier/records/{record}/restore'
 */
        restoreForm.post = (args: { record: string | number } | [record: string | number ] | string | number, options?: RouteQueryOptions): RouteFormDefinition<'post'> => ({
            action: restore.url(args, options),
            method: 'post',
        })
    
    restore.form = restoreForm
const PaymentRecordsController = { index, archive, archived, restore }

export default PaymentRecordsController