// React import not required with new JSX transform

function wrapPromise(promise) {
  let status = 'pending'
  let result
  const suspender = promise.then(
    (res) => {
      status = 'success'
      result = res
    },
    (err) => {
      status = 'error'
      result = err
    }
  )
  return {
    read() {
      if (status === 'pending') throw suspender
      if (status === 'error') throw result
      return result
    },
  }
}

const productResource = wrapPromise(
  fetch('https://fakestoreapi.com/products').then((r) => r.json())
)

function Product() {
  const products = productResource.read()

  return (
    <div className="p-4">
      <h2 className="text-2xl font-bold mb-4">Products</h2>
      <ul className="space-y-3">
        {products.map((p) => (
          <li key={p.id} className="p-3 bg-neutral-900 rounded">
            <div className="font-semibold">{p.title}</div>
            <div className="text-sm text-gray-400">${p.price}</div>
          </li>
        ))}
      </ul>
    </div>
  )
}

export default Product
