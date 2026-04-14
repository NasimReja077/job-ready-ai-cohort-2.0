/**
 * string , number , boolean , array, object , tuple ,void, never
 * type
 */


/**
 * any , Unknown
 */

let a: unknown

a = 'hello'

if ((typeof a) === "string")
    console.log(a.toUpperCase())