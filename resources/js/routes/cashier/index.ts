import { queryParams, type RouteQueryOptions, type RouteDefinition, type RouteFormDefinition } from './../../wayfinder'
import students from './students'
import recordsE88d67 from './records'
/**
* @see \App\Http\Controllers\CashierDashboardController::dashboard
 * @see app/Http/Controllers/CashierDashboardController.php:20
 * @route '/cashier/dashboard'
 */
export const dashboard = (options?: RouteQueryOptions): RouteDefinition<'get'> => ({
    url: dashboard.url(options),
    method: 'get',
})

dashboard.definition = {
    methods: ["get","head"],
    url: '/cashier/dashboard',
} satisfies RouteDefinition<["get","head"]>

/**
* @see \App\Http\Controllers\CashierDashboardController::dashboard
 * @see app/Http/Controllers/CashierDashboardController.php:20
 * @route '/cashier/dashboard'
 */
dashboard.url = (options?: RouteQueryOptions) => {
    return dashboard.definition.url + queryParams(options)
}

/**
* @see \App\Http\Controllers\CashierDashboardController::dashboard
 * @see app/Http/Controllers/CashierDashboardController.php:20
 * @route '/cashier/dashboard'
 */
dashboard.get = (options?: RouteQueryOptions): RouteDefinition<'get'> => ({
    url: dashboard.url(options),
    method: 'get',
})
/**
* @see \App\Http\Controllers\CashierDashboardController::dashboard
 * @see app/Http/Controllers/CashierDashboardController.php:20
 * @route '/cashier/dashboard'
 */
dashboard.head = (options?: RouteQueryOptions): RouteDefinition<'head'> => ({
    url: dashboard.url(options),
    method: 'head',
})

    /**
* @see \App\Http\Controllers\CashierDashboardController::dashboard
 * @see app/Http/Controllers/CashierDashboardController.php:20
 * @route '/cashier/dashboard'
 */
    const dashboardForm = (options?: RouteQueryOptions): RouteFormDefinition<'get'> => ({
        action: dashboard.url(options),
        method: 'get',
    })

            /**
* @see \App\Http\Controllers\CashierDashboardController::dashboard
 * @see app/Http/Controllers/CashierDashboardController.php:20
 * @route '/cashier/dashboard'
 */
        dashboardForm.get = (options?: RouteQueryOptions): RouteFormDefinition<'get'> => ({
            action: dashboard.url(options),
            method: 'get',
        })
            /**
* @see \App\Http\Controllers\CashierDashboardController::dashboard
 * @see app/Http/Controllers/CashierDashboardController.php:20
 * @route '/cashier/dashboard'
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
/**
* @see \App\Http\Controllers\PaymentRecordsController::records
 * @see app/Http/Controllers/PaymentRecordsController.php:16
 * @route '/cashier/records'
 */
export const records = (options?: RouteQueryOptions): RouteDefinition<'get'> => ({
    url: records.url(options),
    method: 'get',
})

records.definition = {
    methods: ["get","head"],
    url: '/cashier/records',
} satisfies RouteDefinition<["get","head"]>

/**
* @see \App\Http\Controllers\PaymentRecordsController::records
 * @see app/Http/Controllers/PaymentRecordsController.php:16
 * @route '/cashier/records'
 */
records.url = (options?: RouteQueryOptions) => {
    return records.definition.url + queryParams(options)
}

/**
* @see \App\Http\Controllers\PaymentRecordsController::records
 * @see app/Http/Controllers/PaymentRecordsController.php:16
 * @route '/cashier/records'
 */
records.get = (options?: RouteQueryOptions): RouteDefinition<'get'> => ({
    url: records.url(options),
    method: 'get',
})
/**
* @see \App\Http\Controllers\PaymentRecordsController::records
 * @see app/Http/Controllers/PaymentRecordsController.php:16
 * @route '/cashier/records'
 */
records.head = (options?: RouteQueryOptions): RouteDefinition<'head'> => ({
    url: records.url(options),
    method: 'head',
})

    /**
* @see \App\Http\Controllers\PaymentRecordsController::records
 * @see app/Http/Controllers/PaymentRecordsController.php:16
 * @route '/cashier/records'
 */
    const recordsForm = (options?: RouteQueryOptions): RouteFormDefinition<'get'> => ({
        action: records.url(options),
        method: 'get',
    })

            /**
* @see \App\Http\Controllers\PaymentRecordsController::records
 * @see app/Http/Controllers/PaymentRecordsController.php:16
 * @route '/cashier/records'
 */
        recordsForm.get = (options?: RouteQueryOptions): RouteFormDefinition<'get'> => ({
            action: records.url(options),
            method: 'get',
        })
            /**
* @see \App\Http\Controllers\PaymentRecordsController::records
 * @see app/Http/Controllers/PaymentRecordsController.php:16
 * @route '/cashier/records'
 */
        recordsForm.head = (options?: RouteQueryOptions): RouteFormDefinition<'get'> => ({
            action: records.url({
                        [options?.mergeQuery ? 'mergeQuery' : 'query']: {
                            _method: 'HEAD',
                            ...(options?.query ?? options?.mergeQuery ?? {}),
                        }
                    }),
            method: 'get',
        })
    
    records.form = recordsForm
/**
* @see \App\Http\Controllers\PaymentRecordsController::archivedRecords
 * @see app/Http/Controllers/PaymentRecordsController.php:81
 * @route '/cashier/archived-records'
 */
export const archivedRecords = (options?: RouteQueryOptions): RouteDefinition<'get'> => ({
    url: archivedRecords.url(options),
    method: 'get',
})

archivedRecords.definition = {
    methods: ["get","head"],
    url: '/cashier/archived-records',
} satisfies RouteDefinition<["get","head"]>

/**
* @see \App\Http\Controllers\PaymentRecordsController::archivedRecords
 * @see app/Http/Controllers/PaymentRecordsController.php:81
 * @route '/cashier/archived-records'
 */
archivedRecords.url = (options?: RouteQueryOptions) => {
    return archivedRecords.definition.url + queryParams(options)
}

/**
* @see \App\Http\Controllers\PaymentRecordsController::archivedRecords
 * @see app/Http/Controllers/PaymentRecordsController.php:81
 * @route '/cashier/archived-records'
 */
archivedRecords.get = (options?: RouteQueryOptions): RouteDefinition<'get'> => ({
    url: archivedRecords.url(options),
    method: 'get',
})
/**
* @see \App\Http\Controllers\PaymentRecordsController::archivedRecords
 * @see app/Http/Controllers/PaymentRecordsController.php:81
 * @route '/cashier/archived-records'
 */
archivedRecords.head = (options?: RouteQueryOptions): RouteDefinition<'head'> => ({
    url: archivedRecords.url(options),
    method: 'head',
})

    /**
* @see \App\Http\Controllers\PaymentRecordsController::archivedRecords
 * @see app/Http/Controllers/PaymentRecordsController.php:81
 * @route '/cashier/archived-records'
 */
    const archivedRecordsForm = (options?: RouteQueryOptions): RouteFormDefinition<'get'> => ({
        action: archivedRecords.url(options),
        method: 'get',
    })

            /**
* @see \App\Http\Controllers\PaymentRecordsController::archivedRecords
 * @see app/Http/Controllers/PaymentRecordsController.php:81
 * @route '/cashier/archived-records'
 */
        archivedRecordsForm.get = (options?: RouteQueryOptions): RouteFormDefinition<'get'> => ({
            action: archivedRecords.url(options),
            method: 'get',
        })
            /**
* @see \App\Http\Controllers\PaymentRecordsController::archivedRecords
 * @see app/Http/Controllers/PaymentRecordsController.php:81
 * @route '/cashier/archived-records'
 */
        archivedRecordsForm.head = (options?: RouteQueryOptions): RouteFormDefinition<'get'> => ({
            action: archivedRecords.url({
                        [options?.mergeQuery ? 'mergeQuery' : 'query']: {
                            _method: 'HEAD',
                            ...(options?.query ?? options?.mergeQuery ?? {}),
                        }
                    }),
            method: 'get',
        })
    
    archivedRecords.form = archivedRecordsForm
const cashier = {
    dashboard: Object.assign(dashboard, dashboard),
students: Object.assign(students, students),
resetPayments: Object.assign(resetPayments, resetPayments),
records: Object.assign(records, recordsE88d67),
archivedRecords: Object.assign(archivedRecords, archivedRecords),
}

export default cashier