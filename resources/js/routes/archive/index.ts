import { queryParams, type RouteQueryOptions, type RouteDefinition, type RouteFormDefinition, applyUrlDefaults } from './../../wayfinder'
/**
* @see \App\Http\Controllers\ArchiveController::index
 * @see app/Http/Controllers/ArchiveController.php:16
 * @route '/settings/archive'
 */
export const index = (options?: RouteQueryOptions): RouteDefinition<'get'> => ({
    url: index.url(options),
    method: 'get',
})

index.definition = {
    methods: ["get","head"],
    url: '/settings/archive',
} satisfies RouteDefinition<["get","head"]>

/**
* @see \App\Http\Controllers\ArchiveController::index
 * @see app/Http/Controllers/ArchiveController.php:16
 * @route '/settings/archive'
 */
index.url = (options?: RouteQueryOptions) => {
    return index.definition.url + queryParams(options)
}

/**
* @see \App\Http\Controllers\ArchiveController::index
 * @see app/Http/Controllers/ArchiveController.php:16
 * @route '/settings/archive'
 */
index.get = (options?: RouteQueryOptions): RouteDefinition<'get'> => ({
    url: index.url(options),
    method: 'get',
})
/**
* @see \App\Http\Controllers\ArchiveController::index
 * @see app/Http/Controllers/ArchiveController.php:16
 * @route '/settings/archive'
 */
index.head = (options?: RouteQueryOptions): RouteDefinition<'head'> => ({
    url: index.url(options),
    method: 'head',
})

    /**
* @see \App\Http\Controllers\ArchiveController::index
 * @see app/Http/Controllers/ArchiveController.php:16
 * @route '/settings/archive'
 */
    const indexForm = (options?: RouteQueryOptions): RouteFormDefinition<'get'> => ({
        action: index.url(options),
        method: 'get',
    })

            /**
* @see \App\Http\Controllers\ArchiveController::index
 * @see app/Http/Controllers/ArchiveController.php:16
 * @route '/settings/archive'
 */
        indexForm.get = (options?: RouteQueryOptions): RouteFormDefinition<'get'> => ({
            action: index.url(options),
            method: 'get',
        })
            /**
* @see \App\Http\Controllers\ArchiveController::index
 * @see app/Http/Controllers/ArchiveController.php:16
 * @route '/settings/archive'
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
* @see \App\Http\Controllers\ArchiveController::restore
 * @see app/Http/Controllers/ArchiveController.php:190
 * @route '/settings/archive/restore/{type}/{id}'
 */
export const restore = (args: { type: string | number, id: string | number } | [type: string | number, id: string | number ], options?: RouteQueryOptions): RouteDefinition<'post'> => ({
    url: restore.url(args, options),
    method: 'post',
})

restore.definition = {
    methods: ["post"],
    url: '/settings/archive/restore/{type}/{id}',
} satisfies RouteDefinition<["post"]>

/**
* @see \App\Http\Controllers\ArchiveController::restore
 * @see app/Http/Controllers/ArchiveController.php:190
 * @route '/settings/archive/restore/{type}/{id}'
 */
restore.url = (args: { type: string | number, id: string | number } | [type: string | number, id: string | number ], options?: RouteQueryOptions) => {
    if (Array.isArray(args)) {
        args = {
                    type: args[0],
                    id: args[1],
                }
    }

    args = applyUrlDefaults(args)

    const parsedArgs = {
                        type: args.type,
                                id: args.id,
                }

    return restore.definition.url
            .replace('{type}', parsedArgs.type.toString())
            .replace('{id}', parsedArgs.id.toString())
            .replace(/\/+$/, '') + queryParams(options)
}

/**
* @see \App\Http\Controllers\ArchiveController::restore
 * @see app/Http/Controllers/ArchiveController.php:190
 * @route '/settings/archive/restore/{type}/{id}'
 */
restore.post = (args: { type: string | number, id: string | number } | [type: string | number, id: string | number ], options?: RouteQueryOptions): RouteDefinition<'post'> => ({
    url: restore.url(args, options),
    method: 'post',
})

    /**
* @see \App\Http\Controllers\ArchiveController::restore
 * @see app/Http/Controllers/ArchiveController.php:190
 * @route '/settings/archive/restore/{type}/{id}'
 */
    const restoreForm = (args: { type: string | number, id: string | number } | [type: string | number, id: string | number ], options?: RouteQueryOptions): RouteFormDefinition<'post'> => ({
        action: restore.url(args, options),
        method: 'post',
    })

            /**
* @see \App\Http\Controllers\ArchiveController::restore
 * @see app/Http/Controllers/ArchiveController.php:190
 * @route '/settings/archive/restore/{type}/{id}'
 */
        restoreForm.post = (args: { type: string | number, id: string | number } | [type: string | number, id: string | number ], options?: RouteQueryOptions): RouteFormDefinition<'post'> => ({
            action: restore.url(args, options),
            method: 'post',
        })
    
    restore.form = restoreForm
/**
* @see \App\Http\Controllers\ArchiveController::forceDelete
 * @see app/Http/Controllers/ArchiveController.php:249
 * @route '/settings/archive/force-delete/{type}/{id}'
 */
export const forceDelete = (args: { type: string | number, id: string | number } | [type: string | number, id: string | number ], options?: RouteQueryOptions): RouteDefinition<'delete'> => ({
    url: forceDelete.url(args, options),
    method: 'delete',
})

forceDelete.definition = {
    methods: ["delete"],
    url: '/settings/archive/force-delete/{type}/{id}',
} satisfies RouteDefinition<["delete"]>

/**
* @see \App\Http\Controllers\ArchiveController::forceDelete
 * @see app/Http/Controllers/ArchiveController.php:249
 * @route '/settings/archive/force-delete/{type}/{id}'
 */
forceDelete.url = (args: { type: string | number, id: string | number } | [type: string | number, id: string | number ], options?: RouteQueryOptions) => {
    if (Array.isArray(args)) {
        args = {
                    type: args[0],
                    id: args[1],
                }
    }

    args = applyUrlDefaults(args)

    const parsedArgs = {
                        type: args.type,
                                id: args.id,
                }

    return forceDelete.definition.url
            .replace('{type}', parsedArgs.type.toString())
            .replace('{id}', parsedArgs.id.toString())
            .replace(/\/+$/, '') + queryParams(options)
}

/**
* @see \App\Http\Controllers\ArchiveController::forceDelete
 * @see app/Http/Controllers/ArchiveController.php:249
 * @route '/settings/archive/force-delete/{type}/{id}'
 */
forceDelete.delete = (args: { type: string | number, id: string | number } | [type: string | number, id: string | number ], options?: RouteQueryOptions): RouteDefinition<'delete'> => ({
    url: forceDelete.url(args, options),
    method: 'delete',
})

    /**
* @see \App\Http\Controllers\ArchiveController::forceDelete
 * @see app/Http/Controllers/ArchiveController.php:249
 * @route '/settings/archive/force-delete/{type}/{id}'
 */
    const forceDeleteForm = (args: { type: string | number, id: string | number } | [type: string | number, id: string | number ], options?: RouteQueryOptions): RouteFormDefinition<'post'> => ({
        action: forceDelete.url(args, {
                    [options?.mergeQuery ? 'mergeQuery' : 'query']: {
                        _method: 'DELETE',
                        ...(options?.query ?? options?.mergeQuery ?? {}),
                    }
                }),
        method: 'post',
    })

            /**
* @see \App\Http\Controllers\ArchiveController::forceDelete
 * @see app/Http/Controllers/ArchiveController.php:249
 * @route '/settings/archive/force-delete/{type}/{id}'
 */
        forceDeleteForm.delete = (args: { type: string | number, id: string | number } | [type: string | number, id: string | number ], options?: RouteQueryOptions): RouteFormDefinition<'post'> => ({
            action: forceDelete.url(args, {
                        [options?.mergeQuery ? 'mergeQuery' : 'query']: {
                            _method: 'DELETE',
                            ...(options?.query ?? options?.mergeQuery ?? {}),
                        }
                    }),
            method: 'post',
        })
    
    forceDelete.form = forceDeleteForm
/**
* @see \App\Http\Controllers\ArchiveController::clearAll
 * @see app/Http/Controllers/ArchiveController.php:308
 * @route '/settings/archive/clear-all'
 */
export const clearAll = (options?: RouteQueryOptions): RouteDefinition<'delete'> => ({
    url: clearAll.url(options),
    method: 'delete',
})

clearAll.definition = {
    methods: ["delete"],
    url: '/settings/archive/clear-all',
} satisfies RouteDefinition<["delete"]>

/**
* @see \App\Http\Controllers\ArchiveController::clearAll
 * @see app/Http/Controllers/ArchiveController.php:308
 * @route '/settings/archive/clear-all'
 */
clearAll.url = (options?: RouteQueryOptions) => {
    return clearAll.definition.url + queryParams(options)
}

/**
* @see \App\Http\Controllers\ArchiveController::clearAll
 * @see app/Http/Controllers/ArchiveController.php:308
 * @route '/settings/archive/clear-all'
 */
clearAll.delete = (options?: RouteQueryOptions): RouteDefinition<'delete'> => ({
    url: clearAll.url(options),
    method: 'delete',
})

    /**
* @see \App\Http\Controllers\ArchiveController::clearAll
 * @see app/Http/Controllers/ArchiveController.php:308
 * @route '/settings/archive/clear-all'
 */
    const clearAllForm = (options?: RouteQueryOptions): RouteFormDefinition<'post'> => ({
        action: clearAll.url({
                    [options?.mergeQuery ? 'mergeQuery' : 'query']: {
                        _method: 'DELETE',
                        ...(options?.query ?? options?.mergeQuery ?? {}),
                    }
                }),
        method: 'post',
    })

            /**
* @see \App\Http\Controllers\ArchiveController::clearAll
 * @see app/Http/Controllers/ArchiveController.php:308
 * @route '/settings/archive/clear-all'
 */
        clearAllForm.delete = (options?: RouteQueryOptions): RouteFormDefinition<'post'> => ({
            action: clearAll.url({
                        [options?.mergeQuery ? 'mergeQuery' : 'query']: {
                            _method: 'DELETE',
                            ...(options?.query ?? options?.mergeQuery ?? {}),
                        }
                    }),
            method: 'post',
        })
    
    clearAll.form = clearAllForm
const archive = {
    index: Object.assign(index, index),
restore: Object.assign(restore, restore),
forceDelete: Object.assign(forceDelete, forceDelete),
clearAll: Object.assign(clearAll, clearAll),
}

export default archive