import { queryParams, type RouteQueryOptions, type RouteDefinition, type RouteFormDefinition, applyUrlDefaults } from './../../../../wayfinder'
/**
* @see \App\Http\Controllers\CashierDashboardController::index
 * @see app/Http/Controllers/CashierDashboardController.php:20
 * @route '/cashier/dashboard'
 */
export const index = (options?: RouteQueryOptions): RouteDefinition<'get'> => ({
    url: index.url(options),
    method: 'get',
})

index.definition = {
    methods: ["get","head"],
    url: '/cashier/dashboard',
} satisfies RouteDefinition<["get","head"]>

/**
* @see \App\Http\Controllers\CashierDashboardController::index
 * @see app/Http/Controllers/CashierDashboardController.php:20
 * @route '/cashier/dashboard'
 */
index.url = (options?: RouteQueryOptions) => {
    return index.definition.url + queryParams(options)
}

/**
* @see \App\Http\Controllers\CashierDashboardController::index
 * @see app/Http/Controllers/CashierDashboardController.php:20
 * @route '/cashier/dashboard'
 */
index.get = (options?: RouteQueryOptions): RouteDefinition<'get'> => ({
    url: index.url(options),
    method: 'get',
})
/**
* @see \App\Http\Controllers\CashierDashboardController::index
 * @see app/Http/Controllers/CashierDashboardController.php:20
 * @route '/cashier/dashboard'
 */
index.head = (options?: RouteQueryOptions): RouteDefinition<'head'> => ({
    url: index.url(options),
    method: 'head',
})

    /**
* @see \App\Http\Controllers\CashierDashboardController::index
 * @see app/Http/Controllers/CashierDashboardController.php:20
 * @route '/cashier/dashboard'
 */
    const indexForm = (options?: RouteQueryOptions): RouteFormDefinition<'get'> => ({
        action: index.url(options),
        method: 'get',
    })

            /**
* @see \App\Http\Controllers\CashierDashboardController::index
 * @see app/Http/Controllers/CashierDashboardController.php:20
 * @route '/cashier/dashboard'
 */
        indexForm.get = (options?: RouteQueryOptions): RouteFormDefinition<'get'> => ({
            action: index.url(options),
            method: 'get',
        })
            /**
* @see \App\Http\Controllers\CashierDashboardController::index
 * @see app/Http/Controllers/CashierDashboardController.php:20
 * @route '/cashier/dashboard'
 */
        indexForm.head = (options?: RouteQueryOptions): RouteFormDefinition<'get'> => ({
            action: index.url({
                        [options?.mergeQuery ? 'mergeQuery' : 'query']: {
                            _method: 'HEAD',
                            ...(options?.query ?? options?.mergeQuery ?? {}),
                        }
                    }),
            method: 'get',
        })
    
    index.form = indexForm
/**
* @see \App\Http\Controllers\CashierDashboardController::updatePaymentStatus
 * @see app/Http/Controllers/CashierDashboardController.php:101
 * @route '/cashier/students/{student}/payment'
 */
export const updatePaymentStatus = (args: { student: string | number } | [student: string | number ] | string | number, options?: RouteQueryOptions): RouteDefinition<'put'> => ({
    url: updatePaymentStatus.url(args, options),
    method: 'put',
})

updatePaymentStatus.definition = {
    methods: ["put"],
    url: '/cashier/students/{student}/payment',
} satisfies RouteDefinition<["put"]>

/**
* @see \App\Http\Controllers\CashierDashboardController::updatePaymentStatus
 * @see app/Http/Controllers/CashierDashboardController.php:101
 * @route '/cashier/students/{student}/payment'
 */
updatePaymentStatus.url = (args: { student: string | number } | [student: string | number ] | string | number, options?: RouteQueryOptions) => {
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

    return updatePaymentStatus.definition.url
            .replace('{student}', parsedArgs.student.toString())
            .replace(/\/+$/, '') + queryParams(options)
}

/**
* @see \App\Http\Controllers\CashierDashboardController::updatePaymentStatus
 * @see app/Http/Controllers/CashierDashboardController.php:101
 * @route '/cashier/students/{student}/payment'
 */
updatePaymentStatus.put = (args: { student: string | number } | [student: string | number ] | string | number, options?: RouteQueryOptions): RouteDefinition<'put'> => ({
    url: updatePaymentStatus.url(args, options),
    method: 'put',
})

    /**
* @see \App\Http\Controllers\CashierDashboardController::updatePaymentStatus
 * @see app/Http/Controllers/CashierDashboardController.php:101
 * @route '/cashier/students/{student}/payment'
 */
    const updatePaymentStatusForm = (args: { student: string | number } | [student: string | number ] | string | number, options?: RouteQueryOptions): RouteFormDefinition<'post'> => ({
        action: updatePaymentStatus.url(args, {
                    [options?.mergeQuery ? 'mergeQuery' : 'query']: {
                        _method: 'PUT',
                        ...(options?.query ?? options?.mergeQuery ?? {}),
                    }
                }),
        method: 'post',
    })

            /**
* @see \App\Http\Controllers\CashierDashboardController::updatePaymentStatus
 * @see app/Http/Controllers/CashierDashboardController.php:101
 * @route '/cashier/students/{student}/payment'
 */
        updatePaymentStatusForm.put = (args: { student: string | number } | [student: string | number ] | string | number, options?: RouteQueryOptions): RouteFormDefinition<'post'> => ({
            action: updatePaymentStatus.url(args, {
                        [options?.mergeQuery ? 'mergeQuery' : 'query']: {
                            _method: 'PUT',
                            ...(options?.query ?? options?.mergeQuery ?? {}),
                        }
                    }),
            method: 'post',
        })
    
    updatePaymentStatus.form = updatePaymentStatusForm
/**
* @see \App\Http\Controllers\CashierDashboardController::resetPayments
 * @see app/Http/Controllers/CashierDashboardController.php:214
 * @route '/cashier/reset-payments'
 */
export const resetPayments = (options?: RouteQueryOptions): RouteDefinition<'post'> => ({
    url: resetPayments.url(options),
    method: 'post',
})

resetPayments.definition = {
    methods: ["post"],
    url: '/cashier/reset-payments',
} satisfies RouteDefinition<["post"]>

/**
* @see \App\Http\Controllers\CashierDashboardController::resetPayments
 * @see app/Http/Controllers/CashierDashboardController.php:214
 * @route '/cashier/reset-payments'
 */
resetPayments.url = (options?: RouteQueryOptions) => {
    return resetPayments.definition.url + queryParams(options)
}

/**
* @see \App\Http\Controllers\CashierDashboardController::resetPayments
 * @see app/Http/Controllers/CashierDashboardController.php:214
 * @route '/cashier/reset-payments'
 */
resetPayments.post = (options?: RouteQueryOptions): RouteDefinition<'post'> => ({
    url: resetPayments.url(options),
    method: 'post',
})

    /**
* @see \App\Http\Controllers\CashierDashboardController::resetPayments
 * @see app/Http/Controllers/CashierDashboardController.php:214
 * @route '/cashier/reset-payments'
 */
    const resetPaymentsForm = (options?: RouteQueryOptions): RouteFormDefinition<'post'> => ({
        action: resetPayments.url(options),
        method: 'post',
    })

            /**
* @see \App\Http\Controllers\CashierDashboardController::resetPayments
 * @see app/Http/Controllers/CashierDashboardController.php:214
 * @route '/cashier/reset-payments'
 */
        resetPaymentsForm.post = (options?: RouteQueryOptions): RouteFormDefinition<'post'> => ({
            action: resetPayments.url(options),
            method: 'post',
        })
    
    resetPayments.form = resetPaymentsForm
const CashierDashboardController = { index, updatePaymentStatus, resetPayments }

export default CashierDashboardController