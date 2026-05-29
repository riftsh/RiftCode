/*---------------------------------------------------------------------------------------------
 *  RiftStatusBar - Status bar integration for RiftAI
 *--------------------------------------------------------------------------------------------*/

import { Event } from '../../../base/common/event.js'
import { createDecorator } from '../../../platform/instantiation/common/instantiation.js'
import { IDisposable } from '../../../base/common/lifecycle.js'

export const IRiftStatusBarService = createDecorator<IRiftStatusBarService>('riftStatusBarService')

export interface IRiftStatusBarService extends IDisposable {
  readonly _serviceBrand: undefined
  
  // Status
  setStatus(text: string, icon?: string): void
  clearStatus(): void
  setConnected(connected: boolean): void
  setProcessing(processing: boolean): void
  
  // Tool execution
  showToolExecution(toolName: string): void
  hideToolExecution(): void
  
  // Events
  readonly onStatusChange: Event<string>
}

/**
 * Status bar service for RiftAI
 */
export class RiftStatusBarService implements IRiftStatusBarService {
  
  declare readonly _serviceBrand: undefined
  
  private currentStatus: string = ''
  private isConnected: boolean = false
  private isProcessing: boolean = false
  
  private readonly onStatusChangeEmitter = new EventEmitter<string>()
  public readonly onStatusChange = this.onStatusChangeEmitter.event
  
  constructor() {
    // Register with VS Code status bar
    this.registerStatusBar()
  }
  
  /**
   * Register with VS Code status bar
   */
  private registerStatusBar(): void {
    // Register status bar entry
    // StatusBarRegistry.registerEntry({...})
  }
  
  /**
   * Set the status text
   */
  setStatus(text: string, icon?: string): void {
    this.currentStatus = text
    const iconText = icon || '🤖'
    // Update status bar entry
    console.log(`[RiftStatusBar] ${iconText} ${text}`)
    this.onStatusChangeEmitter.fire(text)
  }
  
  /**
   * Clear the status
   */
  clearStatus(): void {
    this.setStatus('')
  }
  
  /**
   * Set connected state
   */
  setConnected(connected: boolean): void {
    this.isConnected = connected
    this.setStatus(connected ? 'Connected' : 'Disconnected', connected ? '🟢' : '🔴')
  }
  
  /**
   * Set processing state
   */
  setProcessing(processing: boolean): void {
    this.isProcessing = processing
    if (processing) {
      this.setStatus('Processing...', '⚡')
    }
  }
  
  /**
   * Show tool execution status
   */
  showToolExecution(toolName: string): void {
    this.setStatus(`Running: ${toolName}`, '🔧')
  }
  
  /**
   * Hide tool execution status
   */
  hideToolExecution(): void {
    this.setStatus('')
  }
  
  /**
   * Dispose
   */
  dispose(): void {
    this.onStatusChangeEmitter.dispose()
  }
}

// Import for EventEmitter (would be from base/common/event)
import { Emitter } from '../../../base/common/event.js'