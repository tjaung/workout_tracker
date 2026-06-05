import { apiClient, type ApiClient } from './base'

export type IdValue = string | number
export type IdPathBuilder<TId extends IdValue | Record<string, IdValue>> = (id: TId) => string

interface CrudApiConfig<TRead, TModel, TId extends IdValue | Record<string, IdValue>> {
  basePath: string
  idPath: IdPathBuilder<TId>
  makeModel: (payload: TRead) => TModel
}

interface ListOptions {
  limit?: number
  skip?: number
}

export class CrudApi<TRead, TCreate, TUpdate, TModel, TId extends IdValue | Record<string, IdValue>> {
  private readonly basePath: string
  private readonly client: ApiClient
  private readonly idPath: IdPathBuilder<TId>
  private readonly makeModel: (payload: TRead) => TModel

  constructor(config: CrudApiConfig<TRead, TModel, TId>, client = apiClient) {
    this.basePath = config.basePath
    this.client = client
    this.idPath = config.idPath
    this.makeModel = config.makeModel
  }

  async list(options?: ListOptions) {
    const query = options ? { limit: options.limit, skip: options.skip } : undefined
    const payload = await this.client.get<TRead[]>(this.basePath, { query })
    return payload.map(this.makeModel)
  }

  async create(payload: TCreate) {
    const item = await this.client.post<TRead, TCreate>(this.basePath, payload)
    return this.makeModel(item)
  }

  async get(id: TId) {
    const item = await this.client.get<TRead>(this.itemPath(id))
    return this.makeModel(item)
  }

  async update(id: TId, payload: TUpdate) {
    const item = await this.client.update<TRead, TUpdate>(this.itemPath(id), payload)
    return this.makeModel(item)
  }

  async delete(id: TId) {
    await this.client.delete(this.itemPath(id))
  }

  private itemPath(id: TId) {
    return `${this.basePath}${this.idPath(id)}`
  }
}
