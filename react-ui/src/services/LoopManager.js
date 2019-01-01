// @flow
import { timeout } from 'utils/functions'

type LoopAPI = {
  running: boolean,
  start: () => void,
  stop: () => void
}
type ThreeStrap = {
  Loop: LoopAPI,
  canvas: HTMLCanvasElement
}

export default class LoopManager {

  /**
   * For managing the animation loop. Let's us enter/exit a 'slow mode' which
   * is useful when to reduce CPU consumption when no updates are expected.
   *
   * Note: we use 'slow mode' rather than turning the loop off entirely because
   * I don't know how to detect exactly when the scene has finished rendering
   */

  enterSlowMode: () => void
  exitSlowMode: () => void
  isInSlowMode: boolean
  Loop: LoopAPI
  slowOnTime: number
  slowOffTime: number
  canvas: HTMLCanvasElement


  constructor(threestrap: ThreeStrap, slowOnTime: number = 10, slowOffTime: number = 500) {
    this.Loop = threestrap.Loop
    this.canvas = threestrap.canvas
    this.isInSlowMode = false
    this.slowOffTime = slowOffTime
    this.slowOnTime = slowOnTime

    this.canvas.addEventListener('mousedown', () => {
      this.exitSlowMode()
    } )
    this.canvas.addEventListener('touchstart', () => {
      this.exitSlowMode()
    } )
    this.canvas.addEventListener('mouseup', () => {
      this.enterSlowMode()
    } )
    this.canvas.addEventListener('touchend', () => {
      this.enterSlowMode()
    } )

  }

  slowModeCycle = async () => {
    this.Loop.start()
    await timeout(this.slowOnTime)
    if (this.isInSlowMode) { this.Loop.stop() }
    await timeout(this.slowOffTime)
    if (this.isInSlowMode) { this.slowModeCycle() }
  }

  enterSlowMode = () => {
    if (this.isInSlowMode) { return }
    this.isInSlowMode = true
    this.slowModeCycle()
  }

  exitSlowMode = () => {
    this.isInSlowMode = false
    this.Loop.start()
  }

}