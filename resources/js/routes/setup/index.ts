import { queryParams, type RouteQueryOptions, type RouteDefinition, type RouteFormDefinition } from './../../wayfinder'
/**
* @see \App\Http\Controllers\AdminSetupController::promoteFirstUser
 * @see app/Http/Controllers/AdminSetupController.php:15
 * @route '/setup/promote-first-user'
 */
export const promoteFirstUser = (options?: RouteQueryOptions): RouteDefinition<'post'> => ({
    url: promoteFirstUser.url(options),
    method: 'post',
})

promoteFirstUser.definition = {
    methods: ["post"],
    url: '/setup/promote-first-user',
} satisfies RouteDefinition<["post"]>

/**
* @see \App\Http\Controllers\AdminSetupController::promoteFirstUser
 * @see app/Http/Controllers/AdminSetupController.php:15
 * @route '/setup/promote-first-user'
 */
promoteFirstUser.url = (options?: RouteQueryOptions) => {
    return promoteFirstUser.definition.url + queryParams(options)
}

/**
* @see \App\Http\Controllers\AdminSetupController::promoteFirstUser
 * @see app/Http/Controllers/AdminSetupController.php:15
 * @route '/setup/promote-first-user'
 */
promoteFirstUser.post = (options?: RouteQueryOptions): RouteDefinition<'post'> => ({
    url: promoteFirstUser.url(options),
    method: 'post',
})

    /**
* @see \App\Http\Controllers\AdminSetupController::promoteFirstUser
 * @see app/Http/Controllers/AdminSetupController.php:15
 * @route '/setup/promote-first-user'
 */
    const promoteFirstUserForm = (options?: RouteQueryOptions): RouteFormDefinition<'post'> => ({
        action: promoteFirstUser.url(options),
        method: 'post',
    })

            /**
* @see \App\Http\Controllers\AdminSetupController::promoteFirstUser
 * @see app/Http/Controllers/AdminSetupController.php:15
 * @route '/setup/promote-first-user'
 */
        promoteFirstUserForm.post = (options?: RouteQueryOptions): RouteFormDefinition<'post'> => ({
            action: promoteFirstUser.url(options),
            method: 'post',
        })
    
    promoteFirstUser.form = promoteFirstUserForm
/**
* @see \App\Http\Controllers\AdminSetupController::promoteUser
 * @see app/Http/Controllers/AdminSetupController.php:51
 * @route '/setup/promote-user'
 */
export const promoteUser = (options?: RouteQueryOptions): RouteDefinition<'post'> => ({
    url: promoteUser.url(options),
    method: 'post',
})

promoteUser.definition = {
    methods: ["post"],
    url: '/setup/promote-user',
} satisfies RouteDefinition<["post"]>

/**
* @see \App\Http\Controllers\AdminSetupController::promoteUser
 * @see app/Http/Controllers/AdminSetupController.php:51
 * @route '/setup/promote-user'
 */
promoteUser.url = (options?: RouteQueryOptions) => {
    return promoteUser.definition.url + queryParams(options)
}

/**
* @see \App\Http\Controllers\AdminSetupController::promoteUser
 * @see app/Http/Controllers/AdminSetupController.php:51
 * @route '/setup/promote-user'
 */
promoteUser.post = (options?: RouteQueryOptions): RouteDefinition<'post'> => ({
    url: promoteUser.url(options),
    method: 'post',
})

    /**
* @see \App\Http\Controllers\AdminSetupController::promoteUser
 * @see app/Http/Controllers/AdminSetupController.php:51
 * @route '/setup/promote-user'
 */
    const promoteUserForm = (options?: RouteQueryOptions): RouteFormDefinition<'post'> => ({
        action: promoteUser.url(options),
        method: 'post',
    })

            /**
* @see \App\Http\Controllers\AdminSetupController::promoteUser
 * @see app/Http/Controllers/AdminSetupController.php:51
 * @route '/setup/promote-user'
 */
        promoteUserForm.post = (options?: RouteQueryOptions): RouteFormDefinition<'post'> => ({
            action: promoteUser.url(options),
            method: 'post',
        })
    
    promoteUser.form = promoteUserForm
const setup = {
    promoteFirstUser: Object.assign(promoteFirstUser, promoteFirstUser),
promoteUser: Object.assign(promoteUser, promoteUser),
}

export default setup