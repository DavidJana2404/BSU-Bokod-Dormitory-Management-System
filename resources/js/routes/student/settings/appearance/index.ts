import { queryParams, type RouteQueryOptions, type RouteDefinition, type RouteFormDefinition } from './../../../../wayfinder'
/**
* @see \App\Http\Controllers\Student\Settings\AppearanceController::edit
 * @see app/Http/Controllers/Student/Settings/AppearanceController.php:14
 * @route '/student/settings/appearance'
 */
export const edit = (options?: RouteQueryOptions): RouteDefinition<'get'> => ({
    url: edit.url(options),
    method: 'get',
})

edit.definition = {
    methods: ["get","head"],
    url: '/student/settings/appearance',
} satisfies RouteDefinition<["get","head"]>

/**
* @see \App\Http\Controllers\Student\Settings\AppearanceController::edit
 * @see app/Http/Controllers/Student/Settings/AppearanceController.php:14
 * @route '/student/settings/appearance'
 */
edit.url = (options?: RouteQueryOptions) => {
    return edit.definition.url + queryParams(options)
}

/**
* @see \App\Http\Controllers\Student\Settings\AppearanceController::edit
 * @see app/Http/Controllers/Student/Settings/AppearanceController.php:14
 * @route '/student/settings/appearance'
 */
edit.get = (options?: RouteQueryOptions): RouteDefinition<'get'> => ({
    url: edit.url(options),
    method: 'get',
})
/**
* @see \App\Http\Controllers\Student\Settings\AppearanceController::edit
 * @see app/Http/Controllers/Student/Settings/AppearanceController.php:14
 * @route '/student/settings/appearance'
 */
edit.head = (options?: RouteQueryOptions): RouteDefinition<'head'> => ({
    url: edit.url(options),
    method: 'head',
})

    /**
* @see \App\Http\Controllers\Student\Settings\AppearanceController::edit
 * @see app/Http/Controllers/Student/Settings/AppearanceController.php:14
 * @route '/student/settings/appearance'
 */
    const editForm = (options?: RouteQueryOptions): RouteFormDefinition<'get'> => ({
        action: edit.url(options),
        method: 'get',
    })

            /**
* @see \App\Http\Controllers\Student\Settings\AppearanceController::edit
 * @see app/Http/Controllers/Student/Settings/AppearanceController.php:14
 * @route '/student/settings/appearance'
 */
        editForm.get = (options?: RouteQueryOptions): RouteFormDefinition<'get'> => ({
            action: edit.url(options),
            method: 'get',
        })
            /**
* @see \App\Http\Controllers\Student\Settings\AppearanceController::edit
 * @see app/Http/Controllers/Student/Settings/AppearanceController.php:14
 * @route '/student/settings/appearance'
 */
        editForm.head = (options?: RouteQueryOptions): RouteFormDefinition<'get'> => ({
            action: edit.url({
                        [options?.mergeQuery ? 'mergeQuery' : 'query']: {
                            _method: 'HEAD',
                            ...(options?.query ?? options?.mergeQuery ?? {}),
                        }
                    }),
            method: 'get',
        })
    
    edit.form = editForm
const appearance = {
    edit: Object.assign(edit, edit),
}

export default appearance