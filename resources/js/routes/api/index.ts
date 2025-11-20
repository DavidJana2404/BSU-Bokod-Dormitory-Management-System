import { queryParams, type RouteQueryOptions, type RouteDefinition, type RouteFormDefinition } from './../../wayfinder'
import student from './student'
/**
* @see \App\Http\Controllers\ApplicationController::dormitories
 * @see app/Http/Controllers/ApplicationController.php:868
 * @route '/api/dormitories'
 */
export const dormitories = (options?: RouteQueryOptions): RouteDefinition<'get'> => ({
    url: dormitories.url(options),
    method: 'get',
})

dormitories.definition = {
    methods: ["get","head"],
    url: '/api/dormitories',
} satisfies RouteDefinition<["get","head"]>

/**
* @see \App\Http\Controllers\ApplicationController::dormitories
 * @see app/Http/Controllers/ApplicationController.php:868
 * @route '/api/dormitories'
 */
dormitories.url = (options?: RouteQueryOptions) => {
    return dormitories.definition.url + queryParams(options)
}

/**
* @see \App\Http\Controllers\ApplicationController::dormitories
 * @see app/Http/Controllers/ApplicationController.php:868
 * @route '/api/dormitories'
 */
dormitories.get = (options?: RouteQueryOptions): RouteDefinition<'get'> => ({
    url: dormitories.url(options),
    method: 'get',
})
/**
* @see \App\Http\Controllers\ApplicationController::dormitories
 * @see app/Http/Controllers/ApplicationController.php:868
 * @route '/api/dormitories'
 */
dormitories.head = (options?: RouteQueryOptions): RouteDefinition<'head'> => ({
    url: dormitories.url(options),
    method: 'head',
})

    /**
* @see \App\Http\Controllers\ApplicationController::dormitories
 * @see app/Http/Controllers/ApplicationController.php:868
 * @route '/api/dormitories'
 */
    const dormitoriesForm = (options?: RouteQueryOptions): RouteFormDefinition<'get'> => ({
        action: dormitories.url(options),
        method: 'get',
    })

            /**
* @see \App\Http\Controllers\ApplicationController::dormitories
 * @see app/Http/Controllers/ApplicationController.php:868
 * @route '/api/dormitories'
 */
        dormitoriesForm.get = (options?: RouteQueryOptions): RouteFormDefinition<'get'> => ({
            action: dormitories.url(options),
            method: 'get',
        })
            /**
* @see \App\Http\Controllers\ApplicationController::dormitories
 * @see app/Http/Controllers/ApplicationController.php:868
 * @route '/api/dormitories'
 */
        dormitoriesForm.head = (options?: RouteQueryOptions): RouteFormDefinition<'get'> => ({
            action: dormitories.url({
                        [options?.mergeQuery ? 'mergeQuery' : 'query']: {
                            _method: 'HEAD',
                            ...(options?.query ?? options?.mergeQuery ?? {}),
                        }
                    }),
            method: 'get',
        })
    
    dormitories.form = dormitoriesForm
const api = {
    dormitories: Object.assign(dormitories, dormitories),
student: Object.assign(student, student),
}

export default api