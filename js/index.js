const API_URL = "https://apistore.cybersoft.edu.vn";

document.addEventListener("DOMContentLoaded", function () {
    loadProducts();
});

function loadProducts() {
    fetch(`${API_URL}/api/Product`)
        .then(response => {
            if (!response.ok) {
                throw new Error("Không thể lấy danh sách sản phẩm");
            }

            return response.json();
        })
        .then(result => {

            console.log("Dữ liệu API:", result);
            console.log("Content:", result.content);
console.log("Kiểu dữ liệu:", typeof result.content);
console.log("Có phải mảng không:", Array.isArray(result.content));

            let products = result;

            // Trường hợp API trả về { data: [...] }
            if (result.data) {
                products = result.content;
            }

            renderProducts(products);
        })
        .catch(error => {
            console.error(error);

            document.getElementById("productList").innerHTML = `
                <p>Không thể tải sản phẩm.</p>
            `;
        });
}


function renderProducts(products) {

    const productList = document.getElementById("productList");

    productList.innerHTML = "";

    // Chỉ lấy 4 sản phẩm đầu tiên
    products.slice(0, 4).forEach(product => {

        const image = product.imgLink || product.image || "images/product1.jpg";

        const html = `
            <div class="product-card">

                <img src="${image}" alt="${product.name}">

                <h3>${product.name}</h3>

                <p class="price">
                    ${formatPrice(product.price)} VNĐ
                </p>

                <button onclick="addToCart(${product.id})">
                    Thêm vào giỏ
                </button>

            </div>
        `;

        productList.innerHTML += html;
    });
}


function formatPrice(price) {

    return Number(price).toLocaleString("vi-VN");
}


function addToCart(productId) {

    console.log("Thêm sản phẩm vào giỏ:", productId);

    alert("Đã thêm sản phẩm vào giỏ hàng!");
}