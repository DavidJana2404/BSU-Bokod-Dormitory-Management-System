import { queryParams, type RouteQueryOptions, type RouteDefinition, type RouteFormDefinition, applyUrlDefaults } from './../../../wayfinder'
/**
* @see \App\Http\Controllers\PaymentRecordsController::archive
 * @see app/Http/Controllers/PaymentRecordsController.php:70
 * @route '/cashier/records/{record}/archive'
 */
export const archive = (args: { record: string | number } | [record: string | number ] | string | number, options?: RouteQueryOptions): RouteDefinition<'post'> => ({
    url: archive.url(args, options),
    method: 'post',
})

archive.definition = {
    methods: ["post"],
    url: '/cashier/records/{record}/archive',
} satisfies RouteDefinition<["post"]>

/**
* @see \App\Http\Controllers\PaymentRecordsController::archive
 * @see app/Http/Controllers/PaymentRecordsController.php:70
 * @route '/cashier/records/{record}/archive'
 */
archive.url = (args: { record: string | number } | [record: string | number ] | string | number, options?: RouteQueryOptions) => {
    if (typeof args === 'string' || typeof args === 'number') {
        args = { record: args }
    }

    
    if (Array.isArray(args)) {
        args = {
                    record: args[0],
                }
    }

    args = applyUrlDefaults(args)

    const parsedArgs = {
                        record: args.record,
                }

    return archive.definition.url
            .replace('{record}', parsedArgs.record.toString())
            .replace(/\/+$/, '') + queryParams(options)
}

/**
* @see \App\Http\Controllers\PaymentRecordsController::archive
 * @see app/Http/Controllers/PaymentRecordsController.php:70
 * @route '/cashier/records/{record}/archive'
 */
archive.post = (args: { record: string | number } | [record: string | number ] | string | number, options?: RouteQueryOptions): RouteDefinition<'post'> => ({
    url: archive.url(args, options),
    method: 'post',
})

    /**
* @see \App\Http\Controllers\PaymentRecordsController::archive
 * @see app/Http/Controllers/PaymentRecordsController.php:70
 * @route '/cashier/records/{record}/archive'
 */
    const archiveForm = (args: { record: string | number } | [record: string | number ] | string | number, options?: RouteQueryOptions): RouteFormDefinition<'post'> => ({
        action: archive.url(args, options),
        method: 'post',
    })

            /**
* @see \App\Http\Controllers\PaymentRecordsController::archive
 * @see app/Http/Controllers/PaymentRecordsController.php:70
 * @route '/cashier/records/{record}/archive'
 */
        archiveForm.post = (args: { record: string | number } | [record: string | number ] | string | number, options?: RouteQueryOptions): RouteFormDefinition<'post'> => ({
            action: archive.url(args, options),
            method: 'post',
        })
    
    archive.form = archiveForm
/**
* @see \App\Http\Controllers\PaymentRecordsController::restore
 * @see app/Http/Controllers/PaymentRecordsController.php:136
 * @route '/cashier/records/{record}/restore'
 */
export const restore = (args: { record: string | number } | [record: string | number ] | string | number, options?: RouteQueryOptions): RouteDefinition<'post'> => ({
    url: restore.url(args, options),
    method: 'post',
})

restore.definition = {
    methods: ["post"],
    url: '/cashier/records/{record}/restore',
} satisfies RouteDefinition<["post"]>

/**
* @see \App\Http\Controllers\PaymentRecordsController::restore
 * @see app/Http/Controllers/PaymentRecordsController.php:136
 * @route '/cashier/records/{record}/restore'
 */
restore.url = (args: { record: string | number } | [record: string | number ] | string | number, options?: RouteQueryOptions) => {
    if (typeof args === 'string' || typeof args === 'number') {
        args = { record: args }
    }

    
    if (Array.isArray(args)) {
        args = {
                    record: args[0],
                }
    }

    args = applyUrlDefaults(args)

    const parsedArgs = {
                        record: args.record,
                }

    return restore.definition.url
            .replace('{record}', parsedArgs.record.toString())
            .replace(/\/+$/, '') + queryParams(options)
}

/**
* @see \App\Http\Controllers\PaymentRecordsController::restore
 * @see app/Http/Controllers/PaymentRecordsController.php:136
 * @route '/cashier/records/{record}/restore'
 */
restore.post = (args: { record: string | number } | [record: string | number ] | string | number, options?: RouteQueryOptions): RouteDefinition<'post'> => ({
    url: restore.url(args, options),
    method: 'post',
})

    /**
* @see \App\Http\Controllers\PaymentRecordsController::restore
 * @see app/Http/Controllers/PaymentRecordsController.php:136
 * @route '/cashier/records/{record}/restore'
 */
    const restoreForm = (args: { record: string | number } | [record: string | number ] | string | number, options?: RouteQueryOptions): RouteFormDefinition<'post'> => ({
        action: restore.url(args, options),
        method: 'post',
    })

            /**
* @see \App\Http\Controllers\PaymentRecordsController::restore
 * @see app/Http/Controllers/PaymentRecordsController.php:136
 * @route '/cashier/records/{record}/restore'
 */
        restoreForm.post = (args: { record: string | number } | [record: string | number ] | string | number, options?: RouteQueryOptions): RouteFormDefinition<'post'> => ({
            action: restore.url(args, options),
            method: 'post',
        })
    
    restore.form = restoreForm
const records = {
    archive: Object.assign(archive, archive),
restore: Object.assign(restore, restore),
}

export default records