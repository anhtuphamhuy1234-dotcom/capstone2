let cart = [];

function getCartFromStorage() {
  const cartJson = localStorage.getItem("CART_LIST");
  cart = cartJson ? JSON.parse(cartJson) : [];
}

function saveCartToStorage() {
  localStorage.setItem("CART_LIST", JSON.stringify(cart));
}

function renderCart() {
  const tbody = document.getElementById("tblCart");
  if (!tbody) return;

  let content = "";
  let totalMoney = 0;

  if (!cart || cart.length === 0) {
    tbody.innerHTML = `<tr><td colspan="7" class="text-center py-4">Giỏ hàng của bạn đang trống!</td></tr>`;
    document.getElementById("totalMoney").innerText = "0";
    return;
  }

  cart.forEach((item, index) => {
    const price = Number(item.product.price) || 0;
    const itemTotal = price * item.quantity;
    totalMoney += itemTotal;

    const image = item.product.imgLink || item.product.image || "https://via.placeholder.com/70";

    content += `
      <tr>
        <td>${index + 1}</td>
        <td><img src="${image}" alt="${item.product.name}" style="width: 60px; height: 60px; object-fit: cover;"></td>
        <td class="fw-bold">${item.product.name}</td>
        <td>${price.toLocaleString("vi-VN")} VNĐ</td>
        <td>
          <button class="btn btn-sm btn-outline-secondary me-2" onclick="changeQuantity(${item.product.id}, -1)">-</button>
          <span class="fw-bold">${item.quantity}</span>
          <button class="btn btn-sm btn-outline-secondary ms-2" onclick="changeQuantity(${item.product.id}, 1)">+</button>
        </td>
        <td class="text-danger fw-bold">${itemTotal.toLocaleString("vi-VN")} VNĐ</td>
        <td>
          <button class="btn btn-sm btn-danger" onclick="removeItem(${item.product.id})">
            <i class="fa-solid fa-trash"></i> Xóa
          </button>
        </td>
      </tr>
    `;
  });

  tbody.innerHTML = content;
  document.getElementById("totalMoney").innerText = totalMoney.toLocaleString("vi-VN");
}

function changeQuantity(id, amount) {
  const index = cart.findIndex((item) => item.product.id == id);
  if (index !== -1) {
    cart[index].quantity += amount;
    if (cart[index].quantity <= 0) {
      cart.splice(index, 1);
    }
    saveCartToStorage();
    renderCart();
  }
}

function removeItem(id) {
  cart = cart.filter((item) => item.product.id != id);
  saveCartToStorage();
  renderCart();
}

document.getElementById("btnPay")?.addEventListener("click", () => {
  if (cart.length === 0) {
    alert("Giỏ hàng của bạn đang trống!");
    return;
  }
  alert("Thanh toán thành công! Cảm ơn bạn đã mua hàng.");
  cart = [];
  saveCartToStorage();
  renderCart();
});

document.addEventListener("DOMContentLoaded", function () {
  getCartFromStorage();
  renderCart();
});