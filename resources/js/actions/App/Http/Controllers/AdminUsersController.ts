import { queryParams, type RouteQueryOptions, type RouteDefinition, type RouteFormDefinition, applyUrlDefaults } from './../../../../wayfinder'
/**
* @see \App\Http\Controllers\AdminUsersController::index
 * @see app/Http/Controllers/AdminUsersController.php:18
 * @route '/admin/users'
 */
export const index = (options?: RouteQueryOptions): RouteDefinition<'get'> => ({
    url: index.url(options),
    method: 'get',
})

index.definition = {
    methods: ["get","head"],
    url: '/admin/users',
} satisfies RouteDefinition<["get","head"]>

/**
* @see \App\Http\Controllers\AdminUsersController::index
 * @see app/Http/Controllers/AdminUsersController.php:18
 * @route '/admin/users'
 */
index.url = (options?: RouteQueryOptions) => {
    return index.definition.url + queryParams(options)
}

/**
* @see \App\Http\Controllers\AdminUsersController::index
 * @see app/Http/Controllers/AdminUsersController.php:18
 * @route '/admin/users'
 */
index.get = (options?: RouteQueryOptions): RouteDefinition<'get'> => ({
    url: index.url(options),
    method: 'get',
})
/**
* @see \App\Http\Controllers\AdminUsersController::index
 * @see app/Http/Controllers/AdminUsersController.php:18
 * @route '/admin/users'
 */
index.head = (options?: RouteQueryOptions): RouteDefinition<'head'> => ({
    url: index.url(options),
    method: 'head',
})

    /**
* @see \App\Http\Controllers\AdminUsersController::index
 * @see app/Http/Controllers/AdminUsersController.php:18
 * @route '/admin/users'
 */
    const indexForm = (options?: RouteQueryOptions): RouteFormDefinition<'get'> => ({
        action: index.url(options),
        method: 'get',
    })

            /**
* @see \App\Http\Controllers\AdminUsersController::index
 * @see app/Http/Controllers/AdminUsersController.php:18
 * @route '/admin/users'
 */
        indexForm.get = (options?: RouteQueryOptions): RouteFormDefinition<'get'> => ({
            action: index.url(options),
            method: 'get',
        })
            /**
* @see \App\Http\Controllers\AdminUsersController::index
 * @see app/Http/Controllers/AdminUsersController.php:18
 * @route '/admin/users'
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
* @see \App\Http\Controllers\AdminUsersController::updateUserRole
 * @see app/Http/Controllers/AdminUsersController.php:145
 * @route '/admin/users/{id}/role'
 */
export const updateUserRole = (args: { id: string | number } | [id: string | number ] | string | number, options?: RouteQueryOptions): RouteDefinition<'put'> => ({
    url: updateUserRole.url(args, options),
    method: 'put',
})

updateUserRole.definition = {
    methods: ["put"],
    url: '/admin/users/{id}/role',
} satisfies RouteDefinition<["put"]>

/**
* @see \App\Http\Controllers\AdminUsersController::updateUserRole
 * @see app/Http/Controllers/AdminUsersController.php:145
 * @route '/admin/users/{id}/role'
 */
updateUserRole.url = (args: { id: string | number } | [id: string | number ] | string | number, options?: RouteQueryOptions) => {
    if (typeof args === 'string' || typeof args === 'number') {
        args = { id: args }
    }

    
    if (Array.isArray(args)) {
        args = {
                    id: args[0],
                }
    }

    args = applyUrlDefaults(args)

    const parsedArgs = {
                        id: args.id,
                }

    return updateUserRole.definition.url
            .replace('{id}', parsedArgs.id.toString())
            .replace(/\/+$/, '') + queryParams(options)
}

/**
* @see \App\Http\Controllers\AdminUsersController::updateUserRole
 * @see app/Http/Controllers/AdminUsersController.php:145
 * @route '/admin/users/{id}/role'
 */
updateUserRole.put = (args: { id: string | number } | [id: string | number ] | string | number, options?: RouteQueryOptions): RouteDefinition<'put'> => ({
    url: updateUserRole.url(args, options),
    method: 'put',
})

    /**
* @see \App\Http\Controllers\AdminUsersController::updateUserRole
 * @see app/Http/Controllers/AdminUsersController.php:145
 * @route '/admin/users/{id}/role'
 */
    const updateUserRoleForm = (args: { id: string | number } | [id: string | number ] | string | number, options?: RouteQueryOptions): RouteFormDefinition<'post'> => ({
        action: updateUserRole.url(args, {
                    [options?.mergeQuery ? 'mergeQuery' : 'query']: {
                        _method: 'PUT',
                        ...(options?.query ?? options?.mergeQuery ?? {}),
                    }
                }),
        method: 'post',
    })

            /**
* @see \App\Http\Controllers\AdminUsersController::updateUserRole
 * @see app/Http/Controllers/AdminUsersController.php:145
 * @route '/admin/users/{id}/role'
 */
        updateUserRoleForm.put = (args: { id: string | number } | [id: string | number ] | string | number, options?: RouteQueryOptions): RouteFormDefinition<'post'> => ({
            action: updateUserRole.url(args, {
                        [options?.mergeQuery ? 'mergeQuery' : 'query']: {
                            _method: 'PUT',
                            ...(options?.query ?? options?.mergeQuery ?? {}),
                        }
                    }),
            method: 'post',
        })
    
    updateUserRole.form = updateUserRoleForm
/**
* @see \App\Http\Controllers\AdminUsersController::toggleUserActive
 * @see app/Http/Controllers/AdminUsersController.php:162
 * @route '/admin/users/{id}/toggle-active'
 */
export const toggleUserActive = (args: { id: string | number } | [id: string | number ] | string | number, options?: RouteQueryOptions): RouteDefinition<'post'> => ({
    url: toggleUserActive.url(args, options),
    method: 'post',
})

toggleUserActive.definition = {
    methods: ["post"],
    url: '/admin/users/{id}/toggle-active',
} satisfies RouteDefinition<["post"]>

/**
* @see \App\Http\Controllers\AdminUsersController::toggleUserActive
 * @see app/Http/Controllers/AdminUsersController.php:162
 * @route '/admin/users/{id}/toggle-active'
 */
toggleUserActive.url = (args: { id: string | number } | [id: string | number ] | string | number, options?: RouteQueryOptions) => {
    if (typeof args === 'string' || typeof args === 'number') {
        args = { id: args }
    }

    
    if (Array.isArray(args)) {
        args = {
                    id: args[0],
                }
    }

    args = applyUrlDefaults(args)

    const parsedArgs = {
                        id: args.id,
                }

    return toggleUserActive.definition.url
            .replace('{id}', parsedArgs.id.toString())
            .replace(/\/+$/, '') + queryParams(options)
}

/**
* @see \App\Http\Controllers\AdminUsersController::toggleUserActive
 * @see app/Http/Controllers/AdminUsersController.php:162
 * @route '/admin/users/{id}/toggle-active'
 */
toggleUserActive.post = (args: { id: string | number } | [id: string | number ] | string | number, options?: RouteQueryOptions): RouteDefinition<'post'> => ({
    url: toggleUserActive.url(args, options),
    method: 'post',
})

    /**
* @see \App\Http\Controllers\AdminUsersController::toggleUserActive
 * @see app/Http/Controllers/AdminUsersController.php:162
 * @route '/admin/users/{id}/toggle-active'
 */
    const toggleUserActiveForm = (args: { id: string | number } | [id: string | number ] | string | number, options?: RouteQueryOptions): RouteFormDefinition<'post'> => ({
        action: toggleUserActive.url(args, options),
        method: 'post',
    })

            /**
* @see \App\Http\Controllers\AdminUsersController::toggleUserActive
 * @see app/Http/Controllers/AdminUsersController.php:162
 * @route '/admin/users/{id}/toggle-active'
 */
        toggleUserActiveForm.post = (args: { id: string | number } | [id: string | number ] | string | number, options?: RouteQueryOptions): RouteFormDefinition<'post'> => ({
            action: toggleUserActive.url(args, options),
            method: 'post',
        })
    
    toggleUserActive.form = toggleUserActiveForm
/**
* @see \App\Http\Controllers\AdminUsersController::toggleRegistration
 * @see app/Http/Controllers/AdminUsersController.php:171
 * @route '/admin/users/toggle-registration'
 */
export const toggleRegistration = (options?: RouteQueryOptions): RouteDefinition<'post'> => ({
    url: toggleRegistration.url(options),
    method: 'post',
})

toggleRegistration.definition = {
    methods: ["post"],
    url: '/admin/users/toggle-registration',
} satisfies RouteDefinition<["post"]>

/**
* @see \App\Http\Controllers\AdminUsersController::toggleRegistration
 * @see app/Http/Controllers/AdminUsersController.php:171
 * @route '/admin/users/toggle-registration'
 */
toggleRegistration.url = (options?: RouteQueryOptions) => {
    return toggleRegistration.definition.url + queryParams(options)
}

/**
* @see \App\Http\Controllers\AdminUsersController::toggleRegistration
 * @see app/Http/Controllers/AdminUsersController.php:171
 * @route '/admin/users/toggle-registration'
 */
toggleRegistration.post = (options?: RouteQueryOptions): RouteDefinition<'post'> => ({
    url: toggleRegistration.url(options),
    method: 'post',
})

    /**
* @see \App\Http\Controllers\AdminUsersController::toggleRegistration
 * @see app/Http/Controllers/AdminUsersController.php:171
 * @route '/admin/users/toggle-registration'
 */
    const toggleRegistrationForm = (options?: RouteQueryOptions): RouteFormDefinition<'post'> => ({
        action: toggleRegistration.url(options),
        method: 'post',
    })

            /**
* @see \App\Http\Controllers\AdminUsersController::toggleRegistration
 * @see app/Http/Controllers/AdminUsersController.php:171
 * @route '/admin/users/toggle-registration'
 */
        toggleRegistrationForm.post = (options?: RouteQueryOptions): RouteFormDefinition<'post'> => ({
            action: toggleRegistration.url(options),
            method: 'post',
        })
    
    toggleRegistration.form = toggleRegistrationForm
/**
* @see \App\Http\Controllers\AdminUsersController::storeStudent
 * @see app/Http/Controllers/AdminUsersController.php:229
 * @route '/admin/students'
 */
export const storeStudent = (options?: RouteQueryOptions): RouteDefinition<'post'> => ({
    url: storeStudent.url(options),
    method: 'post',
})

storeStudent.definition = {
    methods: ["post"],
    url: '/admin/students',
} satisfies RouteDefinition<["post"]>

/**
* @see \App\Http\Controllers\AdminUsersController::storeStudent
 * @see app/Http/Controllers/AdminUsersController.php:229
 * @route '/admin/students'
 */
storeStudent.url = (options?: RouteQueryOptions) => {
    return storeStudent.definition.url + queryParams(options)
}

/**
* @see \App\Http\Controllers\AdminUsersController::storeStudent
 * @see app/Http/Controllers/AdminUsersController.php:229
 * @route '/admin/students'
 */
storeStudent.post = (options?: RouteQueryOptions): RouteDefinition<'post'> => ({
    url: storeStudent.url(options),
    method: 'post',
})

    /**
* @see \App\Http\Controllers\AdminUsersController::storeStudent
 * @see app/Http/Controllers/AdminUsersController.php:229
 * @route '/admin/students'
 */
    const storeStudentForm = (options?: RouteQueryOptions): RouteFormDefinition<'post'> => ({
        action: storeStudent.url(options),
        method: 'post',
    })

            /**
* @see \App\Http\Controllers\AdminUsersController::storeStudent
 * @see app/Http/Controllers/AdminUsersController.php:229
 * @route '/admin/students'
 */
        storeStudentForm.post = (options?: RouteQueryOptions): RouteFormDefinition<'post'> => ({
            action: storeStudent.url(options),
            method: 'post',
        })
    
    storeStudent.form = storeStudentForm
/**
* @see \App\Http\Controllers\AdminUsersController::updateStudent
 * @see app/Http/Controllers/AdminUsersController.php:260
 * @route '/admin/students/{id}'
 */
export const updateStudent = (args: { id: string | number } | [id: string | number ] | string | number, options?: RouteQueryOptions): RouteDefinition<'put'> => ({
    url: updateStudent.url(args, options),
    method: 'put',
})

updateStudent.definition = {
    methods: ["put"],
    url: '/admin/students/{id}',
} satisfies RouteDefinition<["put"]>

/**
* @see \App\Http\Controllers\AdminUsersController::updateStudent
 * @see app/Http/Controllers/AdminUsersController.php:260
 * @route '/admin/students/{id}'
 */
updateStudent.url = (args: { id: string | number } | [id: string | number ] | string | number, options?: RouteQueryOptions) => {
    if (typeof args === 'string' || typeof args === 'number') {
        args = { id: args }
    }

    
    if (Array.isArray(args)) {
        args = {
                    id: args[0],
                }
    }

    args = applyUrlDefaults(args)

    const parsedArgs = {
                        id: args.id,
                }

    return updateStudent.definition.url
            .replace('{id}', parsedArgs.id.toString())
            .replace(/\/+$/, '') + queryParams(options)
}

/**
* @see \App\Http\Controllers\AdminUsersController::updateStudent
 * @see app/Http/Controllers/AdminUsersController.php:260
 * @route '/admin/students/{id}'
 */
updateStudent.put = (args: { id: string | number } | [id: string | number ] | string | number, options?: RouteQueryOptions): RouteDefinition<'put'> => ({
    url: updateStudent.url(args, options),
    method: 'put',
})

    /**
* @see \App\Http\Controllers\AdminUsersController::updateStudent
 * @see app/Http/Controllers/AdminUsersController.php:260
 * @route '/admin/students/{id}'
 */
    const updateStudentForm = (args: { id: string | number } | [id: string | number ] | string | number, options?: RouteQueryOptions): RouteFormDefinition<'post'> => ({
        action: updateStudent.url(args, {
                    [options?.mergeQuery ? 'mergeQuery' : 'query']: {
                        _method: 'PUT',
                        ...(options?.query ?? options?.mergeQuery ?? {}),
                    }
                }),
        method: 'post',
    })

            /**
* @see \App\Http\Controllers\AdminUsersController::updateStudent
 * @see app/Http/Controllers/AdminUsersController.php:260
 * @route '/admin/students/{id}'
 */
        updateStudentForm.put = (args: { id: string | number } | [id: string | number ] | string | number, options?: RouteQueryOptions): RouteFormDefinition<'post'> => ({
            action: updateStudent.url(args, {
                        [options?.mergeQuery ? 'mergeQuery' : 'query']: {
                            _method: 'PUT',
                            ...(options?.query ?? options?.mergeQuery ?? {}),
                        }
                    }),
            method: 'post',
        })
    
    updateStudent.form = updateStudentForm
/**
* @see \App\Http\Controllers\AdminUsersController::archiveStudent
 * @see app/Http/Controllers/AdminUsersController.php:294
 * @route '/admin/students/{id}'
 */
export const archiveStudent = (args: { id: string | number } | [id: string | number ] | string | number, options?: RouteQueryOptions): RouteDefinition<'delete'> => ({
    url: archiveStudent.url(args, options),
    method: 'delete',
})

archiveStudent.definition = {
    methods: ["delete"],
    url: '/admin/students/{id}',
} satisfies RouteDefinition<["delete"]>

/**
* @see \App\Http\Controllers\AdminUsersController::archiveStudent
 * @see app/Http/Controllers/AdminUsersController.php:294
 * @route '/admin/students/{id}'
 */
archiveStudent.url = (args: { id: string | number } | [id: string | number ] | string | number, options?: RouteQueryOptions) => {
    if (typeof args === 'string' || typeof args === 'number') {
        args = { id: args }
    }

    
    if (Array.isArray(args)) {
        args = {
                    id: args[0],
                }
    }

    args = applyUrlDefaults(args)

    const parsedArgs = {
                        id: args.id,
                }

    return archiveStudent.definition.url
            .replace('{id}', parsedArgs.id.toString())
            .replace(/\/+$/, '') + queryParams(options)
}

/**
* @see \App\Http\Controllers\AdminUsersController::archiveStudent
 * @see app/Http/Controllers/AdminUsersController.php:294
 * @route '/admin/students/{id}'
 */
archiveStudent.delete = (args: { id: string | number } | [id: string | number ] | string | number, options?: RouteQueryOptions): RouteDefinition<'delete'> => ({
    url: archiveStudent.url(args, options),
    method: 'delete',
})

    /**
* @see \App\Http\Controllers\AdminUsersController::archiveStudent
 * @see app/Http/Controllers/AdminUsersController.php:294
 * @route '/admin/students/{id}'
 */
    const archiveStudentForm = (args: { id: string | number } | [id: string | number ] | string | number, options?: RouteQueryOptions): RouteFormDefinition<'post'> => ({
        action: archiveStudent.url(args, {
                    [options?.mergeQuery ? 'mergeQuery' : 'query']: {
                        _method: 'DELETE',
                        ...(options?.query ?? options?.mergeQuery ?? {}),
                    }
                }),
        method: 'post',
    })

            /**
* @see \App\Http\Controllers\AdminUsersController::archiveStudent
 * @see app/Http/Controllers/AdminUsersController.php:294
 * @route '/admin/students/{id}'
 */
        archiveStudentForm.delete = (args: { id: string | number } | [id: string | number ] | string | number, options?: RouteQueryOptions): RouteFormDefinition<'post'> => ({
            action: archiveStudent.url(args, {
                        [options?.mergeQuery ? 'mergeQuery' : 'query']: {
                            _method: 'DELETE',
                            ...(options?.query ?? options?.mergeQuery ?? {}),
                        }
                    }),
            method: 'post',
        })
    
    archiveStudent.form = archiveStudentForm
/**
* @see \App\Http\Controllers\AdminUsersController::archiveUser
 * @see app/Http/Controllers/AdminUsersController.php:309
 * @route '/admin/users/{id}'
 */
export const archiveUser = (args: { id: string | number } | [id: string | number ] | string | number, options?: RouteQueryOptions): RouteDefinition<'delete'> => ({
    url: archiveUser.url(args, options),
    method: 'delete',
})

archiveUser.definition = {
    methods: ["delete"],
    url: '/admin/users/{id}',
} satisfies RouteDefinition<["delete"]>

/**
* @see \App\Http\Controllers\AdminUsersController::archiveUser
 * @see app/Http/Controllers/AdminUsersController.php:309
 * @route '/admin/users/{id}'
 */
archiveUser.url = (args: { id: string | number } | [id: string | number ] | string | number, options?: RouteQueryOptions) => {
    if (typeof args === 'string' || typeof args === 'number') {
        args = { id: args }
    }

    
    if (Array.isArray(args)) {
        args = {
                    id: args[0],
                }
    }

    args = applyUrlDefaults(args)

    const parsedArgs = {
                        id: args.id,
                }

    return archiveUser.definition.url
            .replace('{id}', parsedArgs.id.toString())
            .replace(/\/+$/, '') + queryParams(options)
}

/**
* @see \App\Http\Controllers\AdminUsersController::archiveUser
 * @see app/Http/Controllers/AdminUsersController.php:309
 * @route '/admin/users/{id}'
 */
archiveUser.delete = (args: { id: string | number } | [id: string | number ] | string | number, options?: RouteQueryOptions): RouteDefinition<'delete'> => ({
    url: archiveUser.url(args, options),
    method: 'delete',
})

    /**
* @see \App\Http\Controllers\AdminUsersController::archiveUser
 * @see app/Http/Controllers/AdminUsersController.php:309
 * @route '/admin/users/{id}'
 */
    const archiveUserForm = (args: { id: string | number } | [id: string | number ] | string | number, options?: RouteQueryOptions): RouteFormDefinition<'post'> => ({
        action: archiveUser.url(args, {
                    [options?.mergeQuery ? 'mergeQuery' : 'query']: {
                        _method: 'DELETE',
                        ...(options?.query ?? options?.mergeQuery ?? {}),
                    }
                }),
        method: 'post',
    })

            /**
* @see \App\Http\Controllers\AdminUsersController::archiveUser
 * @see app/Http/Controllers/AdminUsersController.php:309
 * @route '/admin/users/{id}'
 */
        archiveUserForm.delete = (args: { id: string | number } | [id: string | number ] | string | number, options?: RouteQueryOptions): RouteFormDefinition<'post'> => ({
            action: archiveUser.url(args, {
                        [options?.mergeQuery ? 'mergeQuery' : 'query']: {
                            _method: 'DELETE',
                            ...(options?.query ?? options?.mergeQuery ?? {}),
                        }
                    }),
            method: 'post',
        })
    
    archiveUser.form = archiveUserForm
const AdminUsersController = { index, updateUserRole, toggleUserActive, toggleRegistration, storeStudent, updateStudent, archiveStudent, archiveUser }

export default AdminUsersController