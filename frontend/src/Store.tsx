/* eslint-disable @typescript-eslint/ban-types */
/* eslint-disable no-case-declarations */
import React from 'react'
import { Cart, CartItem, ShippingAddress } from './types/Cart'
import { UserInfo } from './types/UserInfo'

type AppState = {
  mode: string
  cart: Cart
  userInfo?: UserInfo
}

const initialState: AppState = {
  userInfo: localStorage.getItem('userInfo')
    ? JSON.parse(localStorage.getItem('userInfo')!)
    : null,

  mode: localStorage.getItem('mode')
    ? localStorage.getItem('mode')!
    : window.matchMedia &&
      window.matchMedia('(prefers-color-scheme: dark)').matches
    ? 'dark'
    : 'light',
  cart: {
    itemsPrice: 0,
    shippingPrice: 0,
    taxPrice: 0,
    totalPrice: 0,
    cartItems: localStorage.getItem('cartItems')
      ? JSON.parse(localStorage.getItem('cartItems')!)
      : [],
    shippingAddress: localStorage.getItem('shippingAddress')
      ? JSON.parse(localStorage.getItem('shippingAddress')!)
      : [],
    paymentMethod: localStorage.getItem('shippingAddress')
      ? localStorage.getItem('shippingAddress')!
      : 'PayPal',
  },
}

type Action =
  | { type: 'SWITCH_MODE' }
  | { type: 'CART_ADD_ITEM'; payload: CartItem }
  | { type: 'CART_REMOVE_ITEM'; payload: CartItem }
  | { type: 'CART_CLEAR' }
  | { type: 'USER_SIGNIN'; payload: UserInfo }
  | { type: 'USER_SIGNOUT' }
  | { type: 'SAVE_SHIPPING_ADDRESS'; payload: ShippingAddress }
  | { type: 'SAVE_PAYMENT_METHOD'; payload: string }

// The `reducer` function takes two parameters: `state` and `action`.
function reducer(state: AppState, action: Action): AppState {
  // It uses a switch statement to handle different types of actions.
  switch (action.type) {
    // Case for the 'SWITCH_MODE' action type.
    case 'SWITCH_MODE':
      // The reducer updates the 'mode' field in the state based on the current mode.
      // If the current mode is 'dark', it switches to 'light', and vice versa.
      return { ...state, mode: state.mode === 'dark' ? 'light' : 'dark' }

    // Case for the 'CART_ADD_ITEM' action type.
    case 'CART_ADD_ITEM':
      // Extracts the payload (new item to be added to the cart) from the action.
      const newItem = action.payload

      // Checks if the new item already exists in the cart by comparing its _id.
      const existItem = state.cart.cartItems.find(
        (item: CartItem) => item._id === newItem._id
      )

      // Updates the cartItems array in the state based on whether the item already exists.
      const cartItems = existItem
        ? state.cart.cartItems.map((item: CartItem) =>
            item._id === existItem._id ? newItem : item
          )
        : [...state.cart.cartItems, newItem]

      // Updates the 'cartItems' in the local storage to persist the cart state.
      localStorage.setItem('cartItems', JSON.stringify(cartItems))

      // Returns the new state with the updated 'cart' field.
      return { ...state, cart: { ...state.cart, cartItems } }

    case 'CART_REMOVE_ITEM': {
      // Using filter to create a new array of cart items excluding the item to be removed
      const cartItems = state.cart.cartItems.filter(
        (item: CartItem) => item._id !== action.payload._id
      )

      // Updating the 'cartItems' in localStorage with the filtered array
      localStorage.setItem('cartItems', JSON.stringify(cartItems))

      // Returning a new state object with the updated cart items
      // The spread (...) operator is used for shallow copying to avoid mutation
      return { ...state, cart: { ...state.cart, cartItems } }
    }

    case 'CART_CLEAR': {
      return { ...state, cart: { ...state.cart, cartItems: [] } }
    }

    case 'USER_SIGNIN': {
      return { ...state, userInfo: action.payload }
    }

    case 'USER_SIGNOUT':
      return {
        mode:
          window.matchMedia &&
          window.matchMedia('(prefers-color-scheme: dark)').matches
            ? 'dark'
            : 'light',
        cart: {
          cartItems: [],
          paymentMethod: 'PayPal',
          shippingAddress: {
            fullName: '',
            address: '',
            postalCode: '',
            city: '',
            country: '',
          },
          itemsPrice: 0,
          shippingPrice: 0,
          taxPrice: 0,
          totalPrice: 0,
        },
      }

    case 'SAVE_SHIPPING_ADDRESS':
      return {
        ...state,
        cart: {
          ...state.cart,
          shippingAddress: action.payload,
        },
      }

    case 'SAVE_PAYMENT_METHOD':
      return {
        ...state,
        cart: { ...state.cart, paymentMethod: action.payload },
      }

    // Default case for handling unknown action types.
    default:
      // If the action type is not recognized, the reducer returns the current state unchanged.
      return state
  }
}

const defaultDispatch: React.Dispatch<Action> = () => initialState

const Store = React.createContext({
  state: initialState,
  dispatch: defaultDispatch,
})

function StoreProvider(props: React.PropsWithChildren<{}>) {
  const [state, dispatch] = React.useReducer<React.Reducer<AppState, Action>>(
    reducer,
    initialState
  )

  return <Store.Provider value={{ state, dispatch }} {...props} />
}

export { Store, StoreProvider }
