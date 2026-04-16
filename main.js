const apiMeta = document.querySelector('meta[name="api-base-url"]')

const FALLBACK_PRODUCTS = [
  {
    id: 'fallback-1',
    title: 'Худи Soft',
    description: 'Плотное худи из мягкого хлопка для прохладных городских вечеров.',
    price: 6900,
    stock: 12,
    sizes: ['S', 'M', 'L'],
    colors: ['Cream', 'Graphite'],
    imageUrl: 'https://images.unsplash.com/photo-1512436991641-6745cdb1723f?auto=format&fit=crop&w=900&q=80',
    category: 'Верх'
  },
  {
    id: 'fallback-2',
    title: 'Футболка Base',
    description: 'Базовая футболка со свободной посадкой и чистым силуэтом.',
    price: 3200,
    stock: 20,
    sizes: ['S', 'M', 'L', 'XL'],
    colors: ['White', 'Black'],
    imageUrl: 'https://images.unsplash.com/photo-1521572163474-6864f9cf17ab?auto=format&fit=crop&w=900&q=80',
    category: 'Верх'
  },
  {
    id: 'fallback-3',
    title: 'Брюки City',
    description: 'Прямые брюки с эластичным поясом и лаконичной посадкой.',
    price: 5400,
    stock: 9,
    sizes: ['M', 'L', 'XL'],
    colors: ['Sand', 'Black'],
    imageUrl: 'https://images.unsplash.com/photo-1506629905607-57a256f4af4b?auto=format&fit=crop&w=900&q=80',
    category: 'Низ'
  },
  {
    id: 'fallback-4',
    title: 'Куртка Flow',
    description: 'Лёгкая куртка для межсезонья с чистой архитектурной формой.',
    price: 9800,
    stock: 6,
    sizes: ['M', 'L'],
    colors: ['Olive', 'Stone'],
    imageUrl: 'https://images.unsplash.com/photo-1523381210434-271e8be1f52b?auto=format&fit=crop&w=900&q=80',
    category: 'Верхняя одежда'
  },
  {
    id: 'fallback-5',
    title: 'Шарф Air',
    description: 'Мягкий шарф нейтрального оттенка для многослойных образов.',
    price: 2400,
    stock: 15,
    sizes: ['One Size'],
    colors: ['Ivory', 'Taupe'],
    imageUrl: 'https://images.unsplash.com/photo-1541099649105-f69ad21f3246?auto=format&fit=crop&w=900&q=80',
    category: 'Аксессуары'
  },
  {
    id: 'fallback-6',
    title: 'Рубашка Line',
    description: 'Свободная рубашка с мягкой фактурой и минималистичным воротником.',
    price: 4700,
    stock: 11,
    sizes: ['S', 'M', 'L'],
    colors: ['Milk', 'Blue Gray'],
    imageUrl: 'https://images.unsplash.com/photo-1483985988355-763728e1935b?auto=format&fit=crop&w=900&q=80',
    category: 'Верх'
  }
]

function deriveApiBaseUrl() {
  const configured = apiMeta?.content?.trim()

  if (location.hostname === 'localhost' || location.hostname === '127.0.0.1') {
    return 'http://localhost:5000/api'
  }

  if (configured) {
    return configured
  }

  if (location.hostname.includes('sqez-site') && location.hostname.endsWith('.onrender.com')) {
    return 'https://sqez-api.onrender.com/api'
  }

  return '/api'
}

const API_BASE_URL = deriveApiBaseUrl()

const burger = document.getElementById('burger')
const mobileMenu = document.getElementById('mobileMenu')
const categoryFilters = document.getElementById('categoryFilters')
const productsGrid = document.getElementById('productsGrid')
const catalogStatus = document.getElementById('catalogStatus')
const cartToggle = document.getElementById('cartToggle')
const heroCartButton = document.getElementById('heroCartButton')
const cartCount = document.getElementById('cartCount')
const cartDrawer = document.getElementById('cartDrawer')
const cartOverlay = document.getElementById('cartOverlay')
const closeCart = document.getElementById('closeCart')
const cartItems = document.getElementById('cartItems')
const cartTotal = document.getElementById('cartTotal')
const cartStatus = document.getElementById('cartStatus')
const checkoutForm = document.getElementById('checkoutForm')
const apiPill = document.getElementById('apiPill')
const orderToast = document.getElementById('orderToast')
const categoryMetric = document.getElementById('categoryMetric')
const cartMetric = document.getElementById('cartMetric')
const footerYear = document.getElementById('footerYear')

const CART_STORAGE_KEY = 'sqez-cart-id'
let activeCategory = ''
let cart = { items: [], totalItems: 0, totalPrice: 0 }
let apiAvailable = true
let previewMode = false
let toastTimeoutId = null

function wait(ms) {
  return new Promise((resolve) => setTimeout(resolve, ms))
}

function buildNetworkErrorMessage() {
  return 'Не удалось связаться с сервером. Если Render только просыпается, подождите около минуты и попробуйте ещё раз.'
}

function escapeHtml(value) {
  return String(value)
    .replaceAll('&', '&amp;')
    .replaceAll('<', '&lt;')
    .replaceAll('>', '&gt;')
    .replaceAll('"', '&quot;')
    .replaceAll("'", '&#39;')
}

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

function setBodyLock() {
  const menuOpen = mobileMenu.classList.contains('active')
  const cartOpen = cartDrawer.classList.contains('open')
  document.body.classList.toggle('no-scroll', menuOpen || cartOpen)
}

function setApiState(mode, label) {
  apiAvailable = mode !== 'offline'
  apiPill.textContent = label
  apiPill.classList.remove('online', 'offline')
  if (mode === 'online') {
    apiPill.classList.add('online')
  } else if (mode === 'offline') {
    apiPill.classList.add('offline')
  }
}

function showToast(message) {
  orderToast.textContent = message
  orderToast.classList.add('visible')
  clearTimeout(toastTimeoutId)
  toastTimeoutId = setTimeout(() => {
    orderToast.classList.remove('visible')
  }, 3200)
}

function setStatus(target, message, isVisible = true, tone = 'default') {
  target.textContent = message
  target.classList.toggle('hidden', !isVisible)
  target.classList.toggle('warning', tone === 'warning')
}

async function performFetch(url, options) {
  try {
    return await fetch(url, options)
  } catch (error) {
    if (error instanceof TypeError || error.name === 'AbortError') {
      throw new Error(buildNetworkErrorMessage())
    }
    throw error
  }
}

async function request(path, options = {}) {
  const requestOptions = {
    headers: {
      'Content-Type': 'application/json'
    },
    ...options
  }

  let response

  try {
    response = await performFetch(API_BASE_URL + path, requestOptions)
  } catch (error) {
    if ((options.method || 'GET') === 'GET') {
      await wait(1200)
      response = await performFetch(API_BASE_URL + path, requestOptions)
    } else {
      throw error
    }
  }

  if (!response.ok) {
    const payload = await response.json().catch(() => ({}))
    throw new Error(payload.message || 'Ошибка запроса')
  }

  if (response.status === 204) {
    return null
  }

  const contentType = response.headers.get('content-type') || ''
  if (!contentType.includes('application/json')) {
    throw new Error('Сервер вернул неожиданный ответ. Попробуйте обновить страницу чуть позже.')
  }

  return response.json()
}

function renderCategories(categories) {
  const buttons = ['<button class="filter-chip active" type="button" data-category="">Все</button>']
  for (const category of categories) {
    buttons.push(
      `<button class="filter-chip" type="button" data-category="${escapeHtml(category)}">${escapeHtml(category)}</button>`
    )
  }

  categoryFilters.innerHTML = buttons.join('')

  for (const button of categoryFilters.querySelectorAll('[data-category]')) {
    button.classList.toggle('active', button.dataset.category === activeCategory)
  }

  categoryMetric.textContent = String(categories.length)
}

function productCard(product) {
  const chips = [
    product.category ? `<span>${escapeHtml(product.category)}</span>` : '',
    product.sizes?.length ? `<span>${escapeHtml(product.sizes.join(' / '))}</span>` : '',
    product.colors?.length ? `<span>${escapeHtml(product.colors.join(', '))}</span>` : ''
  ].filter(Boolean).join('')

  const soldOut = product.stock < 1
  const disabled = !apiAvailable || soldOut || String(product.id).startsWith('fallback-')

  return `
    <article class="product-card">
      <img src="${escapeHtml(product.imageUrl)}" alt="${escapeHtml(product.title)}">
      <div class="product-copy">
        <div class="product-meta">${chips}</div>
        <h3>${escapeHtml(product.title)}</h3>
        <p>${escapeHtml(product.description)}</p>
      </div>
      <div class="product-bottom">
        <div>
          <div class="price">${formatPrice(product.price)}</div>
          <div class="stock-label">${soldOut ? 'Нет в наличии' : `В наличии: ${product.stock}`}</div>
        </div>
        <button class="btn" type="button" data-add-to-cart="${escapeHtml(product.id)}" ${disabled ? 'disabled' : ''}>
          ${String(product.id).startsWith('fallback-') ? 'Ждём API' : soldOut ? 'Скоро' : 'В корзину'}
        </button>
      </div>
    </article>
  `
}

function getCategoriesFromProducts(products) {
  return [...new Set(products.map((product) => product.category).filter(Boolean))].sort((a, b) => a.localeCompare(b, 'ru'))
}

function getFilteredFallbackProducts() {
  if (!activeCategory) {
    return FALLBACK_PRODUCTS
  }
  return FALLBACK_PRODUCTS.filter((product) => product.category === activeCategory)
}

function renderCatalog(products) {
  if (!products.length) {
    productsGrid.innerHTML = ''
    setStatus(catalogStatus, 'Для этой категории товары пока не добавлены.', true)
    return
  }

  productsGrid.innerHTML = products.map(productCard).join('')
  setStatus(catalogStatus, '', false)
}

async function loadCatalog() {
  try {
    setApiState('online', 'API: syncing live catalog')
    setStatus(catalogStatus, 'Загружаем live-каталог...', true)

    const [categories, products] = await Promise.all([
      request('/products/categories/list'),
      request(`/products${activeCategory ? `?category=${encodeURIComponent(activeCategory)}` : ''}`)
    ])

    previewMode = false
    setApiState('online', 'API: live and responsive')
    renderCategories(categories)
    renderCatalog(products)
  } catch (error) {
    previewMode = true
    const fallbackProducts = getFilteredFallbackProducts()
    const fallbackCategories = getCategoriesFromProducts(FALLBACK_PRODUCTS)
    renderCategories(fallbackCategories)
    renderCatalog(fallbackProducts)
    setApiState('offline', 'API: sleeping, using preview mode')
    setStatus(catalogStatus, `${error.message} Сейчас показываем preview-каталог, но корзина заработает после пробуждения API.`, true, 'warning')
  }
}

function renderCart() {
  cartCount.textContent = String(cart.totalItems)
  cartMetric.textContent = String(cart.totalItems)
  cartTotal.textContent = formatPrice(cart.totalPrice)

  if (!cart.items.length) {
    cartItems.innerHTML = '<p class="empty-cart">Корзина пока пуста. Добавьте вещи из каталога, и они сохранятся на сервере.</p>'
    return
  }

  cartItems.innerHTML = cart.items.map((item) => `
    <article class="cart-item">
      <img src="${escapeHtml(item.imageUrl)}" alt="${escapeHtml(item.title)}">
      <div class="cart-item-copy">
        <h4>${escapeHtml(item.title)}</h4>
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
    setApiState('online', 'API: cart connected')
    setStatus(cartStatus, '', false)
    renderCart()

    if (previewMode) {
      await loadCatalog()
    }
  } catch (error) {
    cart = { items: [], totalItems: 0, totalPrice: 0 }
    renderCart()
    setApiState('offline', 'API: cart unavailable')
    setStatus(cartStatus, error.message, true, 'warning')
  }
}

function openCart() {
  cartDrawer.classList.add('open')
  cartOverlay.classList.add('visible')
  setBodyLock()
}

function closeCartDrawer() {
  cartDrawer.classList.remove('open')
  cartOverlay.classList.remove('visible')
  setBodyLock()
}

function closeMobileMenu() {
  mobileMenu.classList.remove('active')
  setBodyLock()
}

async function addToCart(productId) {
  if (!apiAvailable) {
    showToast('API ещё не проснулся. Корзина станет доступна, когда backend ответит.')
    openCart()
    return
  }

  try {
    setStatus(cartStatus, 'Добавляем товар...', true)
    cart = await request(`/cart/${getCartId()}/items`, {
      method: 'POST',
      body: JSON.stringify({ productId, quantity: 1 })
    })
    renderCart()
    setStatus(cartStatus, 'Товар добавлен в корзину.', true)
    showToast('Товар добавлен в корзину')
    openCart()
  } catch (error) {
    setStatus(cartStatus, error.message, true, 'warning')
    showToast('Не удалось добавить товар')
  }
}

async function updateCartItem(productId, nextQty) {
  if (!apiAvailable) {
    showToast('Сейчас backend недоступен, поэтому корзину нельзя изменить.')
    return
  }

  try {
    const method = nextQty < 1 ? 'DELETE' : 'PATCH'
    const options = { method }

    if (method === 'PATCH') {
      options.body = JSON.stringify({ quantity: nextQty })
    }

    cart = await request(`/cart/${getCartId()}/items/${productId}`, options)
    renderCart()
    setStatus(cartStatus, '', false)
  } catch (error) {
    setStatus(cartStatus, error.message, true, 'warning')
  }
}

async function checkout(event) {
  event.preventDefault()

  if (!apiAvailable) {
    setStatus(cartStatus, 'Оформление заказа доступно после того, как API проснётся и снова ответит.', true, 'warning')
    return
  }

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
    showToast(`Заказ #${result.orderId} оформлен`)
  } catch (error) {
    setStatus(cartStatus, error.message, true, 'warning')
  }
}

function initRevealObserver() {
  const items = document.querySelectorAll('.reveal')

  if (!('IntersectionObserver' in window)) {
    for (const item of items) {
      item.classList.add('revealed')
    }
    return
  }

  const observer = new IntersectionObserver((entries) => {
    for (const entry of entries) {
      if (entry.isIntersecting) {
        entry.target.classList.add('revealed')
        observer.unobserve(entry.target)
      }
    }
  }, {
    threshold: 0.12
  })

  for (const item of items) {
    observer.observe(item)
  }
}

burger.addEventListener('click', () => {
  mobileMenu.classList.toggle('active')
  setBodyLock()
})

for (const link of mobileMenu.querySelectorAll('a')) {
  link.addEventListener('click', closeMobileMenu)
}

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
  if (!button || button.disabled) {
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

cartToggle.addEventListener('click', openCart)
heroCartButton.addEventListener('click', openCart)
closeCart.addEventListener('click', closeCartDrawer)
cartOverlay.addEventListener('click', closeCartDrawer)
checkoutForm.addEventListener('submit', checkout)

footerYear.textContent = new Date().getFullYear()
setApiState('online', 'API: booting up')
renderCart()
initRevealObserver()

Promise.all([loadCatalog(), loadCart()]).catch(() => {
  setApiState('offline', 'API: preview mode')
})
