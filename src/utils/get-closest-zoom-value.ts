import type { WorkspaceApp } from "src/types"

export const getClosestZoomValue = (
  array: WorkspaceApp["zoomValues"],
  input: string
) => {
  // Initialize the closest value and its difference to infinity.
  let closestValue = null
  let closestDifference = Infinity
  let inputNumber = parseFloat(input.replace("%", ""))

  // Iterate through the array.
  for (let i = 0; i < array.length; i++) {
    // Convert the string to a number, removing the percentage symbol first from both the input and the array value.
    let value = parseFloat(array[i].replace("%", ""))

    // Calculate the absolute difference between the input and the current value.
    let difference = Math.abs(inputNumber - value)

    // If the difference is smaller than the current closest difference, update the closest value and its difference.
    if (difference < closestDifference) {
      closestValue = value
      closestDifference = difference
    }
  }

  // Return the closest value.
  return `${closestValue}%`
}
