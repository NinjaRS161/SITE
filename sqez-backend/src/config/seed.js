const { Category, Product } = require('../models')

const catalog = [
  {
    category: 'Верх',
    title: 'Худи Soft',
    description: 'Плотное худи из мягкого хлопка для прохладных городских вечеров.',
    price: 6900,
    stock: 12,
    sizes: ['S', 'M', 'L'],
    colors: ['Cream', 'Graphite'],
    imageUrl: 'https://images.unsplash.com/photo-1512436991641-6745cdb1723f?auto=format&fit=crop&w=900&q=80'
  },
  {
    category: 'Верх',
    title: 'Футболка Base',
    description: 'Базовая футболка со свободной посадкой и чистым силуэтом.',
    price: 3200,
    stock: 20,
    sizes: ['S', 'M', 'L', 'XL'],
    colors: ['White', 'Black'],
    imageUrl: 'https://images.unsplash.com/photo-1521572163474-6864f9cf17ab?auto=format&fit=crop&w=900&q=80'
  },
  {
    category: 'Низ',
    title: 'Брюки City',
    description: 'Прямые брюки с эластичным поясом и лаконичной посадкой.',
    price: 5400,
    stock: 9,
    sizes: ['M', 'L', 'XL'],
    colors: ['Sand', 'Black'],
    imageUrl: 'https://images.unsplash.com/photo-1506629905607-57a256f4af4b?auto=format&fit=crop&w=900&q=80'
  },
  {
    category: 'Верхняя одежда',
    title: 'Куртка Flow',
    description: 'Лёгкая куртка для межсезонья с чистой архитектурной формой.',
    price: 9800,
    stock: 6,
    sizes: ['M', 'L'],
    colors: ['Olive', 'Stone'],
    imageUrl: 'https://images.unsplash.com/photo-1523381210434-271e8be1f52b?auto=format&fit=crop&w=900&q=80'
  },
  {
    category: 'Аксессуары',
    title: 'Шарф Air',
    description: 'Мягкий шарф нейтрального оттенка для многослойных образов.',
    price: 2400,
    stock: 15,
    sizes: ['One Size'],
    colors: ['Ivory', 'Taupe'],
    imageUrl: 'https://images.unsplash.com/photo-1541099649105-f69ad21f3246?auto=format&fit=crop&w=900&q=80'
  },
  {
    category: 'Верх',
    title: 'Рубашка Line',
    description: 'Свободная рубашка с мягкой фактурой и минималистичным воротником.',
    price: 4700,
    stock: 11,
    sizes: ['S', 'M', 'L'],
    colors: ['Milk', 'Blue Gray'],
    imageUrl: 'https://images.unsplash.com/photo-1483985988355-763728e1935b?auto=format&fit=crop&w=900&q=80'
  }
]

async function seedCatalog() {
  const productCount = await Product.count()
  if (productCount > 0) {
    return
  }

  const categories = new Map()

  for (const item of catalog) {
    let category = categories.get(item.category)
    if (!category) {
      ;[category] = await Category.findOrCreate({
        where: { name: item.category },
        defaults: { name: item.category }
      })
      categories.set(item.category, category)
    }

    await Product.create({
      title: item.title,
      description: item.description,
      price: item.price,
      stock: item.stock,
      sizes: item.sizes,
      colors: item.colors,
      imageUrl: item.imageUrl,
      CategoryId: category.id
    })
  }
}

module.exports = { seedCatalog }
