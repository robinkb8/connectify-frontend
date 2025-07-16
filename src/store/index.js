// src/store/index.js - Redux Store Configuration (Cross-Slice Middleware Temporarily Disabled)
import { configureStore } from '@reduxjs/toolkit';
import rootReducer from './rootReducer';
// import crossSliceMiddleware from './middleware/crossSliceMiddleware'; // Will enable after creating files

// Configure Redux store with Redux Toolkit
export const store = configureStore({
  reducer: rootReducer,
  
  // Enable Redux DevTools in development
  devTools: process.env.NODE_ENV !== 'production',
  
  // Middleware configuration - RTK includes thunk by default
  middleware: (getDefaultMiddleware) =>
    getDefaultMiddleware({
      // Enable serializable check in development only
      serializableCheck: {
        ignoredActions: ['persist/PERSIST', 'persist/REHYDRATE'],
      },
    }), // .concat(crossSliceMiddleware), // Will enable after creating middleware files
});

export default store;