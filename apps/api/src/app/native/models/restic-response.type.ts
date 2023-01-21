import { ResticStatus } from '../enums/ResticStatus.enum'

export type ResticResponse =
  | {
      message_type: ResticStatus.STATUS
      seconds_elapsed?: number
      seconds_remaining?: number
      percent_done: number
      total_files: number
      files_done?: number
      total_bytes: number
      bytes_done?: number
      current_files?: string[]
    }
  | {
      message_type: ResticStatus.SUMMARY
      files_new: number
      files_changed: number
      files_unmodified: number
      dirs_new: number
      dirs_changed: number
      dirs_unmodified: number
      data_blobs: number
      tree_blobs: number
      data_added: number
      total_files_processed: number
      total_bytes_processed: number
      total_duration: number
      snapshot_id: string
    }
  | { message_type: ResticStatus.COMPLETE }
