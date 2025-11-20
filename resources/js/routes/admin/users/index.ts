import { queryParams, type RouteQueryOptions, type RouteDefinition, type RouteFormDefinition, applyUrlDefaults } from './../../../wayfinder'
import role from './role'
/**
* @see \App\Http\Controllers\AdminUsersController::index
 * @see app/Http/Controllers/AdminUsersController.php:18
 * @route '/admin/users'
 */
export const index = (options?: RouteQueryOptions): RouteDefinition<'get'> => ({
    url: index.url(options),
    method: 'get',
})

index.definition = {
    methods: ["get","head"],
    url: '/admin/users',
} satisfies RouteDefinition<["get","head"]>

/**
* @see \App\Http\Controllers\AdminUsersController::index
 * @see app/Http/Controllers/AdminUsersController.php:18
 * @route '/admin/users'
 */
index.url = (options?: RouteQueryOptions) => {
    return index.definition.url + queryParams(options)
}

/**
* @see \App\Http\Controllers\AdminUsersController::index
 * @see app/Http/Controllers/AdminUsersController.php:18
 * @route '/admin/users'
 */
index.get = (options?: RouteQueryOptions): RouteDefinition<'get'> => ({
    url: index.url(options),
    method: 'get',
})
/**
* @see \App\Http\Controllers\AdminUsersController::index
 * @see app/Http/Controllers/AdminUsersController.php:18
 * @route '/admin/users'
 */
index.head = (options?: RouteQueryOptions): RouteDefinition<'head'> => ({
    url: index.url(options),
    method: 'head',
})

    /**
* @see \App\Http\Controllers\AdminUsersController::index
 * @see app/Http/Controllers/AdminUsersController.php:18
 * @route '/admin/users'
 */
    const indexForm = (options?: RouteQueryOptions): RouteFormDefinition<'get'> => ({
        action: index.url(options),
        method: 'get',
    })

            /**
* @see \App\Http\Controllers\AdminUsersController::index
 * @see app/Http/Controllers/AdminUsersController.php:18
 * @route '/admin/users'
 */
        indexForm.get = (options?: RouteQueryOptions): RouteFormDefinition<'get'> => ({
            action: index.url(options),
            method: 'get',
        })
            /**
* @see \App\Http\Controllers\AdminUsersController::index
 * @see app/Http/Controllers/AdminUsersController.php:18
 * @route '/admin/users'
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
* @see \App\Http\Controllers\AdminUsersController::toggleActive
 * @see app/Http/Controllers/AdminUsersController.php:162
 * @route '/admin/users/{id}/toggle-active'
 */
export const toggleActive = (args: { id: string | number } | [id: string | number ] | string | number, options?: RouteQueryOptions): RouteDefinition<'post'> => ({
    url: toggleActive.url(args, options),
    method: 'post',
})

toggleActive.definition = {
    methods: ["post"],
    url: '/admin/users/{id}/toggle-active',
} satisfies RouteDefinition<["post"]>

/**
* @see \App\Http\Controllers\AdminUsersController::toggleActive
 * @see app/Http/Controllers/AdminUsersController.php:162
 * @route '/admin/users/{id}/toggle-active'
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
* @see \App\Http\Controllers\AdminUsersController::toggleActive
 * @see app/Http/Controllers/AdminUsersController.php:162
 * @route '/admin/users/{id}/toggle-active'
 */
toggleActive.post = (args: { id: string | number } | [id: string | number ] | string | number, options?: RouteQueryOptions): RouteDefinition<'post'> => ({
    url: toggleActive.url(args, options),
    method: 'post',
})

    /**
* @see \App\Http\Controllers\AdminUsersController::toggleActive
 * @see app/Http/Controllers/AdminUsersController.php:162
 * @route '/admin/users/{id}/toggle-active'
 */
    const toggleActiveForm = (args: { id: string | number } | [id: string | number ] | string | number, options?: RouteQueryOptions): RouteFormDefinition<'post'> => ({
        action: toggleActive.url(args, options),
        method: 'post',
    })

            /**
* @see \App\Http\Controllers\AdminUsersController::toggleActive
 * @see app/Http/Controllers/AdminUsersController.php:162
 * @route '/admin/users/{id}/toggle-active'
 */
        toggleActiveForm.post = (args: { id: string | number } | [id: string | number ] | string | number, options?: RouteQueryOptions): RouteFormDefinition<'post'> => ({
            action: toggleActive.url(args, options),
            method: 'post',
        })
    
    toggleActive.form = toggleActiveForm
/**
* @see \App\Http\Controllers\AdminUsersController::toggleRegistration
 * @see app/Http/Controllers/AdminUsersController.php:171
 * @route '/admin/users/toggle-registration'
 */
export const toggleRegistration = (options?: RouteQueryOptions): RouteDefinition<'post'> => ({
    url: toggleRegistration.url(options),
    method: 'post',
})

toggleRegistration.definition = {
    methods: ["post"],
    url: '/admin/users/toggle-registration',
} satisfies RouteDefinition<["post"]>

/**
* @see \App\Http\Controllers\AdminUsersController::toggleRegistration
 * @see app/Http/Controllers/AdminUsersController.php:171
 * @route '/admin/users/toggle-registration'
 */
toggleRegistration.url = (options?: RouteQueryOptions) => {
    return toggleRegistration.definition.url + queryParams(options)
}

/**
* @see \App\Http\Controllers\AdminUsersController::toggleRegistration
 * @see app/Http/Controllers/AdminUsersController.php:171
 * @route '/admin/users/toggle-registration'
 */
toggleRegistration.post = (options?: RouteQueryOptions): RouteDefinition<'post'> => ({
    url: toggleRegistration.url(options),
    method: 'post',
})

    /**
* @see \App\Http\Controllers\AdminUsersController::toggleRegistration
 * @see app/Http/Controllers/AdminUsersController.php:171
 * @route '/admin/users/toggle-registration'
 */
    const toggleRegistrationForm = (options?: RouteQueryOptions): RouteFormDefinition<'post'> => ({
        action: toggleRegistration.url(options),
        method: 'post',
    })

            /**
* @see \App\Http\Controllers\AdminUsersController::toggleRegistration
 * @see app/Http/Controllers/AdminUsersController.php:171
 * @route '/admin/users/toggle-registration'
 */
        toggleRegistrationForm.post = (options?: RouteQueryOptions): RouteFormDefinition<'post'> => ({
            action: toggleRegistration.url(options),
            method: 'post',
        })
    
    toggleRegistration.form = toggleRegistrationForm
/**
* @see \App\Http\Controllers\AdminUsersController::destroy
 * @see app/Http/Controllers/AdminUsersController.php:309
 * @route '/admin/users/{id}'
 */
export const destroy = (args: { id: string | number } | [id: string | number ] | string | number, options?: RouteQueryOptions): RouteDefinition<'delete'> => ({
    url: destroy.url(args, options),
    method: 'delete',
})

destroy.definition = {
    methods: ["delete"],
    url: '/admin/users/{id}',
} satisfies RouteDefinition<["delete"]>

/**
* @see \App\Http\Controllers\AdminUsersController::destroy
 * @see app/Http/Controllers/AdminUsersController.php:309
 * @route '/admin/users/{id}'
 */
destroy.url = (args: { id: string | number } | [id: string | number ] | string | number, options?: RouteQueryOptions) => {
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

    return destroy.definition.url
            .replace('{id}', parsedArgs.id.toString())
            .replace(/\/+$/, '') + queryParams(options)
}

/**
* @see \App\Http\Controllers\AdminUsersController::destroy
 * @see app/Http/Controllers/AdminUsersController.php:309
 * @route '/admin/users/{id}'
 */
destroy.delete = (args: { id: string | number } | [id: string | number ] | string | number, options?: RouteQueryOptions): RouteDefinition<'delete'> => ({
    url: destroy.url(args, options),
    method: 'delete',
})

    /**
* @see \App\Http\Controllers\AdminUsersController::destroy
 * @see app/Http/Controllers/AdminUsersController.php:309
 * @route '/admin/users/{id}'
 */
    const destroyForm = (args: { id: string | number } | [id: string | number ] | string | number, options?: RouteQueryOptions): RouteFormDefinition<'post'> => ({
        action: destroy.url(args, {
                    [options?.mergeQuery ? 'mergeQuery' : 'query']: {
                        _method: 'DELETE',
                        ...(options?.query ?? options?.mergeQuery ?? {}),
                    }
                }),
        method: 'post',
    })

            /**
* @see \App\Http\Controllers\AdminUsersController::destroy
 * @see app/Http/Controllers/AdminUsersController.php:309
 * @route '/admin/users/{id}'
 */
        destroyForm.delete = (args: { id: string | number } | [id: string | number ] | string | number, options?: RouteQueryOptions): RouteFormDefinition<'post'> => ({
            action: destroy.url(args, {
                        [options?.mergeQuery ? 'mergeQuery' : 'query']: {
                            _method: 'DELETE',
                            ...(options?.query ?? options?.mergeQuery ?? {}),
                        }
                    }),
            method: 'post',
        })
    
    destroy.form = destroyForm
const users = {
    index: Object.assign(index, index),
role: Object.assign(role, role),
toggleActive: Object.assign(toggleActive, toggleActive),
toggleRegistration: Object.assign(toggleRegistration, toggleRegistration),
destroy: Object.assign(destroy, destroy),
}

export default users