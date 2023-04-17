// sometimes i add "%" to the back of a zoom. this will remove that and return a number

const getNumericZoom = (value: string): number => {
  let returnZoom = value

  if (returnZoom.includes("%")) {
    returnZoom.replace(/%/g, "")
  }
  return parseInt(returnZoom, 10)
}

export default getNumericZoom
