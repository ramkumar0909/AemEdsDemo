export default function decorate(block) {
  // Load Shopify web components library
  const script = document.createElement('script');
  script.type = 'module';
  script.src = 'https://cdn.shopify.com/storefront/web-components.js';
  document.head.appendChild(script);

  // Create the main product layout container
  const productLayout = document.createElement('div');
  productLayout.className = 'product-layout';

  // Create product card
  const productCard = document.createElement('div');
  productCard.className = 'product-card';

  // Create product context with template
  const productContext = document.createElement('shopify-context');
  productContext.setAttribute('type', 'product');
  productContext.setAttribute('handle', 'hoodie');

  const template = document.createElement('template');

  template.innerHTML = `
    <div class="product-card__container">
      <div class="product-card__media">
        <div class="product-card__main-image">
          <shopify-media width="280" height="280" query="product.selectedOrFirstAvailableVariant.image"></shopify-media>
        </div>
      </div>
      <div class="product-card__details">
        <div class="product-card__info">
          <h2 class="product-card__title">
            <shopify-data query="product.title"></shopify-data>
          </h2>
          <div class="product-card__price">
            <shopify-money query="product.selectedOrFirstAvailableVariant.price"></shopify-money>
          </div>
        </div>
        <button
          class="product-card__view-button"
          onclick="getElementById('product-modal').showModal(); getElementById('product-modal-context').update(event);"
        >
          View product
        </button>
      </div>
    </div>
  `;

  productContext.appendChild(template);
  productCard.appendChild(productContext);
  productLayout.appendChild(productCard);

  // Create Shopify store context
  const shopifyStore = document.createElement('shopify-store');
  shopifyStore.setAttribute('store-domain', 'mock.shop');
  shopifyStore.setAttribute('country', 'US');
  shopifyStore.setAttribute('language', 'en');

  // Create cart element
  const cart = document.createElement('shopify-cart');
  cart.id = 'cart';

  // Create modal dialog
  const modal = document.createElement('dialog');
  modal.id = 'product-modal';
  modal.className = 'product-modal';

  const modalContext = document.createElement('shopify-context');
  modalContext.id = 'product-modal-context';
  modalContext.setAttribute('type', 'product');
  modalContext.setAttribute('wait-for-update', '');

  const modalTemplate = document.createElement('template');
  modalTemplate.innerHTML = `
    <div class="product-modal__container">
      <div class="product-modal__close-container">
        <button class="product-modal__close" onclick="getElementById('product-modal').close();">&#10005;</button>
      </div>
      <div class="product-modal__content">
        <div class="product-modal__layout">
          <div class="product-modal__media">
            <shopify-media width="416" height="416" query="product.selectedOrFirstAvailableVariant.image"></shopify-media>
          </div>
          <div class="product-modal__details">
            <div class="product-modal__header">
              <div>
                <span class="product-modal__vendor">
                  <shopify-data query="product.vendor"></shopify-data>
                </span>
              </div>
              <h1 class="product-modal__title">
                <shopify-data query="product.title"></shopify-data>
              </h1>
              <div class="product-modal__price-container">
                <shopify-money query="product.selectedOrFirstAvailableVariant.price"></shopify-money>
                <shopify-money
                  class="product-modal__compare-price"
                  query="product.selectedOrFirstAvailableVariant.compareAtPrice"
                ></shopify-money>
              </div>
            </div>
            <shopify-variant-selector></shopify-variant-selector>
            <div class="product-modal__buttons">
              <button
                class="product-modal__add-button"
                onclick="getElementById('cart').addLine(event).showModal();"
                shopify-attr--disabled="!product.selectedOrFirstAvailableVariant.availableForSale"
              >
                Add to cart
              </button>
              <button
                class="product-modal__buy-button"
                onclick="document.querySelector('shopify-store').buyNow(event)"
                shopify-attr--disabled="!product.selectedOrFirstAvailableVariant.availableForSale"
              >
                Buy now
              </button>
            </div>
            <div class="product-modal__description">
              <span class="product-modal__description-text">
                <shopify-data query="product.descriptionHtml"></shopify-data>
              </span>
            </div>
          </div>
        </div>
      </div>
    </div>
  `;

  modalContext.appendChild(modalTemplate);
  modal.appendChild(modalContext);

  // Append all elements to the block
  block.appendChild(shopifyStore);
  block.appendChild(productLayout);
  block.appendChild(cart);
  block.appendChild(modal);
}
