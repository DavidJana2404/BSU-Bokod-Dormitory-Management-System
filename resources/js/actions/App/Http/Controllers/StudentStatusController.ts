import { queryParams, type RouteQueryOptions, type RouteDefinition, type RouteFormDefinition } from './../../../../wayfinder'
/**
* @see \App\Http\Controllers\StudentStatusController::updateStatus
 * @see app/Http/Controllers/StudentStatusController.php:14
 * @route '/student/status'
 */
export const updateStatus = (options?: RouteQueryOptions): RouteDefinition<'put'> => ({
    url: updateStatus.url(options),
    method: 'put',
})

updateStatus.definition = {
    methods: ["put"],
    url: '/student/status',
} satisfies RouteDefinition<["put"]>

/**
* @see \App\Http\Controllers\StudentStatusController::updateStatus
 * @see app/Http/Controllers/StudentStatusController.php:14
 * @route '/student/status'
 */
updateStatus.url = (options?: RouteQueryOptions) => {
    return updateStatus.definition.url + queryParams(options)
}

/**
* @see \App\Http\Controllers\StudentStatusController::updateStatus
 * @see app/Http/Controllers/StudentStatusController.php:14
 * @route '/student/status'
 */
updateStatus.put = (options?: RouteQueryOptions): RouteDefinition<'put'> => ({
    url: updateStatus.url(options),
    method: 'put',
})

    /**
* @see \App\Http\Controllers\StudentStatusController::updateStatus
 * @see app/Http/Controllers/StudentStatusController.php:14
 * @route '/student/status'
 */
    const updateStatusForm = (options?: RouteQueryOptions): RouteFormDefinition<'post'> => ({
        action: updateStatus.url({
                    [options?.mergeQuery ? 'mergeQuery' : 'query']: {
                        _method: 'PUT',
                        ...(options?.query ?? options?.mergeQuery ?? {}),
                    }
                }),
        method: 'post',
    })

            /**
* @see \App\Http\Controllers\StudentStatusController::updateStatus
 * @see app/Http/Controllers/StudentStatusController.php:14
 * @route '/student/status'
 */
        updateStatusForm.put = (options?: RouteQueryOptions): RouteFormDefinition<'post'> => ({
            action: updateStatus.url({
                        [options?.mergeQuery ? 'mergeQuery' : 'query']: {
                            _method: 'PUT',
                            ...(options?.query ?? options?.mergeQuery ?? {}),
                        }
                    }),
            method: 'post',
        })
    
    updateStatus.form = updateStatusForm
const StudentStatusController = { updateStatus }

export default StudentStatusController