import { createOptimizedPicture } from '../../scripts/aem.js';

export default async function decorate(block) {
  /* change to ul, li */
  const ul = document.createElement('ul');

  // Fetch data from GraphQL endpoint
  let products = []; // Default empty array in case fetch fails
  try {
    const response = await fetch('http://localhost:3000/api/2025-10/graphql.json', {
      method: 'POST',
      mode: 'cors',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        query: `query GetProductListMinimal {
  products(first: 20) {
    nodes {
      id
      handle
      title
      featuredImage {
        url
      }
      priceRange {
        minVariantPrice {
          amount
          currencyCode
        }
      }
    }
  }
}`,
        variables: {},
      }),
    });
    if (response.ok) {
      const fetchedData = await response.json();
      products = fetchedData.data?.products?.nodes || [];
    }
  } catch (error) {
    console.error('Error fetching data:', error);
  }

  [...block.children].forEach((row, index) => {
    const li = document.createElement('li');
    while (row.firstElementChild) li.append(row.firstElementChild);
    [...li.children].forEach((div) => {
      if (div.children.length === 1 && div.querySelector('picture')) div.className = 'cards-card-image';
      else div.className = 'cards-card-body';
    });

    // Add product details if available
    if (products.length > 0 && products[index]) {
      const product = products[index];
      const productDetails = document.createElement('div');
      productDetails.className = 'cards-product-details';

      const title = document.createElement('h3');
      title.textContent = product.title;
      productDetails.append(title);

      if (product.featuredImage?.url) {
        const img = document.createElement('img');
        img.src = product.featuredImage.url;
        img.alt = product.title;
        productDetails.append(img);
      }

      const price = document.createElement('p');
      const amount = product.priceRange?.minVariantPrice?.amount;
      const currency = product.priceRange?.minVariantPrice?.currencyCode;
      price.textContent = `${currency} ${amount}`;
      price.className = 'cards-product-price';
      productDetails.append(price);

      li.append(productDetails);
    }

    ul.append(li);
  });
  ul.querySelectorAll('picture > img').forEach((img) => img.closest('picture').replaceWith(createOptimizedPicture(img.src, img.alt, false, [{ width: '750' }])));
  block.replaceChildren(ul);
}
