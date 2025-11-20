import { queryParams, type RouteQueryOptions, type RouteDefinition, type RouteFormDefinition } from './../../../wayfinder'
/**
* @see \App\Http\Controllers\Student\InitialPasswordController::check
 * @see app/Http/Controllers/Student/InitialPasswordController.php:77
 * @route '/api/student/check'
 */
export const check = (options?: RouteQueryOptions): RouteDefinition<'post'> => ({
    url: check.url(options),
    method: 'post',
})

check.definition = {
    methods: ["post"],
    url: '/api/student/check',
} satisfies RouteDefinition<["post"]>

/**
* @see \App\Http\Controllers\Student\InitialPasswordController::check
 * @see app/Http/Controllers/Student/InitialPasswordController.php:77
 * @route '/api/student/check'
 */
check.url = (options?: RouteQueryOptions) => {
    return check.definition.url + queryParams(options)
}

/**
* @see \App\Http\Controllers\Student\InitialPasswordController::check
 * @see app/Http/Controllers/Student/InitialPasswordController.php:77
 * @route '/api/student/check'
 */
check.post = (options?: RouteQueryOptions): RouteDefinition<'post'> => ({
    url: check.url(options),
    method: 'post',
})

    /**
* @see \App\Http\Controllers\Student\InitialPasswordController::check
 * @see app/Http/Controllers/Student/InitialPasswordController.php:77
 * @route '/api/student/check'
 */
    const checkForm = (options?: RouteQueryOptions): RouteFormDefinition<'post'> => ({
        action: check.url(options),
        method: 'post',
    })

            /**
* @see \App\Http\Controllers\Student\InitialPasswordController::check
 * @see app/Http/Controllers/Student/InitialPasswordController.php:77
 * @route '/api/student/check'
 */
        checkForm.post = (options?: RouteQueryOptions): RouteFormDefinition<'post'> => ({
            action: check.url(options),
            method: 'post',
        })
    
    check.form = checkForm
const student = {
    check: Object.assign(check, check),
}

export default student