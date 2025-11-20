import { queryParams, type RouteQueryOptions, type RouteDefinition, type RouteFormDefinition, applyUrlDefaults } from './../../wayfinder'
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
const assignManager = {
    assign: Object.assign(assign, assign),
unassign: Object.assign(unassign, unassign),
}

export default assignManager