const API_URL = "https://apistore.cybersoft.edu.vn";

let products = [];
let categories = [];
let editingProductId = null;
let productModal;

// === KHỞI TẠO TRANG ===
document.addEventListener("DOMContentLoaded", function () {
    const modalElement = document.getElementById("productModal");
    if (modalElement) {
        productModal = new bootstrap.Modal(modalElement);

        modalElement.addEventListener("hidden.bs.modal", function () {
            editingProductId = null;
            document.getElementById("productForm")?.reset();
            const idInput = document.getElementById("productId");
            if (idInput) idInput.value = "";
        });
    }

    loadProducts();
    loadCategories();

    const productForm = document.getElementById("productForm");
    if (productForm) {
        productForm.addEventListener("submit", saveProduct);
    }

    const searchInput = document.getElementById("searchInput");
    if (searchInput) {
        searchInput.addEventListener("keydown", function (event) {
            if (event.key === "Enter") {
                searchProduct();
            }
        });
    }
});

// === QUẢN LÝ DANH SÁCH SẢN PHẨM ===
async function loadProducts() {
    try {
        const response = await axios.get(`${API_URL}/api/Product`);
        const result = response.data;

        if (Array.isArray(result)) {
            products = result;
        } else if (Array.isArray(result.content)) {
            products = result.content;
        } else if (Array.isArray(result.data)) {
            products = result.data;
        } else {
            products = [];
        }

        renderProducts(products);
    } catch (error) {
        console.error("Lỗi loadProducts:", error);
    }
}

function renderProducts(list = products) {
    const tableBody = document.getElementById("productTableBody");
    if (!tableBody) return;

    tableBody.innerHTML = "";

    if (!list || list.length === 0) {
        tableBody.innerHTML = `
            <tr>
                <td colspan="7" class="text-center py-3">
                    Không có sản phẩm
                </td>
            </tr>
        `;
        return;
    }

    list.forEach(function (product) {
        let categoryName = "Chưa có";
        if (product.categories && product.categories.length > 0) {
            let catObj = product.categories[0];
            if (typeof catObj === "string") {
                try { catObj = JSON.parse(catObj); } catch (e) {}
            }
            categoryName = catObj.category || catObj.name || catObj.id || "Chưa có";
        } else if (product.category) {
            categoryName = product.category;
        }

        let image = product.imgLink || product.image || "https://via.placeholder.com/70";

        const row = document.createElement("tr");
        row.innerHTML = `
            <td>${product.id ?? ""}</td>
            <td>
                <img src="${image}" width="60" height="60" style="object-fit: cover;" alt="${product.name ?? ""}" onerror="this.src='https://via.placeholder.com/60'">
            </td>
            <td class="fw-bold">${product.name ?? ""}</td>
            <td>${formatPrice(product.price)}</td>
            <td>${product.quantity ?? 0}</td>
            <td><span class="badge bg-info text-dark">${categoryName}</span></td>
            <td>
                <button type="button" class="btn btn-warning btn-sm me-1" onclick="editProduct('${product.id}')">
                    Sửa
                </button>
                <button type="button" class="btn btn-danger btn-sm" onclick="deleteProduct('${product.id}')">
                    Xóa
                </button>
            </td>
        `;
        tableBody.appendChild(row);
    });
}

function formatPrice(price) {
    return Number(price || 0).toLocaleString("vi-VN") + " VNĐ";
}

// === QUẢN LÝ DANH MỤC ===
async function loadCategories() {
    try {
        const response = await axios.get(`${API_URL}/api/Product/getAllCategory`);
        const result = response.data;

        if (Array.isArray(result)) {
            categories = result;
        } else if (Array.isArray(result.content)) {
            categories = result.content;
        } else {
            categories = [];
        }

        renderCategories();
    } catch (error) {
        console.error("Lỗi loadCategories:", error);
    }
}

function renderCategories() {
    const select = document.getElementById("productCategory");
    if (!select) return;

    select.innerHTML = `<option value="">-- Chọn danh mục --</option>`;

    categories.forEach(function (category) {
        const option = document.createElement("option");
        option.value = category.id || category.category;
        option.textContent = category.category || category.name || category.id;
        select.appendChild(option);
    });
}

// === THAO TÁC FORM (THÊM, SỬA, LƯU, XÓA) ===
function openAddProduct() {
    editingProductId = null;
    document.getElementById("modalTitle").textContent = "Thêm sản phẩm";
    document.getElementById("productForm").reset();
    document.getElementById("productId").value = "";
    if (productModal) productModal.show();
}

function editProduct(id) {
    const product = products.find((item) => String(item.id) === String(id));

    if (!product) {
        alert("Không tìm thấy sản phẩm!");
        return;
    }

    editingProductId = id;

    document.getElementById("modalTitle").textContent = "Sửa sản phẩm";
    document.getElementById("productId").value = product.id ?? "";
    document.getElementById("productName").value = product.name ?? "";
    document.getElementById("productAlias").value = product.alias ?? "";
    document.getElementById("productPrice").value = product.price ?? 0;
    document.getElementById("productQuantity").value = product.quantity ?? 0;
    document.getElementById("description").value = product.description ?? "";
    document.getElementById("shortDescription").value = product.shortDescription ?? "";

    let sizesText = "";
    if (Array.isArray(product.size)) {
        sizesText = product.size.join(",");
    } else if (typeof product.size === "string") {
        sizesText = product.size.replace(/[\[\]"]/g, "");
    }
    document.getElementById("productSizes").value = sizesText;
    document.getElementById("productImage").value = product.imgLink || product.image || "";

    if (product.categories && product.categories.length > 0) {
        let catObj = product.categories[0];
        if (typeof catObj === "string") {
            try { catObj = JSON.parse(catObj); } catch (e) {}
        }
        document.getElementById("productCategory").value = catObj.id || catObj.category || "";
    }

    if (productModal) productModal.show();
}

function validateProduct() {
    const name = document.getElementById("productName").value.trim();
    const price = Number(document.getElementById("productPrice").value);
    const quantity = Number(document.getElementById("productQuantity").value);

    if (name === "") {
        alert("Tên sản phẩm không được để trống!");
        return false;
    }
    if (price <= 0) {
        alert("Giá sản phẩm phải lớn hơn 0!");
        return false;
    }
    if (quantity < 0) {
        alert("Số lượng không được nhỏ hơn 0!");
        return false;
    }
    return true;
}

async function saveProduct(event) {
    event.preventDefault();

    if (!validateProduct()) return;

    const id = document.getElementById("productId").value;
    const name = document.getElementById("productName").value.trim();
    const alias = document.getElementById("productAlias").value.trim();
    const price = Number(document.getElementById("productPrice").value);
    const quantity = Number(document.getElementById("productQuantity").value);
    const description = document.getElementById("description").value.trim();
    const shortDescription = document.getElementById("shortDescription").value.trim();
    const sizesInput = document.getElementById("productSizes").value.trim();
    const image = document.getElementById("productImage").value.trim();
    const categoryId = document.getElementById("productCategory").value || "VANS_CONVERSE";

    const cleanSizes = sizesInput.replace(/[\[\]"]/g, "");
    const sizeArray = cleanSizes 
        ? cleanSizes.split(",").map(s => s.trim()) 
        : ["36", "37", "38", "39"];

    const categoryObj = categories.find(cat => String(cat.id) === String(categoryId)) || { id: categoryId, category: categoryId };
    
    const categoriesArray = [
        {
            id: String(categoryObj.id || categoryId),
            category: String(categoryObj.category || categoryObj.name || categoryId)
        }
    ];

    const productData = {
        id: editingProductId ? Number(id) : 0,
        name: name,
        alias: alias || name.toLowerCase().replace(/\s+/g, "-"),
        price: price,
        description: description,
        size: sizeArray,
        shortDescription: shortDescription,
        quantity: quantity,
        deleted: false,
        categories: categoriesArray,
        relatedProducts: [],
        feature: true,
        image: image,
        imgLink: image
    };

    try {
        if (editingProductId) {
            await axios.put(`${API_URL}/api/Product/updateProduct`, productData);
            alert("Cập nhật sản phẩm thành công!");
        } else {
            await axios.post(`${API_URL}/api/Product/createProduct`, productData);
            alert("Thêm sản phẩm thành công!");
        }

        if (productModal) productModal.hide();
        await loadProducts();
    } catch (error) {
        try {
            if (editingProductId) {
                await axios.put(`${API_URL}/api/Product`, productData);
            } else {
                await axios.post(`${API_URL}/api/Product`, productData);
            }
            alert("Lưu sản phẩm thành công!");
            if (productModal) productModal.hide();
            await loadProducts();
        } catch (errFallback) {
            console.error("Lỗi Backend chi tiết:", errFallback.response?.data);
            alert("Lỗi Backend: " + (errFallback.response?.data?.message || "Kiểm tra lại dữ liệu nhập!"));
        }
    }
}

async function deleteProduct(id) {
    const confirmDelete = confirm("Bạn có chắc chắn muốn xóa sản phẩm này?");
    if (!confirmDelete) return;

    try {
        await axios.delete(`${API_URL}/api/Product/${id}`);
        alert("Xóa sản phẩm thành công!");
        await loadProducts();
    } catch (error) {
        console.error("Lỗi deleteProduct:", error);
        alert("Xóa sản phẩm thất bại!");
    }
}

// === TÌM KIẾM VÀ SẮP XẾP ===
function searchProduct() {
    const keyword = document.getElementById("searchInput").value.trim().toLowerCase();
    if (keyword === "") {
        renderProducts(products);
        return;
    }
    const result = products.filter((product) => product.name?.toLowerCase().includes(keyword));
    renderProducts(result);
}

function sortProducts() {
    const type = document.getElementById("sortPrice").value;
    let sortedProducts = [...products];

    if (type === "asc") {
        sortedProducts.sort((a, b) => Number(a.price) - Number(b.price));
    } else if (type === "desc") {
        sortedProducts.sort((a, b) => Number(b.price) - Number(a.price));
    }

    renderProducts(sortedProducts);
}