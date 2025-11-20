import { queryParams, type RouteQueryOptions, type RouteDefinition, type RouteFormDefinition, applyUrlDefaults } from './../../wayfinder'
/**
* @see \App\Http\Controllers\CleaningScheduleController::index
 * @see app/Http/Controllers/CleaningScheduleController.php:16
 * @route '/cleaning-schedules'
 */
export const index = (options?: RouteQueryOptions): RouteDefinition<'get'> => ({
    url: index.url(options),
    method: 'get',
})

index.definition = {
    methods: ["get","head"],
    url: '/cleaning-schedules',
} satisfies RouteDefinition<["get","head"]>

/**
* @see \App\Http\Controllers\CleaningScheduleController::index
 * @see app/Http/Controllers/CleaningScheduleController.php:16
 * @route '/cleaning-schedules'
 */
index.url = (options?: RouteQueryOptions) => {
    return index.definition.url + queryParams(options)
}

/**
* @see \App\Http\Controllers\CleaningScheduleController::index
 * @see app/Http/Controllers/CleaningScheduleController.php:16
 * @route '/cleaning-schedules'
 */
index.get = (options?: RouteQueryOptions): RouteDefinition<'get'> => ({
    url: index.url(options),
    method: 'get',
})
/**
* @see \App\Http\Controllers\CleaningScheduleController::index
 * @see app/Http/Controllers/CleaningScheduleController.php:16
 * @route '/cleaning-schedules'
 */
index.head = (options?: RouteQueryOptions): RouteDefinition<'head'> => ({
    url: index.url(options),
    method: 'head',
})

    /**
* @see \App\Http\Controllers\CleaningScheduleController::index
 * @see app/Http/Controllers/CleaningScheduleController.php:16
 * @route '/cleaning-schedules'
 */
    const indexForm = (options?: RouteQueryOptions): RouteFormDefinition<'get'> => ({
        action: index.url(options),
        method: 'get',
    })

            /**
* @see \App\Http\Controllers\CleaningScheduleController::index
 * @see app/Http/Controllers/CleaningScheduleController.php:16
 * @route '/cleaning-schedules'
 */
        indexForm.get = (options?: RouteQueryOptions): RouteFormDefinition<'get'> => ({
            action: index.url(options),
            method: 'get',
        })
            /**
* @see \App\Http\Controllers\CleaningScheduleController::index
 * @see app/Http/Controllers/CleaningScheduleController.php:16
 * @route '/cleaning-schedules'
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
* @see \App\Http\Controllers\CleaningScheduleController::store
 * @see app/Http/Controllers/CleaningScheduleController.php:75
 * @route '/cleaning-schedules'
 */
export const store = (options?: RouteQueryOptions): RouteDefinition<'post'> => ({
    url: store.url(options),
    method: 'post',
})

store.definition = {
    methods: ["post"],
    url: '/cleaning-schedules',
} satisfies RouteDefinition<["post"]>

/**
* @see \App\Http\Controllers\CleaningScheduleController::store
 * @see app/Http/Controllers/CleaningScheduleController.php:75
 * @route '/cleaning-schedules'
 */
store.url = (options?: RouteQueryOptions) => {
    return store.definition.url + queryParams(options)
}

/**
* @see \App\Http\Controllers\CleaningScheduleController::store
 * @see app/Http/Controllers/CleaningScheduleController.php:75
 * @route '/cleaning-schedules'
 */
store.post = (options?: RouteQueryOptions): RouteDefinition<'post'> => ({
    url: store.url(options),
    method: 'post',
})

    /**
* @see \App\Http\Controllers\CleaningScheduleController::store
 * @see app/Http/Controllers/CleaningScheduleController.php:75
 * @route '/cleaning-schedules'
 */
    const storeForm = (options?: RouteQueryOptions): RouteFormDefinition<'post'> => ({
        action: store.url(options),
        method: 'post',
    })

            /**
* @see \App\Http\Controllers\CleaningScheduleController::store
 * @see app/Http/Controllers/CleaningScheduleController.php:75
 * @route '/cleaning-schedules'
 */
        storeForm.post = (options?: RouteQueryOptions): RouteFormDefinition<'post'> => ({
            action: store.url(options),
            method: 'post',
        })
    
    store.form = storeForm
/**
* @see \App\Http\Controllers\CleaningScheduleController::update
 * @see app/Http/Controllers/CleaningScheduleController.php:107
 * @route '/cleaning-schedules/{cleaning_schedule}'
 */
export const update = (args: { cleaning_schedule: string | number } | [cleaning_schedule: string | number ] | string | number, options?: RouteQueryOptions): RouteDefinition<'put'> => ({
    url: update.url(args, options),
    method: 'put',
})

update.definition = {
    methods: ["put","patch"],
    url: '/cleaning-schedules/{cleaning_schedule}',
} satisfies RouteDefinition<["put","patch"]>

/**
* @see \App\Http\Controllers\CleaningScheduleController::update
 * @see app/Http/Controllers/CleaningScheduleController.php:107
 * @route '/cleaning-schedules/{cleaning_schedule}'
 */
update.url = (args: { cleaning_schedule: string | number } | [cleaning_schedule: string | number ] | string | number, options?: RouteQueryOptions) => {
    if (typeof args === 'string' || typeof args === 'number') {
        args = { cleaning_schedule: args }
    }

    
    if (Array.isArray(args)) {
        args = {
                    cleaning_schedule: args[0],
                }
    }

    args = applyUrlDefaults(args)

    const parsedArgs = {
                        cleaning_schedule: args.cleaning_schedule,
                }

    return update.definition.url
            .replace('{cleaning_schedule}', parsedArgs.cleaning_schedule.toString())
            .replace(/\/+$/, '') + queryParams(options)
}

/**
* @see \App\Http\Controllers\CleaningScheduleController::update
 * @see app/Http/Controllers/CleaningScheduleController.php:107
 * @route '/cleaning-schedules/{cleaning_schedule}'
 */
update.put = (args: { cleaning_schedule: string | number } | [cleaning_schedule: string | number ] | string | number, options?: RouteQueryOptions): RouteDefinition<'put'> => ({
    url: update.url(args, options),
    method: 'put',
})
/**
* @see \App\Http\Controllers\CleaningScheduleController::update
 * @see app/Http/Controllers/CleaningScheduleController.php:107
 * @route '/cleaning-schedules/{cleaning_schedule}'
 */
update.patch = (args: { cleaning_schedule: string | number } | [cleaning_schedule: string | number ] | string | number, options?: RouteQueryOptions): RouteDefinition<'patch'> => ({
    url: update.url(args, options),
    method: 'patch',
})

    /**
* @see \App\Http\Controllers\CleaningScheduleController::update
 * @see app/Http/Controllers/CleaningScheduleController.php:107
 * @route '/cleaning-schedules/{cleaning_schedule}'
 */
    const updateForm = (args: { cleaning_schedule: string | number } | [cleaning_schedule: string | number ] | string | number, options?: RouteQueryOptions): RouteFormDefinition<'post'> => ({
        action: update.url(args, {
                    [options?.mergeQuery ? 'mergeQuery' : 'query']: {
                        _method: 'PUT',
                        ...(options?.query ?? options?.mergeQuery ?? {}),
                    }
                }),
        method: 'post',
    })

            /**
* @see \App\Http\Controllers\CleaningScheduleController::update
 * @see app/Http/Controllers/CleaningScheduleController.php:107
 * @route '/cleaning-schedules/{cleaning_schedule}'
 */
        updateForm.put = (args: { cleaning_schedule: string | number } | [cleaning_schedule: string | number ] | string | number, options?: RouteQueryOptions): RouteFormDefinition<'post'> => ({
            action: update.url(args, {
                        [options?.mergeQuery ? 'mergeQuery' : 'query']: {
                            _method: 'PUT',
                            ...(options?.query ?? options?.mergeQuery ?? {}),
                        }
                    }),
            method: 'post',
        })
            /**
* @see \App\Http\Controllers\CleaningScheduleController::update
 * @see app/Http/Controllers/CleaningScheduleController.php:107
 * @route '/cleaning-schedules/{cleaning_schedule}'
 */
        updateForm.patch = (args: { cleaning_schedule: string | number } | [cleaning_schedule: string | number ] | string | number, options?: RouteQueryOptions): RouteFormDefinition<'post'> => ({
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
* @see \App\Http\Controllers\CleaningScheduleController::destroy
 * @see app/Http/Controllers/CleaningScheduleController.php:146
 * @route '/cleaning-schedules/{cleaning_schedule}'
 */
export const destroy = (args: { cleaning_schedule: string | number } | [cleaning_schedule: string | number ] | string | number, options?: RouteQueryOptions): RouteDefinition<'delete'> => ({
    url: destroy.url(args, options),
    method: 'delete',
})

destroy.definition = {
    methods: ["delete"],
    url: '/cleaning-schedules/{cleaning_schedule}',
} satisfies RouteDefinition<["delete"]>

/**
* @see \App\Http\Controllers\CleaningScheduleController::destroy
 * @see app/Http/Controllers/CleaningScheduleController.php:146
 * @route '/cleaning-schedules/{cleaning_schedule}'
 */
destroy.url = (args: { cleaning_schedule: string | number } | [cleaning_schedule: string | number ] | string | number, options?: RouteQueryOptions) => {
    if (typeof args === 'string' || typeof args === 'number') {
        args = { cleaning_schedule: args }
    }

    
    if (Array.isArray(args)) {
        args = {
                    cleaning_schedule: args[0],
                }
    }

    args = applyUrlDefaults(args)

    const parsedArgs = {
                        cleaning_schedule: args.cleaning_schedule,
                }

    return destroy.definition.url
            .replace('{cleaning_schedule}', parsedArgs.cleaning_schedule.toString())
            .replace(/\/+$/, '') + queryParams(options)
}

/**
* @see \App\Http\Controllers\CleaningScheduleController::destroy
 * @see app/Http/Controllers/CleaningScheduleController.php:146
 * @route '/cleaning-schedules/{cleaning_schedule}'
 */
destroy.delete = (args: { cleaning_schedule: string | number } | [cleaning_schedule: string | number ] | string | number, options?: RouteQueryOptions): RouteDefinition<'delete'> => ({
    url: destroy.url(args, options),
    method: 'delete',
})

    /**
* @see \App\Http\Controllers\CleaningScheduleController::destroy
 * @see app/Http/Controllers/CleaningScheduleController.php:146
 * @route '/cleaning-schedules/{cleaning_schedule}'
 */
    const destroyForm = (args: { cleaning_schedule: string | number } | [cleaning_schedule: string | number ] | string | number, options?: RouteQueryOptions): RouteFormDefinition<'post'> => ({
        action: destroy.url(args, {
                    [options?.mergeQuery ? 'mergeQuery' : 'query']: {
                        _method: 'DELETE',
                        ...(options?.query ?? options?.mergeQuery ?? {}),
                    }
                }),
        method: 'post',
    })

            /**
* @see \App\Http\Controllers\CleaningScheduleController::destroy
 * @see app/Http/Controllers/CleaningScheduleController.php:146
 * @route '/cleaning-schedules/{cleaning_schedule}'
 */
        destroyForm.delete = (args: { cleaning_schedule: string | number } | [cleaning_schedule: string | number ] | string | number, options?: RouteQueryOptions): RouteFormDefinition<'post'> => ({
            action: destroy.url(args, {
                        [options?.mergeQuery ? 'mergeQuery' : 'query']: {
                            _method: 'DELETE',
                            ...(options?.query ?? options?.mergeQuery ?? {}),
                        }
                    }),
            method: 'post',
        })
    
    destroy.form = destroyForm
const cleaningSchedules = {
    index: Object.assign(index, index),
store: Object.assign(store, store),
update: Object.assign(update, update),
destroy: Object.assign(destroy, destroy),
}

export default cleaningSchedules