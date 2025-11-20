import { queryParams, type RouteQueryOptions, type RouteDefinition, type RouteFormDefinition } from './../../../wayfinder'
/**
* @see \App\Http\Controllers\Student\InitialPasswordController::store
 * @see app/Http/Controllers/Student/InitialPasswordController.php:32
 * @route '/student/setup-password'
 */
export const store = (options?: RouteQueryOptions): RouteDefinition<'post'> => ({
    url: store.url(options),
    method: 'post',
})

store.definition = {
    methods: ["post"],
    url: '/student/setup-password',
} satisfies RouteDefinition<["post"]>

/**
* @see \App\Http\Controllers\Student\InitialPasswordController::store
 * @see app/Http/Controllers/Student/InitialPasswordController.php:32
 * @route '/student/setup-password'
 */
store.url = (options?: RouteQueryOptions) => {
    return store.definition.url + queryParams(options)
}

/**
* @see \App\Http\Controllers\Student\InitialPasswordController::store
 * @see app/Http/Controllers/Student/InitialPasswordController.php:32
 * @route '/student/setup-password'
 */
store.post = (options?: RouteQueryOptions): RouteDefinition<'post'> => ({
    url: store.url(options),
    method: 'post',
})

    /**
* @see \App\Http\Controllers\Student\InitialPasswordController::store
 * @see app/Http/Controllers/Student/InitialPasswordController.php:32
 * @route '/student/setup-password'
 */
    const storeForm = (options?: RouteQueryOptions): RouteFormDefinition<'post'> => ({
        action: store.url(options),
        method: 'post',
    })

            /**
* @see \App\Http\Controllers\Student\InitialPasswordController::store
 * @see app/Http/Controllers/Student/InitialPasswordController.php:32
 * @route '/student/setup-password'
 */
        storeForm.post = (options?: RouteQueryOptions): RouteFormDefinition<'post'> => ({
            action: store.url(options),
            method: 'post',
        })
    
    store.form = storeForm
const setupPassword = {
    store: Object.assign(store, store),
}

export default setupPassword