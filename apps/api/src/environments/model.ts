import { ToolBackup } from '../app/models/tool-backup'
import { Tool } from '../app/models/tool.model'

export interface EnvironmentModel {
  /**
   * Enable or disable production mode
   */
  readonly production: boolean
  /**
   * Api key shared with api service to secure communication
   */
  readonly apiKey: string
  /**
   * Storage path
   * Used by sqlite3 to store information
   */
  readonly storage: string
  /**
   * `initTools` will only be used if no other tools exist
   */
  readonly initTools: Tool[]
  /**
   * Hostname of prometheus instance
   * @example localhost:9090
   */
  readonly prometheusHost: string

  /**
   * List of tools to configure automatic backups
   */
  readonly backups: ToolBackup[]

  /**
   * SSH base configuration, format `user@hostname`
   */
  readonly sshBase: string

  /**
   * Restic configuration
   */
  readonly restic: {
    /**
     * Repository name
     */
    readonly repository: string
    /**
     * Password the the specified repository
     */
    readonly password: string
  }
}
