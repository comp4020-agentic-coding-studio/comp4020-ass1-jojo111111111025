import { CATEGORIES, chooseCategory, createInitialState, type RecommenderState } from "./recommender";
import { buildFeed, payoffMessage } from "./feed";

const feedEl = document.querySelector<HTMLElement>('[data-testid="feed"]');
const roundValueEl = document.querySelector<HTMLElement>("#round-value");
const diversityValueEl = document.querySelector<HTMLElement>("#diversity-value");
const payoffEl = document.querySelector<HTMLElement>('[data-testid="payoff"]');
const resetButton = document.querySelector<HTMLButtonElement>('[data-testid="reset"]');

let state: RecommenderState = createInitialState();

function render() {
  if (!feedEl || !roundValueEl || !diversityValueEl || !payoffEl) return;

  const feed = buildFeed(state);
  feedEl.innerHTML = "";
  feed.forEach((item, i) => {
    const card = document.createElement("button");
    card.type = "button";
    card.className = "feed-card";
    card.dataset.testid = "feed-card";
    card.dataset.category = item.categoryId;
    card.dataset.slot = String(i);
    card.innerHTML = `<span class="feed-card-category">${item.label}</span><span class="feed-card-title">${item.title}</span>`;
    feedEl.appendChild(card);
  });

  roundValueEl.textContent = String(state.round);
  diversityValueEl.textContent = String(new Set(feed.map((item) => item.categoryId)).size);

  const message = payoffMessage(state);
  if (message) {
    payoffEl.textContent = message;
    payoffEl.hidden = false;
  } else {
    payoffEl.textContent = "";
    payoffEl.hidden = true;
  }
}

feedEl?.addEventListener("click", (event) => {
  const button = (event.target as HTMLElement).closest<HTMLButtonElement>(".feed-card");
  if (!button) return;
  const categoryId = button.dataset.category;
  const categoryIndex = CATEGORIES.findIndex((c) => c.id === categoryId);
  if (categoryIndex === -1) return;
  state = chooseCategory(state, categoryIndex);
  render();
});

resetButton?.addEventListener("click", () => {
  state = createInitialState();
  render();
});

render();
