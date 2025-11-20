import { queryParams, type RouteQueryOptions, type RouteDefinition, type RouteFormDefinition, applyUrlDefaults } from './../../../../wayfinder'
/**
* @see \App\Http\Controllers\CashierDashboardController::update
 * @see app/Http/Controllers/CashierDashboardController.php:101
 * @route '/cashier/students/{student}/payment'
 */
export const update = (args: { student: string | number } | [student: string | number ] | string | number, options?: RouteQueryOptions): RouteDefinition<'put'> => ({
    url: update.url(args, options),
    method: 'put',
})

update.definition = {
    methods: ["put"],
    url: '/cashier/students/{student}/payment',
} satisfies RouteDefinition<["put"]>

/**
* @see \App\Http\Controllers\CashierDashboardController::update
 * @see app/Http/Controllers/CashierDashboardController.php:101
 * @route '/cashier/students/{student}/payment'
 */
update.url = (args: { student: string | number } | [student: string | number ] | string | number, options?: RouteQueryOptions) => {
    if (typeof args === 'string' || typeof args === 'number') {
        args = { student: args }
    }

    
    if (Array.isArray(args)) {
        args = {
                    student: args[0],
                }
    }

    args = applyUrlDefaults(args)

    const parsedArgs = {
                        student: args.student,
                }

    return update.definition.url
            .replace('{student}', parsedArgs.student.toString())
            .replace(/\/+$/, '') + queryParams(options)
}

/**
* @see \App\Http\Controllers\CashierDashboardController::update
 * @see app/Http/Controllers/CashierDashboardController.php:101
 * @route '/cashier/students/{student}/payment'
 */
update.put = (args: { student: string | number } | [student: string | number ] | string | number, options?: RouteQueryOptions): RouteDefinition<'put'> => ({
    url: update.url(args, options),
    method: 'put',
})

    /**
* @see \App\Http\Controllers\CashierDashboardController::update
 * @see app/Http/Controllers/CashierDashboardController.php:101
 * @route '/cashier/students/{student}/payment'
 */
    const updateForm = (args: { student: string | number } | [student: string | number ] | string | number, options?: RouteQueryOptions): RouteFormDefinition<'post'> => ({
        action: update.url(args, {
                    [options?.mergeQuery ? 'mergeQuery' : 'query']: {
                        _method: 'PUT',
                        ...(options?.query ?? options?.mergeQuery ?? {}),
                    }
                }),
        method: 'post',
    })

            /**
* @see \App\Http\Controllers\CashierDashboardController::update
 * @see app/Http/Controllers/CashierDashboardController.php:101
 * @route '/cashier/students/{student}/payment'
 */
        updateForm.put = (args: { student: string | number } | [student: string | number ] | string | number, options?: RouteQueryOptions): RouteFormDefinition<'post'> => ({
            action: update.url(args, {
                        [options?.mergeQuery ? 'mergeQuery' : 'query']: {
                            _method: 'PUT',
                            ...(options?.query ?? options?.mergeQuery ?? {}),
                        }
                    }),
            method: 'post',
        })
    
    update.form = updateForm
const payment = {
    update: Object.assign(update, update),
}

export default payment