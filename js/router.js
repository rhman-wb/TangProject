/**
 * 深链路由：?poem / ?place / ?poet
 */
import { parseRouteQuery, buildRouteQuery } from './lib/router-parse.js';
import { selectTargetPlaceId } from './lib/place-target.js';

export class Router {
  /**
   * @param {import('./lib/event-bus.js').EventBus} bus
   * @param {import('./data-loader.js').AppData} data
   */
  constructor(bus, data) {
    this.bus = bus;
    this.data = data;
    this._ready = false;
    this._suppress = false;
  }

  init() {
    window.addEventListener('popstate', () => this.applyFromLocation());
    this.bus.on('poem:selected', ({ poemId, placeId, source }) => {
      if (source === 'router' || this._suppress) return;
      this.push({ poem: poemId, place: placeId || null, poet: null }, true);
    });
    this.bus.on('place:selected', ({ placeId, source }) => {
      if (source === 'router' || this._suppress) return;
      this.replace({ poem: null, place: placeId, poet: null });
    });
    this.bus.on('poet:selected', ({ poetId, source }) => {
      if (source === 'router' || this._suppress) return;
      this.push({ poem: null, place: null, poet: poetId }, true);
    });
    this.bus.on('detail:closed', () => {
      if (this._suppress) return;
      this.replace({ poem: null, place: null, poet: null });
    });
    return this;
  }

  /** 数据与地图就绪后调用 */
  applyInitial() {
    this._ready = true;
    this.applyFromLocation();
  }

  applyFromLocation() {
    if (!this._ready) return;
    const route = parseRouteQuery(window.location.search);
    this._suppress = true;
    try {
      if (route.poet && this.data.poetById.has(route.poet)) {
        this.bus.emit('poet:selected', {
          poetId: route.poet,
          source: 'router',
        });
      }
      if (route.poem && this.data.poemById.has(route.poem)) {
        const poem = this.data.poemById.get(route.poem);
        const placeId =
          route.place ||
          selectTargetPlaceId(poem.places, this.data.placeById);
        this.bus.emit('poem:selected', {
          poemId: route.poem,
          placeId,
          source: 'router',
        });
      } else if (route.place && this.data.placeById.has(route.place)) {
        this.bus.emit('place:selected', {
          placeId: route.place,
          source: 'router',
        });
      }
    } finally {
      this._suppress = false;
    }
  }

  push(route, usePush = false) {
    const q = buildRouteQuery(route);
    const url = `${window.location.pathname}${q}${window.location.hash || ''}`;
    if (usePush) history.pushState(route, '', url);
    else history.replaceState(route, '', url);
  }

  replace(route) {
    this.push(route, false);
  }
}

export default Router;
