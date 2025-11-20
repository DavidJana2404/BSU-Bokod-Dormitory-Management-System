import { queryParams, type RouteQueryOptions, type RouteDefinition, type RouteFormDefinition, applyUrlDefaults } from './../../../../wayfinder'
/**
* @see \App\Http\Controllers\BookingController::store
 * @see app/Http/Controllers/BookingController.php:228
 * @route '/bookings'
 */
export const store = (options?: RouteQueryOptions): RouteDefinition<'post'> => ({
    url: store.url(options),
    method: 'post',
})

store.definition = {
    methods: ["post"],
    url: '/bookings',
} satisfies RouteDefinition<["post"]>

/**
* @see \App\Http\Controllers\BookingController::store
 * @see app/Http/Controllers/BookingController.php:228
 * @route '/bookings'
 */
store.url = (options?: RouteQueryOptions) => {
    return store.definition.url + queryParams(options)
}

/**
* @see \App\Http\Controllers\BookingController::store
 * @see app/Http/Controllers/BookingController.php:228
 * @route '/bookings'
 */
store.post = (options?: RouteQueryOptions): RouteDefinition<'post'> => ({
    url: store.url(options),
    method: 'post',
})

    /**
* @see \App\Http\Controllers\BookingController::store
 * @see app/Http/Controllers/BookingController.php:228
 * @route '/bookings'
 */
    const storeForm = (options?: RouteQueryOptions): RouteFormDefinition<'post'> => ({
        action: store.url(options),
        method: 'post',
    })

            /**
* @see \App\Http\Controllers\BookingController::store
 * @see app/Http/Controllers/BookingController.php:228
 * @route '/bookings'
 */
        storeForm.post = (options?: RouteQueryOptions): RouteFormDefinition<'post'> => ({
            action: store.url(options),
            method: 'post',
        })
    
    store.form = storeForm
/**
* @see \App\Http\Controllers\BookingController::destroy
 * @see app/Http/Controllers/BookingController.php:450
 * @route '/bookings/{booking}'
 */
export const destroy = (args: { booking: string | number } | [booking: string | number ] | string | number, options?: RouteQueryOptions): RouteDefinition<'delete'> => ({
    url: destroy.url(args, options),
    method: 'delete',
})

destroy.definition = {
    methods: ["delete"],
    url: '/bookings/{booking}',
} satisfies RouteDefinition<["delete"]>

/**
* @see \App\Http\Controllers\BookingController::destroy
 * @see app/Http/Controllers/BookingController.php:450
 * @route '/bookings/{booking}'
 */
destroy.url = (args: { booking: string | number } | [booking: string | number ] | string | number, options?: RouteQueryOptions) => {
    if (typeof args === 'string' || typeof args === 'number') {
        args = { booking: args }
    }

    
    if (Array.isArray(args)) {
        args = {
                    booking: args[0],
                }
    }

    args = applyUrlDefaults(args)

    const parsedArgs = {
                        booking: args.booking,
                }

    return destroy.definition.url
            .replace('{booking}', parsedArgs.booking.toString())
            .replace(/\/+$/, '') + queryParams(options)
}

/**
* @see \App\Http\Controllers\BookingController::destroy
 * @see app/Http/Controllers/BookingController.php:450
 * @route '/bookings/{booking}'
 */
destroy.delete = (args: { booking: string | number } | [booking: string | number ] | string | number, options?: RouteQueryOptions): RouteDefinition<'delete'> => ({
    url: destroy.url(args, options),
    method: 'delete',
})

    /**
* @see \App\Http\Controllers\BookingController::destroy
 * @see app/Http/Controllers/BookingController.php:450
 * @route '/bookings/{booking}'
 */
    const destroyForm = (args: { booking: string | number } | [booking: string | number ] | string | number, options?: RouteQueryOptions): RouteFormDefinition<'post'> => ({
        action: destroy.url(args, {
                    [options?.mergeQuery ? 'mergeQuery' : 'query']: {
                        _method: 'DELETE',
                        ...(options?.query ?? options?.mergeQuery ?? {}),
                    }
                }),
        method: 'post',
    })

            /**
* @see \App\Http\Controllers\BookingController::destroy
 * @see app/Http/Controllers/BookingController.php:450
 * @route '/bookings/{booking}'
 */
        destroyForm.delete = (args: { booking: string | number } | [booking: string | number ] | string | number, options?: RouteQueryOptions): RouteFormDefinition<'post'> => ({
            action: destroy.url(args, {
                        [options?.mergeQuery ? 'mergeQuery' : 'query']: {
                            _method: 'DELETE',
                            ...(options?.query ?? options?.mergeQuery ?? {}),
                        }
                    }),
            method: 'post',
        })
    
    destroy.form = destroyForm
/**
* @see \App\Http\Controllers\BookingController::index
 * @see app/Http/Controllers/BookingController.php:17
 * @route '/bookings'
 */
export const index = (options?: RouteQueryOptions): RouteDefinition<'get'> => ({
    url: index.url(options),
    method: 'get',
})

index.definition = {
    methods: ["get","head"],
    url: '/bookings',
} satisfies RouteDefinition<["get","head"]>

/**
* @see \App\Http\Controllers\BookingController::index
 * @see app/Http/Controllers/BookingController.php:17
 * @route '/bookings'
 */
index.url = (options?: RouteQueryOptions) => {
    return index.definition.url + queryParams(options)
}

/**
* @see \App\Http\Controllers\BookingController::index
 * @see app/Http/Controllers/BookingController.php:17
 * @route '/bookings'
 */
index.get = (options?: RouteQueryOptions): RouteDefinition<'get'> => ({
    url: index.url(options),
    method: 'get',
})
/**
* @see \App\Http\Controllers\BookingController::index
 * @see app/Http/Controllers/BookingController.php:17
 * @route '/bookings'
 */
index.head = (options?: RouteQueryOptions): RouteDefinition<'head'> => ({
    url: index.url(options),
    method: 'head',
})

    /**
* @see \App\Http\Controllers\BookingController::index
 * @see app/Http/Controllers/BookingController.php:17
 * @route '/bookings'
 */
    const indexForm = (options?: RouteQueryOptions): RouteFormDefinition<'get'> => ({
        action: index.url(options),
        method: 'get',
    })

            /**
* @see \App\Http\Controllers\BookingController::index
 * @see app/Http/Controllers/BookingController.php:17
 * @route '/bookings'
 */
        indexForm.get = (options?: RouteQueryOptions): RouteFormDefinition<'get'> => ({
            action: index.url(options),
            method: 'get',
        })
            /**
* @see \App\Http\Controllers\BookingController::index
 * @see app/Http/Controllers/BookingController.php:17
 * @route '/bookings'
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
* @see \App\Http\Controllers\BookingController::show
 * @see app/Http/Controllers/BookingController.php:342
 * @route '/bookings/{booking}'
 */
export const show = (args: { booking: string | number } | [booking: string | number ] | string | number, options?: RouteQueryOptions): RouteDefinition<'get'> => ({
    url: show.url(args, options),
    method: 'get',
})

show.definition = {
    methods: ["get","head"],
    url: '/bookings/{booking}',
} satisfies RouteDefinition<["get","head"]>

/**
* @see \App\Http\Controllers\BookingController::show
 * @see app/Http/Controllers/BookingController.php:342
 * @route '/bookings/{booking}'
 */
show.url = (args: { booking: string | number } | [booking: string | number ] | string | number, options?: RouteQueryOptions) => {
    if (typeof args === 'string' || typeof args === 'number') {
        args = { booking: args }
    }

    
    if (Array.isArray(args)) {
        args = {
                    booking: args[0],
                }
    }

    args = applyUrlDefaults(args)

    const parsedArgs = {
                        booking: args.booking,
                }

    return show.definition.url
            .replace('{booking}', parsedArgs.booking.toString())
            .replace(/\/+$/, '') + queryParams(options)
}

/**
* @see \App\Http\Controllers\BookingController::show
 * @see app/Http/Controllers/BookingController.php:342
 * @route '/bookings/{booking}'
 */
show.get = (args: { booking: string | number } | [booking: string | number ] | string | number, options?: RouteQueryOptions): RouteDefinition<'get'> => ({
    url: show.url(args, options),
    method: 'get',
})
/**
* @see \App\Http\Controllers\BookingController::show
 * @see app/Http/Controllers/BookingController.php:342
 * @route '/bookings/{booking}'
 */
show.head = (args: { booking: string | number } | [booking: string | number ] | string | number, options?: RouteQueryOptions): RouteDefinition<'head'> => ({
    url: show.url(args, options),
    method: 'head',
})

    /**
* @see \App\Http\Controllers\BookingController::show
 * @see app/Http/Controllers/BookingController.php:342
 * @route '/bookings/{booking}'
 */
    const showForm = (args: { booking: string | number } | [booking: string | number ] | string | number, options?: RouteQueryOptions): RouteFormDefinition<'get'> => ({
        action: show.url(args, options),
        method: 'get',
    })

            /**
* @see \App\Http\Controllers\BookingController::show
 * @see app/Http/Controllers/BookingController.php:342
 * @route '/bookings/{booking}'
 */
        showForm.get = (args: { booking: string | number } | [booking: string | number ] | string | number, options?: RouteQueryOptions): RouteFormDefinition<'get'> => ({
            action: show.url(args, options),
            method: 'get',
        })
            /**
* @see \App\Http\Controllers\BookingController::show
 * @see app/Http/Controllers/BookingController.php:342
 * @route '/bookings/{booking}'
 */
        showForm.head = (args: { booking: string | number } | [booking: string | number ] | string | number, options?: RouteQueryOptions): RouteFormDefinition<'get'> => ({
            action: show.url(args, {
                        [options?.mergeQuery ? 'mergeQuery' : 'query']: {
                            _method: 'HEAD',
                            ...(options?.query ?? options?.mergeQuery ?? {}),
                        }
                    }),
            method: 'get',
        })
    
    show.form = showForm
/**
* @see \App\Http\Controllers\BookingController::update
 * @see app/Http/Controllers/BookingController.php:377
 * @route '/bookings/{booking}'
 */
const update6c85be6b7173673130df8a61609a49cb = (args: { booking: string | number } | [booking: string | number ] | string | number, options?: RouteQueryOptions): RouteDefinition<'put'> => ({
    url: update6c85be6b7173673130df8a61609a49cb.url(args, options),
    method: 'put',
})

update6c85be6b7173673130df8a61609a49cb.definition = {
    methods: ["put"],
    url: '/bookings/{booking}',
} satisfies RouteDefinition<["put"]>

/**
* @see \App\Http\Controllers\BookingController::update
 * @see app/Http/Controllers/BookingController.php:377
 * @route '/bookings/{booking}'
 */
update6c85be6b7173673130df8a61609a49cb.url = (args: { booking: string | number } | [booking: string | number ] | string | number, options?: RouteQueryOptions) => {
    if (typeof args === 'string' || typeof args === 'number') {
        args = { booking: args }
    }

    
    if (Array.isArray(args)) {
        args = {
                    booking: args[0],
                }
    }

    args = applyUrlDefaults(args)

    const parsedArgs = {
                        booking: args.booking,
                }

    return update6c85be6b7173673130df8a61609a49cb.definition.url
            .replace('{booking}', parsedArgs.booking.toString())
            .replace(/\/+$/, '') + queryParams(options)
}

/**
* @see \App\Http\Controllers\BookingController::update
 * @see app/Http/Controllers/BookingController.php:377
 * @route '/bookings/{booking}'
 */
update6c85be6b7173673130df8a61609a49cb.put = (args: { booking: string | number } | [booking: string | number ] | string | number, options?: RouteQueryOptions): RouteDefinition<'put'> => ({
    url: update6c85be6b7173673130df8a61609a49cb.url(args, options),
    method: 'put',
})

    /**
* @see \App\Http\Controllers\BookingController::update
 * @see app/Http/Controllers/BookingController.php:377
 * @route '/bookings/{booking}'
 */
    const update6c85be6b7173673130df8a61609a49cbForm = (args: { booking: string | number } | [booking: string | number ] | string | number, options?: RouteQueryOptions): RouteFormDefinition<'post'> => ({
        action: update6c85be6b7173673130df8a61609a49cb.url(args, {
                    [options?.mergeQuery ? 'mergeQuery' : 'query']: {
                        _method: 'PUT',
                        ...(options?.query ?? options?.mergeQuery ?? {}),
                    }
                }),
        method: 'post',
    })

            /**
* @see \App\Http\Controllers\BookingController::update
 * @see app/Http/Controllers/BookingController.php:377
 * @route '/bookings/{booking}'
 */
        update6c85be6b7173673130df8a61609a49cbForm.put = (args: { booking: string | number } | [booking: string | number ] | string | number, options?: RouteQueryOptions): RouteFormDefinition<'post'> => ({
            action: update6c85be6b7173673130df8a61609a49cb.url(args, {
                        [options?.mergeQuery ? 'mergeQuery' : 'query']: {
                            _method: 'PUT',
                            ...(options?.query ?? options?.mergeQuery ?? {}),
                        }
                    }),
            method: 'post',
        })
    
    update6c85be6b7173673130df8a61609a49cb.form = update6c85be6b7173673130df8a61609a49cbForm
    /**
* @see \App\Http\Controllers\BookingController::update
 * @see app/Http/Controllers/BookingController.php:377
 * @route '/bookings/{booking}'
 */
const update6c85be6b7173673130df8a61609a49cb = (args: { booking: string | number } | [booking: string | number ] | string | number, options?: RouteQueryOptions): RouteDefinition<'patch'> => ({
    url: update6c85be6b7173673130df8a61609a49cb.url(args, options),
    method: 'patch',
})

update6c85be6b7173673130df8a61609a49cb.definition = {
    methods: ["patch"],
    url: '/bookings/{booking}',
} satisfies RouteDefinition<["patch"]>

/**
* @see \App\Http\Controllers\BookingController::update
 * @see app/Http/Controllers/BookingController.php:377
 * @route '/bookings/{booking}'
 */
update6c85be6b7173673130df8a61609a49cb.url = (args: { booking: string | number } | [booking: string | number ] | string | number, options?: RouteQueryOptions) => {
    if (typeof args === 'string' || typeof args === 'number') {
        args = { booking: args }
    }

    
    if (Array.isArray(args)) {
        args = {
                    booking: args[0],
                }
    }

    args = applyUrlDefaults(args)

    const parsedArgs = {
                        booking: args.booking,
                }

    return update6c85be6b7173673130df8a61609a49cb.definition.url
            .replace('{booking}', parsedArgs.booking.toString())
            .replace(/\/+$/, '') + queryParams(options)
}

/**
* @see \App\Http\Controllers\BookingController::update
 * @see app/Http/Controllers/BookingController.php:377
 * @route '/bookings/{booking}'
 */
update6c85be6b7173673130df8a61609a49cb.patch = (args: { booking: string | number } | [booking: string | number ] | string | number, options?: RouteQueryOptions): RouteDefinition<'patch'> => ({
    url: update6c85be6b7173673130df8a61609a49cb.url(args, options),
    method: 'patch',
})

    /**
* @see \App\Http\Controllers\BookingController::update
 * @see app/Http/Controllers/BookingController.php:377
 * @route '/bookings/{booking}'
 */
    const update6c85be6b7173673130df8a61609a49cbForm = (args: { booking: string | number } | [booking: string | number ] | string | number, options?: RouteQueryOptions): RouteFormDefinition<'post'> => ({
        action: update6c85be6b7173673130df8a61609a49cb.url(args, {
                    [options?.mergeQuery ? 'mergeQuery' : 'query']: {
                        _method: 'PATCH',
                        ...(options?.query ?? options?.mergeQuery ?? {}),
                    }
                }),
        method: 'post',
    })

            /**
* @see \App\Http\Controllers\BookingController::update
 * @see app/Http/Controllers/BookingController.php:377
 * @route '/bookings/{booking}'
 */
        update6c85be6b7173673130df8a61609a49cbForm.patch = (args: { booking: string | number } | [booking: string | number ] | string | number, options?: RouteQueryOptions): RouteFormDefinition<'post'> => ({
            action: update6c85be6b7173673130df8a61609a49cb.url(args, {
                        [options?.mergeQuery ? 'mergeQuery' : 'query']: {
                            _method: 'PATCH',
                            ...(options?.query ?? options?.mergeQuery ?? {}),
                        }
                    }),
            method: 'post',
        })
    
    update6c85be6b7173673130df8a61609a49cb.form = update6c85be6b7173673130df8a61609a49cbForm

export const update = {
    '/bookings/{booking}': update6c85be6b7173673130df8a61609a49cb,
    '/bookings/{booking}': update6c85be6b7173673130df8a61609a49cb,
}

/**
* @see \App\Http\Controllers\BookingController::restore
 * @see app/Http/Controllers/BookingController.php:494
 * @route '/bookings/{booking}/restore'
 */
export const restore = (args: { booking: string | number } | [booking: string | number ] | string | number, options?: RouteQueryOptions): RouteDefinition<'post'> => ({
    url: restore.url(args, options),
    method: 'post',
})

restore.definition = {
    methods: ["post"],
    url: '/bookings/{booking}/restore',
} satisfies RouteDefinition<["post"]>

/**
* @see \App\Http\Controllers\BookingController::restore
 * @see app/Http/Controllers/BookingController.php:494
 * @route '/bookings/{booking}/restore'
 */
restore.url = (args: { booking: string | number } | [booking: string | number ] | string | number, options?: RouteQueryOptions) => {
    if (typeof args === 'string' || typeof args === 'number') {
        args = { booking: args }
    }

    
    if (Array.isArray(args)) {
        args = {
                    booking: args[0],
                }
    }

    args = applyUrlDefaults(args)

    const parsedArgs = {
                        booking: args.booking,
                }

    return restore.definition.url
            .replace('{booking}', parsedArgs.booking.toString())
            .replace(/\/+$/, '') + queryParams(options)
}

/**
* @see \App\Http\Controllers\BookingController::restore
 * @see app/Http/Controllers/BookingController.php:494
 * @route '/bookings/{booking}/restore'
 */
restore.post = (args: { booking: string | number } | [booking: string | number ] | string | number, options?: RouteQueryOptions): RouteDefinition<'post'> => ({
    url: restore.url(args, options),
    method: 'post',
})

    /**
* @see \App\Http\Controllers\BookingController::restore
 * @see app/Http/Controllers/BookingController.php:494
 * @route '/bookings/{booking}/restore'
 */
    const restoreForm = (args: { booking: string | number } | [booking: string | number ] | string | number, options?: RouteQueryOptions): RouteFormDefinition<'post'> => ({
        action: restore.url(args, options),
        method: 'post',
    })

            /**
* @see \App\Http\Controllers\BookingController::restore
 * @see app/Http/Controllers/BookingController.php:494
 * @route '/bookings/{booking}/restore'
 */
        restoreForm.post = (args: { booking: string | number } | [booking: string | number ] | string | number, options?: RouteQueryOptions): RouteFormDefinition<'post'> => ({
            action: restore.url(args, options),
            method: 'post',
        })
    
    restore.form = restoreForm
/**
* @see \App\Http\Controllers\BookingController::forceDelete
 * @see app/Http/Controllers/BookingController.php:511
 * @route '/bookings/{booking}/force'
 */
export const forceDelete = (args: { booking: string | number } | [booking: string | number ] | string | number, options?: RouteQueryOptions): RouteDefinition<'delete'> => ({
    url: forceDelete.url(args, options),
    method: 'delete',
})

forceDelete.definition = {
    methods: ["delete"],
    url: '/bookings/{booking}/force',
} satisfies RouteDefinition<["delete"]>

/**
* @see \App\Http\Controllers\BookingController::forceDelete
 * @see app/Http/Controllers/BookingController.php:511
 * @route '/bookings/{booking}/force'
 */
forceDelete.url = (args: { booking: string | number } | [booking: string | number ] | string | number, options?: RouteQueryOptions) => {
    if (typeof args === 'string' || typeof args === 'number') {
        args = { booking: args }
    }

    
    if (Array.isArray(args)) {
        args = {
                    booking: args[0],
                }
    }

    args = applyUrlDefaults(args)

    const parsedArgs = {
                        booking: args.booking,
                }

    return forceDelete.definition.url
            .replace('{booking}', parsedArgs.booking.toString())
            .replace(/\/+$/, '') + queryParams(options)
}

/**
* @see \App\Http\Controllers\BookingController::forceDelete
 * @see app/Http/Controllers/BookingController.php:511
 * @route '/bookings/{booking}/force'
 */
forceDelete.delete = (args: { booking: string | number } | [booking: string | number ] | string | number, options?: RouteQueryOptions): RouteDefinition<'delete'> => ({
    url: forceDelete.url(args, options),
    method: 'delete',
})

    /**
* @see \App\Http\Controllers\BookingController::forceDelete
 * @see app/Http/Controllers/BookingController.php:511
 * @route '/bookings/{booking}/force'
 */
    const forceDeleteForm = (args: { booking: string | number } | [booking: string | number ] | string | number, options?: RouteQueryOptions): RouteFormDefinition<'post'> => ({
        action: forceDelete.url(args, {
                    [options?.mergeQuery ? 'mergeQuery' : 'query']: {
                        _method: 'DELETE',
                        ...(options?.query ?? options?.mergeQuery ?? {}),
                    }
                }),
        method: 'post',
    })

            /**
* @see \App\Http\Controllers\BookingController::forceDelete
 * @see app/Http/Controllers/BookingController.php:511
 * @route '/bookings/{booking}/force'
 */
        forceDeleteForm.delete = (args: { booking: string | number } | [booking: string | number ] | string | number, options?: RouteQueryOptions): RouteFormDefinition<'post'> => ({
            action: forceDelete.url(args, {
                        [options?.mergeQuery ? 'mergeQuery' : 'query']: {
                            _method: 'DELETE',
                            ...(options?.query ?? options?.mergeQuery ?? {}),
                        }
                    }),
            method: 'post',
        })
    
    forceDelete.form = forceDeleteForm
const BookingController = { store, destroy, index, show, update, restore, forceDelete }

export default BookingController