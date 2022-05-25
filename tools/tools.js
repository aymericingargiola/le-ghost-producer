module.exports = {
    asyncForEach: async function(array, callback) {
    const getType = obj => Object.prototype.toString.call(obj).slice(8, -1)
    const isMap = obj => getType(obj) === 'Map'
      if (isMap(array)) {
        let index = 0
        for (const [key, value] of array) {
            await callback(value, index, array)
            ++index
        }
      } else {
        for (let index = 0; index < array.length; index++) {
            await callback(array[index], index, array)
        }
      }
    }
}