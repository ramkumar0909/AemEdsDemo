import { getMetadata } from '../../scripts/aem.js';

const QUERY = `
  query GetProductListMinimal {
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
  }
`;

function formatMoney(amount, currencyCode) {
  const n = Number(amount);
  if (Number.isNaN(n)) return '';
  try {
    return new Intl.NumberFormat(undefined, {
      style: 'currency',
      currency: currencyCode || 'USD',
    }).format(n);
  } catch (e) {
    return `${n.toFixed(2)} ${currencyCode || ''}`.trim();
  }
}

async function fetchProducts(endpoint) {
  const resp = await fetch(endpoint, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ query: QUERY }),
  });

  if (!resp.ok) {
    const text = await resp.text();
    throw new Error(`HTTP ${resp.status}: ${text}`);
  }

  const json = await resp.json();
  if (json.errors) {
    throw new Error(`GraphQL errors: ${JSON.stringify(json.errors)}`);
  }

  return json?.data?.products?.nodes || [];
}

function renderState(block, titleText, state, message) {
  const container = document.createElement('div');
  container.className = 'shopify-products__container';

  if (titleText) {
    const h2 = document.createElement('h2');
    h2.className = 'shopify-products__title';
    h2.textContent = titleText;
    container.append(h2);
  }

  const status = document.createElement('div');
  status.className = `shopify-products__status shopify-products__status--${state}`;
  status.textContent = message;

  container.append(status);
  block.replaceChildren(container);
}

function renderGrid(block, titleText, products) {
  const container = document.createElement('div');
  container.className = 'shopify-products__container';

  if (titleText) {
    const h2 = document.createElement('h2');
    h2.className = 'shopify-products__title';
    h2.textContent = titleText;
    container.append(h2);
  }

  const grid = document.createElement('ul');
  grid.className = 'shopify-products__grid';

  products.forEach((p) => {
    const li = document.createElement('li');
    li.className = 'shopify-products__card';

    const a = document.createElement('a');
    a.className = 'shopify-products__link';

    // Demo-friendly: keep it safe even if you don't have product pages wired yet.
    // If you DO have PDPs, switch to: `/products/${p.handle}`
    a.href = '#';
    a.setAttribute('aria-label', p.title || 'Product');

    const imgWrap = document.createElement('div');
    imgWrap.className = 'shopify-products__image-wrap';

    if (p.featuredImage?.url) {
      const img = document.createElement('img');
      img.className = 'shopify-products__image';
      img.loading = 'lazy';
      img.alt = p.title || '';
      img.src = p.featuredImage.url;
      imgWrap.append(img);
    } else {
      const placeholder = document.createElement('div');
      placeholder.className = 'shopify-products__placeholder';
      placeholder.textContent = 'No image';
      imgWrap.append(placeholder);
    }

    const info = document.createElement('div');
    info.className = 'shopify-products__info';

    const name = document.createElement('div');
    name.className = 'shopify-products__name';
    name.textContent = p.title || '';

    const min = p.priceRange?.minVariantPrice;
    const price = document.createElement('div');
    price.className = 'shopify-products__price';
    price.textContent = min ? formatMoney(min.amount, min.currencyCode) : '';

    info.append(name, price);
    a.append(imgWrap, info);
    li.append(a);
    grid.append(li);
  });

  container.append(grid);
  block.replaceChildren(container);
}

export default async function decorate(block) {
  // Title row (optional)
  const maybeTitle = block.querySelector(':scope > div > div');
  const titleText = maybeTitle ? maybeTitle.textContent.trim() : '';

  // Use local mock.shop endpoint via meta
  // Example: <meta name="shopify-endpoint" content="http://localhost:4010/api">
  const endpoint = getMetadata('shopify-endpoint') || 'https://mock.shop/api';

  renderState(block, titleText, 'loading', 'Loading products…');

  try {
    const products = await fetchProducts(endpoint);

    if (!products.length) {
      renderState(block, titleText, 'empty', 'No products found.');
      return;
    }

    renderGrid(block, titleText, products);
  } catch (e) {
    renderState(block, titleText, 'error', `Could not load products. ${e.message}`);
  }
}