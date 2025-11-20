import { queryParams, type RouteQueryOptions, type RouteDefinition, type RouteFormDefinition, applyUrlDefaults } from './../../../../wayfinder'
/**
* @see \App\Http\Controllers\AssignManagerController::index
 * @see app/Http/Controllers/AssignManagerController.php:12
 * @route '/assign-manager'
 */
export const index = (options?: RouteQueryOptions): RouteDefinition<'get'> => ({
    url: index.url(options),
    method: 'get',
})

index.definition = {
    methods: ["get","head"],
    url: '/assign-manager',
} satisfies RouteDefinition<["get","head"]>

/**
* @see \App\Http\Controllers\AssignManagerController::index
 * @see app/Http/Controllers/AssignManagerController.php:12
 * @route '/assign-manager'
 */
index.url = (options?: RouteQueryOptions) => {
    return index.definition.url + queryParams(options)
}

/**
* @see \App\Http\Controllers\AssignManagerController::index
 * @see app/Http/Controllers/AssignManagerController.php:12
 * @route '/assign-manager'
 */
index.get = (options?: RouteQueryOptions): RouteDefinition<'get'> => ({
    url: index.url(options),
    method: 'get',
})
/**
* @see \App\Http\Controllers\AssignManagerController::index
 * @see app/Http/Controllers/AssignManagerController.php:12
 * @route '/assign-manager'
 */
index.head = (options?: RouteQueryOptions): RouteDefinition<'head'> => ({
    url: index.url(options),
    method: 'head',
})

    /**
* @see \App\Http\Controllers\AssignManagerController::index
 * @see app/Http/Controllers/AssignManagerController.php:12
 * @route '/assign-manager'
 */
    const indexForm = (options?: RouteQueryOptions): RouteFormDefinition<'get'> => ({
        action: index.url(options),
        method: 'get',
    })

            /**
* @see \App\Http\Controllers\AssignManagerController::index
 * @see app/Http/Controllers/AssignManagerController.php:12
 * @route '/assign-manager'
 */
        indexForm.get = (options?: RouteQueryOptions): RouteFormDefinition<'get'> => ({
            action: index.url(options),
            method: 'get',
        })
            /**
* @see \App\Http\Controllers\AssignManagerController::index
 * @see app/Http/Controllers/AssignManagerController.php:12
 * @route '/assign-manager'
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
* @see \App\Http\Controllers\AssignManagerController::assign
 * @see app/Http/Controllers/AssignManagerController.php:59
 * @route '/assign-manager/{manager}/assign'
 */
export const assign = (args: { manager: string | number } | [manager: string | number ] | string | number, options?: RouteQueryOptions): RouteDefinition<'post'> => ({
    url: assign.url(args, options),
    method: 'post',
})

assign.definition = {
    methods: ["post"],
    url: '/assign-manager/{manager}/assign',
} satisfies RouteDefinition<["post"]>

/**
* @see \App\Http\Controllers\AssignManagerController::assign
 * @see app/Http/Controllers/AssignManagerController.php:59
 * @route '/assign-manager/{manager}/assign'
 */
assign.url = (args: { manager: string | number } | [manager: string | number ] | string | number, options?: RouteQueryOptions) => {
    if (typeof args === 'string' || typeof args === 'number') {
        args = { manager: args }
    }

    
    if (Array.isArray(args)) {
        args = {
                    manager: args[0],
                }
    }

    args = applyUrlDefaults(args)

    const parsedArgs = {
                        manager: args.manager,
                }

    return assign.definition.url
            .replace('{manager}', parsedArgs.manager.toString())
            .replace(/\/+$/, '') + queryParams(options)
}

/**
* @see \App\Http\Controllers\AssignManagerController::assign
 * @see app/Http/Controllers/AssignManagerController.php:59
 * @route '/assign-manager/{manager}/assign'
 */
assign.post = (args: { manager: string | number } | [manager: string | number ] | string | number, options?: RouteQueryOptions): RouteDefinition<'post'> => ({
    url: assign.url(args, options),
    method: 'post',
})

    /**
* @see \App\Http\Controllers\AssignManagerController::assign
 * @see app/Http/Controllers/AssignManagerController.php:59
 * @route '/assign-manager/{manager}/assign'
 */
    const assignForm = (args: { manager: string | number } | [manager: string | number ] | string | number, options?: RouteQueryOptions): RouteFormDefinition<'post'> => ({
        action: assign.url(args, options),
        method: 'post',
    })

            /**
* @see \App\Http\Controllers\AssignManagerController::assign
 * @see app/Http/Controllers/AssignManagerController.php:59
 * @route '/assign-manager/{manager}/assign'
 */
        assignForm.post = (args: { manager: string | number } | [manager: string | number ] | string | number, options?: RouteQueryOptions): RouteFormDefinition<'post'> => ({
            action: assign.url(args, options),
            method: 'post',
        })
    
    assign.form = assignForm
/**
* @see \App\Http\Controllers\AssignManagerController::unassign
 * @see app/Http/Controllers/AssignManagerController.php:82
 * @route '/assign-manager/{manager}/unassign'
 */
export const unassign = (args: { manager: string | number } | [manager: string | number ] | string | number, options?: RouteQueryOptions): RouteDefinition<'post'> => ({
    url: unassign.url(args, options),
    method: 'post',
})

unassign.definition = {
    methods: ["post"],
    url: '/assign-manager/{manager}/unassign',
} satisfies RouteDefinition<["post"]>

/**
* @see \App\Http\Controllers\AssignManagerController::unassign
 * @see app/Http/Controllers/AssignManagerController.php:82
 * @route '/assign-manager/{manager}/unassign'
 */
unassign.url = (args: { manager: string | number } | [manager: string | number ] | string | number, options?: RouteQueryOptions) => {
    if (typeof args === 'string' || typeof args === 'number') {
        args = { manager: args }
    }

    
    if (Array.isArray(args)) {
        args = {
                    manager: args[0],
                }
    }

    args = applyUrlDefaults(args)

    const parsedArgs = {
                        manager: args.manager,
                }

    return unassign.definition.url
            .replace('{manager}', parsedArgs.manager.toString())
            .replace(/\/+$/, '') + queryParams(options)
}

/**
* @see \App\Http\Controllers\AssignManagerController::unassign
 * @see app/Http/Controllers/AssignManagerController.php:82
 * @route '/assign-manager/{manager}/unassign'
 */
unassign.post = (args: { manager: string | number } | [manager: string | number ] | string | number, options?: RouteQueryOptions): RouteDefinition<'post'> => ({
    url: unassign.url(args, options),
    method: 'post',
})

    /**
* @see \App\Http\Controllers\AssignManagerController::unassign
 * @see app/Http/Controllers/AssignManagerController.php:82
 * @route '/assign-manager/{manager}/unassign'
 */
    const unassignForm = (args: { manager: string | number } | [manager: string | number ] | string | number, options?: RouteQueryOptions): RouteFormDefinition<'post'> => ({
        action: unassign.url(args, options),
        method: 'post',
    })

            /**
* @see \App\Http\Controllers\AssignManagerController::unassign
 * @see app/Http/Controllers/AssignManagerController.php:82
 * @route '/assign-manager/{manager}/unassign'
 */
        unassignForm.post = (args: { manager: string | number } | [manager: string | number ] | string | number, options?: RouteQueryOptions): RouteFormDefinition<'post'> => ({
            action: unassign.url(args, options),
            method: 'post',
        })
    
    unassign.form = unassignForm
/**
* @see \App\Http\Controllers\AssignManagerController::toggleActive
 * @see app/Http/Controllers/AssignManagerController.php:104
 * @route '/users/{id}/toggle-active'
 */
export const toggleActive = (args: { id: string | number } | [id: string | number ] | string | number, options?: RouteQueryOptions): RouteDefinition<'post'> => ({
    url: toggleActive.url(args, options),
    method: 'post',
})

toggleActive.definition = {
    methods: ["post"],
    url: '/users/{id}/toggle-active',
} satisfies RouteDefinition<["post"]>

/**
* @see \App\Http\Controllers\AssignManagerController::toggleActive
 * @see app/Http/Controllers/AssignManagerController.php:104
 * @route '/users/{id}/toggle-active'
 */
toggleActive.url = (args: { id: string | number } | [id: string | number ] | string | number, options?: RouteQueryOptions) => {
    if (typeof args === 'string' || typeof args === 'number') {
        args = { id: args }
    }

    
    if (Array.isArray(args)) {
        args = {
                    id: args[0],
                }
    }

    args = applyUrlDefaults(args)

    const parsedArgs = {
                        id: args.id,
                }

    return toggleActive.definition.url
            .replace('{id}', parsedArgs.id.toString())
            .replace(/\/+$/, '') + queryParams(options)
}

/**
* @see \App\Http\Controllers\AssignManagerController::toggleActive
 * @see app/Http/Controllers/AssignManagerController.php:104
 * @route '/users/{id}/toggle-active'
 */
toggleActive.post = (args: { id: string | number } | [id: string | number ] | string | number, options?: RouteQueryOptions): RouteDefinition<'post'> => ({
    url: toggleActive.url(args, options),
    method: 'post',
})

    /**
* @see \App\Http\Controllers\AssignManagerController::toggleActive
 * @see app/Http/Controllers/AssignManagerController.php:104
 * @route '/users/{id}/toggle-active'
 */
    const toggleActiveForm = (args: { id: string | number } | [id: string | number ] | string | number, options?: RouteQueryOptions): RouteFormDefinition<'post'> => ({
        action: toggleActive.url(args, options),
        method: 'post',
    })

            /**
* @see \App\Http\Controllers\AssignManagerController::toggleActive
 * @see app/Http/Controllers/AssignManagerController.php:104
 * @route '/users/{id}/toggle-active'
 */
        toggleActiveForm.post = (args: { id: string | number } | [id: string | number ] | string | number, options?: RouteQueryOptions): RouteFormDefinition<'post'> => ({
            action: toggleActive.url(args, options),
            method: 'post',
        })
    
    toggleActive.form = toggleActiveForm
const AssignManagerController = { index, assign, unassign, toggleActive }

export default AssignManagerController