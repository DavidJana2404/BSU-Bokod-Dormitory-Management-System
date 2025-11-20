import { queryParams, type RouteQueryOptions, type RouteDefinition, type RouteFormDefinition, applyUrlDefaults } from './../../wayfinder'
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
const users = {
    toggleActive: Object.assign(toggleActive, toggleActive),
}

export default users