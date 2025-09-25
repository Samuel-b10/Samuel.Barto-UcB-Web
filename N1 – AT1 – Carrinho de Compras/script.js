// Variáveis globais (array de produtos e carrinho)
const PRODUCTS = [
  { code: 'P001', name: 'Teclado Mecânico', price: 249.90 },
  { code: 'P002', name: 'Mouse Gamer', price: 99.90 },
  { code: 'P003', name: 'Monitor 24"', price: 899.00 },
  { code: 'P004', name: 'Webcam 1080p', price: 159.50 },
  { code: 'P005', name: 'Headset', price: 199.99 }
];

// carrinho será um array de objetos: { code, name, price, qty }
let cart = []; // variável global (mutável)
var loggedUser = null; // demonstrando var (escopo funcional/glob.)

// Usuários simples para autenticação (apenas exemplo)
const USERS = [
  { username: 'aluno', password: '1234', displayName: 'Aluno' },
  { username: 'admin', password: 'admin', displayName: 'Administrador' }
];

// --- Funções de inicialização e render ---
function init() {
  // Vincular eventos
  document.getElementById('btn-login').addEventListener('click', login);
  document.getElementById('btn-logout').addEventListener('click', logout);
  document.getElementById('btn-search').addEventListener('click', handleSearch);
  document.getElementById('btn-show-all').addEventListener('click', renderProducts);
  document.getElementById('btn-finalize').addEventListener('click', finalizePurchase);
  document.getElementById('btn-clear').addEventListener('click', clearCart);
  document.getElementById('btn-close-summary').addEventListener('click', () => toggleSummary(false));
  document.getElementById('search-input').addEventListener('keyup', (e)=>{ if(e.key === 'Enter') handleSearch() });

  renderProducts();
  renderCart();
}

// --- Login / Logout ---
function login() {
  const username = document.getElementById('username').value.trim();
  const password = document.getElementById('password').value.trim();
  const msgEl = document.getElementById('login-msg');

  // validação simples
  if (!username || !password) {
    msgEl.textContent = 'Preencha usuário e senha.';
    return;
  }

  const user = USERS.find(u => u.username === username && u.password === password);
  if (user) {
    loggedUser = user;
    msgEl.textContent = '';
    afterLogin();
  } else {
    msgEl.textContent = 'Usuário ou senha inválidos.';
  }
}

function afterLogin() {
  document.getElementById('login-section').classList.add('hidden');
  document.getElementById('app-section').classList.remove('hidden');
  document.getElementById('btn-logout').classList.remove('hidden');
  document.getElementById('user-name').textContent = loggedUser.displayName;
  document.getElementById('user-name').title = loggedUser.username;
  renderProducts();
  renderCart();
}

function logout() {
  loggedUser = null;
  document.getElementById('login-section').classList.remove('hidden');
  document.getElementById('app-section').classList.add('hidden');
  document.getElementById('btn-logout').classList.add('hidden');
  document.getElementById('login-msg').textContent = 'Desconectado.';
}

// --- Produtos & Busca ---
function renderProducts(products = PRODUCTS) {
  // somente permitir render se estiver logado
  const prodList = document.getElementById('products-list');
  prodList.innerHTML = '';

  products.forEach(p => {
    const li = document.createElement('li');
    li.innerHTML = `
      <div>
        <div><strong>${p.name}</strong></div>
        <div class="small">Código: ${p.code} • R$ ${p.price.toFixed(2)}</div>
      </div>
      <div>
        <button class="btn-mini" onclick="addToCart('${p.code}')">Adicionar</button>
      </div>
    `;
    prodList.appendChild(li);
  });
}

function handleSearch() {
  const term = document.getElementById('search-input').value.trim().toLowerCase();
  const msgEl = document.getElementById('app-msg');
  msgEl.textContent = '';
  if (!term) {
    renderProducts();
    return;
  }

  const results = PRODUCTS.filter(p => p.name.toLowerCase().includes(term) || p.code.toLowerCase() === term);
  if (results.length === 0) {
    msgEl.textContent = 'Nenhum produto encontrado.';
  }
  renderProducts(results);
}

// --- Carrinho ---
function addToCart(code) {
  if (!loggedUser) { showAppMessage('Faça login para adicionar produtos.'); return; }

  const prod = PRODUCTS.find(p => p.code === code);
  if (!prod) { showAppMessage('Produto não encontrado.'); return; }

  const existing = cart.find(i => i.code === code);
  if (existing) {
    existing.qty += 1; // variável dentro do objeto
  } else {
    // uso de let para variável local
    let item = { code: prod.code, name: prod.name, price: prod.price, qty: 1 };
    cart.push(item);
  }
  renderCart();
  showAppMessage(`${prod.name} adicionado ao carrinho.`);
}

function removeFromCart(code) {
  // remove item completamente do carrinho
  cart = cart.filter(i => i.code !== code);
  renderCart();
}

function renderCart() {
  const cartList = document.getElementById('cart-list');
  cartList.innerHTML = '';
  let total = 0;

  cart.forEach(item => {
    const itemTotal = item.price * item.qty;
    total += itemTotal;

    const li = document.createElement('li');
    li.innerHTML = `
      <div>
        <div><strong>${item.name}</strong></div>
        <div class="small">Qtd: <span class="qty">${item.qty}</span> • R$ ${itemTotal.toFixed(2)}</div>
      </div>
      <div>
        <button class="btn-mini" onclick="decreaseQty('${item.code}')">-</button>
        <button class="btn-mini" onclick="increaseQty('${item.code}')">+</button>
        <button class="btn-mini" onclick="removeFromCart('${item.code}')">Remover</button>
      </div>
    `;
    cartList.appendChild(li);
  });

  document.getElementById('cart-total').textContent = `Total: R$ ${total.toFixed(2)}`;
}

function increaseQty(code) {
  const item = cart.find(i => i.code === code);
  if (item) { item.qty += 1; renderCart(); }
}

function decreaseQty(code) {
  const item = cart.find(i => i.code === code);
  if (item) {
    item.qty -= 1;
    if (item.qty <= 0) removeFromCart(code);
    else renderCart();
  }
}

function clearCart() {
  cart = [];
  renderCart();
}

// --- Finalizar Compra ---
function finalizePurchase() {
  if (!loggedUser) { showAppMessage('Faça login para finalizar a compra.'); return; }
  if (cart.length === 0) { showAppMessage('Carrinho vazio. Adicione produtos antes de finalizar.'); return; }

  const total = cart.reduce((s, i) => s + i.price * i.qty, 0);
  const summaryEl = document.getElementById('order-summary');

  // construir resumo (DOM)
  let html = `<p><strong>Cliente:</strong> ${loggedUser.displayName} (${loggedUser.username})</p>`;
  html += '<ul>';
  cart.forEach(i => {
    html += `<li>${i.qty}x ${i.name} — R$ ${(i.price * i.qty).toFixed(2)}</li>`;
  });
  html += '</ul>';
  html += `<p><strong>Total:</strong> R$ ${total.toFixed(2)}</p>`;

  summaryEl.innerHTML = html;
  toggleSummary(true);

  // opcional: limpar o carrinho após finalizar
  cart = [];
  renderCart();
}

function toggleSummary(show) {
  const el = document.getElementById('summary');
  if (show) el.classList.remove('hidden'); else el.classList.add('hidden');
}

// --- Utilitários ---
function showAppMessage(text) {
  const el = document.getElementById('app-msg');
  el.textContent = text;
  setTimeout(()=>{ el.textContent = '' }, 3000);
}

// Inicialização quando a página carregar
window.addEventListener('DOMContentLoaded', init);