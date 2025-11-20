import { queryParams, type RouteQueryOptions, type RouteDefinition, type RouteFormDefinition } from './../../wayfinder'
import setupPasswordEa3feb from './setup-password'
import status from './status'
import settings from './settings'
/**
* @see \App\Http\Controllers\Student\InitialPasswordController::setupPassword
 * @see app/Http/Controllers/Student/InitialPasswordController.php:20
 * @route '/student/setup-password'
 */
export const setupPassword = (options?: RouteQueryOptions): RouteDefinition<'get'> => ({
    url: setupPassword.url(options),
    method: 'get',
})

setupPassword.definition = {
    methods: ["get","head"],
    url: '/student/setup-password',
} satisfies RouteDefinition<["get","head"]>

/**
* @see \App\Http\Controllers\Student\InitialPasswordController::setupPassword
 * @see app/Http/Controllers/Student/InitialPasswordController.php:20
 * @route '/student/setup-password'
 */
setupPassword.url = (options?: RouteQueryOptions) => {
    return setupPassword.definition.url + queryParams(options)
}

/**
* @see \App\Http\Controllers\Student\InitialPasswordController::setupPassword
 * @see app/Http/Controllers/Student/InitialPasswordController.php:20
 * @route '/student/setup-password'
 */
setupPassword.get = (options?: RouteQueryOptions): RouteDefinition<'get'> => ({
    url: setupPassword.url(options),
    method: 'get',
})
/**
* @see \App\Http\Controllers\Student\InitialPasswordController::setupPassword
 * @see app/Http/Controllers/Student/InitialPasswordController.php:20
 * @route '/student/setup-password'
 */
setupPassword.head = (options?: RouteQueryOptions): RouteDefinition<'head'> => ({
    url: setupPassword.url(options),
    method: 'head',
})

    /**
* @see \App\Http\Controllers\Student\InitialPasswordController::setupPassword
 * @see app/Http/Controllers/Student/InitialPasswordController.php:20
 * @route '/student/setup-password'
 */
    const setupPasswordForm = (options?: RouteQueryOptions): RouteFormDefinition<'get'> => ({
        action: setupPassword.url(options),
        method: 'get',
    })

            /**
* @see \App\Http\Controllers\Student\InitialPasswordController::setupPassword
 * @see app/Http/Controllers/Student/InitialPasswordController.php:20
 * @route '/student/setup-password'
 */
        setupPasswordForm.get = (options?: RouteQueryOptions): RouteFormDefinition<'get'> => ({
            action: setupPassword.url(options),
            method: 'get',
        })
            /**
* @see \App\Http\Controllers\Student\InitialPasswordController::setupPassword
 * @see app/Http/Controllers/Student/InitialPasswordController.php:20
 * @route '/student/setup-password'
 */
        setupPasswordForm.head = (options?: RouteQueryOptions): RouteFormDefinition<'get'> => ({
            action: setupPassword.url({
                        [options?.mergeQuery ? 'mergeQuery' : 'query']: {
                            _method: 'HEAD',
                            ...(options?.query ?? options?.mergeQuery ?? {}),
                        }
                    }),
            method: 'get',
        })
    
    setupPassword.form = setupPasswordForm
/**
* @see \App\Http\Controllers\StudentDashboardController::dashboard
 * @see app/Http/Controllers/StudentDashboardController.php:15
 * @route '/student/dashboard'
 */
export const dashboard = (options?: RouteQueryOptions): RouteDefinition<'get'> => ({
    url: dashboard.url(options),
    method: 'get',
})

dashboard.definition = {
    methods: ["get","head"],
    url: '/student/dashboard',
} satisfies RouteDefinition<["get","head"]>

/**
* @see \App\Http\Controllers\StudentDashboardController::dashboard
 * @see app/Http/Controllers/StudentDashboardController.php:15
 * @route '/student/dashboard'
 */
dashboard.url = (options?: RouteQueryOptions) => {
    return dashboard.definition.url + queryParams(options)
}

/**
* @see \App\Http\Controllers\StudentDashboardController::dashboard
 * @see app/Http/Controllers/StudentDashboardController.php:15
 * @route '/student/dashboard'
 */
dashboard.get = (options?: RouteQueryOptions): RouteDefinition<'get'> => ({
    url: dashboard.url(options),
    method: 'get',
})
/**
* @see \App\Http\Controllers\StudentDashboardController::dashboard
 * @see app/Http/Controllers/StudentDashboardController.php:15
 * @route '/student/dashboard'
 */
dashboard.head = (options?: RouteQueryOptions): RouteDefinition<'head'> => ({
    url: dashboard.url(options),
    method: 'head',
})

    /**
* @see \App\Http\Controllers\StudentDashboardController::dashboard
 * @see app/Http/Controllers/StudentDashboardController.php:15
 * @route '/student/dashboard'
 */
    const dashboardForm = (options?: RouteQueryOptions): RouteFormDefinition<'get'> => ({
        action: dashboard.url(options),
        method: 'get',
    })

            /**
* @see \App\Http\Controllers\StudentDashboardController::dashboard
 * @see app/Http/Controllers/StudentDashboardController.php:15
 * @route '/student/dashboard'
 */
        dashboardForm.get = (options?: RouteQueryOptions): RouteFormDefinition<'get'> => ({
            action: dashboard.url(options),
            method: 'get',
        })
            /**
* @see \App\Http\Controllers\StudentDashboardController::dashboard
 * @see app/Http/Controllers/StudentDashboardController.php:15
 * @route '/student/dashboard'
 */
        dashboardForm.head = (options?: RouteQueryOptions): RouteFormDefinition<'get'> => ({
            action: dashboard.url({
                        [options?.mergeQuery ? 'mergeQuery' : 'query']: {
                            _method: 'HEAD',
                            ...(options?.query ?? options?.mergeQuery ?? {}),
                        }
                    }),
            method: 'get',
        })
    
    dashboard.form = dashboardForm
const student = {
    setupPassword: Object.assign(setupPassword, setupPasswordEa3feb),
dashboard: Object.assign(dashboard, dashboard),
status: Object.assign(status, status),
settings: Object.assign(settings, settings),
}

export default student