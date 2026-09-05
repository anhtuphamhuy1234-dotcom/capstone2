// ========================================
// CẤU HÌNH API
// ========================================

const API_URL = "https://apistore.cybersoft.edu.vn";


// ========================================
// BIẾN TOÀN CỤC
// ========================================

let products = [];

let categories = [];

let editingProductId = null;

let productModal;


// ========================================
// CHẠY KHI TRANG ĐƯỢC MỞ
// ========================================

document.addEventListener("DOMContentLoaded", function () {

    // Khởi tạo Bootstrap Modal
    productModal = new bootstrap.Modal(
        document.getElementById("productModal")
    );

    // Lấy sản phẩm
    loadProducts();

    // Lấy danh mục
    loadCategories();


    // Xử lý submit form
    document
        .getElementById("productForm")
        .addEventListener("submit", saveProduct);


    // Nhấn Enter trong ô tìm kiếm
    document
        .getElementById("searchInput")
        .addEventListener("keydown", function (event) {

            if (event.key === "Enter") {

                searchProduct();

            }

        });

});


// ========================================
// LẤY DANH SÁCH SẢN PHẨM
// GET /api/Product
// ========================================

async function loadProducts(keyword = "") {

    try {

        let url = `${API_URL}/api/Product`;

        // Nếu có keyword thì thêm query
        if (keyword.trim() !== "") {

            url += `?keyword=${encodeURIComponent(keyword)}`;

        }


        const response = await fetch(url);


        if (!response.ok) {

            throw new Error("Không thể lấy danh sách sản phẩm");

        }


        const result = await response.json();


        // Một số API trả về mảng trực tiếp
        // Một số API trả về { data: [] }
        if (Array.isArray(result)) {

            products = result;

        }
        else if (Array.isArray(result.data)) {

            products = result.data;

        }
        else {

            products = [];

        }


        // Hiển thị lên bảng
        renderProducts();

    }
    catch (error) {

        console.error(error);

        alert("Lỗi khi lấy danh sách sản phẩm!");

    }

}


// ========================================
// HIỂN THỊ SẢN PHẨM
// ========================================

function renderProducts() {

    const tableBody =
        document.getElementById("productTableBody");


    tableBody.innerHTML = "";


    if (products.length === 0) {

        tableBody.innerHTML = `
            <tr>
                <td colspan="7" class="text-center">
                    Không có sản phẩm
                </td>
            </tr>
        `;

        return;

    }


    products.forEach(function (product) {

        // Lấy tên danh mục
        let categoryName = "Chưa có";


        if (
            product.categories &&
            product.categories.length > 0
        ) {

            categoryName =
                product.categories[0].category;

        }


        // Hình ảnh
        let image = product.imgLink || product.image;


        if (!image) {

            image = "https://via.placeholder.com/70";

        }


        // Tạo một dòng
        const row = document.createElement("tr");


        row.innerHTML = `

            <td>
                ${product.id ?? ""}
            </td>

            <td>

                <img
                    src="${image}"
                    width="70"
                    height="70"
                    style="object-fit: cover;"
                    alt="${product.name ?? ""}"
                >

            </td>

            <td>
                ${product.name ?? ""}
            </td>

            <td>
                ${formatPrice(product.price)}
            </td>

            <td>
                ${product.quantity ?? 0}
            </td>

            <td>
                ${categoryName}
            </td>

            <td>

                <button
                    class="btn btn-warning btn-sm"
                    onclick="editProduct(${product.id})">

                    Sửa

                </button>


                <button
                    class="btn btn-danger btn-sm"
                    onclick="deleteProduct(${product.id})">

                    Xóa

                </button>

            </td>

        `;


        tableBody.appendChild(row);

    });

}


// ========================================
// FORMAT GIÁ
// ========================================

function formatPrice(price) {

    if (price === undefined || price === null) {

        return "0 VNĐ";

    }


    return Number(price).toLocaleString("vi-VN") + " VNĐ";

}


// ========================================
// LẤY DANH SÁCH DANH MỤC
// GET /api/Product/getAllCategory
// ========================================

async function loadCategories() {

    try {

        const response = await fetch(
            `${API_URL}/api/Product/getAllCategory`
        );


        if (!response.ok) {

            throw new Error("Không thể lấy danh mục");

        }


        const result = await response.json();


        if (Array.isArray(result)) {

            categories = result;

        }
        else if (Array.isArray(result.data)) {

            categories = result.data;

        }
        else {

            categories = [];

        }


        renderCategories();

    }
    catch (error) {

        console.error(error);

        alert("Không thể lấy danh sách danh mục!");

    }

}


// ========================================
// HIỂN THỊ DANH MỤC VÀO SELECT
// ========================================

function renderCategories() {

    const select =
        document.getElementById("productCategory");


    select.innerHTML = `
        <option value="">
            -- Chọn danh mục --
        </option>
    `;


    categories.forEach(function (category) {

        const option =
            document.createElement("option");


        option.value = category.id;

        option.textContent = category.category;


        select.appendChild(option);

    });

}


// ========================================
// MỞ FORM THÊM SẢN PHẨM
// ========================================

function openAddProduct() {

    editingProductId = null;


    document.getElementById("modalTitle").textContent =
        "Thêm sản phẩm";


    // Xóa dữ liệu cũ
    document.getElementById("productForm").reset();


    document.getElementById("productId").value = "";


    productModal.show();

}


// ========================================
// MỞ FORM SỬA SẢN PHẨM
// ========================================

function editProduct(id) {

    const product =
        products.find(function (item) {

            return item.id == id;

        });


    if (!product) {

        alert("Không tìm thấy sản phẩm!");

        return;

    }


    editingProductId = id;


    document.getElementById("modalTitle").textContent =
        "Sửa sản phẩm";


    // ID
    document.getElementById("productId").value =
        product.id ?? "";


    // Tên
    document.getElementById("productName").value =
        product.name ?? "";


    // Alias
    document.getElementById("productAlias").value =
        product.alias ?? "";


    // Giá
    document.getElementById("productPrice").value =
        product.price ?? 0;


    // Số lượng
    document.getElementById("productQuantity").value =
        product.quantity ?? 0;


    // Mô tả
    document.getElementById("description").value =
        product.description ?? "";


    // Mô tả ngắn
    document.getElementById("shortDescription").value =
        product.shortDescription ?? "";


    // Sizes
    document.getElementById("productSizes").value =
        product.sizes ?? "";


    // Hình ảnh
    document.getElementById("productImage").value =
        product.imgLink || product.image || "";


    // Danh mục
    if (
        product.categories &&
        product.categories.length > 0
    ) {

        document.getElementById("productCategory").value =
            product.categories[0].id;

    }


    productModal.show();

}


// ========================================
// THÊM / SỬA SẢN PHẨM
// ========================================

async function saveProduct(event) {

    event.preventDefault();


    // Lấy dữ liệu từ form
    const id =
        document.getElementById("productId").value;


    const name =
        document.getElementById("productName").value.trim();


    const alias =
        document.getElementById("productAlias").value.trim();


    const price =
        Number(document.getElementById("productPrice").value);


    const quantity =
        Number(document.getElementById("productQuantity").value);


    const description =
        document.getElementById("description").value.trim();


    const shortDescription =
        document.getElementById("shortDescription").value.trim();


    const sizes =
        document.getElementById("productSizes").value.trim();


    const image =
        document.getElementById("productImage").value.trim();


    const categoryId =
        document.getElementById("productCategory").value;


    // Tìm category tương ứng
    const selectedCategory =
        categories.find(function (category) {

            return String(category.id) === String(categoryId);

        });


    // Tạo object Product
    const productData = {

        id: editingProductId ? Number(id) : 0,

        name: name,

        alias: alias,

        price: price,

        description: description,

        size: [],

        sizes: sizes,

        shortDescription: shortDescription,

        quantity: quantity,

        categories: selectedCategory
            ? [
                {
                    id: selectedCategory.id,
                    category: selectedCategory.category
                }
            ]
            : [],

        relatedProducts: [],

        image: image,

        imgLink: image

    };


    try {

        let url = `${API_URL}/api/Product`;

        let method = "POST";


        // Nếu đang sửa
        if (editingProductId) {

            method = "PUT";

        }


        const response = await fetch(url, {

            method: method,

            headers: {

                "Content-Type": "application/json"

            },

            body: JSON.stringify(productData)

        });


        if (!response.ok) {

            const errorText = await response.text();

            console.error(errorText);

            throw new Error("API trả về lỗi");

        }


        if (editingProductId) {

            alert("Sửa sản phẩm thành công!");

        }
        else {

            alert("Thêm sản phẩm thành công!");

        }


        // Đóng modal
        productModal.hide();


        // Load lại danh sách
        loadProducts();

    }
    catch (error) {

        console.error(error);

        alert(
            "Có lỗi xảy ra khi lưu sản phẩm!"
        );

    }

}


// ========================================
// XÓA SẢN PHẨM
// DELETE /api/Product/{id}
// ========================================

async function deleteProduct(id) {

    const confirmDelete =
        confirm(
            "Bạn có chắc chắn muốn xóa sản phẩm này?"
        );


    if (!confirmDelete) {

        return;

    }


    try {

        const response = await fetch(
            `${API_URL}/api/Product/${id}`,
            {
                method: "DELETE"
            }
        );


        if (!response.ok) {

            throw new Error("Không thể xóa sản phẩm");

        }


        alert("Xóa sản phẩm thành công!");


        // Load lại bảng
        loadProducts();

    }
    catch (error) {

        console.error(error);

        alert("Xóa sản phẩm thất bại!");

    }

}


// ========================================
// TÌM KIẾM
// GET /api/Product?keyword=...
// ========================================

function searchProduct() {

    const keyword =
        document
            .getElementById("searchInput")
            .value
            .trim();


    loadProducts(keyword);

}