console.log("Product Detail Page Loaded");

const productDetail = document.getElementById("product-detail");
const cartCount = document.getElementById("cart-count");
const loading = document.getElementById("loading");
const error = document.getElementById("error");
let cartItems = JSON.parse(localStorage.getItem("cart")) || [];
cartCount.textContent