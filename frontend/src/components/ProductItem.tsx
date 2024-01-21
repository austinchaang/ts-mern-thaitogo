import { useContext } from 'react'
import { Button, Card } from 'react-bootstrap'
import { Link } from 'react-router-dom'
import { toast } from 'react-toastify'
import { Store } from '../Store'
import { CartItem } from '../types/Cart'
import { Product } from '../types/Products'
import { convertProductToCartItem } from '../utils'
import Rating from './Rating'

function ProductItem({ product }: { product: Product }) {
  const { state, dispatch } = useContext(Store)
  const {
    cart: { cartItems },
  } = state

  const addToCartHandler = (item: CartItem) => {
    const existItem = cartItems.find((x) => x._id === product._id)
    const quantity = existItem ? existItem.quantity + 1 : 1
    if (product.countInStock < quantity) {
      alert('Sorry, product is out of stock!')
      return
    }
    dispatch({
      type: 'CART_ADD_ITEM',
      payload: { ...item, quantity },
    })
    toast.success('Product added to cart!')
  }

  return (
    <Card className="d-flex justify-content-center align-items-center">
      <Link to={`/product/${product.slug}`}>
        <img
          src={product.image}
          className="card-img-top product-image rounded mt-3"
          alt={product.name}
        />
      </Link>
      <Card.Body>
        <Link to={`product/${product.slug}`}>
          <Card.Title>{product.name}</Card.Title>
        </Link>
        <Rating rating={product.rating} numReviews={product.numReviews} />
        <Card.Text>${product.price}</Card.Text>
        {product.countInStock === 0 ? (
          <Button variant="light" disabled>
            Out of Stock
          </Button>
        ) : (
          <Button
            onClick={() => addToCartHandler(convertProductToCartItem(product))}
          >
            Add to Cart
          </Button>
        )}
      </Card.Body>
    </Card>
  )
}

export default ProductItem
