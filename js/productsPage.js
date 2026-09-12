const API_URL = "https://apistore.cybersoft.edu.vn/api/Product";
let listProducts = [];

document.addEventListener("DOMContentLoaded", function () {
    fetchProducts();
});

function fetchProducts() {
    axios.get(API_URL)
        .then(function (response) {
            listProducts = response.data.content || response.data;
            renderCategoryDropdown(listProducts);
            checkCategoryFromURL();
            filterProducts();
        })
        .catch(function (error) {
            console.error("Lỗi khi tải sản phẩm:", error);
            const container = document.getElementById("productsContainer");
            if (container) container.innerHTML = `<p style="color:red;">Không thể tải sản phẩm!</p>`;
        });
}

function filterProducts() {
    let keyword = document.getElementById("searchInput").value.toLowerCase().trim();
    let selectedCategory = document.getElementById("categoryFilter").value;
    let sortPriceValue = document.getElementById("sortPrice").value;

    let filteredList = listProducts.filter(function (product) {
        let matchName = product.name ? product.name.toLowerCase().includes(keyword) : false;
        
        let matchCategory = true;
        if (selectedCategory !== "") {
            if (product.categories && Array.isArray(product.categories)) {
                matchCategory = product.categories.some(cat => String(cat.id) === String(selectedCategory));
            }
        }

        return matchName && matchCategory;
    });

    if (sortPriceValue === "asc") {
        filteredList.sort((a, b) => Number(a.price) - Number(b.price));
    } else if (sortPriceValue === "desc") {
        filteredList.sort((a, b) => Number(b.price) - Number(a.price));
    }

    renderProductList(filteredList);
}

function renderProductList(products) {
    let container = document.getElementById("productsContainer");
    if (!container) return;
    
    if (products.length === 0) {
        container.innerHTML = `<p style="grid-column: 1/-1; text-align: center; padding: 20px;">Không tìm thấy sản phẩm phù hợp!</p>`;
        return;
    }

    let htmlContent = "";
    products.forEach(function (product) {
        let image = product.image || product.imgLink || "https://via.placeholder.com/150";

        htmlContent += `
            <div class="product-card">
                <img src="${image}" alt="${product.name}" onerror="this.src='https://via.placeholder.com/150'">
                <div class="product-info">
                    <h3>${product.name}</h3>
                    <p class="price">${Number(product.price).toLocaleString("vi-VN")} VNĐ</p>
                    <button onclick="addToCart(${product.id})" class="btn btn-primary">
                        Thêm vào giỏ
                    </button>
                </div>
            </div>
        `;
    });

    container.innerHTML = htmlContent;
}

function renderCategoryDropdown(products) {
    let categorySelect = document.getElementById("categoryFilter");
    if (!categorySelect) return;

    let categoriesMap = new Map();

    products.forEach(function (product) {
        if (product.categories && Array.isArray(product.categories)) {
            product.categories.forEach(cat => {
                if (cat.id) categoriesMap.set(String(cat.id), cat.category || cat.name);
            });
        }
    });

    let htmlOptions = `<option value="">Tất cả danh mục</option>`;
    categoriesMap.forEach(function (name, id) {
        htmlOptions += `<option value="${id}">${name}</option>`;
    });

    categorySelect.innerHTML = htmlOptions;
}

function checkCategoryFromURL() {
    let urlParams = new URLSearchParams(window.location.search);
    let categoryParam = urlParams.get('category');
    
    if (categoryParam) {
        let categorySelect = document.getElementById("categoryFilter");
        if (categorySelect) categorySelect.value = categoryParam;
    }
}

function addToCart(productId) {
    const product = listProducts.find(item => item.id == productId);
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