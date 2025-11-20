import { queryParams, type RouteQueryOptions, type RouteDefinition, type RouteFormDefinition } from './../../../wayfinder'
/**
* @see \App\Http\Controllers\StudentStatusController::update
 * @see app/Http/Controllers/StudentStatusController.php:14
 * @route '/student/status'
 */
export const update = (options?: RouteQueryOptions): RouteDefinition<'put'> => ({
    url: update.url(options),
    method: 'put',
})

update.definition = {
    methods: ["put"],
    url: '/student/status',
} satisfies RouteDefinition<["put"]>

/**
* @see \App\Http\Controllers\StudentStatusController::update
 * @see app/Http/Controllers/StudentStatusController.php:14
 * @route '/student/status'
 */
update.url = (options?: RouteQueryOptions) => {
    return update.definition.url + queryParams(options)
}

/**
* @see \App\Http\Controllers\StudentStatusController::update
 * @see app/Http/Controllers/StudentStatusController.php:14
 * @route '/student/status'
 */
update.put = (options?: RouteQueryOptions): RouteDefinition<'put'> => ({
    url: update.url(options),
    method: 'put',
})

    /**
* @see \App\Http\Controllers\StudentStatusController::update
 * @see app/Http/Controllers/StudentStatusController.php:14
 * @route '/student/status'
 */
    const updateForm = (options?: RouteQueryOptions): RouteFormDefinition<'post'> => ({
        action: update.url({
                    [options?.mergeQuery ? 'mergeQuery' : 'query']: {
                        _method: 'PUT',
                        ...(options?.query ?? options?.mergeQuery ?? {}),
                    }
                }),
        method: 'post',
    })

            /**
* @see \App\Http\Controllers\StudentStatusController::update
 * @see app/Http/Controllers/StudentStatusController.php:14
 * @route '/student/status'
 */
        updateForm.put = (options?: RouteQueryOptions): RouteFormDefinition<'post'> => ({
            action: update.url({
                        [options?.mergeQuery ? 'mergeQuery' : 'query']: {
                            _method: 'PUT',
                            ...(options?.query ?? options?.mergeQuery ?? {}),
                        }
                    }),
            method: 'post',
        })
    
    update.form = updateForm
const status = {
    update: Object.assign(update, update),
}

export default status