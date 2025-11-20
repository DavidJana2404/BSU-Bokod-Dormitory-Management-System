import { queryParams, type RouteQueryOptions, type RouteDefinition, type RouteFormDefinition, applyUrlDefaults } from './../../wayfinder'
/**
* @see \App\Http\Controllers\DormitoryController::index
 * @see app/Http/Controllers/DormitoryController.php:13
 * @route '/dormitories'
 */
export const index = (options?: RouteQueryOptions): RouteDefinition<'get'> => ({
    url: index.url(options),
    method: 'get',
})

index.definition = {
    methods: ["get","head"],
    url: '/dormitories',
} satisfies RouteDefinition<["get","head"]>

/**
* @see \App\Http\Controllers\DormitoryController::index
 * @see app/Http/Controllers/DormitoryController.php:13
 * @route '/dormitories'
 */
index.url = (options?: RouteQueryOptions) => {
    return index.definition.url + queryParams(options)
}

/**
* @see \App\Http\Controllers\DormitoryController::index
 * @see app/Http/Controllers/DormitoryController.php:13
 * @route '/dormitories'
 */
index.get = (options?: RouteQueryOptions): RouteDefinition<'get'> => ({
    url: index.url(options),
    method: 'get',
})
/**
* @see \App\Http\Controllers\DormitoryController::index
 * @see app/Http/Controllers/DormitoryController.php:13
 * @route '/dormitories'
 */
index.head = (options?: RouteQueryOptions): RouteDefinition<'head'> => ({
    url: index.url(options),
    method: 'head',
})

    /**
* @see \App\Http\Controllers\DormitoryController::index
 * @see app/Http/Controllers/DormitoryController.php:13
 * @route '/dormitories'
 */
    const indexForm = (options?: RouteQueryOptions): RouteFormDefinition<'get'> => ({
        action: index.url(options),
        method: 'get',
    })

            /**
* @see \App\Http\Controllers\DormitoryController::index
 * @see app/Http/Controllers/DormitoryController.php:13
 * @route '/dormitories'
 */
        indexForm.get = (options?: RouteQueryOptions): RouteFormDefinition<'get'> => ({
            action: index.url(options),
            method: 'get',
        })
            /**
* @see \App\Http\Controllers\DormitoryController::index
 * @see app/Http/Controllers/DormitoryController.php:13
 * @route '/dormitories'
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
* @see \App\Http\Controllers\DormitoryController::store
 * @see app/Http/Controllers/DormitoryController.php:119
 * @route '/dormitories'
 */
export const store = (options?: RouteQueryOptions): RouteDefinition<'post'> => ({
    url: store.url(options),
    method: 'post',
})

store.definition = {
    methods: ["post"],
    url: '/dormitories',
} satisfies RouteDefinition<["post"]>

/**
* @see \App\Http\Controllers\DormitoryController::store
 * @see app/Http/Controllers/DormitoryController.php:119
 * @route '/dormitories'
 */
store.url = (options?: RouteQueryOptions) => {
    return store.definition.url + queryParams(options)
}

/**
* @see \App\Http\Controllers\DormitoryController::store
 * @see app/Http/Controllers/DormitoryController.php:119
 * @route '/dormitories'
 */
store.post = (options?: RouteQueryOptions): RouteDefinition<'post'> => ({
    url: store.url(options),
    method: 'post',
})

    /**
* @see \App\Http\Controllers\DormitoryController::store
 * @see app/Http/Controllers/DormitoryController.php:119
 * @route '/dormitories'
 */
    const storeForm = (options?: RouteQueryOptions): RouteFormDefinition<'post'> => ({
        action: store.url(options),
        method: 'post',
    })

            /**
* @see \App\Http\Controllers\DormitoryController::store
 * @see app/Http/Controllers/DormitoryController.php:119
 * @route '/dormitories'
 */
        storeForm.post = (options?: RouteQueryOptions): RouteFormDefinition<'post'> => ({
            action: store.url(options),
            method: 'post',
        })
    
    store.form = storeForm
/**
* @see \App\Http\Controllers\DormitoryController::update
 * @see app/Http/Controllers/DormitoryController.php:137
 * @route '/dormitories/{dormitory}'
 */
export const update = (args: { dormitory: string | number } | [dormitory: string | number ] | string | number, options?: RouteQueryOptions): RouteDefinition<'put'> => ({
    url: update.url(args, options),
    method: 'put',
})

update.definition = {
    methods: ["put","patch"],
    url: '/dormitories/{dormitory}',
} satisfies RouteDefinition<["put","patch"]>

/**
* @see \App\Http\Controllers\DormitoryController::update
 * @see app/Http/Controllers/DormitoryController.php:137
 * @route '/dormitories/{dormitory}'
 */
update.url = (args: { dormitory: string | number } | [dormitory: string | number ] | string | number, options?: RouteQueryOptions) => {
    if (typeof args === 'string' || typeof args === 'number') {
        args = { dormitory: args }
    }

    
    if (Array.isArray(args)) {
        args = {
                    dormitory: args[0],
                }
    }

    args = applyUrlDefaults(args)

    const parsedArgs = {
                        dormitory: args.dormitory,
                }

    return update.definition.url
            .replace('{dormitory}', parsedArgs.dormitory.toString())
            .replace(/\/+$/, '') + queryParams(options)
}

/**
* @see \App\Http\Controllers\DormitoryController::update
 * @see app/Http/Controllers/DormitoryController.php:137
 * @route '/dormitories/{dormitory}'
 */
update.put = (args: { dormitory: string | number } | [dormitory: string | number ] | string | number, options?: RouteQueryOptions): RouteDefinition<'put'> => ({
    url: update.url(args, options),
    method: 'put',
})
/**
* @see \App\Http\Controllers\DormitoryController::update
 * @see app/Http/Controllers/DormitoryController.php:137
 * @route '/dormitories/{dormitory}'
 */
update.patch = (args: { dormitory: string | number } | [dormitory: string | number ] | string | number, options?: RouteQueryOptions): RouteDefinition<'patch'> => ({
    url: update.url(args, options),
    method: 'patch',
})

    /**
* @see \App\Http\Controllers\DormitoryController::update
 * @see app/Http/Controllers/DormitoryController.php:137
 * @route '/dormitories/{dormitory}'
 */
    const updateForm = (args: { dormitory: string | number } | [dormitory: string | number ] | string | number, options?: RouteQueryOptions): RouteFormDefinition<'post'> => ({
        action: update.url(args, {
                    [options?.mergeQuery ? 'mergeQuery' : 'query']: {
                        _method: 'PUT',
                        ...(options?.query ?? options?.mergeQuery ?? {}),
                    }
                }),
        method: 'post',
    })

            /**
* @see \App\Http\Controllers\DormitoryController::update
 * @see app/Http/Controllers/DormitoryController.php:137
 * @route '/dormitories/{dormitory}'
 */
        updateForm.put = (args: { dormitory: string | number } | [dormitory: string | number ] | string | number, options?: RouteQueryOptions): RouteFormDefinition<'post'> => ({
            action: update.url(args, {
                        [options?.mergeQuery ? 'mergeQuery' : 'query']: {
                            _method: 'PUT',
                            ...(options?.query ?? options?.mergeQuery ?? {}),
                        }
                    }),
            method: 'post',
        })
            /**
* @see \App\Http\Controllers\DormitoryController::update
 * @see app/Http/Controllers/DormitoryController.php:137
 * @route '/dormitories/{dormitory}'
 */
        updateForm.patch = (args: { dormitory: string | number } | [dormitory: string | number ] | string | number, options?: RouteQueryOptions): RouteFormDefinition<'post'> => ({
            action: update.url(args, {
                        [options?.mergeQuery ? 'mergeQuery' : 'query']: {
                            _method: 'PATCH',
                            ...(options?.query ?? options?.mergeQuery ?? {}),
                        }
                    }),
            method: 'post',
        })
    
    update.form = updateForm
/**
* @see \App\Http\Controllers\DormitoryController::archive
 * @see app/Http/Controllers/DormitoryController.php:152
 * @route '/dormitories/{dormitory}/archive'
 */
export const archive = (args: { dormitory: string | number } | [dormitory: string | number ] | string | number, options?: RouteQueryOptions): RouteDefinition<'post'> => ({
    url: archive.url(args, options),
    method: 'post',
})

archive.definition = {
    methods: ["post"],
    url: '/dormitories/{dormitory}/archive',
} satisfies RouteDefinition<["post"]>

/**
* @see \App\Http\Controllers\DormitoryController::archive
 * @see app/Http/Controllers/DormitoryController.php:152
 * @route '/dormitories/{dormitory}/archive'
 */
archive.url = (args: { dormitory: string | number } | [dormitory: string | number ] | string | number, options?: RouteQueryOptions) => {
    if (typeof args === 'string' || typeof args === 'number') {
        args = { dormitory: args }
    }

    
    if (Array.isArray(args)) {
        args = {
                    dormitory: args[0],
                }
    }

    args = applyUrlDefaults(args)

    const parsedArgs = {
                        dormitory: args.dormitory,
                }

    return archive.definition.url
            .replace('{dormitory}', parsedArgs.dormitory.toString())
            .replace(/\/+$/, '') + queryParams(options)
}

/**
* @see \App\Http\Controllers\DormitoryController::archive
 * @see app/Http/Controllers/DormitoryController.php:152
 * @route '/dormitories/{dormitory}/archive'
 */
archive.post = (args: { dormitory: string | number } | [dormitory: string | number ] | string | number, options?: RouteQueryOptions): RouteDefinition<'post'> => ({
    url: archive.url(args, options),
    method: 'post',
})

    /**
* @see \App\Http\Controllers\DormitoryController::archive
 * @see app/Http/Controllers/DormitoryController.php:152
 * @route '/dormitories/{dormitory}/archive'
 */
    const archiveForm = (args: { dormitory: string | number } | [dormitory: string | number ] | string | number, options?: RouteQueryOptions): RouteFormDefinition<'post'> => ({
        action: archive.url(args, options),
        method: 'post',
    })

            /**
* @see \App\Http\Controllers\DormitoryController::archive
 * @see app/Http/Controllers/DormitoryController.php:152
 * @route '/dormitories/{dormitory}/archive'
 */
        archiveForm.post = (args: { dormitory: string | number } | [dormitory: string | number ] | string | number, options?: RouteQueryOptions): RouteFormDefinition<'post'> => ({
            action: archive.url(args, options),
            method: 'post',
        })
    
    archive.form = archiveForm
const dormitories = {
    index: Object.assign(index, index),
store: Object.assign(store, store),
update: Object.assign(update, update),
archive: Object.assign(archive, archive),
}

export default dormitories