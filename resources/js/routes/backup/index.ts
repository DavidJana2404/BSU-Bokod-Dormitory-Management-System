import { queryParams, type RouteQueryOptions, type RouteDefinition, type RouteFormDefinition, applyUrlDefaults } from './../../wayfinder'
/**
* @see \App\Http\Controllers\BackupController::index
 * @see app/Http/Controllers/BackupController.php:18
 * @route '/settings/backup'
 */
export const index = (options?: RouteQueryOptions): RouteDefinition<'get'> => ({
    url: index.url(options),
    method: 'get',
})

index.definition = {
    methods: ["get","head"],
    url: '/settings/backup',
} satisfies RouteDefinition<["get","head"]>

/**
* @see \App\Http\Controllers\BackupController::index
 * @see app/Http/Controllers/BackupController.php:18
 * @route '/settings/backup'
 */
index.url = (options?: RouteQueryOptions) => {
    return index.definition.url + queryParams(options)
}

/**
* @see \App\Http\Controllers\BackupController::index
 * @see app/Http/Controllers/BackupController.php:18
 * @route '/settings/backup'
 */
index.get = (options?: RouteQueryOptions): RouteDefinition<'get'> => ({
    url: index.url(options),
    method: 'get',
})
/**
* @see \App\Http\Controllers\BackupController::index
 * @see app/Http/Controllers/BackupController.php:18
 * @route '/settings/backup'
 */
index.head = (options?: RouteQueryOptions): RouteDefinition<'head'> => ({
    url: index.url(options),
    method: 'head',
})

    /**
* @see \App\Http\Controllers\BackupController::index
 * @see app/Http/Controllers/BackupController.php:18
 * @route '/settings/backup'
 */
    const indexForm = (options?: RouteQueryOptions): RouteFormDefinition<'get'> => ({
        action: index.url(options),
        method: 'get',
    })

            /**
* @see \App\Http\Controllers\BackupController::index
 * @see app/Http/Controllers/BackupController.php:18
 * @route '/settings/backup'
 */
        indexForm.get = (options?: RouteQueryOptions): RouteFormDefinition<'get'> => ({
            action: index.url(options),
            method: 'get',
        })
            /**
* @see \App\Http\Controllers\BackupController::index
 * @see app/Http/Controllers/BackupController.php:18
 * @route '/settings/backup'
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
* @see \App\Http\Controllers\BackupController::create
 * @see app/Http/Controllers/BackupController.php:37
 * @route '/settings/backup/create'
 */
export const create = (options?: RouteQueryOptions): RouteDefinition<'post'> => ({
    url: create.url(options),
    method: 'post',
})

create.definition = {
    methods: ["post"],
    url: '/settings/backup/create',
} satisfies RouteDefinition<["post"]>

/**
* @see \App\Http\Controllers\BackupController::create
 * @see app/Http/Controllers/BackupController.php:37
 * @route '/settings/backup/create'
 */
create.url = (options?: RouteQueryOptions) => {
    return create.definition.url + queryParams(options)
}

/**
* @see \App\Http\Controllers\BackupController::create
 * @see app/Http/Controllers/BackupController.php:37
 * @route '/settings/backup/create'
 */
create.post = (options?: RouteQueryOptions): RouteDefinition<'post'> => ({
    url: create.url(options),
    method: 'post',
})

    /**
* @see \App\Http\Controllers\BackupController::create
 * @see app/Http/Controllers/BackupController.php:37
 * @route '/settings/backup/create'
 */
    const createForm = (options?: RouteQueryOptions): RouteFormDefinition<'post'> => ({
        action: create.url(options),
        method: 'post',
    })

            /**
* @see \App\Http\Controllers\BackupController::create
 * @see app/Http/Controllers/BackupController.php:37
 * @route '/settings/backup/create'
 */
        createForm.post = (options?: RouteQueryOptions): RouteFormDefinition<'post'> => ({
            action: create.url(options),
            method: 'post',
        })
    
    create.form = createForm
/**
* @see \App\Http\Controllers\BackupController::download
 * @see app/Http/Controllers/BackupController.php:148
 * @route '/settings/backup/download/{filename}'
 */
export const download = (args: { filename: string | number } | [filename: string | number ] | string | number, options?: RouteQueryOptions): RouteDefinition<'get'> => ({
    url: download.url(args, options),
    method: 'get',
})

download.definition = {
    methods: ["get","head"],
    url: '/settings/backup/download/{filename}',
} satisfies RouteDefinition<["get","head"]>

/**
* @see \App\Http\Controllers\BackupController::download
 * @see app/Http/Controllers/BackupController.php:148
 * @route '/settings/backup/download/{filename}'
 */
download.url = (args: { filename: string | number } | [filename: string | number ] | string | number, options?: RouteQueryOptions) => {
    if (typeof args === 'string' || typeof args === 'number') {
        args = { filename: args }
    }

    
    if (Array.isArray(args)) {
        args = {
                    filename: args[0],
                }
    }

    args = applyUrlDefaults(args)

    const parsedArgs = {
                        filename: args.filename,
                }

    return download.definition.url
            .replace('{filename}', parsedArgs.filename.toString())
            .replace(/\/+$/, '') + queryParams(options)
}

/**
* @see \App\Http\Controllers\BackupController::download
 * @see app/Http/Controllers/BackupController.php:148
 * @route '/settings/backup/download/{filename}'
 */
download.get = (args: { filename: string | number } | [filename: string | number ] | string | number, options?: RouteQueryOptions): RouteDefinition<'get'> => ({
    url: download.url(args, options),
    method: 'get',
})
/**
* @see \App\Http\Controllers\BackupController::download
 * @see app/Http/Controllers/BackupController.php:148
 * @route '/settings/backup/download/{filename}'
 */
download.head = (args: { filename: string | number } | [filename: string | number ] | string | number, options?: RouteQueryOptions): RouteDefinition<'head'> => ({
    url: download.url(args, options),
    method: 'head',
})

    /**
* @see \App\Http\Controllers\BackupController::download
 * @see app/Http/Controllers/BackupController.php:148
 * @route '/settings/backup/download/{filename}'
 */
    const downloadForm = (args: { filename: string | number } | [filename: string | number ] | string | number, options?: RouteQueryOptions): RouteFormDefinition<'get'> => ({
        action: download.url(args, options),
        method: 'get',
    })

            /**
* @see \App\Http\Controllers\BackupController::download
 * @see app/Http/Controllers/BackupController.php:148
 * @route '/settings/backup/download/{filename}'
 */
        downloadForm.get = (args: { filename: string | number } | [filename: string | number ] | string | number, options?: RouteQueryOptions): RouteFormDefinition<'get'> => ({
            action: download.url(args, options),
            method: 'get',
        })
            /**
* @see \App\Http\Controllers\BackupController::download
 * @see app/Http/Controllers/BackupController.php:148
 * @route '/settings/backup/download/{filename}'
 */
        downloadForm.head = (args: { filename: string | number } | [filename: string | number ] | string | number, options?: RouteQueryOptions): RouteFormDefinition<'get'> => ({
            action: download.url(args, {
                        [options?.mergeQuery ? 'mergeQuery' : 'query']: {
                            _method: 'HEAD',
                            ...(options?.query ?? options?.mergeQuery ?? {}),
                        }
                    }),
            method: 'get',
        })
    
    download.form = downloadForm
/**
* @see \App\Http\Controllers\BackupController::restore
 * @see app/Http/Controllers/BackupController.php:198
 * @route '/settings/backup/restore/{filename}'
 */
export const restore = (args: { filename: string | number } | [filename: string | number ] | string | number, options?: RouteQueryOptions): RouteDefinition<'post'> => ({
    url: restore.url(args, options),
    method: 'post',
})

restore.definition = {
    methods: ["post"],
    url: '/settings/backup/restore/{filename}',
} satisfies RouteDefinition<["post"]>

/**
* @see \App\Http\Controllers\BackupController::restore
 * @see app/Http/Controllers/BackupController.php:198
 * @route '/settings/backup/restore/{filename}'
 */
restore.url = (args: { filename: string | number } | [filename: string | number ] | string | number, options?: RouteQueryOptions) => {
    if (typeof args === 'string' || typeof args === 'number') {
        args = { filename: args }
    }

    
    if (Array.isArray(args)) {
        args = {
                    filename: args[0],
                }
    }

    args = applyUrlDefaults(args)

    const parsedArgs = {
                        filename: args.filename,
                }

    return restore.definition.url
            .replace('{filename}', parsedArgs.filename.toString())
            .replace(/\/+$/, '') + queryParams(options)
}

/**
* @see \App\Http\Controllers\BackupController::restore
 * @see app/Http/Controllers/BackupController.php:198
 * @route '/settings/backup/restore/{filename}'
 */
restore.post = (args: { filename: string | number } | [filename: string | number ] | string | number, options?: RouteQueryOptions): RouteDefinition<'post'> => ({
    url: restore.url(args, options),
    method: 'post',
})

    /**
* @see \App\Http\Controllers\BackupController::restore
 * @see app/Http/Controllers/BackupController.php:198
 * @route '/settings/backup/restore/{filename}'
 */
    const restoreForm = (args: { filename: string | number } | [filename: string | number ] | string | number, options?: RouteQueryOptions): RouteFormDefinition<'post'> => ({
        action: restore.url(args, options),
        method: 'post',
    })

            /**
* @see \App\Http\Controllers\BackupController::restore
 * @see app/Http/Controllers/BackupController.php:198
 * @route '/settings/backup/restore/{filename}'
 */
        restoreForm.post = (args: { filename: string | number } | [filename: string | number ] | string | number, options?: RouteQueryOptions): RouteFormDefinition<'post'> => ({
            action: restore.url(args, options),
            method: 'post',
        })
    
    restore.form = restoreForm
/**
* @see \App\Http\Controllers\BackupController::destroy
 * @see app/Http/Controllers/BackupController.php:172
 * @route '/settings/backup/delete/{filename}'
 */
export const destroy = (args: { filename: string | number } | [filename: string | number ] | string | number, options?: RouteQueryOptions): RouteDefinition<'delete'> => ({
    url: destroy.url(args, options),
    method: 'delete',
})

destroy.definition = {
    methods: ["delete"],
    url: '/settings/backup/delete/{filename}',
} satisfies RouteDefinition<["delete"]>

/**
* @see \App\Http\Controllers\BackupController::destroy
 * @see app/Http/Controllers/BackupController.php:172
 * @route '/settings/backup/delete/{filename}'
 */
destroy.url = (args: { filename: string | number } | [filename: string | number ] | string | number, options?: RouteQueryOptions) => {
    if (typeof args === 'string' || typeof args === 'number') {
        args = { filename: args }
    }

    
    if (Array.isArray(args)) {
        args = {
                    filename: args[0],
                }
    }

    args = applyUrlDefaults(args)

    const parsedArgs = {
                        filename: args.filename,
                }

    return destroy.definition.url
            .replace('{filename}', parsedArgs.filename.toString())
            .replace(/\/+$/, '') + queryParams(options)
}

/**
* @see \App\Http\Controllers\BackupController::destroy
 * @see app/Http/Controllers/BackupController.php:172
 * @route '/settings/backup/delete/{filename}'
 */
destroy.delete = (args: { filename: string | number } | [filename: string | number ] | string | number, options?: RouteQueryOptions): RouteDefinition<'delete'> => ({
    url: destroy.url(args, options),
    method: 'delete',
})

    /**
* @see \App\Http\Controllers\BackupController::destroy
 * @see app/Http/Controllers/BackupController.php:172
 * @route '/settings/backup/delete/{filename}'
 */
    const destroyForm = (args: { filename: string | number } | [filename: string | number ] | string | number, options?: RouteQueryOptions): RouteFormDefinition<'post'> => ({
        action: destroy.url(args, {
                    [options?.mergeQuery ? 'mergeQuery' : 'query']: {
                        _method: 'DELETE',
                        ...(options?.query ?? options?.mergeQuery ?? {}),
                    }
                }),
        method: 'post',
    })

            /**
* @see \App\Http\Controllers\BackupController::destroy
 * @see app/Http/Controllers/BackupController.php:172
 * @route '/settings/backup/delete/{filename}'
 */
        destroyForm.delete = (args: { filename: string | number } | [filename: string | number ] | string | number, options?: RouteQueryOptions): RouteFormDefinition<'post'> => ({
            action: destroy.url(args, {
                        [options?.mergeQuery ? 'mergeQuery' : 'query']: {
                            _method: 'DELETE',
                            ...(options?.query ?? options?.mergeQuery ?? {}),
                        }
                    }),
            method: 'post',
        })
    
    destroy.form = destroyForm
const backup = {
    index: Object.assign(index, index),
create: Object.assign(create, create),
download: Object.assign(download, download),
restore: Object.assign(restore, restore),
destroy: Object.assign(destroy, destroy),
}

export default backup