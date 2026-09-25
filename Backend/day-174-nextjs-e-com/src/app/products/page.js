import ProductCard from '@/components/ProductCard';
import React from 'react'

const page = async ()=> {

  const res = await fetch("https://fakestoreapi.com/products");
  const products = await res.json();

  console.log(products);
  return (
    <div className='grid grid-cols-4 gap-5'>
      {
        products.map((elem) => {
          return <ProductCard key={elem.id} product={elem} />;
        })
      }
    </div>
  );
};


export default page
