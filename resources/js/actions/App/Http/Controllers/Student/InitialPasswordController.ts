import { queryParams, type RouteQueryOptions, type RouteDefinition, type RouteFormDefinition } from './../../../../../wayfinder'
/**
* @see \App\Http\Controllers\Student\InitialPasswordController::create
 * @see app/Http/Controllers/Student/InitialPasswordController.php:20
 * @route '/student/setup-password'
 */
export const create = (options?: RouteQueryOptions): RouteDefinition<'get'> => ({
    url: create.url(options),
    method: 'get',
})

create.definition = {
    methods: ["get","head"],
    url: '/student/setup-password',
} satisfies RouteDefinition<["get","head"]>

/**
* @see \App\Http\Controllers\Student\InitialPasswordController::create
 * @see app/Http/Controllers/Student/InitialPasswordController.php:20
 * @route '/student/setup-password'
 */
create.url = (options?: RouteQueryOptions) => {
    return create.definition.url + queryParams(options)
}

/**
* @see \App\Http\Controllers\Student\InitialPasswordController::create
 * @see app/Http/Controllers/Student/InitialPasswordController.php:20
 * @route '/student/setup-password'
 */
create.get = (options?: RouteQueryOptions): RouteDefinition<'get'> => ({
    url: create.url(options),
    method: 'get',
})
/**
* @see \App\Http\Controllers\Student\InitialPasswordController::create
 * @see app/Http/Controllers/Student/InitialPasswordController.php:20
 * @route '/student/setup-password'
 */
create.head = (options?: RouteQueryOptions): RouteDefinition<'head'> => ({
    url: create.url(options),
    method: 'head',
})

    /**
* @see \App\Http\Controllers\Student\InitialPasswordController::create
 * @see app/Http/Controllers/Student/InitialPasswordController.php:20
 * @route '/student/setup-password'
 */
    const createForm = (options?: RouteQueryOptions): RouteFormDefinition<'get'> => ({
        action: create.url(options),
        method: 'get',
    })

            /**
* @see \App\Http\Controllers\Student\InitialPasswordController::create
 * @see app/Http/Controllers/Student/InitialPasswordController.php:20
 * @route '/student/setup-password'
 */
        createForm.get = (options?: RouteQueryOptions): RouteFormDefinition<'get'> => ({
            action: create.url(options),
            method: 'get',
        })
            /**
* @see \App\Http\Controllers\Student\InitialPasswordController::create
 * @see app/Http/Controllers/Student/InitialPasswordController.php:20
 * @route '/student/setup-password'
 */
        createForm.head = (options?: RouteQueryOptions): RouteFormDefinition<'get'> => ({
            action: create.url({
                        [options?.mergeQuery ? 'mergeQuery' : 'query']: {
                            _method: 'HEAD',
                            ...(options?.query ?? options?.mergeQuery ?? {}),
                        }
                    }),
            method: 'get',
        })
    
    create.form = createForm
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
/**
* @see \App\Http\Controllers\Student\InitialPasswordController::checkStudent
 * @see app/Http/Controllers/Student/InitialPasswordController.php:77
 * @route '/api/student/check'
 */
export const checkStudent = (options?: RouteQueryOptions): RouteDefinition<'post'> => ({
    url: checkStudent.url(options),
    method: 'post',
})

checkStudent.definition = {
    methods: ["post"],
    url: '/api/student/check',
} satisfies RouteDefinition<["post"]>

/**
* @see \App\Http\Controllers\Student\InitialPasswordController::checkStudent
 * @see app/Http/Controllers/Student/InitialPasswordController.php:77
 * @route '/api/student/check'
 */
checkStudent.url = (options?: RouteQueryOptions) => {
    return checkStudent.definition.url + queryParams(options)
}

/**
* @see \App\Http\Controllers\Student\InitialPasswordController::checkStudent
 * @see app/Http/Controllers/Student/InitialPasswordController.php:77
 * @route '/api/student/check'
 */
checkStudent.post = (options?: RouteQueryOptions): RouteDefinition<'post'> => ({
    url: checkStudent.url(options),
    method: 'post',
})

    /**
* @see \App\Http\Controllers\Student\InitialPasswordController::checkStudent
 * @see app/Http/Controllers/Student/InitialPasswordController.php:77
 * @route '/api/student/check'
 */
    const checkStudentForm = (options?: RouteQueryOptions): RouteFormDefinition<'post'> => ({
        action: checkStudent.url(options),
        method: 'post',
    })

            /**
* @see \App\Http\Controllers\Student\InitialPasswordController::checkStudent
 * @see app/Http/Controllers/Student/InitialPasswordController.php:77
 * @route '/api/student/check'
 */
        checkStudentForm.post = (options?: RouteQueryOptions): RouteFormDefinition<'post'> => ({
            action: checkStudent.url(options),
            method: 'post',
        })
    
    checkStudent.form = checkStudentForm
const InitialPasswordController = { create, store, checkStudent }

export default InitialPasswordController