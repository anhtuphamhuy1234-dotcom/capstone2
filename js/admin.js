const API_URL = "https://apistore.cybersoft.edu.vn";

let products = [];

document.addEventListener("DOMContentLoaded", function () {
    loadDashboard();
});

async function loadDashboard() {
    await loadProducts();
    updateStatistics();
}

async function loadProducts() {
    try {
        const response = await fetch(`${API_URL}/api/Product`);

        if (!response.ok) {
            throw new Error("Không thể lấy danh sách sản phẩm");
        }

        const result = await response.json();

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

        console.log("Danh sách sản phẩm:", products);
    }
    catch (error) {
        console.error(error);
        products = [];
    }
}

function updateStatistics() {
    const totalProducts = products.length;

    document.getElementById("totalProducts").textContent = totalProducts;

    document.getElementById("totalOrders").textContent = 85;

    document.getElementById("totalCustomers").textContent = 350;

    document.getElementById("totalRevenue").textContent =
        "50.000.000 VNĐ";
}