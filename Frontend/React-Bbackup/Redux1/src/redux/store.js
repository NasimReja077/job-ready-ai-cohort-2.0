import {configureStore} from '@reduxjs/toolkit'
import counterReducer from './features/CounterSlice.js'
export const store = configureStore({
     reducer: {
          count: counterReducer
     }
})