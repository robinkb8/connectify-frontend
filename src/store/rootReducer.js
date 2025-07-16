// src/store/rootReducer.js - Root Reducer Configuration
import { combineReducers } from '@reduxjs/toolkit';

// PHASE 2: Import postsSlice
import postsReducer from './slices/postsSlice';

// PHASE 3: Import chatsSlice
import chatsReducer from './slices/chatsSlice';

// PHASE 4: Import profileSlice
import profileReducer from './slices/profileSlice';

// PHASE 1: Empty reducer object - slices will be added in subsequent phases
// This prevents Redux from throwing errors while we have no slices yet
const placeholderReducer = (state = {}, action) => state;

const rootReducer = combineReducers({
  // PHASE 2: postsSlice added ✅
  posts: postsReducer,
  
  // PHASE 3: chatsSlice added ✅
  chats: chatsReducer,
  
  // PHASE 4: profileSlice added ✅
  profile: profileReducer,
  
  // PHASE 5: Additional slices as needed
  
  // Temporary placeholder to prevent empty reducer object
  _placeholder: placeholderReducer,
});

export default rootReducer;