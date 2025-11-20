import { queryParams, type RouteQueryOptions, type RouteDefinition, type RouteFormDefinition, applyUrlDefaults } from './../../wayfinder'
/**
* @see \App\Http\Controllers\ApplicationController::store
 * @see app/Http/Controllers/ApplicationController.php:219
 * @route '/applications'
 */
export const store = (options?: RouteQueryOptions): RouteDefinition<'post'> => ({
    url: store.url(options),
    method: 'post',
})

store.definition = {
    methods: ["post"],
    url: '/applications',
} satisfies RouteDefinition<["post"]>

/**
* @see \App\Http\Controllers\ApplicationController::store
 * @see app/Http/Controllers/ApplicationController.php:219
 * @route '/applications'
 */
store.url = (options?: RouteQueryOptions) => {
    return store.definition.url + queryParams(options)
}

/**
* @see \App\Http\Controllers\ApplicationController::store
 * @see app/Http/Controllers/ApplicationController.php:219
 * @route '/applications'
 */
store.post = (options?: RouteQueryOptions): RouteDefinition<'post'> => ({
    url: store.url(options),
    method: 'post',
})

    /**
* @see \App\Http\Controllers\ApplicationController::store
 * @see app/Http/Controllers/ApplicationController.php:219
 * @route '/applications'
 */
    const storeForm = (options?: RouteQueryOptions): RouteFormDefinition<'post'> => ({
        action: store.url(options),
        method: 'post',
    })

            /**
* @see \App\Http\Controllers\ApplicationController::store
 * @see app/Http/Controllers/ApplicationController.php:219
 * @route '/applications'
 */
        storeForm.post = (options?: RouteQueryOptions): RouteFormDefinition<'post'> => ({
            action: store.url(options),
            method: 'post',
        })
    
    store.form = storeForm
/**
 * @see routes/web.php:195
 * @route '/applications/emergency'
 */
export const emergency = (options?: RouteQueryOptions): RouteDefinition<'get'> => ({
    url: emergency.url(options),
    method: 'get',
})

emergency.definition = {
    methods: ["get","head"],
    url: '/applications/emergency',
} satisfies RouteDefinition<["get","head"]>

/**
 * @see routes/web.php:195
 * @route '/applications/emergency'
 */
emergency.url = (options?: RouteQueryOptions) => {
    return emergency.definition.url + queryParams(options)
}

/**
 * @see routes/web.php:195
 * @route '/applications/emergency'
 */
emergency.get = (options?: RouteQueryOptions): RouteDefinition<'get'> => ({
    url: emergency.url(options),
    method: 'get',
})
/**
 * @see routes/web.php:195
 * @route '/applications/emergency'
 */
emergency.head = (options?: RouteQueryOptions): RouteDefinition<'head'> => ({
    url: emergency.url(options),
    method: 'head',
})

    /**
 * @see routes/web.php:195
 * @route '/applications/emergency'
 */
    const emergencyForm = (options?: RouteQueryOptions): RouteFormDefinition<'get'> => ({
        action: emergency.url(options),
        method: 'get',
    })

            /**
 * @see routes/web.php:195
 * @route '/applications/emergency'
 */
        emergencyForm.get = (options?: RouteQueryOptions): RouteFormDefinition<'get'> => ({
            action: emergency.url(options),
            method: 'get',
        })
            /**
 * @see routes/web.php:195
 * @route '/applications/emergency'
 */
        emergencyForm.head = (options?: RouteQueryOptions): RouteFormDefinition<'get'> => ({
            action: emergency.url({
                        [options?.mergeQuery ? 'mergeQuery' : 'query']: {
                            _method: 'HEAD',
                            ...(options?.query ?? options?.mergeQuery ?? {}),
                        }
                    }),
            method: 'get',
        })
    
    emergency.form = emergencyForm
/**
* @see \App\Http\Controllers\ApplicationController::index
 * @see app/Http/Controllers/ApplicationController.php:26
 * @route '/applications'
 */
export const index = (options?: RouteQueryOptions): RouteDefinition<'get'> => ({
    url: index.url(options),
    method: 'get',
})

index.definition = {
    methods: ["get","head"],
    url: '/applications',
} satisfies RouteDefinition<["get","head"]>

/**
* @see \App\Http\Controllers\ApplicationController::index
 * @see app/Http/Controllers/ApplicationController.php:26
 * @route '/applications'
 */
index.url = (options?: RouteQueryOptions) => {
    return index.definition.url + queryParams(options)
}

/**
* @see \App\Http\Controllers\ApplicationController::index
 * @see app/Http/Controllers/ApplicationController.php:26
 * @route '/applications'
 */
index.get = (options?: RouteQueryOptions): RouteDefinition<'get'> => ({
    url: index.url(options),
    method: 'get',
})
/**
* @see \App\Http\Controllers\ApplicationController::index
 * @see app/Http/Controllers/ApplicationController.php:26
 * @route '/applications'
 */
index.head = (options?: RouteQueryOptions): RouteDefinition<'head'> => ({
    url: index.url(options),
    method: 'head',
})

    /**
* @see \App\Http\Controllers\ApplicationController::index
 * @see app/Http/Controllers/ApplicationController.php:26
 * @route '/applications'
 */
    const indexForm = (options?: RouteQueryOptions): RouteFormDefinition<'get'> => ({
        action: index.url(options),
        method: 'get',
    })

            /**
* @see \App\Http\Controllers\ApplicationController::index
 * @see app/Http/Controllers/ApplicationController.php:26
 * @route '/applications'
 */
        indexForm.get = (options?: RouteQueryOptions): RouteFormDefinition<'get'> => ({
            action: index.url(options),
            method: 'get',
        })
            /**
* @see \App\Http\Controllers\ApplicationController::index
 * @see app/Http/Controllers/ApplicationController.php:26
 * @route '/applications'
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
* @see \App\Http\Controllers\ApplicationController::approve
 * @see app/Http/Controllers/ApplicationController.php:233
 * @route '/applications/{application}/approve'
 */
export const approve = (args: { application: string | number | { id: string | number } } | [application: string | number | { id: string | number } ] | string | number | { id: string | number }, options?: RouteQueryOptions): RouteDefinition<'put'> => ({
    url: approve.url(args, options),
    method: 'put',
})

approve.definition = {
    methods: ["put"],
    url: '/applications/{application}/approve',
} satisfies RouteDefinition<["put"]>

/**
* @see \App\Http\Controllers\ApplicationController::approve
 * @see app/Http/Controllers/ApplicationController.php:233
 * @route '/applications/{application}/approve'
 */
approve.url = (args: { application: string | number | { id: string | number } } | [application: string | number | { id: string | number } ] | string | number | { id: string | number }, options?: RouteQueryOptions) => {
    if (typeof args === 'string' || typeof args === 'number') {
        args = { application: args }
    }

            if (typeof args === 'object' && !Array.isArray(args) && 'id' in args) {
            args = { application: args.id }
        }
    
    if (Array.isArray(args)) {
        args = {
                    application: args[0],
                }
    }

    args = applyUrlDefaults(args)

    const parsedArgs = {
                        application: typeof args.application === 'object'
                ? args.application.id
                : args.application,
                }

    return approve.definition.url
            .replace('{application}', parsedArgs.application.toString())
            .replace(/\/+$/, '') + queryParams(options)
}

/**
* @see \App\Http\Controllers\ApplicationController::approve
 * @see app/Http/Controllers/ApplicationController.php:233
 * @route '/applications/{application}/approve'
 */
approve.put = (args: { application: string | number | { id: string | number } } | [application: string | number | { id: string | number } ] | string | number | { id: string | number }, options?: RouteQueryOptions): RouteDefinition<'put'> => ({
    url: approve.url(args, options),
    method: 'put',
})

    /**
* @see \App\Http\Controllers\ApplicationController::approve
 * @see app/Http/Controllers/ApplicationController.php:233
 * @route '/applications/{application}/approve'
 */
    const approveForm = (args: { application: string | number | { id: string | number } } | [application: string | number | { id: string | number } ] | string | number | { id: string | number }, options?: RouteQueryOptions): RouteFormDefinition<'post'> => ({
        action: approve.url(args, {
                    [options?.mergeQuery ? 'mergeQuery' : 'query']: {
                        _method: 'PUT',
                        ...(options?.query ?? options?.mergeQuery ?? {}),
                    }
                }),
        method: 'post',
    })

            /**
* @see \App\Http\Controllers\ApplicationController::approve
 * @see app/Http/Controllers/ApplicationController.php:233
 * @route '/applications/{application}/approve'
 */
        approveForm.put = (args: { application: string | number | { id: string | number } } | [application: string | number | { id: string | number } ] | string | number | { id: string | number }, options?: RouteQueryOptions): RouteFormDefinition<'post'> => ({
            action: approve.url(args, {
                        [options?.mergeQuery ? 'mergeQuery' : 'query']: {
                            _method: 'PUT',
                            ...(options?.query ?? options?.mergeQuery ?? {}),
                        }
                    }),
            method: 'post',
        })
    
    approve.form = approveForm
/**
* @see \App\Http\Controllers\ApplicationController::reject
 * @see app/Http/Controllers/ApplicationController.php:467
 * @route '/applications/{application}/reject'
 */
export const reject = (args: { application: string | number | { id: string | number } } | [application: string | number | { id: string | number } ] | string | number | { id: string | number }, options?: RouteQueryOptions): RouteDefinition<'put'> => ({
    url: reject.url(args, options),
    method: 'put',
})

reject.definition = {
    methods: ["put"],
    url: '/applications/{application}/reject',
} satisfies RouteDefinition<["put"]>

/**
* @see \App\Http\Controllers\ApplicationController::reject
 * @see app/Http/Controllers/ApplicationController.php:467
 * @route '/applications/{application}/reject'
 */
reject.url = (args: { application: string | number | { id: string | number } } | [application: string | number | { id: string | number } ] | string | number | { id: string | number }, options?: RouteQueryOptions) => {
    if (typeof args === 'string' || typeof args === 'number') {
        args = { application: args }
    }

            if (typeof args === 'object' && !Array.isArray(args) && 'id' in args) {
            args = { application: args.id }
        }
    
    if (Array.isArray(args)) {
        args = {
                    application: args[0],
                }
    }

    args = applyUrlDefaults(args)

    const parsedArgs = {
                        application: typeof args.application === 'object'
                ? args.application.id
                : args.application,
                }

    return reject.definition.url
            .replace('{application}', parsedArgs.application.toString())
            .replace(/\/+$/, '') + queryParams(options)
}

/**
* @see \App\Http\Controllers\ApplicationController::reject
 * @see app/Http/Controllers/ApplicationController.php:467
 * @route '/applications/{application}/reject'
 */
reject.put = (args: { application: string | number | { id: string | number } } | [application: string | number | { id: string | number } ] | string | number | { id: string | number }, options?: RouteQueryOptions): RouteDefinition<'put'> => ({
    url: reject.url(args, options),
    method: 'put',
})

    /**
* @see \App\Http\Controllers\ApplicationController::reject
 * @see app/Http/Controllers/ApplicationController.php:467
 * @route '/applications/{application}/reject'
 */
    const rejectForm = (args: { application: string | number | { id: string | number } } | [application: string | number | { id: string | number } ] | string | number | { id: string | number }, options?: RouteQueryOptions): RouteFormDefinition<'post'> => ({
        action: reject.url(args, {
                    [options?.mergeQuery ? 'mergeQuery' : 'query']: {
                        _method: 'PUT',
                        ...(options?.query ?? options?.mergeQuery ?? {}),
                    }
                }),
        method: 'post',
    })

            /**
* @see \App\Http\Controllers\ApplicationController::reject
 * @see app/Http/Controllers/ApplicationController.php:467
 * @route '/applications/{application}/reject'
 */
        rejectForm.put = (args: { application: string | number | { id: string | number } } | [application: string | number | { id: string | number } ] | string | number | { id: string | number }, options?: RouteQueryOptions): RouteFormDefinition<'post'> => ({
            action: reject.url(args, {
                        [options?.mergeQuery ? 'mergeQuery' : 'query']: {
                            _method: 'PUT',
                            ...(options?.query ?? options?.mergeQuery ?? {}),
                        }
                    }),
            method: 'post',
        })
    
    reject.form = rejectForm
/**
* @see \App\Http\Controllers\ApplicationController::restore
 * @see app/Http/Controllers/ApplicationController.php:628
 * @route '/applications/{application}/restore'
 */
export const restore = (args: { application: string | number | { id: string | number } } | [application: string | number | { id: string | number } ] | string | number | { id: string | number }, options?: RouteQueryOptions): RouteDefinition<'put'> => ({
    url: restore.url(args, options),
    method: 'put',
})

restore.definition = {
    methods: ["put"],
    url: '/applications/{application}/restore',
} satisfies RouteDefinition<["put"]>

/**
* @see \App\Http\Controllers\ApplicationController::restore
 * @see app/Http/Controllers/ApplicationController.php:628
 * @route '/applications/{application}/restore'
 */
restore.url = (args: { application: string | number | { id: string | number } } | [application: string | number | { id: string | number } ] | string | number | { id: string | number }, options?: RouteQueryOptions) => {
    if (typeof args === 'string' || typeof args === 'number') {
        args = { application: args }
    }

            if (typeof args === 'object' && !Array.isArray(args) && 'id' in args) {
            args = { application: args.id }
        }
    
    if (Array.isArray(args)) {
        args = {
                    application: args[0],
                }
    }

    args = applyUrlDefaults(args)

    const parsedArgs = {
                        application: typeof args.application === 'object'
                ? args.application.id
                : args.application,
                }

    return restore.definition.url
            .replace('{application}', parsedArgs.application.toString())
            .replace(/\/+$/, '') + queryParams(options)
}

/**
* @see \App\Http\Controllers\ApplicationController::restore
 * @see app/Http/Controllers/ApplicationController.php:628
 * @route '/applications/{application}/restore'
 */
restore.put = (args: { application: string | number | { id: string | number } } | [application: string | number | { id: string | number } ] | string | number | { id: string | number }, options?: RouteQueryOptions): RouteDefinition<'put'> => ({
    url: restore.url(args, options),
    method: 'put',
})

    /**
* @see \App\Http\Controllers\ApplicationController::restore
 * @see app/Http/Controllers/ApplicationController.php:628
 * @route '/applications/{application}/restore'
 */
    const restoreForm = (args: { application: string | number | { id: string | number } } | [application: string | number | { id: string | number } ] | string | number | { id: string | number }, options?: RouteQueryOptions): RouteFormDefinition<'post'> => ({
        action: restore.url(args, {
                    [options?.mergeQuery ? 'mergeQuery' : 'query']: {
                        _method: 'PUT',
                        ...(options?.query ?? options?.mergeQuery ?? {}),
                    }
                }),
        method: 'post',
    })

            /**
* @see \App\Http\Controllers\ApplicationController::restore
 * @see app/Http/Controllers/ApplicationController.php:628
 * @route '/applications/{application}/restore'
 */
        restoreForm.put = (args: { application: string | number | { id: string | number } } | [application: string | number | { id: string | number } ] | string | number | { id: string | number }, options?: RouteQueryOptions): RouteFormDefinition<'post'> => ({
            action: restore.url(args, {
                        [options?.mergeQuery ? 'mergeQuery' : 'query']: {
                            _method: 'PUT',
                            ...(options?.query ?? options?.mergeQuery ?? {}),
                        }
                    }),
            method: 'post',
        })
    
    restore.form = restoreForm
/**
* @see \App\Http\Controllers\ApplicationController::archive
 * @see app/Http/Controllers/ApplicationController.php:780
 * @route '/applications/{application}/archive'
 */
export const archive = (args: { application: string | number } | [application: string | number ] | string | number, options?: RouteQueryOptions): RouteDefinition<'post'> => ({
    url: archive.url(args, options),
    method: 'post',
})

archive.definition = {
    methods: ["post"],
    url: '/applications/{application}/archive',
} satisfies RouteDefinition<["post"]>

/**
* @see \App\Http\Controllers\ApplicationController::archive
 * @see app/Http/Controllers/ApplicationController.php:780
 * @route '/applications/{application}/archive'
 */
archive.url = (args: { application: string | number } | [application: string | number ] | string | number, options?: RouteQueryOptions) => {
    if (typeof args === 'string' || typeof args === 'number') {
        args = { application: args }
    }

    
    if (Array.isArray(args)) {
        args = {
                    application: args[0],
                }
    }

    args = applyUrlDefaults(args)

    const parsedArgs = {
                        application: args.application,
                }

    return archive.definition.url
            .replace('{application}', parsedArgs.application.toString())
            .replace(/\/+$/, '') + queryParams(options)
}

/**
* @see \App\Http\Controllers\ApplicationController::archive
 * @see app/Http/Controllers/ApplicationController.php:780
 * @route '/applications/{application}/archive'
 */
archive.post = (args: { application: string | number } | [application: string | number ] | string | number, options?: RouteQueryOptions): RouteDefinition<'post'> => ({
    url: archive.url(args, options),
    method: 'post',
})

    /**
* @see \App\Http\Controllers\ApplicationController::archive
 * @see app/Http/Controllers/ApplicationController.php:780
 * @route '/applications/{application}/archive'
 */
    const archiveForm = (args: { application: string | number } | [application: string | number ] | string | number, options?: RouteQueryOptions): RouteFormDefinition<'post'> => ({
        action: archive.url(args, options),
        method: 'post',
    })

            /**
* @see \App\Http\Controllers\ApplicationController::archive
 * @see app/Http/Controllers/ApplicationController.php:780
 * @route '/applications/{application}/archive'
 */
        archiveForm.post = (args: { application: string | number } | [application: string | number ] | string | number, options?: RouteQueryOptions): RouteFormDefinition<'post'> => ({
            action: archive.url(args, options),
            method: 'post',
        })
    
    archive.form = archiveForm
/**
* @see \App\Http\Controllers\ApplicationController::restoreArchived
 * @see app/Http/Controllers/ApplicationController.php:832
 * @route '/applications/{application}/restore-archived'
 */
export const restoreArchived = (args: { application: string | number } | [application: string | number ] | string | number, options?: RouteQueryOptions): RouteDefinition<'post'> => ({
    url: restoreArchived.url(args, options),
    method: 'post',
})

restoreArchived.definition = {
    methods: ["post"],
    url: '/applications/{application}/restore-archived',
} satisfies RouteDefinition<["post"]>

/**
* @see \App\Http\Controllers\ApplicationController::restoreArchived
 * @see app/Http/Controllers/ApplicationController.php:832
 * @route '/applications/{application}/restore-archived'
 */
restoreArchived.url = (args: { application: string | number } | [application: string | number ] | string | number, options?: RouteQueryOptions) => {
    if (typeof args === 'string' || typeof args === 'number') {
        args = { application: args }
    }

    
    if (Array.isArray(args)) {
        args = {
                    application: args[0],
                }
    }

    args = applyUrlDefaults(args)

    const parsedArgs = {
                        application: args.application,
                }

    return restoreArchived.definition.url
            .replace('{application}', parsedArgs.application.toString())
            .replace(/\/+$/, '') + queryParams(options)
}

/**
* @see \App\Http\Controllers\ApplicationController::restoreArchived
 * @see app/Http/Controllers/ApplicationController.php:832
 * @route '/applications/{application}/restore-archived'
 */
restoreArchived.post = (args: { application: string | number } | [application: string | number ] | string | number, options?: RouteQueryOptions): RouteDefinition<'post'> => ({
    url: restoreArchived.url(args, options),
    method: 'post',
})

    /**
* @see \App\Http\Controllers\ApplicationController::restoreArchived
 * @see app/Http/Controllers/ApplicationController.php:832
 * @route '/applications/{application}/restore-archived'
 */
    const restoreArchivedForm = (args: { application: string | number } | [application: string | number ] | string | number, options?: RouteQueryOptions): RouteFormDefinition<'post'> => ({
        action: restoreArchived.url(args, options),
        method: 'post',
    })

            /**
* @see \App\Http\Controllers\ApplicationController::restoreArchived
 * @see app/Http/Controllers/ApplicationController.php:832
 * @route '/applications/{application}/restore-archived'
 */
        restoreArchivedForm.post = (args: { application: string | number } | [application: string | number ] | string | number, options?: RouteQueryOptions): RouteFormDefinition<'post'> => ({
            action: restoreArchived.url(args, options),
            method: 'post',
        })
    
    restoreArchived.form = restoreArchivedForm
/**
* @see \App\Http\Controllers\ApplicationController::forceDelete
 * @see app/Http/Controllers/ApplicationController.php:850
 * @route '/applications/{application}/force'
 */
export const forceDelete = (args: { application: string | number } | [application: string | number ] | string | number, options?: RouteQueryOptions): RouteDefinition<'delete'> => ({
    url: forceDelete.url(args, options),
    method: 'delete',
})

forceDelete.definition = {
    methods: ["delete"],
    url: '/applications/{application}/force',
} satisfies RouteDefinition<["delete"]>

/**
* @see \App\Http\Controllers\ApplicationController::forceDelete
 * @see app/Http/Controllers/ApplicationController.php:850
 * @route '/applications/{application}/force'
 */
forceDelete.url = (args: { application: string | number } | [application: string | number ] | string | number, options?: RouteQueryOptions) => {
    if (typeof args === 'string' || typeof args === 'number') {
        args = { application: args }
    }

    
    if (Array.isArray(args)) {
        args = {
                    application: args[0],
                }
    }

    args = applyUrlDefaults(args)

    const parsedArgs = {
                        application: args.application,
                }

    return forceDelete.definition.url
            .replace('{application}', parsedArgs.application.toString())
            .replace(/\/+$/, '') + queryParams(options)
}

/**
* @see \App\Http\Controllers\ApplicationController::forceDelete
 * @see app/Http/Controllers/ApplicationController.php:850
 * @route '/applications/{application}/force'
 */
forceDelete.delete = (args: { application: string | number } | [application: string | number ] | string | number, options?: RouteQueryOptions): RouteDefinition<'delete'> => ({
    url: forceDelete.url(args, options),
    method: 'delete',
})

    /**
* @see \App\Http\Controllers\ApplicationController::forceDelete
 * @see app/Http/Controllers/ApplicationController.php:850
 * @route '/applications/{application}/force'
 */
    const forceDeleteForm = (args: { application: string | number } | [application: string | number ] | string | number, options?: RouteQueryOptions): RouteFormDefinition<'post'> => ({
        action: forceDelete.url(args, {
                    [options?.mergeQuery ? 'mergeQuery' : 'query']: {
                        _method: 'DELETE',
                        ...(options?.query ?? options?.mergeQuery ?? {}),
                    }
                }),
        method: 'post',
    })

            /**
* @see \App\Http\Controllers\ApplicationController::forceDelete
 * @see app/Http/Controllers/ApplicationController.php:850
 * @route '/applications/{application}/force'
 */
        forceDeleteForm.delete = (args: { application: string | number } | [application: string | number ] | string | number, options?: RouteQueryOptions): RouteFormDefinition<'post'> => ({
            action: forceDelete.url(args, {
                        [options?.mergeQuery ? 'mergeQuery' : 'query']: {
                            _method: 'DELETE',
                            ...(options?.query ?? options?.mergeQuery ?? {}),
                        }
                    }),
            method: 'post',
        })
    
    forceDelete.form = forceDeleteForm
const applications = {
    store: Object.assign(store, store),
emergency: Object.assign(emergency, emergency),
index: Object.assign(index, index),
approve: Object.assign(approve, approve),
reject: Object.assign(reject, reject),
restore: Object.assign(restore, restore),
archive: Object.assign(archive, archive),
restoreArchived: Object.assign(restoreArchived, restoreArchived),
forceDelete: Object.assign(forceDelete, forceDelete),
}

export default applications