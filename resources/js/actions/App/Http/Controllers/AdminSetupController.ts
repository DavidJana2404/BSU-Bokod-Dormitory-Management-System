import { queryParams, type RouteQueryOptions, type RouteDefinition, type RouteFormDefinition } from './../../../../wayfinder'
/**
* @see \App\Http\Controllers\AdminSetupController::promoteFirstUserToAdmin
 * @see app/Http/Controllers/AdminSetupController.php:15
 * @route '/setup/promote-first-user'
 */
export const promoteFirstUserToAdmin = (options?: RouteQueryOptions): RouteDefinition<'post'> => ({
    url: promoteFirstUserToAdmin.url(options),
    method: 'post',
})

promoteFirstUserToAdmin.definition = {
    methods: ["post"],
    url: '/setup/promote-first-user',
} satisfies RouteDefinition<["post"]>

/**
* @see \App\Http\Controllers\AdminSetupController::promoteFirstUserToAdmin
 * @see app/Http/Controllers/AdminSetupController.php:15
 * @route '/setup/promote-first-user'
 */
promoteFirstUserToAdmin.url = (options?: RouteQueryOptions) => {
    return promoteFirstUserToAdmin.definition.url + queryParams(options)
}

/**
* @see \App\Http\Controllers\AdminSetupController::promoteFirstUserToAdmin
 * @see app/Http/Controllers/AdminSetupController.php:15
 * @route '/setup/promote-first-user'
 */
promoteFirstUserToAdmin.post = (options?: RouteQueryOptions): RouteDefinition<'post'> => ({
    url: promoteFirstUserToAdmin.url(options),
    method: 'post',
})

    /**
* @see \App\Http\Controllers\AdminSetupController::promoteFirstUserToAdmin
 * @see app/Http/Controllers/AdminSetupController.php:15
 * @route '/setup/promote-first-user'
 */
    const promoteFirstUserToAdminForm = (options?: RouteQueryOptions): RouteFormDefinition<'post'> => ({
        action: promoteFirstUserToAdmin.url(options),
        method: 'post',
    })

            /**
* @see \App\Http\Controllers\AdminSetupController::promoteFirstUserToAdmin
 * @see app/Http/Controllers/AdminSetupController.php:15
 * @route '/setup/promote-first-user'
 */
        promoteFirstUserToAdminForm.post = (options?: RouteQueryOptions): RouteFormDefinition<'post'> => ({
            action: promoteFirstUserToAdmin.url(options),
            method: 'post',
        })
    
    promoteFirstUserToAdmin.form = promoteFirstUserToAdminForm
/**
* @see \App\Http\Controllers\AdminSetupController::promoteUserByEmail
 * @see app/Http/Controllers/AdminSetupController.php:51
 * @route '/setup/promote-user'
 */
export const promoteUserByEmail = (options?: RouteQueryOptions): RouteDefinition<'post'> => ({
    url: promoteUserByEmail.url(options),
    method: 'post',
})

promoteUserByEmail.definition = {
    methods: ["post"],
    url: '/setup/promote-user',
} satisfies RouteDefinition<["post"]>

/**
* @see \App\Http\Controllers\AdminSetupController::promoteUserByEmail
 * @see app/Http/Controllers/AdminSetupController.php:51
 * @route '/setup/promote-user'
 */
promoteUserByEmail.url = (options?: RouteQueryOptions) => {
    return promoteUserByEmail.definition.url + queryParams(options)
}

/**
* @see \App\Http\Controllers\AdminSetupController::promoteUserByEmail
 * @see app/Http/Controllers/AdminSetupController.php:51
 * @route '/setup/promote-user'
 */
promoteUserByEmail.post = (options?: RouteQueryOptions): RouteDefinition<'post'> => ({
    url: promoteUserByEmail.url(options),
    method: 'post',
})

    /**
* @see \App\Http\Controllers\AdminSetupController::promoteUserByEmail
 * @see app/Http/Controllers/AdminSetupController.php:51
 * @route '/setup/promote-user'
 */
    const promoteUserByEmailForm = (options?: RouteQueryOptions): RouteFormDefinition<'post'> => ({
        action: promoteUserByEmail.url(options),
        method: 'post',
    })

            /**
* @see \App\Http\Controllers\AdminSetupController::promoteUserByEmail
 * @see app/Http/Controllers/AdminSetupController.php:51
 * @route '/setup/promote-user'
 */
        promoteUserByEmailForm.post = (options?: RouteQueryOptions): RouteFormDefinition<'post'> => ({
            action: promoteUserByEmail.url(options),
            method: 'post',
        })
    
    promoteUserByEmail.form = promoteUserByEmailForm
const AdminSetupController = { promoteFirstUserToAdmin, promoteUserByEmail }

export default AdminSetupController