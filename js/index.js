const API_URL = "https://apistore.cybersoft.edu.vn";
let productListArray = [];

document.addEventListener("DOMContentLoaded", function () {
    loadProducts();
});

function loadProducts() {
    fetch(`${API_URL}/api/Product`)
        .then(response => {
            if (!response.ok) throw new Error("Không thể lấy danh sách sản phẩm");
            return response.json();
        })
        .then(result => {
            if (Array.isArray(result)) {
                productListArray = result;
            } else if (result.content && Array.isArray(result.content)) {
                productListArray = result.content;
            } else if (result.data && Array.isArray(result.data)) {
                productListArray = result.data;
            } else {
                productListArray = [];
            }
            renderProducts(productListArray);
        })
        .catch(error => {
            console.error(error);
            const container = document.getElementById("productList");
            if (container) container.innerHTML = `<p>Không thể tải sản phẩm.</p>`;
        });
}

function renderProducts(products) {
    const productList = document.getElementById("productList");
    if (!productList) return;

    productList.innerHTML = "";

    products.slice(0, 8).forEach(product => {
        const image = product.imgLink || product.image || "https://via.placeholder.com/150";

        const html = `
            <div class="product-card">
                <img src="${image}" alt="${product.name}">
                <h3>${product.name}</h3>
                <p class="price">${formatPrice(product.price)} VNĐ</p>
                <button onclick="addToCart(${product.id})">Thêm vào giỏ</button>
            </div>
        `;
        productList.innerHTML += html;
    });
}

function formatPrice(price) {
    if (price === undefined || price === null) return "0";
    return Number(price).toLocaleString("vi-VN");
}

function addToCart(productId) {
    const product = productListArray.find(item => item.id == productId);
    if (!product) return;

    let cart = JSON.parse(localStorage.getItem("CART_LIST")) || [];

    const index = cart.findIndex(item => item.product.id == productId);
    if (index !== -1) {
        cart[index].quantity += 1;
    } else {
        cart.push(new CartItem(product, 1));
    }

    localStorage.setItem("CART_LIST", JSON.stringify(cart));
    alert(`Đã thêm "${product.name}" vào giỏ hàng!`);
}