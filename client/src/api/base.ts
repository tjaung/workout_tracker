type QueryValue = string | number | boolean | null | undefined

interface RequestOptions<TBody = unknown> {
  body?: TBody
  headers?: HeadersInit
  query?: Record<string, QueryValue>
}

type ApiRequestInit<TBody = unknown> = Omit<RequestInit, 'body'> & RequestOptions<TBody>

export class ApiError extends Error {
  readonly details: unknown
  readonly status: number

  constructor(message: string, status: number, details?: unknown) {
    super(message)
    this.name = 'ApiError'
    this.status = status
    this.details = details
  }
}

export class ApiClient {
  private readonly baseUrl: string

  constructor(baseUrl = import.meta.env.VITE_API_URL ?? 'http://localhost:8000') {
    this.baseUrl = baseUrl
  }

  get<TResponse>(path: string, options?: RequestOptions): Promise<TResponse> {
    return this.request<TResponse>(path, {
      method: 'GET',
      ...options,
    })
  }

  post<TResponse, TBody = unknown>(path: string, body?: TBody, options?: RequestOptions): Promise<TResponse> {
    return this.request<TResponse>(path, {
      ...options,
      body,
      method: 'POST',
    })
  }

  update<TResponse, TBody = unknown>(
    path: string,
    body?: TBody,
    options?: RequestOptions,
  ): Promise<TResponse> {
    return this.request<TResponse>(path, {
      ...options,
      body,
      method: 'PATCH',
    })
  }

  delete<TResponse = void>(path: string, options?: RequestOptions): Promise<TResponse> {
    return this.request<TResponse>(path, {
      method: 'DELETE',
      ...options,
    })
  }

  protected async request<TResponse, TBody = unknown>(
    path: string,
    options: ApiRequestInit<TBody> = {},
  ): Promise<TResponse> {
    const { body, headers, query, ...init } = options
    const response = await fetch(this.url(path, query), {
      credentials: 'include',
      ...init,
      headers: {
        ...(body !== undefined ? { 'Content-Type': 'application/json' } : {}),
        ...headers,
      },
      body: body !== undefined ? JSON.stringify(body) : undefined,
    })

    if (!response.ok) {
      throw await this.toApiError(response)
    }

    if (response.status === 204) {
      return undefined as TResponse
    }

    return response.json() as Promise<TResponse>
  }

  private url(path: string, query?: Record<string, QueryValue>) {
    const url = new URL(path, this.baseUrl)
    Object.entries(query ?? {}).forEach(([key, value]) => {
      if (value !== null && value !== undefined) {
        url.searchParams.set(key, String(value))
      }
    })
    return url.toString()
  }

  private async toApiError(response: Response) {
    try {
      const body = await response.json()
      const error = body?.error
      return new ApiError(error?.message ?? response.statusText, response.status, error?.details ?? body)
    } catch {
      return new ApiError(response.statusText, response.status)
    }
  }
}

export const apiClient = new ApiClient()
