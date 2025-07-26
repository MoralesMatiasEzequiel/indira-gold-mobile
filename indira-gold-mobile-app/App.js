import React from 'react';
import axios from 'axios';
import { Provider } from 'react-redux';
import store from './src/redux/store.js';
import Main from './Main.js';

axios.defaults.baseURL = 'http://192.168.100.5:3001/'; // acá va la IP local de la PC en red
// axios.defaults.baseURL = "http://localhost:3001/";

export default function App() {
  return (
    <Provider store={store}>
      <Main />
    </Provider>
  );
}