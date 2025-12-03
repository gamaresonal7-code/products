console.log("Main Page Loaded");

const hamburger = document.getElementById("hamburger");
const navMenu = document.querySelector(".nav ul");
hamburger.addEventListener("click", () => navMenu.classList.toggle("active"));

const productGrid = document.getElementById("product-grid");
const cartCount = document.getElementById("cart-count");
const loading = document.getElementById("loading");
const error = document.getElementById("error");
let cartItems = JSON.parse(localStorage.getItem("cart")) || [];

cartCount.textContent = cartItems.length;

async function fetchProducts() {
  try {
    const res = await fetch("https://fakestoreapi.com/products?limit=8");
    const products = await res.json();
    loading.style.display = "none";

    products.forEach(product => {
      const card = document.createElement("div");
      card.classList.add("product-card");
      card.innerHTML = `
        <a href="product.html?id=${product.id}">
          <img src="${product.image}" alt="${product.title}" loading="lazy">
          <h3>${product.title}</h3>
          <p>$${product.price}</p>
        </a>
        <button>Add to Cart</button>
      `;
      card.querySelector("button").addEventListener("click", () => {
        cartItems.push(product);
        localStorage.setItem("cart", JSON.stringify(cartItems));
        cartCount.textContent = cartItems.length;
      });
      productGrid.appendChild(card);
    });
  } catch (err) {
    loading.style.display = "none";
    error.textContent = "Failed to load products. Please try again later.";
  }
}
fetchProducts();
