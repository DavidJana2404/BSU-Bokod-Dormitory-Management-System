export type RouteQueryOptions = {
    query?: Record<string, unknown>
    mergeQuery?: Record<string, unknown>
}

export type RouteDefinition<TMethod extends string = string> = {
    url: string
    method: TMethod
}

export type RouteFormDefinition<TMethod extends string = string> = {
    action: string
    method: TMethod
}

export function queryParams(options?: RouteQueryOptions): string {
    if (!options) return ''
    
    const params = new URLSearchParams()
    const query = options.query ?? options.mergeQuery ?? {}
    
    Object.entries(query).forEach(([key, value]) => {
        if (value !== undefined && value !== null) {
            params.append(key, String(value))
        }
    })
    
    const queryString = params.toString()
    return queryString ? `?${queryString}` : ''
}
