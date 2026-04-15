const apiMeta = document.querySelector('meta[name="api-base-url"]')
const API_BASE_URL = apiMeta?.content || 'http://localhost:5000/api'

const burger = document.getElementById('burger')
const mobileMenu = document.getElementById('mobileMenu')
const categoryFilters = document.getElementById('categoryFilters')
const productsGrid = document.getElementById('productsGrid')
const catalogStatus = document.getElementById('catalogStatus')
const cartToggle = document.getElementById('cartToggle')
const cartCount = document.getElementById('cartCount')
const cartDrawer = document.getElementById('cartDrawer')
const cartOverlay = document.getElementById('cartOverlay')
const closeCart = document.getElementById('closeCart')
const cartItems = document.getElementById('cartItems')
const cartTotal = document.getElementById('cartTotal')
const cartStatus = document.getElementById('cartStatus')
const checkoutForm = document.getElementById('checkoutForm')

const CART_STORAGE_KEY = 'sqez-cart-id'
let activeCategory = ''
let cart = { items: [], totalItems: 0, totalPrice: 0 }

function formatPrice(value) {
  return new Intl.NumberFormat('ru-RU').format(value) + ' ₽'
}

function getCartId() {
  let cartId = localStorage.getItem(CART_STORAGE_KEY)
  if (!cartId) {
    cartId = crypto.randomUUID()
    localStorage.setItem(CART_STORAGE_KEY, cartId)
  }
  return cartId
}

async function request(path, options = {}) {
  const response = await fetch(API_BASE_URL + path, {
    headers: {
      'Content-Type': 'application/json'
    },
    ...options
  })

  if (!response.ok) {
    const payload = await response.json().catch(() => ({}))
    throw new Error(payload.message || 'Ошибка запроса')
  }

  return response.json()
}

function setStatus(target, message, isVisible = true) {
  target.textContent = message
  target.classList.toggle('hidden', !isVisible)
}

function renderCategories(categories) {
  const buttons = ['<button class="filter-chip active" type="button" data-category="">Все</button>']
  for (const category of categories) {
    buttons.push(
      `<button class="filter-chip" type="button" data-category="${category}">${category}</button>`
    )
  }
  categoryFilters.innerHTML = buttons.join('')
}

function productCard(product) {
  const chips = [
    product.category ? `<span>${product.category}</span>` : '',
    product.sizes?.length ? `<span>${product.sizes.join(' / ')}</span>` : '',
    product.colors?.length ? `<span>${product.colors.join(', ')}</span>` : ''
  ].filter(Boolean).join('')

  const soldOut = product.stock < 1

  return `
    <article class="product-card">
      <img src="${product.imageUrl}" alt="${product.title}">
      <div class="product-copy">
        <div class="product-meta">${chips}</div>
        <h3>${product.title}</h3>
        <p>${product.description}</p>
      </div>
      <div class="product-bottom">
        <div>
          <div class="price">${formatPrice(product.price)}</div>
          <div class="stock-label">${soldOut ? 'Нет в наличии' : `В наличии: ${product.stock}`}</div>
        </div>
        <button class="btn" type="button" data-add-to-cart="${product.id}" ${soldOut ? 'disabled' : ''}>
          ${soldOut ? 'Скоро' : 'В корзину'}
        </button>
      </div>
    </article>
  `
}

async function loadCatalog() {
  try {
    setStatus(catalogStatus, 'Загружаем каталог...', true)
    const [categories, products] = await Promise.all([
      request('/products/categories/list'),
      request(`/products${activeCategory ? `?category=${encodeURIComponent(activeCategory)}` : ''}`)
    ])

    renderCategories(categories)
    for (const button of categoryFilters.querySelectorAll('[data-category]')) {
      button.classList.toggle('active', button.dataset.category === activeCategory)
    }

    if (products.length === 0) {
      productsGrid.innerHTML = ''
      setStatus(catalogStatus, 'Для этой категории товары пока не добавлены.', true)
      return
    }

    productsGrid.innerHTML = products.map(productCard).join('')
    setStatus(catalogStatus, '', false)
  } catch (error) {
    productsGrid.innerHTML = ''
    setStatus(catalogStatus, error.message, true)
  }
}

function renderCart() {
  cartCount.textContent = cart.totalItems
  cartTotal.textContent = formatPrice(cart.totalPrice)

  if (!cart.items.length) {
    cartItems.innerHTML = '<p class="empty-cart">Корзина пока пуста. Добавьте что-нибудь из каталога.</p>'
    return
  }

  cartItems.innerHTML = cart.items.map((item) => `
    <article class="cart-item">
      <img src="${item.imageUrl}" alt="${item.title}">
      <div class="cart-item-copy">
        <h4>${item.title}</h4>
        <p>${formatPrice(item.price)}</p>
        <div class="cart-controls">
          <button type="button" data-qty-change="${item.productId}" data-next-qty="${item.quantity - 1}">−</button>
          <span>${item.quantity}</span>
          <button type="button" data-qty-change="${item.productId}" data-next-qty="${item.quantity + 1}">+</button>
          <button type="button" class="link-btn" data-remove-item="${item.productId}">Удалить</button>
        </div>
      </div>
      <strong>${formatPrice(item.lineTotal)}</strong>
    </article>
  `).join('')
}

async function loadCart() {
  try {
    cart = await request(`/cart/${getCartId()}`)
    renderCart()
  } catch (error) {
    setStatus(cartStatus, error.message, true)
  }
}

async function addToCart(productId) {
  try {
    setStatus(cartStatus, 'Добавляем товар...', true)
    cart = await request(`/cart/${getCartId()}/items`, {
      method: 'POST',
      body: JSON.stringify({ productId, quantity: 1 })
    })
    renderCart()
    setStatus(cartStatus, 'Товар добавлен в корзину.', true)
    cartDrawer.classList.add('open')
    cartOverlay.classList.add('visible')
  } catch (error) {
    setStatus(cartStatus, error.message, true)
  }
}

async function updateCartItem(productId, nextQty) {
  try {
    const method = nextQty < 1 ? 'DELETE' : 'PATCH'
    const options = {
      method
    }

    if (method === 'PATCH') {
      options.body = JSON.stringify({ quantity: nextQty })
    }

    cart = await request(`/cart/${getCartId()}/items/${productId}`, options)
    renderCart()
  } catch (error) {
    setStatus(cartStatus, error.message, true)
  }
}

async function checkout(event) {
  event.preventDefault()

  try {
    setStatus(cartStatus, 'Оформляем заказ...', true)
    const formData = new FormData(checkoutForm)
    const result = await request(`/cart/${getCartId()}/checkout`, {
      method: 'POST',
      body: JSON.stringify({
        customerName: formData.get('customerName'),
        customerEmail: formData.get('customerEmail')
      })
    })

    localStorage.removeItem(CART_STORAGE_KEY)
    checkoutForm.reset()
    await loadCart()
    setStatus(cartStatus, `Заказ #${result.orderId} оформлен. Мы скоро свяжемся с вами.`, true)
  } catch (error) {
    setStatus(cartStatus, error.message, true)
  }
}

burger.addEventListener('click', () => {
  mobileMenu.classList.toggle('active')
})

categoryFilters.addEventListener('click', async (event) => {
  const button = event.target.closest('[data-category]')
  if (!button) {
    return
  }

  activeCategory = button.dataset.category
  await loadCatalog()
})

productsGrid.addEventListener('click', async (event) => {
  const button = event.target.closest('[data-add-to-cart]')
  if (!button) {
    return
  }

  await addToCart(Number(button.dataset.addToCart))
})

cartItems.addEventListener('click', async (event) => {
  const qtyButton = event.target.closest('[data-qty-change]')
  if (qtyButton) {
    await updateCartItem(
      Number(qtyButton.dataset.qtyChange),
      Number(qtyButton.dataset.nextQty)
    )
    return
  }

  const removeButton = event.target.closest('[data-remove-item]')
  if (removeButton) {
    await updateCartItem(Number(removeButton.dataset.removeItem), 0)
  }
})

cartToggle.addEventListener('click', () => {
  cartDrawer.classList.add('open')
  cartOverlay.classList.add('visible')
})

closeCart.addEventListener('click', () => {
  cartDrawer.classList.remove('open')
  cartOverlay.classList.remove('visible')
})

cartOverlay.addEventListener('click', () => {
  cartDrawer.classList.remove('open')
  cartOverlay.classList.remove('visible')
})

checkoutForm.addEventListener('submit', checkout)

loadCatalog()
loadCart()
