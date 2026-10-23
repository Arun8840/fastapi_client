import { createUISFX } from "uisfx"

export function useSounds() {

 const ui = createUISFX({
  pack: "minimal",
  volume: 5
 })

 const playSuccess = () => {
  ui.play("success");
 }

 const playComplete = () => {
  ui.play("complete");
 }

 const playError = () => {
  ui.play("error");
 }

 const playDelete = () => {
  ui.play("delete");
 }

 const playProcessing = () => {
  ui.play("processing")
 }
 const playSend = () => {
  ui.play("send")
 }

 const play = {
  success: playSuccess,
  error: playError,
  delete: playDelete,
  processing: playProcessing,
  complete: playComplete,
  send: playSend
 }
 return {
  play
 }
}
