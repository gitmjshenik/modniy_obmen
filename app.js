const seedItems = [
  {
    id: 1,
    title: "Пальто oversize",
    brand: "Mango",
    category: "Одежда",
    condition: "Аренда",
    price: 1200,
    city: "Москва",
    date: "2026-05-12",
    seller: "Мээрим",
    sellerEmail: "meerim@example.com",
    rating: 4.9,
    image: "coat",
    description: "Теплое пальто на вечер или фотосессию. Размер M, можно примерить в центре.",
    comments: ["Красивый цвет, есть пояс?", "Можно забрать на выходные?"],
  },
  {
    id: 2,
    title: "Кроссовки Air",
    brand: "Nike",
    category: "Обувь",
    condition: "Б/у",
    price: 5200,
    city: "Санкт-Петербург",
    date: "2026-05-14",
    seller: "Дина",
    sellerEmail: "dina@example.com",
    rating: 4.6,
    image: "shoe",
    description: "Оригинал, размер 38. Есть небольшие следы носки, коробка сохранена.",
    comments: ["Стелька сколько см?", "Торг возможен?"],
  },
  {
    id: 3,
    title: "Сумка мини",
    brand: "Zara",
    category: "Аксессуары",
    condition: "Новая",
    price: 3400,
    city: "Казань",
    date: "2026-05-15",
    seller: "Айжан",
    sellerEmail: "aizhan@example.com",
    rating: 5,
    image: "bag",
    description: "Новая сумка с биркой. Подходит к платью и к джинсам.",
    comments: ["Можно доставкой?", "Есть фото внутри?"],
  },
  {
    id: 4,
    title: "Платье на выпускной",
    brand: "Love Republic",
    category: "Одежда",
    condition: "Аренда",
    price: 1800,
    city: "Екатеринбург",
    date: "2026-05-16",
    seller: "София",
    sellerEmail: "sofia@example.com",
    rating: 4.7,
    image: "coat",
    description: "Нежное платье, размер S. Аренда на 2-3 дня, залог обсуждается.",
    comments: ["Какая длина?", "Можно примерить завтра?"],
  },
];

const defaultProfile = {
  name: "Гость",
  email: "",
  age: "",
  city: "",
  clothesSize: "",
  shoeSize: "",
  preferences: "",
  deals: 0,
  rating: 5,
};

let users = JSON.parse(localStorage.getItem("fashionUsers") || "[]");
let currentUser = JSON.parse(localStorage.getItem("fashionCurrentUser") || "null");
let items = JSON.parse(localStorage.getItem("fashionItems") || "null") || seedItems;
let favorites = new Set(JSON.parse(localStorage.getItem("fashionFavorites") || "[]"));
let cart = JSON.parse(localStorage.getItem("fashionCart") || "[]");
let authMode = "login";

const elements = {
  tabs: document.querySelectorAll(".tab"),
  views: document.querySelectorAll(".view"),
  itemsList: document.querySelector("#itemsList"),
  favoritesList: document.querySelector("#favoritesList"),
  myItemsList: document.querySelector("#myItemsList"),
  cartList: document.querySelector("#cartList"),
  resultCount: document.querySelector("#resultCount"),
  favCount: document.querySelector("#favCount"),
  cartCount: document.querySelector("#cartCount"),
  myItemsCount: document.querySelector("#myItemsCount"),
  categoryFilter: document.querySelector("#categoryFilter"),
  conditionFilter: document.querySelector("#conditionFilter"),
  brandFilter: document.querySelector("#brandFilter"),
  priceFilter: document.querySelector("#priceFilter"),
  cityFilter: document.querySelector("#cityFilter"),
  dateFilter: document.querySelector("#dateFilter"),
  timeline: document.querySelector("#timeline"),
  detailsDialog: document.querySelector("#detailsDialog"),
  detailsContent: document.querySelector("#detailsContent"),
  loginDialog: document.querySelector("#loginDialog"),
  loginBtn: document.querySelector("#loginBtn"),
  statusText: document.querySelector("#statusText"),
  welcomeText: document.querySelector("#welcomeText"),
  postForm: document.querySelector("#postForm"),
  postLock: document.querySelector("#postLock"),
  postHint: document.querySelector("#postHint"),
  profileCard: document.querySelector("#profileCard"),
  profileForm: document.querySelector("#profileForm"),
  profileStats: document.querySelector("#profileStats"),
  authForm: document.querySelector("#authForm"),
  authTitle: document.querySelector("#authTitle"),
  authHelp: document.querySelector("#authHelp"),
  authSubmit: document.querySelector("#authSubmit"),
  authNotice: document.querySelector("#authNotice"),
};

function saveState() {
  localStorage.setItem("fashionUsers", JSON.stringify(users));
  localStorage.setItem("fashionCurrentUser", JSON.stringify(currentUser));
  localStorage.setItem("fashionItems", JSON.stringify(items));
  localStorage.setItem("fashionFavorites", JSON.stringify([...favorites]));
  localStorage.setItem("fashionCart", JSON.stringify(cart));
}

function normalizeEmail(email) {
  return String(email || "").trim().toLowerCase();
}

function isLoggedIn() {
  return Boolean(currentUser && currentUser.email);
}

function getFilteredItems() {
  const category = elements.categoryFilter.value;
  const condition = elements.conditionFilter.value;
  const brand = elements.brandFilter.value.trim().toLowerCase();
  const price = Number(elements.priceFilter.value);
  const city = elements.cityFilter.value.trim().toLowerCase();

  return items.filter((item) => {
    const byCategory = category === "all" || item.category === category;
    const byCondition = condition === "all" || item.condition === condition;
    const byBrand = !brand || item.brand.toLowerCase().includes(brand);
    const byPrice = !price || item.price <= price;
    const byCity = !city || item.city.toLowerCase().includes(city);
    return byCategory && byCondition && byBrand && byPrice && byCity;
  });
}

function photoClass(item) {
  if (item.image === "shoe") return "photo shoe";
  if (item.image === "bag") return "photo bag";
  return "photo";
}

function renderItemCard(item) {
  const isFavorite = favorites.has(item.id);
  const inCart = cart.includes(item.id);
  const mine = isLoggedIn() && item.sellerEmail === currentUser.email;

  return `
    <article class="item-card">
      <div class="${photoClass(item)}" aria-label="Фото: ${item.title}"></div>
      <div class="item-info">
        <h3>${item.title}</h3>
        <div class="meta">${item.brand} · ${item.category} · ${item.condition}<br>${item.city} · ${formatDate(item.date)}</div>
        <div class="price">${item.price.toLocaleString("ru-RU")} руб.</div>
        <div class="actions">
          <button class="hot" data-open="${item.id}">Подробнее</button>
          <button data-favorite="${item.id}">${isFavorite ? "В избранном" : "♡ Избранное"}</button>
          <button data-cart="${item.id}">${inCart ? "В корзине" : "В корзину"}</button>
          ${mine ? `<button data-delete="${item.id}">Удалить</button>` : ""}
        </div>
      </div>
    </article>
  `;
}

function renderCatalog() {
  const filtered = getFilteredItems();
  elements.itemsList.innerHTML = filtered.map(renderItemCard).join("") || "<p class='muted'>Ничего не найдено. Попробуйте изменить фильтр.</p>";
  elements.resultCount.textContent = `${filtered.length} шт.`;
  bindCardButtons(elements.itemsList);
  renderHeader();
  renderProfile();
  renderProfileLists();
  renderTimeline();
}

function renderHeader() {
  if (isLoggedIn()) {
    elements.statusText.textContent = `вошли как ${currentUser.name}`;
    elements.welcomeText.textContent = `${currentUser.name}, можно публиковать вещи, писать продавцам и оформлять заказ.`;
    elements.loginBtn.textContent = "✓";
    elements.loginBtn.title = "Аккаунт";
    elements.postLock.style.display = "none";
    elements.postForm.style.display = "grid";
    elements.postHint.textContent = "активно";
    return;
  }

  elements.statusText.textContent = "гость";
  elements.welcomeText.textContent = "Зарегистрируйтесь, чтобы публиковать объявления и сохранять избранное.";
  elements.loginBtn.textContent = "↗";
  elements.loginBtn.title = "Войти";
  elements.postLock.style.display = "grid";
  elements.postForm.style.display = "none";
  elements.postHint.textContent = "нужен вход";
}

function renderProfile() {
  const profile = currentUser || defaultProfile;
  const initial = profile.name ? profile.name.slice(0, 1).toUpperCase() : "Г";
  const details = [
    profile.age ? `${profile.age} лет` : "возраст не указан",
    profile.city || "город не указан",
    profile.preferences || "предпочтения не заполнены",
  ].join(" · ");

  elements.profileCard.innerHTML = `
    <div class="avatar">${initial}</div>
    <div>
      <h2>${profile.name}</h2>
      <p>${details}</p>
      <div class="rating">★★★★★ ${profile.rating || 5}</div>
      ${isLoggedIn() ? `<button class="small-button" id="logoutBtn">Выйти из аккаунта</button>` : `<button class="small-button" id="profileLoginBtn">Войти или зарегистрироваться</button>`}
    </div>
  `;

  elements.profileStats.innerHTML = `
    <div><b>Одежда</b><span>${profile.clothesSize || "не указан"}</span></div>
    <div><b>Обувь</b><span>${profile.shoeSize || "не указан"}</span></div>
    <div><b>Предпочтения</b><span>${profile.preferences || "пока пусто"}</span></div>
    <div><b>Сделки</b><span>${profile.deals || 0} успешно</span></div>
  `;

  elements.profileForm.style.display = isLoggedIn() ? "grid" : "none";
  if (isLoggedIn()) {
    Object.entries(currentUser).forEach(([key, value]) => {
      if (elements.profileForm.elements[key]) elements.profileForm.elements[key].value = value || "";
    });
  }

  const logoutBtn = document.querySelector("#logoutBtn");
  if (logoutBtn) logoutBtn.addEventListener("click", logout);
  const profileLoginBtn = document.querySelector("#profileLoginBtn");
  if (profileLoginBtn) profileLoginBtn.addEventListener("click", openLogin);
}

function renderProfileLists() {
  const favoriteItems = items.filter((item) => favorites.has(item.id));
  const myItems = isLoggedIn() ? items.filter((item) => item.sellerEmail === currentUser.email) : [];

  elements.favoritesList.innerHTML = favoriteItems.map(renderItemCard).join("") || "<p class='muted'>Пока нет сохраненных объявлений.</p>";
  elements.myItemsList.innerHTML = myItems.map(renderItemCard).join("") || "<p class='muted'>После публикации ваши вещи появятся здесь.</p>";
  elements.favCount.textContent = favoriteItems.length;
  elements.myItemsCount.textContent = myItems.length;
  elements.cartCount.textContent = cart.length;
  elements.cartList.innerHTML = cart.length
    ? cart.map((id) => {
        const item = items.find((entry) => entry.id === id);
        if (!item) return "";
        return `<div class="cart-row"><span>${item.title}</span><b>${item.price.toLocaleString("ru-RU")} руб.</b></div>`;
      }).join("")
    : "<p class='muted'>Корзина пустая.</p>";

  bindCardButtons(elements.favoritesList);
  bindCardButtons(elements.myItemsList);
}

function renderTimeline() {
  const selectedDate = elements.dateFilter.value;
  const timelineItems = selectedDate ? items.filter((item) => item.date === selectedDate) : items;
  elements.timeline.innerHTML = timelineItems.map((item) => `
    <article class="timeline-item">
      <b>${formatDate(item.date)}</b>
      <span>${item.title} · ${item.city} · ${item.price.toLocaleString("ru-RU")} руб.</span>
    </article>
  `).join("") || "<p class='muted'>За эту дату объявлений нет.</p>";
}

function bindCardButtons(root) {
  root.querySelectorAll("[data-open]").forEach((button) => {
    button.addEventListener("click", () => openDetails(Number(button.dataset.open)));
  });
  root.querySelectorAll("[data-favorite]").forEach((button) => {
    button.addEventListener("click", () => toggleFavorite(Number(button.dataset.favorite)));
  });
  root.querySelectorAll("[data-cart]").forEach((button) => {
    button.addEventListener("click", () => toggleCart(Number(button.dataset.cart)));
  });
  root.querySelectorAll("[data-delete]").forEach((button) => {
    button.addEventListener("click", () => deleteItem(Number(button.dataset.delete)));
  });
}

function requireLogin(message) {
  if (isLoggedIn()) return true;
  elements.authNotice.textContent = message || "Сначала войдите или зарегистрируйтесь.";
  if (elements.detailsDialog.open) elements.detailsDialog.close();
  openLogin();
  return false;
}

function toggleFavorite(id) {
  if (!requireLogin("Чтобы сохранять избранное, войдите или зарегистрируйтесь.")) return;
  favorites.has(id) ? favorites.delete(id) : favorites.add(id);
  saveState();
  renderCatalog();
}

function toggleCart(id) {
  if (!requireLogin("Чтобы добавлять в корзину, войдите или зарегистрируйтесь.")) return;
  cart = cart.includes(id) ? cart.filter((entry) => entry !== id) : [...cart, id];
  saveState();
  renderCatalog();
}

function deleteItem(id) {
  items = items.filter((item) => item.id !== id);
  cart = cart.filter((entry) => entry !== id);
  favorites.delete(id);
  saveState();
  renderCatalog();
}

function openDetails(id) {
  const item = items.find((entry) => entry.id === id);
  elements.detailsContent.innerHTML = `
    <button class="close" data-close="detailsDialog">×</button>
    <div class="${photoClass(item)} dialog-hero"></div>
    <h2>${item.title}</h2>
    <p class="meta">${item.brand} · ${item.condition} · ${item.city}</p>
    <p>${item.description}</p>
    <div class="price">${item.price.toLocaleString("ru-RU")} руб.</div>
    <div class="rating">Продавец: ${item.seller} · ★ ${item.rating}</div>
    <div class="comments">
      <b>Комментарии</b>
      ${item.comments.map((comment) => `<div class="comment">${comment}</div>`).join("")}
      <input id="newComment" placeholder="Написать комментарий" />
      <button class="small-button" id="addComment">Добавить комментарий</button>
    </div>
    <div class="chat">
      <b>Чат с продавцом</b>
      <div class="message">Здравствуйте! Вещь еще доступна?</div>
      <div class="message seller">Да, можно примерить сегодня после 17:00.</div>
      <input id="chatMessage" placeholder="Сообщение продавцу" />
      <button class="small-button" id="sendMessage">Отправить</button>
    </div>
    <button class="primary-button" data-cart="${item.id}">Добавить в корзину</button>
  `;
  elements.detailsDialog.showModal();
  elements.detailsContent.querySelector("[data-close]").addEventListener("click", () => elements.detailsDialog.close());
  elements.detailsContent.querySelector("[data-cart]").addEventListener("click", () => {
    if (isLoggedIn()) elements.detailsDialog.close();
    toggleCart(item.id);
  });
  elements.detailsContent.querySelector("#addComment").addEventListener("click", () => {
    if (!requireLogin("Комментарии доступны после входа.")) return;
    const input = elements.detailsContent.querySelector("#newComment");
    if (input.value.trim()) {
      item.comments.push(`${currentUser.name}: ${input.value.trim()}`);
      saveState();
      openDetails(item.id);
    }
  });
  elements.detailsContent.querySelector("#sendMessage").addEventListener("click", () => {
    if (!requireLogin("Чтобы писать продавцу, войдите или зарегистрируйтесь.")) return;
    const input = elements.detailsContent.querySelector("#chatMessage");
    if (input.value.trim()) {
      input.insertAdjacentHTML("beforebegin", `<div class="message">${currentUser.name}: ${input.value.trim()}</div>`);
      input.value = "";
    }
  });
}

function openLogin() {
  renderAuthMode();
  elements.loginDialog.showModal();
}

function setAuthMode(mode) {
  authMode = mode;
  renderAuthMode();
}

function renderAuthMode() {
  const isRegister = authMode === "register";
  document.querySelectorAll("[data-auth-mode]").forEach((button) => {
    button.classList.toggle("active", button.dataset.authMode === authMode);
  });
  document.querySelectorAll(".register-only").forEach((field) => {
    field.style.display = isRegister ? "grid" : "none";
  });
  elements.authTitle.textContent = isRegister ? "Регистрация" : "Вход в приложение";
  elements.authHelp.textContent = isRegister
    ? "Создайте учебный аккаунт. Он сохранится только в этом браузере."
    : "Введите email и пароль, либо используйте демонстрационный вход через соцсеть.";
  elements.authSubmit.textContent = isRegister ? "Зарегистрироваться" : "Войти";
}

function registerUser(form) {
  const email = normalizeEmail(form.get("email"));
  const password = String(form.get("password") || "");
  const name = String(form.get("name") || "").trim() || email.split("@")[0];
  const city = String(form.get("city") || "").trim();

  if (users.some((user) => user.email === email)) {
    elements.authNotice.textContent = "Такой email уже зарегистрирован. Переключитесь на вход.";
    return;
  }

  currentUser = {
    ...defaultProfile,
    name,
    email,
    password,
    city,
    deals: 0,
    rating: 5,
  };
  users.push(currentUser);
  favorites = new Set();
  cart = [];
  saveState();
  elements.authNotice.textContent = "Регистрация прошла успешно.";
  elements.loginDialog.close();
  renderCatalog();
}

function loginUser(form) {
  const email = normalizeEmail(form.get("email"));
  const password = String(form.get("password") || "");
  const user = users.find((entry) => entry.email === email && entry.password === password);

  if (!user) {
    elements.authNotice.textContent = "Пользователь не найден или пароль неверный. Можно перейти на регистрацию.";
    return;
  }

  currentUser = user;
  saveState();
  elements.authNotice.textContent = "Вход выполнен.";
  elements.loginDialog.close();
  renderCatalog();
}

function socialLogin(provider) {
  const email = `${provider.toLowerCase()}@demo.local`;
  let user = users.find((entry) => entry.email === email);
  if (!user) {
    user = {
      ...defaultProfile,
      name: `Пользователь ${provider}`,
      email,
      password: "demo",
      city: "Москва",
      preferences: "casual, аренда образов",
      clothesSize: "M",
      shoeSize: "38",
      deals: 3,
      rating: 4.8,
    };
    users.push(user);
  }
  currentUser = user;
  saveState();
  elements.loginDialog.close();
  renderCatalog();
}

function logout() {
  currentUser = null;
  favorites = new Set();
  cart = [];
  localStorage.removeItem("fashionCurrentUser");
  localStorage.setItem("fashionFavorites", "[]");
  localStorage.setItem("fashionCart", "[]");
  renderCatalog();
}

function formatDate(date) {
  return new Date(date).toLocaleDateString("ru-RU", { day: "numeric", month: "long" });
}

elements.tabs.forEach((tab) => {
  tab.addEventListener("click", () => {
    elements.tabs.forEach((entry) => entry.classList.remove("active"));
    elements.views.forEach((view) => view.classList.remove("active"));
    tab.classList.add("active");
    document.querySelector(`#${tab.dataset.view}View`).classList.add("active");
  });
});

[elements.categoryFilter, elements.conditionFilter, elements.brandFilter, elements.priceFilter, elements.cityFilter].forEach((input) => {
  input.addEventListener("input", renderCatalog);
});

document.querySelectorAll("[data-chip]").forEach((button) => {
  button.addEventListener("click", () => {
    if (button.dataset.chip === "rent") elements.conditionFilter.value = "Аренда";
    if (button.dataset.chip === "new") elements.conditionFilter.value = "Новая";
    if (button.dataset.chip === "reset") {
      elements.categoryFilter.value = "all";
      elements.conditionFilter.value = "all";
      elements.brandFilter.value = "";
      elements.priceFilter.value = "";
      elements.cityFilter.value = "";
    }
    renderCatalog();
  });
});

elements.postForm.addEventListener("submit", (event) => {
  event.preventDefault();
  if (!requireLogin("Публикация доступна после входа.")) return;

  const form = new FormData(event.target);
  items.unshift({
    id: Date.now(),
    title: String(form.get("title")).trim(),
    brand: String(form.get("brand")).trim(),
    category: form.get("category"),
    condition: form.get("condition"),
    price: Number(form.get("price")),
    city: String(form.get("city")).trim(),
    date: new Date().toISOString().slice(0, 10),
    seller: currentUser.name,
    sellerEmail: currentUser.email,
    rating: currentUser.rating || 5,
    image: form.get("category") === "Обувь" ? "shoe" : form.get("category") === "Аксессуары" ? "bag" : "coat",
    description: String(form.get("description") || "").trim() || "Описание добавлено пользователем.",
    comments: ["Новое объявление только что опубликовано."],
  });
  event.target.reset();
  document.querySelector("#postNotice").textContent = "Объявление опубликовано и сохранено.";
  saveState();
  document.querySelector('[data-view="catalog"]').click();
  renderCatalog();
});

elements.profileForm.addEventListener("submit", (event) => {
  event.preventDefault();
  if (!isLoggedIn()) return;

  const form = new FormData(event.target);
  const oldEmail = currentUser.email;
  currentUser = {
    ...currentUser,
    name: String(form.get("name")).trim(),
    email: normalizeEmail(form.get("email")),
    age: String(form.get("age") || "").trim(),
    city: String(form.get("city") || "").trim(),
    clothesSize: String(form.get("clothesSize") || "").trim(),
    shoeSize: String(form.get("shoeSize") || "").trim(),
    preferences: String(form.get("preferences") || "").trim(),
  };
  users = users.map((user) => user.email === oldEmail ? currentUser : user);
  items = items.map((item) => item.sellerEmail === oldEmail ? { ...item, seller: currentUser.name, sellerEmail: currentUser.email } : item);
  saveState();
  document.querySelector("#profileNotice").textContent = "Профиль сохранен.";
  renderCatalog();
});

elements.authForm.addEventListener("submit", (event) => {
  event.preventDefault();
  const form = new FormData(event.target);
  authMode === "register" ? registerUser(form) : loginUser(form);
});

document.querySelectorAll("[data-auth-mode]").forEach((button) => {
  button.addEventListener("click", () => setAuthMode(button.dataset.authMode));
});

document.querySelectorAll("[data-social]").forEach((button) => {
  button.addEventListener("click", () => socialLogin(button.dataset.social));
});

elements.dateFilter.addEventListener("input", renderTimeline);
document.querySelector("#clearDate").addEventListener("click", () => {
  elements.dateFilter.value = "";
  renderTimeline();
});

document.querySelector("#checkoutBtn").addEventListener("click", () => {
  if (!requireLogin("Чтобы оформить заказ, войдите или зарегистрируйтесь.")) return;
  const address = document.querySelector("#deliveryAddress").value.trim();
  const notice = document.querySelector("#checkoutNotice");
  if (!cart.length || !address) {
    notice.textContent = "Добавьте вещь и укажите адрес или место встречи.";
    return;
  }
  currentUser.deals = Number(currentUser.deals || 0) + 1;
  users = users.map((user) => user.email === currentUser.email ? currentUser : user);
  cart = [];
  saveState();
  notice.textContent = "Заказ оформлен. После сделки можно будет оценить продавца.";
  renderCatalog();
});

elements.loginBtn.addEventListener("click", () => {
  if (isLoggedIn()) {
    document.querySelector('[data-view="profile"]').click();
    return;
  }
  openLogin();
});
document.querySelector("#postLoginBtn").addEventListener("click", openLogin);
document.querySelectorAll("[data-close]").forEach((button) => {
  button.addEventListener("click", () => document.querySelector(`#${button.dataset.close}`).close());
});

renderAuthMode();
renderCatalog();
