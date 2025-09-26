// =======================================================
//                   VARIÁVEIS GLOBAIS
// =======================================================

// Lista de produtos disponíveis
const PRODUCTS = [
  { code: 'P001', name: 'Teclado Mecânico', price: 249.90 },
  { code: 'P002', name: 'Mouse Gamer', price: 99.90 },
  { code: 'P003', name: 'Monitor 24"', price: 899.00 },
  { code: 'P004', name: 'Webcam 1080p', price: 159.50 },
  { code: 'P005', name: 'Headset', price: 199.99 }
];

// Carrinho de compras, começa vazio
let cart = [];

// Usuário logado atualmente
var loggedUser = null; // 'var' demonstra escopo global/função

// Usuários para login (apenas exemplo)
const USERS = [
  { username: 'aluno', password: '1234', displayName: 'Aluno' },
  { username: 'admin', password: 'admin', displayName: 'Administrador' }
];

// =======================================================
//             INICIALIZAÇÃO E EVENTOS
// =======================================================
function init() {
  // ----- Vincula botões e campos aos eventos -----
  document.getElementById('btn-login').addEventListener('click', login);
  document.getElementById('btn-logout').addEventListener('click', logout);
  document.getElementById('btn-search').addEventListener('click', handleSearch);
  document.getElementById('btn-show-all').addEventListener('click', renderProducts);
  document.getElementById('btn-finalize').addEventListener('click', finalizePurchase);
  document.getElementById('btn-clear').addEventListener('click', clearCart);
  document.getElementById('btn-close-summary').addEventListener('click', () => toggleSummary(false));

  // Evento "Enter" para busca
  document.getElementById('search-input').addEventListener('keyup', (e) => {
    if (e.key === 'Enter') handleSearch();
  });

  // Renderiza produtos e carrinho na tela
  renderProducts();
  renderCart();
}

// O init() será chamado quando a página carregar
window.addEventListener('DOMContentLoaded', init);

// =======================================================
//                   LOGIN / LOGOUT
// =======================================================
function login() {
  const username = document.getElementById('username').value.trim();
  const password = document.getElementById('password').value.trim();
  const msgEl = document.getElementById('login-msg');

  // Validação: campos não podem estar vazios
  if (!username || !password) {
    msgEl.textContent = 'Preencha usuário e senha.';
    return;
  }

  // Procura usuário na lista USERS
  const user = USERS.find(u => u.username === username && u.password === password);

  if (user) {
    loggedUser = user;  // salva usuário logado
    msgEl.textContent = '';
    afterLogin();       // atualiza interface
  } else {
    msgEl.textContent = 'Usuário ou senha inválidos.';
  }
}

// Ajusta a interface após login
function afterLogin() {
  document.getElementById('login-section').classList.add('hidden'); // esconde login
  document.getElementById('app-section').classList.remove('hidden'); // mostra app
  document.getElementById('btn-logout').classList.remove('hidden'); // mostra botão logout
  document.getElementById('user-name').textContent = loggedUser.displayName; // mostra nome
  document.getElementById('user-name').title = loggedUser.username;         // mostra username
  renderProducts(); // lista produtos
  renderCart();     // atualiza carrinho
}

// Logout: limpa usuário e volta para tela de login
function logout() {
  loggedUser = null;
  document.getElementById('login-section').classList.remove('hidden');
  document.getElementById('app-section').classList.add('hidden');
  document.getElementById('btn-logout').classList.add('hidden');
  document.getElementById('login-msg').textContent = 'Desconectado.';
}

// =======================================================
//             PRODUTOS E BUSCA
// =======================================================

// Renderiza a lista de produtos na tela
function renderProducts(products = PRODUCTS) {
  const prodList = document.getElementById('products-list');
  prodList.innerHTML = ''; // limpa lista antes de renderizar

  // Cria elementos <li> para cada produto
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

// Busca produtos por nome ou código
function handleSearch() {
  const term = document.getElementById('search-input').value.trim().toLowerCase();
  const msgEl = document.getElementById('app-msg');
  msgEl.textContent = '';

  if (!term) {
    renderProducts(); // se campo vazio, mostra todos
    return;
  }

  // Filtra produtos
  const results = PRODUCTS.filter(p => p.name.toLowerCase().includes(term) || p.code.toLowerCase() === term);

  if (results.length === 0) msgEl.textContent = 'Nenhum produto encontrado.';
  renderProducts(results);
}

// =======================================================
//                     CARRINHO
// =======================================================

// Adiciona produto ao carrinho
function addToCart(code) {
  if (!loggedUser) { showAppMessage('Faça login para adicionar produtos.'); return; }

  const prod = PRODUCTS.find(p => p.code === code);
  if (!prod) { showAppMessage('Produto não encontrado.'); return; }

  const existing = cart.find(i => i.code === code);
  if (existing) existing.qty += 1; // incrementa se já existe
  else cart.push({ code: prod.code, name: prod.name, price: prod.price, qty: 1 });

  renderCart(); // atualiza carrinho  
  showAppMessage(`${prod.name} adicionado ao carrinho.`);
}

// Remove produto do carrinho
function removeFromCart(code) {
  cart = cart.filter(i => i.code !== code);
  renderCart();
}

// Renderiza carrinho na tela
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

  // Atualiza total na interface
  document.getElementById('cart-total').textContent = `Total: R$ ${total.toFixed(2)}`;
}

// Aumenta ou diminui quantidade
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

// Limpa todo o carrinho
function clearCart() {
  cart = [];
  renderCart();
}

// =======================================================
//                  FINALIZAR COMPRA
// =======================================================
function finalizePurchase() {
  if (!loggedUser) { showAppMessage('Faça login para finalizar a compra.'); return; }
  if (cart.length === 0) { showAppMessage('Carrinho vazio. Adicione produtos antes de finalizar.'); return; }

  // Calcula total da compra
  const total = cart.reduce((s, i) => s + i.price * i.qty, 0);

  // Seleciona elemento HTML de resumo
  const summaryEl = document.getElementById('order-summary');

  // Monta HTML do resumo
  let html = `<p><strong>Cliente:</strong> ${loggedUser.displayName} (${loggedUser.username})</p>`;
  html += '<ul>';
  cart.forEach(i => {
    html += `<li>${i.qty}x ${i.name} — R$ ${(i.price * i.qty).toFixed(2)}</li>`;
  });
  html += '</ul>';
  html += `<p><strong>Total:</strong> R$ ${total.toFixed(2)}</p>`;

  summaryEl.innerHTML = html; // exibe resumo
  toggleSummary(true);         // mostra seção de resumo
s
  cart = [];                   // limpa carrinho
  renderCart();                // atualiza interface
}

// Mostra ou esconde resumo
function toggleSummary(show) {
  const el = document.getElementById('summary');
  if (show) el.classList.remove('hidden'); 
  else el.classList.add('hidden');
}

// =======================================================
//                    UTILITÁRIOS
// =======================================================
function showAppMessage(text) {
  const el = document.getElementById('app-msg');
  el.textContent = text;                   // mostra mensagem
  setTimeout(()=>{ el.textContent = '' }, 3000); // some após 3s
}
