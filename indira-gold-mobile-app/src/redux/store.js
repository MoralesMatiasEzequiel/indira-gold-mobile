import { configureStore } from "@reduxjs/toolkit";
import Products from "./productSlice.js";
import Clients from "./clientSlice.js";
import Sales from "./saleSlice.js";
import Categories from "./categorySlice.js";
import Debts from "./debtSlice.js";


export default configureStore({
    reducer:{
        products: Products,
        clients: Clients,
        sales: Sales,
        categories: Categories,
        debts: Debts
    }
});