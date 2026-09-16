const API_URL = "https://apistore.cybersoft.edu.vn";
let productListArray = [];

document.addEventListener("DOMContentLoaded", function () {
    loadProducts();
});

function loadProducts() {
    axios.get(`${API_URL}/api/Product`)
        .then(response => {
            const result = response.data.content || response.data;
            productListArray = Array.isArray(result) ? result : [];
            renderProducts(productListArray);
        })
        .catch(error => {
            console.error("Lỗi lấy danh sách sản phẩm:", error);
            const container = document.getElementById("productList");
            if (container) container.innerHTML = `<p class="col-12 text-center text-danger">Không thể tải sản phẩm.</p>`;
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
    const itemData = productListArray.find(item => item.id == productId);
    if (!itemData) return;

    const productObj = new Product(
        itemData.id,
        itemData.name,
        itemData.price,
        itemData.image || itemData.imgLink,
        itemData.description,
        itemData.quantity,
        itemData.categories
    );

    let cart = JSON.parse(localStorage.getItem("CART_LIST")) || [];

    const index = cart.findIndex(item => item.product.id == productId);
    if (index !== -1) {
        cart[index].quantity += 1;
    } else {
        cart.push(new CartItem(productObj, 1));
    }

    localStorage.setItem("CART_LIST", JSON.stringify(cart));
    alert(`Đã thêm "${productObj.name}" vào giỏ hàng!`);
}