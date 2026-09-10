const API_URL = "https://apistore.cybersoft.edu.vn";

let products = [];
let categories = [];
let editingProductId = null;
let productModal;

document.addEventListener("DOMContentLoaded", function () {
    productModal = new bootstrap.Modal(
        document.getElementById("productModal")
    );

    loadProducts();
    loadCategories();

    document
        .getElementById("productForm")
        .addEventListener("submit", saveProduct);

    document
        .getElementById("searchInput")
        .addEventListener("keydown", function (event) {
            if (event.key === "Enter") {
                searchProduct();
            }
        });
});

async function loadProducts() {
    try {
        const response = await axios.get(
            `${API_URL}/api/Product`
        );

        const result = response.data;

        if (Array.isArray(result)) {
            products = result;
        }
        else if (Array.isArray(result.content)) {
            products = result.content;
        }
        else if (Array.isArray(result.data)) {
            products = result.data;
        }
        else {
            products = [];
        }

        renderProducts(products);

        console.log("Danh sách sản phẩm:", products);
    }
    catch (error) {
        console.error(error);
        alert("Không thể lấy danh sách sản phẩm!");
    }
}

function renderProducts(list = products) {
    const tableBody =
        document.getElementById("productTableBody");

    tableBody.innerHTML = "";

    if (list.length === 0) {
        tableBody.innerHTML = `
            <tr>
                <td colspan="7" class="text-center">
                    Không có sản phẩm
                </td>
            </tr>
        `;

        return;
    }

    list.forEach(function (product) {
        let categoryName = "Chưa có";

        if (
            product.categories &&
            product.categories.length > 0
        ) {
            categoryName =
                product.categories[0].category;
        }

        let image =
            product.imgLink ||
            product.image ||
            "https://via.placeholder.com/70";

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
    type="button"
    class="btn btn-warning btn-sm"
    style="color: black !important; font-size: 14px !important;"
    onclick="editProduct(${product.id})">
    Sửa
</button>

                <button
    type="button"
    style="color: white !important; background-color: red !important; font-size: 14px !important;"
    onclick="deleteProduct(${product.id})">
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

async function loadCategories() {
    try {
        const response = await axios.get(
            `${API_URL}/api/Product/getAllCategory`
        );

        const result = response.data;

        if (Array.isArray(result)) {
            categories = result;
        }
        else if (Array.isArray(result.content)) {
            categories = result.content;
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

function openAddProduct() {
    editingProductId = null;

    document.getElementById("modalTitle").textContent =
        "Thêm sản phẩm";

    document.getElementById("productForm").reset();

    document.getElementById("productId").value = "";

    productModal.show();
}

function editProduct(id) {
    const product = products.find(function (item) {
        return item.id == id;
    });

    if (!product) {
        alert("Không tìm thấy sản phẩm!");
        return;
    }

    editingProductId = id;

    document.getElementById("modalTitle").textContent =
        "Sửa sản phẩm";

    document.getElementById("productId").value =
        product.id ?? "";

    document.getElementById("productName").value =
        product.name ?? "";

    document.getElementById("productAlias").value =
        product.alias ?? "";

    document.getElementById("productPrice").value =
        product.price ?? 0;

    document.getElementById("productQuantity").value =
        product.quantity ?? 0;

    document.getElementById("description").value =
        product.description ?? "";

    document.getElementById("shortDescription").value =
        product.shortDescription ?? "";

    document.getElementById("productSizes").value =
        product.sizes ?? "";

    document.getElementById("productImage").value =
        product.imgLink ||
        product.image ||
        "";

    if (
        product.categories &&
        product.categories.length > 0
    ) {
        document.getElementById("productCategory").value =
            product.categories[0].id;
    }

    productModal.show();
}

function validateProduct() {
    const name =
        document.getElementById("productName").value.trim();

    const price =
        Number(document.getElementById("productPrice").value);

    const quantity =
        Number(document.getElementById("productQuantity").value);

    const category =
        document.getElementById("productCategory").value;

    const image =
        document.getElementById("productImage").value.trim();

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

    if (category === "") {
        alert("Vui lòng chọn danh mục!");
        return false;
    }

    if (image !== "") {
        try {
            new URL(image);
        }
        catch {
            alert("Link hình ảnh không hợp lệ!");
            return false;
        }
    }

    return true;
}

async function saveProduct(event) {
    event.preventDefault();

    if (!validateProduct()) {
        return;
    }

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

    const selectedCategory =
        categories.find(function (category) {
            return String(category.id) === String(categoryId);
        });

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
        if (editingProductId) {
            await axios.put(
                `${API_URL}/api/Product`,
                productData
            );

            alert("Cập nhật sản phẩm thành công!");
        }
        else {
            await axios.post(
                `${API_URL}/api/Product`,
                productData
            );

            alert("Thêm sản phẩm thành công!");
        }

        productModal.hide();

        await loadProducts();
    }
    catch (error) {
        console.error(error);
        console.log(error.response?.data);

        alert("Có lỗi xảy ra khi lưu sản phẩm!");
    }
}

async function deleteProduct(id) {
    const confirmDelete =
        confirm(
            "Bạn có chắc chắn muốn xóa sản phẩm này?"
        );

    if (!confirmDelete) {
        return;
    }

    try {
        await axios.delete(
            `${API_URL}/api/Product/${id}`
        );

        alert("Xóa sản phẩm thành công!");

        await loadProducts();
    }
    catch (error) {
        console.error(error);
        console.log(error.response?.data);

        alert("Xóa sản phẩm thất bại!");
    }
}

function searchProduct() {
    const keyword =
        document
            .getElementById("searchInput")
            .value
            .trim()
            .toLowerCase();

    if (keyword === "") {
        renderProducts(products);
        return;
    }

    const result =
        products.filter(function (product) {
            return product.name
                ?.toLowerCase()
                .includes(keyword);
        });

    renderProducts(result);
}

function sortProducts() {
    const type =
        document.getElementById("sortPrice").value;

    let sortedProducts = [...products];

    if (type === "asc") {
        sortedProducts.sort(function (a, b) {
            return Number(a.price) - Number(b.price);
        });
    }

    if (type === "desc") {
        sortedProducts.sort(function (a, b) {
            return Number(b.price) - Number(a.price);
        });
    }

    renderProducts(sortedProducts);
}