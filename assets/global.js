// const { Console } = require("console");

document.addEventListener('DOMContentLoaded', () => {
  const noJsElements = document.querySelectorAll('.no-js-menu');
  noJsElements.forEach((el) => el.remove());

  function updateMainContentHeight() {
    const headerSection = document.querySelector('[data-header-section]');
    const mainContent = document.querySelector('.main-content-wrapper');

    if (headerSection?.classList.contains('header-style-side-reveal-menu') && mainContent && window.innerWidth > 1024) {
      const mainContentElement = document.getElementById('MainContent');
      const footerElement = document.querySelector('.footer-section');

      if (mainContentElement && footerElement) {
        const totalHeight = mainContentElement.offsetHeight + footerElement.offsetHeight;
        document.body.style.setProperty('--main-content-height', `${totalHeight}px`);
      }
    } else {
      document.body.style.removeProperty('--main-content-height');
    }
  }

  updateMainContentHeight();

  window.addEventListener('resize', updateMainContentHeight);
});

Shopify.postLink = function (path, options) {
  options = options || {};
  var method = options['method'] || 'post';
  var params = options['parameters'] || {};

  var form = document.createElement('form');
  form.setAttribute('method', method);
  form.setAttribute('action', path);

  for (var key in params) {
    var hiddenField = document.createElement('input');
    hiddenField.setAttribute('type', 'hidden');
    hiddenField.setAttribute('name', key);
    hiddenField.setAttribute('value', params[key]);
    form.appendChild(hiddenField);
  }
  document.body.appendChild(form);
  form.submit();
  document.body.removeChild(form);
};

class Accordion {
  constructor(el) {
    this.el = el;
    this.summary = el.querySelector('summary');

    this.content = el.querySelector('[data-accordion-content]') || el.querySelector('[data-collapsible-content]');
    this.animation = null;
    this.isClosing = false;
    this.isExpanding = false;
    this.summary.addEventListener('click', (e) => this.onClick(e));
  }

  onClick(e) {
    e.preventDefault();
    this.el.style.overflow = 'hidden';
    if (this.isClosing || !this.el.open) {
      this.open();
    } else if (this.isExpanding || this.el.open) {
      this.shrink();
    }
  }

  shrink() {
    this.isClosing = true;
    const startHeight = `${this.el.offsetHeight}px`;
    const endHeight = `${this.summary.offsetHeight}px`;

    if (this.animation) {
      this.animation.cancel();
    }

    if (this.content) {
      this.content.style.opacity = '0';
    }
    this.animation = this.el.animate(
      {
        height: [startHeight, endHeight],
      },
      {
        duration: 400,
        easing: 'linear',
      }
    );

    this.animation.onfinish = () => this.onAnimationFinish(false);

    this.animation.oncancel = () => (this.isClosing = false);
  }

  open() {
    const get_parents = this.el.closest('[data-collapsible-parent]');
    if (get_parents) {
      const openDetails = get_parents.querySelector('details[open]');
      if (openDetails && openDetails !== this.el) {
        const accordionInstance = openDetails._accordionInstance;
        if (accordionInstance) {
          accordionInstance.shrink();
        }
      }
    }
    this.el.style.height = `${this.el.offsetHeight}px`;
    this.el.open = true;

    this.el._accordionInstance = this;
    window.requestAnimationFrame(() => this.expand());
  }

  expand() {
    if (this.content) {
      this.content.style.opacity = '1';
    }
    this.isExpanding = true;
    const startHeight = `${this.el.offsetHeight}px`;
    const endHeight = `${this.summary.offsetHeight + this.content.offsetHeight}px`;
    if (this.animation) {
      this.animation.cancel();
    }
    this.animation = this.el.animate(
      {
        height: [startHeight, endHeight],
      },
      {
        duration: 400,
        easing: 'linear',
      }
    );

    this.animation.onfinish = () => this.onAnimationFinish(true);

    this.animation.oncancel = () => (this.isExpanding = false);
  }

  onAnimationFinish(open) {
    this.el.open = open;
    this.animation = null;
    this.isClosing = false;
    this.isExpanding = false;
    this.el.style.height = this.el.style.overflow = '';
  }
}

class CountryProvince extends HTMLElement {
  constructor() {
    super();
    this.provinceElement = this.querySelector('[name="address[province]"]');
    this.countryElement = this.querySelector('[name="address[country]"]');
    this.countryElement.addEventListener('change', this.CountryChange.bind(this));
    const defaultCountry = this.countryElement.getAttribute('data-default');
    if (defaultCountry) {
      const selectedIndex = Array.from(this.countryElement.options).findIndex(
        (option) => option.value === defaultCountry
      );
      this.countryElement.selectedIndex = selectedIndex !== -1 ? selectedIndex : 0;
      this.countryElement.dispatchEvent(new Event('change'));
    } else {
      this.CountryChange();
    }
  }

  CountryChange() {
    const option = this.countryElement.options[this.countryElement.selectedIndex];
    const provinces = JSON.parse(option.dataset.provinces);
    this.provinceElement.parentElement.parentElement.hidden = provinces.length === 0;
    if (provinces.length !== 0) {
      this.provinceElement.innerHTML = '';
      provinces.forEach((data) => {
        const selected = data[1] === this.dataset.province;
        this.provinceElement.options.add(new Option(data[1], data[0], selected, selected));
      });
    }
  }
}
customElements.define('country-province', CountryProvince);

class AnnouncementBar extends HTMLElement {
  constructor() {
    super();
    this.currentScrollTop = 0;
    this.updateAnnouncementHeight();
    this.updateDynamicAnnouncementHeight();
    window.addEventListener('scroll', this.updateDynamicAnnouncementHeight.bind(this), false);

    const resizeObserver = new ResizeObserver(this.updateDynamicAnnouncementHeight.bind(this));
    resizeObserver.observe(this.closest('[data-announcement-wrapper]'));
  }

  updateAnnouncementHeight() {
    const announcementWrapper = this.closest('[data-announcement-wrapper]');
    if (announcementWrapper) {
      const announcementBarHeight = announcementWrapper.offsetHeight;
      document.body.style.setProperty('--announcement-height', `${announcementBarHeight}px`);
    }
  }

  updateDynamicAnnouncementHeight() {
    const announcementWrapper = this.closest('[data-announcement-wrapper]');

    if (announcementWrapper) {
      const announcementBarHeight = announcementWrapper.offsetHeight;
      const scrollTop = window.pageYOffset || document.documentElement.scrollTop;

      const dynamicHeight = scrollTop > announcementBarHeight ? 0 : Math.max(announcementBarHeight - scrollTop, 0);
      document.body.style.setProperty('--dynamic-announcement-height', `${dynamicHeight}px`);
      this.currentScrollTop = scrollTop;
    }
  }
}

customElements.define('announcement-bar', AnnouncementBar);

// class CustomListItem extends HTMLLIElement {
//   constructor() {
//     super(), (this.magnetButton = new theme.MagnetButton(this)), this.magnetButton.load();
//   }
// }
// customElements.define('hover-li', CustomListItem, { extends: 'li' });

function isOnScreen(elem) {
  if (!elem) {
    return;
  }
  const window = document.defaultView;
  const viewport_top = window.scrollY;
  const viewport_height = window.innerHeight;
  const viewport_bottom = viewport_top + viewport_height;
  const elemRect = elem.getBoundingClientRect();
  const top = elemRect.top + viewport_top;
  const height = elemRect.height;
  const bottom = top + height;

  return (
    (top >= viewport_top && top < viewport_bottom) ||
    (bottom > viewport_top && bottom <= viewport_bottom) ||
    (height > viewport_height && top <= viewport_top && bottom >= viewport_bottom)
  );
}

var DOMAnimations = {
  slideUp: function (element, duration = 500) {
    return new Promise(function (resolve, reject) {
      element.style.height = element.offsetHeight + 'px';
      element.style.transitionProperty = `height, margin, padding`;
      element.style.transitionDuration = duration + 'ms';
      element.offsetHeight;
      element.style.overflow = 'hidden';
      element.style.height = 0;
      element.style.paddingTop = 0;
      element.style.paddingBottom = 0;
      element.style.marginTop = 0;
      element.style.marginBottom = 0;
      window.setTimeout(function () {
        element.style.display = 'none';
        element.style.removeProperty('height');
        element.style.removeProperty('padding-top');
        element.style.removeProperty('padding-bottom');
        element.style.removeProperty('margin-top');
        element.style.removeProperty('margin-bottom');
        element.style.removeProperty('overflow');
        element.style.removeProperty('transition-duration');
        element.style.removeProperty('transition-property');
        resolve(false);
      }, duration);
    });
  },

  slideDown: function (element, duration = 500) {
    return new Promise(function (resolve, reject) {
      element.style.removeProperty('display');
      let display = window.getComputedStyle(element).display;
      if (display === 'none') display = 'block';
      element.style.display = display;
      let height = element.offsetHeight;
      element.style.overflow = 'hidden';
      element.style.height = 0;
      element.style.paddingTop = 0;
      element.style.paddingBottom = 0;
      element.style.marginTop = 0;
      element.style.marginBottom = 0;
      element.offsetHeight;
      element.style.transitionProperty = `height, margin, padding`;
      element.style.transitionDuration = duration + 'ms';
      element.style.height = height + 'px';
      element.style.removeProperty('padding-top');
      element.style.removeProperty('padding-bottom');
      element.style.removeProperty('margin-top');
      element.style.removeProperty('margin-bottom');
      window.setTimeout(function () {
        element.style.removeProperty('height');
        element.style.removeProperty('overflow');
        element.style.removeProperty('transition-duration');
        element.style.removeProperty('transition-property');
      }, duration);
    });
  },

  slideToggle: function (element, duration = 500) {
    const isHidden = window.getComputedStyle(element).display === 'none';
    return isHidden ? this.slideDown(element, duration) : this.slideUp(element, duration);
  },

  classToggle: function (element, className) {
    element.classList.toggle(className);
  },
};

function debounce(fn, wait) {
  let t;
  return (...args) => {
    clearTimeout(t);
    t = setTimeout(() => fn.apply(this, args), wait);
  };
}

class ShopTheLook extends HTMLElement {
  constructor() {
    super();
    this.hotspotItems = Array.from(this.querySelectorAll('[data-product-hotspot]'));
  }

  connectedCallback() {
    this.nextTrigger = this.querySelector('[data-trigger-next]');
    this.prevTrigger = this.querySelector('[data-trigger-prev]');
    if (this.nextTrigger) {
      this.nextTrigger.addEventListener('click', () => this.changeProduct(1));
    }
    if (this.prevTrigger) {
      this.prevTrigger.addEventListener('click', () => this.changeProduct(-1));
    }
    if (this.hotspotItems.length > 0) {
      this.hotspotItems.forEach((item) => {
        if (item.querySelector('[data-product-hotspot-trigger]')) {
          const hotspotTrigger = item.querySelector('[data-product-hotspot-trigger]');
          hotspotTrigger.addEventListener('click', () => this.setActiveItem(item));
        }
      });
    }
  }

  changeProduct(direction) {
    const activeItem = this.hotspotItems.find((item) => item.classList.contains('active'));
    if (!activeItem) {
      if (this.hotspotItems.length > 0) {
        this.hotspotItems[0].classList.add('active');
      }
      return;
    }
    // if (!activeItem) return;
    let currentIndex = this.hotspotItems.indexOf(activeItem);
    activeItem.classList.remove('active');
    let newIndex = (currentIndex + direction + this.hotspotItems.length) % this.hotspotItems.length;
    this.hotspotItems[newIndex].classList.add('active');
  }

  // setActiveItem(clickedItem) {
  //   this.hotspotItems.forEach((item) => item.classList.remove('active'));
  //   clickedItem.classList.add('active');
  // }

  setActiveItem(clickedItem) {
    if (clickedItem.classList.contains('active')) {
      clickedItem.classList.remove('active');
    } else {
      this.hotspotItems.forEach((item) => item.classList.remove('active'));
      clickedItem.classList.add('active');
    }
  }
}
customElements.define('shop-the-look', ShopTheLook);

class Quickview extends HTMLElement {
  constructor() {
    super();
    this.drawerSelector = '[data-drawer="quick-view-drawer"]';
    this.drawerElement = document.querySelector(this.drawerSelector);
    this.addEventListener('click', this.handleClick.bind(this));
    this.quickView = this.dataset.quickView;
    if (this.quickView == 'on_hover') {
      this.addHoverEvents();
    }
  }

  addHoverEvents() {
    const productCard = this.closest('.product-card');
    if (!productCard) return;

    productCard.addEventListener('mouseenter', () => {
      const btn = this.querySelector('[product-quickview-btn]');
      if (btn) btn.classList.add('show_view_icon');
    });

    productCard.addEventListener('mouseleave', () => {
      const btn = this.querySelector('[product-quickview-btn]');
      if (btn) btn.classList.remove('show_view_icon');
    });
  }

  handleClick(event) {
    event.preventDefault();
    const sideRevealMenu = document.querySelector('side-reveal-menu');
    if (sideRevealMenu) {
      sideRevealMenu.closeDrawer();
    }
    if (this.drawerElement) {
      const section_id = this.closest('section').id;
      // document.querySelector(
      //   '[data-drawer="quick-view-drawer"]'
      // ).dataset.oncloseFocus = `${section_id} quick-view[data-product-id="${event.currentTarget.dataset.productId}"] a`;
      this.drawerElement.dataset.oncloseFocus = `#${section_id} quick-view[data-product-id="${event.currentTarget.dataset.productId}"] a`;
      this.loadProductData();
    } else {
      const getURL = this.dataset.productUrl;
      if (getURL) {
        window.location.href = getURL;
      }
    }
  }

  openDrawer() {
    if (this.drawerElement) {
      setTimeout(() => {
        this.drawerElement.classList.add('open');
        document.body.classList.add('overflow-hidden');
      }, 200);
      setTimeout(() => {
        this.drawerElement.querySelector('[data-drawer-close] button').focus();
      }, 1000);
      trapFocus(this.drawerElement);
    }
  }

  loadProductData() {
    const sectionId = this.drawerElement.dataset.sectionId;
    const productUrl = `${this.dataset.productUrl}?section_id=${sectionId}`;
    fetch(productUrl)
      .then((response) => response.text())
      .then((responseText) => {
        const fetchedDrawerContent = new DOMParser()
          .parseFromString(responseText, 'text/html')
          .querySelector(this.drawerSelector);
        if (fetchedDrawerContent) {
          this.drawerElement.innerHTML = fetchedDrawerContent.innerHTML;
          // Reinitialize Shopify payment buttons if necessary
          if (window.Shopify && Shopify.PaymentButton) {
            Shopify.PaymentButton.init();
          }
          // this.querySelector('[data-atc-loader]').remove();
          // this.querySelector('.quick-view-icon').classList.remove('hidden');
          this.openDrawer();
          window.ProductModel.loadShopifyXR();
        } else {
          console.error('Product element not found in the fetched content.');
        }
      })
      .catch((error) => {
        console.error('Error fetching or parsing product content:', error);
      });
  }
}

customElements.define('quick-view', Quickview);

class RecentlyViewed extends HTMLElement {
  constructor() {
    super();
    const checkrecentlyViewed = window.localStorage.getItem('genie-recently-viewed');
    if (checkrecentlyViewed != null) {
      this.init();
    } else {
      if (!Shopify.designMode) {
        this.closest('.shopify-section').classList.add('hidden');
      }
    }
  }

  init() {
    const url = this.dataset.section + this.getQueryString();

    fetch(url)
      .then((response) => response.text())
      .then((responseText) => {
        const doc = new DOMParser().parseFromString(responseText, 'text/html');
        const recommendations = doc.querySelector('.shopify-section')?.querySelector('recently-viewed-products');
        const viewedProductsWrapper = doc.querySelector('[data-recent-viewed-products]');

        if (recommendations && viewedProductsWrapper && viewedProductsWrapper.innerHTML.trim().length) {
          this.innerHTML = recommendations.innerHTML;
          this.closest('.shopify-section').classList.remove('hidden');
        } else {
          if (!Shopify.designMode) {
            this.closest('.shopify-section').classList.add('hidden');
          }
        }
      })
      .catch((error) => {
        console.error('Error fetching recently viewed products:', error);
        if (!Shopify.designMode) {
          this.closest('.shopify-section').classList.add('hidden');
        }
      });
  }

  getQueryString() {
    const recentlyViewed = window.localStorage.getItem('genie-recently-viewed') || '[]';
    const items = new Set(JSON.parse(recentlyViewed));

    if (this.dataset.product) {
      items.delete(parseInt(this.dataset.product, 10));
    }

    return Array.from(items, (item) => `id:${item}`)
      .slice(0, parseInt(this.dataset.limit || 15, 10))
      .join(' OR ');
  }
}

customElements.define('recently-viewed-products', RecentlyViewed);

// product recommendation code
class ProductRecommendations extends HTMLElement {
  constructor() {
    super();
  }

  connectedCallback() {
    const onIntersection = (entries, observer) => {
      const [entry] = entries;
      if (!entry.isIntersecting) return;
      observer.unobserve(this);
      fetch(this.dataset.url)
        .then((response) => {
          if (!response.ok) {
            throw new Error('Network response was not ok');
          }
          return response.text();
        })
        .then((htmlContent) => {
          const tempDiv = document.createElement('div');
          tempDiv.innerHTML = htmlContent;
          const recommendationsContent = tempDiv.querySelector('product-recommendations');
          if (recommendationsContent && recommendationsContent.innerHTML.trim()) {
            this.innerHTML = recommendationsContent.innerHTML;
          }
        })
        .catch((error) => {
          console.error('Error fetching product recommendations:', error);
        });
    };

    const observerOptions = {
      rootMargin: '0px 0px 400px 0px',
    };
    const observer = new IntersectionObserver(onIntersection.bind(this), observerOptions);
    observer.observe(this);
  }
}
customElements.define('product-recommendations', ProductRecommendations);
//product recommendation code end

class ProductCardHoverEffect extends HTMLElement {
  constructor() {
    super();

    this.hoverTemplateContainer = this.querySelector('[data-hover-effect-svg-template]');
    this.template = this.hoverTemplateContainer?.querySelector('template');
    this.hoverImage = this.querySelector('.product-second-img');
    this.mainWrapper = this.closest('[data-product-card-image-wrapper]');

    this.clipPathId = null;
    this.hoverEffectSvg = null;
    this.circles = [];

    this.isSvgAppended = false;

    if (this.mainWrapper) {
      this.mainWrapper.addEventListener('mouseenter', () => this.handleMouseEnter());
      this.mainWrapper.addEventListener('mouseleave', () => this.handleMouseLeave());
    } else {
      this.addEventListener('mouseenter', () => this.handleMouseEnter());
      this.addEventListener('mouseleave', () => this.handleMouseLeave());
    }
  }

  handleMouseEnter() {
    if (!this.isSvgAppended && this.template?.content) {
      // Clone the template
      const svgFragment = this.template.content.cloneNode(true);
      const svgElement = svgFragment.querySelector('[data-hover-effect-svg]');
      if (!svgElement) return;

      // Append SVG outside the template container
      this.hoverTemplateContainer.insertAdjacentElement('afterend', svgElement);

      // Remove only the template container, not the SVG
      this.hoverTemplateContainer.remove();
      this.hoverTemplateContainer = null;

      // Store references
      this.hoverEffectSvg = svgElement;
      this.clipPathId = this.hoverEffectSvg.dataset.id;
      this.circles = this.hoverEffectSvg.querySelectorAll('circle');
      this.isSvgAppended = true;

      // Apply clip path
      if (this.hoverImage && this.clipPathId) {
        this.hoverImage.style.clipPath = `url(#${this.clipPathId})`;
      }

      this.startAnimation(1, 500);
    } else {
      this.startAnimation(1, 500);
    }
  }

  handleMouseLeave() {
    this.startAnimation(0, 500);
  }

  startAnimation(targetScale, duration, onComplete) {
    if (!this.circles.length) return;

    let startTime = null;

    const animate = (timestamp) => {
      if (!startTime) startTime = timestamp;
      let progress = Math.min((timestamp - startTime) / duration, 1);
      let scale = targetScale === 1 ? progress : 1 - progress;

      this.circles.forEach((circle) => {
        circle.setAttribute('transform', `matrix(${scale},0,0,${scale},0,0)`);
      });

      if (progress < 1) {
        requestAnimationFrame(animate);
      } else if (typeof onComplete === 'function') {
        onComplete();
      }
    };

    requestAnimationFrame(animate);
  }
}

customElements.define('product-cart-media', ProductCardHoverEffect);

class CustomDropdown extends HTMLElement {
  constructor() {
    super();
    this.elements = {
      parent: this.closest('[data-custom-dropdown-wrapper]'),
      button: this.querySelector('[data-dropdown-button]'),
      panel: this.querySelector('[data-dropdown-content]'),
      wrapper: this.querySelector('[data-horizontal-wrapper]'),
    };

    this.scrollStep = 40; // Set the scroll step to 40 pixels
    this.wrapper = null;
    this.leftArrow = null;
    this.rightArrow = null;

    if (this.elements.button) {
      this.elements.button.addEventListener('click', this.togglePanel.bind(this));
    }
    // if (this.elements.panel) {
    //   this.elements.panel.addEventListener('focusout', this.closePanel.bind(this));
    // }
    document.body.addEventListener(
      'click',
      function (event) {
        if (event.target != this && !this.contains(event.target)) {
          if (this.classList.contains('active')) {
            this.hidePanel();
          }
        }
      }.bind(this)
    );
    this.addEventListener('keyup', this.onKeyUp.bind(this));
    if (this.dataset.desktopOnly != undefined) {
      window.addEventListener(
        'resize',
        function () {
          if (window.innerWidth > 766) {
            this.classList.remove('active');
            this.elements.panel.style.display = 'none';
          } else {
            this.elements.panel.style.display = 'block';
          }
        }.bind(this)
      );
    }
    this.dropDownMenuPositions();
    this.offsetForDropDown();
    const resizeObserverDropdown = new ResizeObserver(this.offsetForDropDown.bind(this));
    resizeObserverDropdown.observe(this.closest('[data-custom-dropdown-wrapper]'));
  }
  onKeyUp(event) {
    if (event.code.toUpperCase() === 'ESCAPE') {
      if (window.innerWidth <= 766) return false;
      this.hidePanel();
      this.elements.button.focus();
    }
  }

  dropDownMenuPositions() {
    if (window.innerWidth < 992) return false;
    this.querySelector('[data-dropdown-content]').classList.remove('menu-position-left');
    const windowSize = window.innerWidth - 200;
    const rect = this.getBoundingClientRect();
    let currentPosition = rect.left + rect.width;
    const grandChildList = this.querySelector('[data-dropdown-content]');
    if (grandChildList) {
      currentPosition += grandChildList.getBoundingClientRect().width;
    }
    if (currentPosition >= windowSize) {
      this.querySelector('[data-dropdown-content]').classList.add('menu-position-left');
    }
  }
  offsetForDropDown() {
    const submenu = this.querySelector('[data-dropdown-content]');
    if (submenu) {
      const container = this.closest('[data-horizontal-wrapper]');
      if (!container) {
        console.info('Parent container not found');
        return;
      }
      const containerRect = container.getBoundingClientRect();
      const menuRect = this.getBoundingClientRect();
      const submenuRect = submenu.getBoundingClientRect();
      const gap = 0; // Adjust this if you want a different gap
      let defaultSpaceFromRight;
      let createSpaceFromRight;
      if (window.innerWidth > 1440) {
        defaultSpaceFromRight = 250;
        createSpaceFromRight = 350;
      } else if (window.innerWidth <= 1440) {
        defaultSpaceFromRight = 100;
        createSpaceFromRight = 200;
      } else {
        defaultSpaceFromRight = 100;
        createSpaceFromRight = 100;
      }
      let offsetLeft = menuRect.left - containerRect.left;
      let windowInnerWidth = window.innerWidth - defaultSpaceFromRight;
      // Check if submenu overflows the window width
      const spaceRight = windowInnerWidth - (menuRect.left + submenuRect.width + gap);
      if (spaceRight < 0) {
        // Not enough space on the right, adjust the left position
        offsetLeft += spaceRight - createSpaceFromRight; // Creating a 300px gap from the right side
      }
      // Ensure the submenu stays within the viewport with the defined gap
      offsetLeft = Math.max(offsetLeft, gap);
      submenu.style.left = `${offsetLeft}px`;
    }
  }
  hidePanel() {
    if (this.elements.panel) {
      this.classList.remove('active');
      this.elements.button.setAttribute('aria-expanded', 'false');
      // this.elements.panel.style.display = 'none';
      DOMAnimations.slideUp(this.elements.panel);
    }
  }

  onKeyUp(event) {
    if (event.code.toUpperCase() === 'ESCAPE') {
      if (window.innerWidth <= 766) return false;
      this.hidePanel();
      this.elements.button.focus();
    }
  }

  togglePanel() {
    if (this.classList.contains('active')) {
      this.hidePanel();
      this.elements.button.focus();
    } else {
      const activeElement = this.elements.parent.querySelector('custom-dropdown.active');
      if (activeElement) {
        activeElement.classList.remove('active');
        activeElement.querySelector('[data-dropdown-button]').setAttribute('aria-expanded', 'false');
        DOMAnimations.slideUp(activeElement.querySelector('[data-dropdown-content]'));
      }
      if (this.elements.panel) {
        this.classList.add('active');
        DOMAnimations.slideDown(this.elements.panel);
        this.offsetForDropDown();
        this.elements.button.setAttribute('aria-expanded', 'true');
      }
    }
  }

  closePanel(event) {
    if (!event.relatedTarget || event.relatedTarget.nodeName !== 'BUTTON') {
      this.hidePanel();
    }
  }
}
customElements.define('custom-dropdown', CustomDropdown);

function fetchConfig(type = 'json') {
  return {
    method: 'POST',
    headers: { 'Content-Type': 'application/json', Accept: `application/${type}` },
  };
}

class ListSet extends HTMLElement {
  constructor() {
    super();
    // this.magnetButton = new theme.MagnetButton(this);
    // this.magnetButton.load();
    this.addEventListener('click', this.onClickHandler.bind(this));
  }

  onClickHandler(e) {
    switch (this.dataset.source) {
      case 'search-drawer':
        if (document.querySelector(`[data-drawer="${this.dataset.source}"]`) && this.dataset.behaviour == 'drawer') {
          e.preventDefault();
          document.querySelector(`[data-drawer="${this.dataset.source}"]`).classList.add('open');
          if (document.querySelector(`[data-drawer="${this.dataset.source}"]`).classList.contains('hidden')) {
            document.querySelector(`[data-drawer="${this.dataset.source}"]`).classList.remove('hidden');
          }
          const getDrawer = document.querySelector(`[data-drawer="${this.dataset.source}"]`);
          getDrawer.querySelector('predictive-search').classList.add('open-search');
          const element = getDrawer.querySelector('[data-clear-input]');
          if (element && element.classList.contains('hidden')) {
            element.classList.remove('hidden');
          }
          document.body.classList.add('overflow-hidden');
          setTimeout(() => {
            document.querySelector(`[data-drawer="${this.dataset.source}"]`).classList.add('shadow');
            document
              .querySelector(`[data-drawer="${this.dataset.source}"]`)
              .querySelector('input[type="search"]')
              .focus();
          }, 400);
          trapFocus(document.querySelector(`[data-drawer="${this.dataset.source}"]`));
          // document.querySelector(`[data-drawer="${this.dataset.source}"]`).style.display = 'flex';
        }
        break;

      case 'cart-drawer':
        if (document.querySelector(`[data-drawer="${this.dataset.source}"]`) && this.dataset.behaviour == 'drawer') {
          e.preventDefault();
          // document.querySelector(`[data-drawer="${this.dataset.source}"]`).style.display = 'flex';
          document.querySelector(`[data-drawer="${this.dataset.source}"]`).classList.add('open');
          document.body.classList.add('overflow-hidden');

          setTimeout(() => {
            document.querySelector(`[data-drawer="${this.dataset.source}"]`).classList.add('shadow');
            document
              .querySelector(`[data-drawer="${this.dataset.source}"]`)
              .querySelector('[data-drawer-close] button')
              .focus();
          }, 400);
          // setTimeout(() => {

          // }, 800);
          trapFocus(document.querySelector(`[data-drawer="${this.dataset.source}"]`));
          document.querySelector(`[data-drawer="${this.dataset.source}"]`).dataset.oncloseFocus =
            '[data-source="cart-drawer"] a';
        }
        break;
      default:
        break;
    }
  }
}
customElements.define('list-set', ListSet);

class SwiperSlideshow extends HTMLElement {
  constructor() {
    super();
    this._initial_slider();
    this.imageElement = this.querySelector('video img');
    // if (this.imageElement) {
    //   // this.imageElement.setAttribute('alt', 'Preview image of the video');
    //   this.imageElement.setAttribute('loading', 'lazy');
    // }
  }
  _initial_slider() {
    setTimeout(() => {
      this.swiperslider_settings = this.querySelector('[data-swiper]').getAttribute('data-swiper');
      this.swiperslider_selector = this.querySelector('[data-swiper]');
      this._initSwiperSlide();
    }, 10);
  }
  _initSwiperSlide() {
    if (this.swiper) {
      this.swiper.destroy(true, true);
      this.swiper = null;
    }
    this.swiperslider_settings = JSON.parse(this.swiperslider_settings);
    if (this.swiperslider_settings) {
      this.swiper = new Swiper(this.swiperslider_selector, this.swiperslider_settings);
      //Add focusout listener to resume autoplay

      const hasAutoplay = !!this.swiperslider_settings.autoplay;
      if (hasAutoplay) {
        this.swiperslider_selector.addEventListener('focusout', () => {
          if (this.swiper?.autoplay) {
            this.swiper.autoplay.start();
          }
        });
      }

      // this.swiperslider_selector.addEventListener('focusout', () => {
      //   if (this.swiper?.autoplay) {
      //     this.swiper.autoplay.start();
      //   }
      // });

      const useController = this.swiperslider_selector.getAttribute('data-controller');
      if (useController) {
        this._useController(useController);
      }
    }
  }
  _useController(useController) {
    const mainSlider = document.getElementById(useController).swiper;
    mainSlider.controller.control = this.swiper;
    this.swiper.controller.control = mainSlider;
  }

  _selectSlide(index) {
    if (this.swiper) {
      this.swiper.slideToLoop(index);
    }
  }
}
customElements.define('swiper-slideshow', SwiperSlideshow);

theme.OnScroll = (function () {
  class OnScroll {
    constructor(container) {
      this.container = container;
      this.triggered = false;
    }
    scroll(scrollElement) {
      if (scrollElement && scrollElement.querySelector('a')) {
        let nextUrl = scrollElement.querySelector('a').getAttribute('href');
        if (isOnScreen(scrollElement) && this.triggered == false) {
          this.triggered = true;
          scrollElement.querySelector('a').remove();
          if (scrollElement.querySelector('[data-infinite-scroll]')) {
            scrollElement.querySelector('[data-infinite-scroll]').classList.remove('hidden');
          }
          this.fetchFilterData(nextUrl).then((responseText) => {
            const resultData = new DOMParser().parseFromString(responseText, 'text/html');
            if (resultData.querySelector('[data-scroll-event]')) {
              document.querySelector('[data-scroll-event]').innerHTML =
                resultData.querySelector('[data-scroll-event]').innerHTML;
            } else if (resultData.querySelector('[data-load-more]')) {
              document.querySelector('[data-load-more]').innerHTML =
                resultData.querySelector('[data-load-more]').innerHTML;
            } else {
              scrollElement.remove();
            }
            let html = resultData.querySelector('[main-collection-products]');
            // if (html.querySelector('[data-applied-filters]')) {
            //   html.removeChild(html.querySelector('[data-applied-filters'));
            // }
            let elmnt = document.querySelector('[main-collection-products]');
            /* Result for the collection and search page */
            if (html) {
              elmnt.innerHTML += html.innerHTML;
              const get_list = document.querySelectorAll('animate-motion-list');
              get_list.forEach((list) => list.reload());
              this.triggered = false;
            }
          });
        }
      }
    }
    fetchFilterData(url) {
      return fetch(url).then((response) => response.text());
    }
  }
  return OnScroll;
})();

class LoadMore extends HTMLElement {
  constructor() {
    super();
    this.onScroll = new theme.OnScroll(this);
    this.addEventListener('click', (e) => {
      e.preventDefault();
      this.onScroll.scroll(this);
    });
  }
}
customElements.define('load-more', LoadMore);

class DataScroll extends HTMLElement {
  constructor() {
    super();
    window.addEventListener('load', this.init.bind(this));
  }

  init() {
    this.headerSection = document.querySelector('[data-header-section]');
    this.mainContent = document.querySelector('.main-content-wrapper');
    this.scrollElement = document.querySelector('[data-scroll-event]');

    if (!this.scrollElement || !theme?.OnScroll) return;

    this.onScroll = new theme.OnScroll(this);

    if (this.headerSection?.classList.contains('header-style-side-reveal-menu') && window.innerWidth > 1024) {
      if (this.mainContent) {
        this.mainContent.addEventListener('scroll', () => this.onScroll.scroll(this.scrollElement));
      } else {
        window.addEventListener('scroll', () => this.onScroll.scroll(this.scrollElement));
      }
    } else {
      window.addEventListener('scroll', () => this.onScroll.scroll(this.scrollElement));
    }
  }
}

customElements.define('data-scroll', DataScroll);

class MarqueeContent extends HTMLElement {
  constructor() {
    super();

    this.marqueeWrappers = this.querySelectorAll('[data-marquee-wrapper]');
    this.headerSection = document.querySelector('[data-header-section]');
    this.mainContent = document.querySelector('.main-content-wrapper');

    this.handleResize = this.handleResize.bind(this);

    this.init();
    window.addEventListener('resize', this.handleResize);
  }

  init() {
    this.cleanup();

    this.scrollContainer = this.getScrollContainer();

    this.marqueeWrappers.forEach((marqueeWrapper) => {
      if (marqueeWrapper.hasAttribute('data-marquee-onscroll')) {
        this.desktopSpeed = parseInt(marqueeWrapper.dataset.marqueeSpeed, 10);
        this.mobileSpeed = parseInt(marqueeWrapper.dataset.marqueeSpeedMobile, 10);
        this.initMarqueeScrollListener(marqueeWrapper);
      }
    });
  }

  getScrollContainer() {
    const isDesktop = window.innerWidth > 1024;
    const isSideReveal = this.headerSection?.classList.contains('header-style-side-reveal-menu');
    return isDesktop && isSideReveal && this.mainContent ? this.mainContent : window;
  }

  initMarqueeScrollListener(marqueeWrapper) {
    const listener = () => this.onMarqueeScroll(marqueeWrapper);
    this.scrollContainer.addEventListener('scroll', listener);
    marqueeWrapper._marqueeScrollListener = listener;
  }

  handleResize() {
    this.init();
  }

  cleanup() {
    this.marqueeWrappers.forEach((marqueeWrapper) => {
      const oldListener = marqueeWrapper._marqueeScrollListener;
      if (oldListener && this.scrollContainer) {
        this.scrollContainer.removeEventListener('scroll', oldListener);
      }
    });
  }

  onMarqueeScroll(marqueeWrapper) {
    if (!isOnScreen(this)) return;

    const elementPosition = marqueeWrapper.getBoundingClientRect();
    const Elewidth = this.getBoundingClientRect().width;

    let speed = this.desktopSpeed;
    if (window.innerWidth < 768 && this.mobileSpeed) {
      speed = this.mobileSpeed;
    }

    let marqueePosition;
    if (marqueeWrapper.classList.contains('rtl-direction')) {
      marqueePosition = -(Elewidth / 2) + elementPosition.top;
    } else {
      marqueePosition = Elewidth / 2 - elementPosition.top;
    }

    marqueeWrapper.style.transform = `translate3d(${(marqueePosition / speed) * 10}px, 0px, 0px)`;
  }

  disconnectedCallback() {
    this.cleanup();
    window.removeEventListener('resize', this.handleResize);
  }
}

customElements.define('marquee-content', MarqueeContent);

class VideoMoveEffect extends HTMLElement {
  constructor() {
    super();
    this.triggerButtonWrapper = this.querySelector('[data-video-content');
    this.triggerPlay = this.querySelector('[data-video-play-button]');
    this.animationFrame; // To store the animation frame reference
    this.mouseX = 0;
    this.mouseY = 0;
    if (this.triggerButtonWrapper) {
      this.triggerButtonWrapper.addEventListener('mousemove', this.videoIconMouseMove.bind(this));
      this.triggerButtonWrapper.addEventListener('mouseleave', this.videoIconMouseLeave.bind(this));
    }
    // Bind `applyTransform` to retain `this` context
    this.applyTransform = this.applyTransform.bind(this);
  }

  videoIconMouseLeave(e) {
    this.triggerPlay.style.transform = 'translate3d(0px, 0px, 0px) scale3d(1, 1, 1) rotateX(0deg) rotateY(0deg)';
    if (this.animationFrame) {
      cancelAnimationFrame(this.animationFrame);
      this.animationFrame = null;
    }
  }

  videoIconMouseMove(e) {
    const rect = this.triggerButtonWrapper.getBoundingClientRect();
    // Calculate the mouse position relative to the center of the container
    const centerX = rect.left + rect.width / 2;
    const centerY = rect.top + rect.height / 2;
    this.mouseX = (e.clientX - centerX) / rect.width; // Normalize to -0.5 to 0.5
    this.mouseY = (e.clientY - centerY) / rect.height;
    if (!this.animationFrame) {
      this.animationFrame = requestAnimationFrame(this.applyTransform);
    }
  }

  applyTransform() {
    const translateX = this.mouseX * 30; // Adjust for desired movement intensity
    const translateY = this.mouseY * 30;
    const rotateX = this.mouseY * -15; // Rotate based on Y position
    const rotateY = this.mouseX * 15; // Rotate based on X position
    const scale = 1.1; // Slightly enlarge the icon on hover

    this.triggerPlay.style.transform = `
      translate3d(${translateX}px, ${translateY}px, 0px)
      scale3d(${scale}, ${scale}, 1)
      rotateX(${rotateX}deg)
      rotateY(${rotateY}deg)
    `;
    this.animationFrame = requestAnimationFrame(this.applyTransform);
  }
}
customElements.define('video-move-effect', VideoMoveEffect);

class DeferredMediaVideo extends HTMLElement {
  constructor() {
    super();
    // this.videoIconContent = this.querySelector('[data-video-content]');
    this.autoplayContentVisibility = this.dataset.autoplayContentVisibility;

    this.triggerPlay = this.querySelector('[data-video-play-button]');
    this.videoContent = this.querySelector('[data-video-content-wraper]');
    this.videoElement = this.querySelector('video');
    this.iframeElement = this.querySelector('iframe');
    this.imageElement = this.querySelector('img');
    this.videoThumbnail = this.querySelector('.video-thumbnail');
    this.triggerButtonWrapper = this.querySelector('.video-content-button');
    // if (this.imageElement) {
    //   // this.imageElement.setAttribute('alt', 'Preview image of the video');
    //   this.imageElement.setAttribute('loading', 'lazy');
    // }
    if (this.triggerPlay) {
      this.triggerPlay.addEventListener('click', () => this.playVideo());
      this.triggerPlay.addEventListener('keydown', (event) => {
        if (event.key === 'Enter') {
          event.preventDefault();
          this.playVideo();
        }
      });
    }
  }

  playVideo() {
    if (this.triggerButtonWrapper) this.triggerButtonWrapper.classList.add('hidden');
    if (this.videoContent) {
      if (this.autoplayContentVisibility == 'none') {
        this.videoContent.classList.add('hidden');
      } else {
        this.videoContent.classList.add('video-player-active');
      }
    }
    if (this.videoThumbnail) this.videoThumbnail.classList.add('hidden');
    if (this.videoElement) {
      this.videoElement.classList.remove('hidden');
      this.videoElement.play();
    } else if (this.iframeElement) {
      this.iframeElement.classList.remove('hidden');
    }
  }
}
customElements.define('deferred-media-video', DeferredMediaVideo);

class countdownTimer extends HTMLElement {
  constructor() {
    super();
    this.countdownItemWraper = this.querySelector('[data-countdown-input]');
    this.countdownExpireWraper = this.querySelector('[data-expire-message]');
    this.init_countdown();
  }

  init_countdown() {
    this.targetDate = new Date(
      this.querySelector('[data-countdown-input]').getAttribute('data-countdown-input')
    ).getTime();
    this.timer_labels = {
      days: this.querySelector('[data-days]'),
      hours: this.querySelector('[data-hours]'),
      minutes: this.querySelector('[data-minutes]'),
      seconds: this.querySelector('[data-seconds]'),
    };
    this.interval = setInterval(() => this.timerCountFunc(this.targetDate), 1000);
  }

  timerCountFunc(targetDate) {
    const dateNow = new Date().getTime();
    const remainingTime = targetDate - dateNow;
    if (remainingTime <= 0) {
      this.countdownItemWraper.style.display = 'none';
      this.countdownExpireWraper.classList.remove('hidden');
      return;
    } else {
      this.countdownItemWraper.classList.remove('hide-countdown');
    }

    const days = Math.floor(remainingTime / (1000 * 60 * 60 * 24));
    const hours = Math.floor((remainingTime % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));
    const minutes = Math.floor((remainingTime % (1000 * 60 * 60)) / (1000 * 60));
    const seconds = Math.floor((remainingTime % (1000 * 60)) / 1000);

    this.timer_labels.days.innerHTML = days;
    this.timer_labels.hours.innerHTML = hours;
    this.timer_labels.minutes.innerHTML = minutes;
    this.timer_labels.seconds.innerHTML = seconds;
  }
}

customElements.define('countdown-timer', countdownTimer);

// class TabsHeader extends HTMLElement {
//   constructor() {
//     super();
//     this.parentSection = this.closest('section') || this.closest('[data-tabs-parent]') || this.closest('localization-form');
//     this.tabs = this.querySelectorAll('[data-tab-id]');
//     this.autoSwitch = this.dataset.autoSwitch === 'true';
//     this.autoSwitchTime = parseInt(this.dataset.autochangeTime, 10) || 3000;
//     this.currentTabIndex = 0;
//     if (this.autoSwitch) {
//       this.startAutoSwitch();
//     }
//     this.tabs.forEach((tab, index) => {
//       tab.addEventListener('click', this.switchTab.bind(this));
//       tab.addEventListener('keydown', (event) => {
//         if (event.key === 'Enter' || event.keyCode === 13) {
//           this.switchTab({ currentTarget: tab });
//         }
//       });
//       tab.dataset.index = index;
//     });
//   }

//   startAutoSwitch() {
//     this.interval = setInterval(() => {
//       this.autoSwitchTab();
//     }, this.autoSwitchTime);
//   }

//   autoSwitchTab() {
//     this.tabs.forEach((tab) => tab.classList.remove('active'));
//     const contentSections = this.parentSection.querySelectorAll('[data-content-id]');
//     contentSections.forEach((content) => content.classList.add('hidden'));
//     this.currentTabIndex = (this.currentTabIndex + 1) % this.tabs.length;
//     const nextTab = this.tabs[this.currentTabIndex];
//     nextTab.classList.add('active');
//     const selectedTabId = nextTab.getAttribute('data-tab-id');
//     const targetContents = this.parentSection.querySelectorAll(`[data-content-id="${selectedTabId}"]`);
//     if (targetContents.length > 0) {
//       targetContents.forEach((element) => element.classList.remove('hidden'));
//     }
//   }

//   switchTab(event) {
//     if (this.interval) {
//       clearInterval(this.interval);
//       if (this.autoSwitch) {
//         this.startAutoSwitch();
//       }
//     }
//     this.tabs.forEach((tab) => tab.classList.remove('active'));
//     const contentSections = this.parentSection.querySelectorAll('[data-content-id]');
//     contentSections.forEach((content) => content.classList.add('hidden'));
//     const clickedTab = event.currentTarget;
//     clickedTab.classList.add('active');
//     const selectedTabId = clickedTab.getAttribute('data-tab-id');
//     const targetContents = this.parentSection.querySelectorAll(`[data-content-id="${selectedTabId}"]`);
//     if (targetContents.length > 0) {
//       targetContents.forEach((element) => element.classList.remove('hidden'));
//     }
//     this.currentTabIndex = parseInt(clickedTab.dataset.index, 10);
//   }
// }
// customElements.define('tabs-header', TabsHeader);

class TabsHeader extends HTMLElement {
  constructor() {
    super();
    this.parentSection =
      this.closest('.shopify-section') ||
      this.closest('section') ||
      this.closest('[data-tabs-parent]') ||
      this.closest('localization-form');
    this.tabs = this.querySelectorAll('[data-tab-id]');
    this.autoSwitch = this.dataset.autoSwitch === 'true';
    this.autoSwitchTime = parseInt(this.dataset.autochangeTime, 10) || 3000;
    this.inactivityTime = 10000;
    this.currentTabIndex = 0;
    this.userInteracted = false;

    this.backgroundEffect = this.querySelector('[background-effect]');

    if (this.backgroundEffect) {
      window.addEventListener('resize', this.handleResize.bind(this));

      this.handleMouseOver = this.handleMouseOver.bind(this);
    }

    if (this.autoSwitch) {
      this.startAutoSwitch();
    }

    this.tabs.forEach((tab, index) => {
      tab.addEventListener('click', this.switchTab.bind(this));
      if (this.backgroundEffect) {
        tab.addEventListener('mouseover', this.handleMouseOver);
      }
      tab.addEventListener('keydown', (event) => {
        if (event.key === 'Enter' || event.keyCode === 13) {
          this.switchTab({ currentTarget: tab });
        }
      });
      tab.dataset.index = index;
    });

    if (this.parentSection) {
      this.detectUserInteraction();
    }
  }

  handleResize() {
    if (!this.backgroundEffect) return;

    const activeTab = this.querySelector('[data-tab-id].active');
    if (activeTab) {
      this.moveBackgroundEffect(activeTab);
    }
  }

  handleMouseOver(event) {
    const target = event.currentTarget;
    if (!target || !this.backgroundEffect) return;

    this.moveBackgroundEffect(target);

    // Optional animate class trigger:
    // if (!target.classList.contains('animate')) {
    //   target.classList.add('animate');
    //   target.addEventListener('animationend', () => {
    //     target.classList.remove('animate');
    //   }, { once: true });
    // }
  }

  moveBackgroundEffect(target) {
    const width = target.offsetWidth;
    const tabLeft = target.offsetLeft;
    this.backgroundEffect.style.setProperty('--bgeffect-maxwidth', `${width}px`);
    this.backgroundEffect.style.setProperty('--bgeffect-translate', `${tabLeft}px`);
  }

  startAutoSwitch() {
    this.interval = setInterval(() => {
      this.autoSwitchTab();
    }, this.autoSwitchTime);
  }

  autoSwitchTab() {
    if (this.userInteracted) return;

    this.tabs.forEach((tab) => tab.classList.remove('active'));
    const contentSections = this.parentSection.querySelectorAll('[data-content-id]');
    contentSections.forEach((content) => content.classList.add('hidden'));

    this.currentTabIndex = (this.currentTabIndex + 1) % this.tabs.length;
    const nextTab = this.tabs[this.currentTabIndex];
    nextTab.classList.add('active');

    const selectedTabId = nextTab.getAttribute('data-tab-id');
    const targetContents = this.parentSection.querySelectorAll(`[data-content-id="${selectedTabId}"]`);
    targetContents.forEach((element) => element.classList.remove('hidden'));
  }

  switchTab(event) {
    if (this.interval) {
      clearInterval(this.interval);
      this.userInteracted = true;
      this.resetInactivityTimer();
    }

    this.tabs.forEach((tab) => tab.classList.remove('active'));
    const contentSections = this.parentSection.querySelectorAll('[data-content-id]');
    contentSections.forEach((content) => content.classList.add('hidden'));

    const clickedTab = event.currentTarget;
    clickedTab.classList.add('active');

    const selectedTabId = clickedTab.getAttribute('data-tab-id');
    const targetContents = this.parentSection.querySelectorAll(`[data-content-id="${selectedTabId}"]`);
    targetContents.forEach((element) => element.classList.remove('hidden'));

    this.currentTabIndex = parseInt(clickedTab.dataset.index, 10);
  }

  detectUserInteraction() {
    const interactionEvents = ['click', 'mousemove', 'touchstart'];

    const stopAutoSwitch = () => {
      this.userInteracted = true;
      if (this.interval) {
        clearInterval(this.interval);
      }
      this.resetInactivityTimer();
    };

    interactionEvents.forEach((event) => {
      this.parentSection.addEventListener(event, stopAutoSwitch, { passive: true });
    });
  }

  resetInactivityTimer() {
    if (this.inactivityTimer) {
      clearTimeout(this.inactivityTimer);
    }

    this.inactivityTimer = setTimeout(() => {
      this.userInteracted = false;
      if (this.autoSwitch) {
        this.startAutoSwitch();
      }
    }, this.inactivityTime);
  }
}

customElements.define('tabs-header', TabsHeader);

class LocalizationDropdown extends HTMLElement {
  constructor() {
    super();
    this.toggleButton = this.querySelector('[data-custom-select-button-trigger]');
    this.dropdownPanel = this.querySelector('[data-custom-select-summary]');
    this.closeCountrySelector = this.querySelector('[data-close-countrySelector]') || this.querySelector('[data-close-countryselector]');
    // this.listSelectorAll = this.querySelectorAll('[data-list-selector]');
    if (this.closeCountrySelector) {
      this.closeCountrySelector.addEventListener('click', () => {
        this.closeDropdown();
        this.toggleButton.focus();
      });
    }
    // this.listSelectorAll.forEach((listSelector) => {
    //   listSelector.addEventListener('click', function () {
    //     this.classList.add('active');
    //     const listSelector = this.dataset.listSelector; // Using dataset to get the value
    //     const parentContainer = this.closest('localization-form');
    //     if (listSelector === 'country-list') {
    //       parentContainer.querySelector('[data-list-selector="language-list"]').classList.remove('active');
    //       parentContainer.querySelector('[data-country-list]').classList.remove('hidden');
    //       parentContainer.querySelector('[data-language-list]').classList.add('hidden');
    //     } else if (listSelector === 'language-list') {
    //       parentContainer.querySelector('[data-list-selector="country-list"]').classList.remove('active');
    //       parentContainer.querySelector('[data-country-list]').classList.add('hidden');
    //       parentContainer.querySelector('[data-language-list]').classList.remove('hidden');
    //     }
    //   });
    // });
    document.body.addEventListener(
      'click',
      function (event) {
        if (event.target !== this && !this.contains(event.target)) {
          this.closeDropdown();
        }
      }.bind(this)
    );
    document.body.addEventListener('keydown', this.onKeyDown.bind(this));

    if (this.toggleButton) {
      this.toggleButton.addEventListener('click', this.toggleDropdown.bind(this));
    }
    this.addEventListener('keyup', this.onKeyUp.bind(this));
  }

  onKeyUp(event) {
    if (event.code && event.code.toUpperCase() === 'ESCAPE') {
      this.closeDropdown();
      this.toggleButton.focus();
    }
  }

  onKeyDown(event) {
    if (event.code.toUpperCase() === 'ESCAPE') {
      this.closeDropdown();
    }
  }

  closeDropdown() {
    if (this.dropdownPanel) {
      this.toggleButton.setAttribute('aria-expanded', 'false');
      this.dropdownPanel.style.display = 'none';
      this.dropdownPanel.classList.remove('show');
    }
  }

  toggleDropdown() {
    const isHidden = this.dropdownPanel.style.display === 'none';
    if (this.dropdownPanel) {
      this.dropdownPanel.style.display = isHidden ? 'block' : 'none';
      this.toggleButton.setAttribute('aria-expanded', isHidden.toString());
      this.dropdownPanel.classList.toggle('show');
      if (isHidden) {
        trapFocus(this.dropdownPanel);
        this.toggleButton.focus();
      }
    }
  }
}
customElements.define('localization-form', LocalizationDropdown);

class ProductMediaGallery extends HTMLElement {
  constructor() {
    super();
    // if (!this.querySelector('[data-thumbnails-media]')) 
    if (!this.querySelector('[data-thumbnails-media]')) {
      this.mediaGridVideos();
      return;
    }
    this.galleryId = this.dataset.id;
    this.mainMediaContainer = this.querySelector('[data-main-media]');
    this.thumbnailMediaContainer = this.querySelector('[data-thumbnails-media]');
    this.thumbnailsStyle = this.dataset.thumbnailsStyle;
    this.layout = this.dataset.mediaGalleryStyle;
    this.mediaCount = this.dataset.mediaCount;

    this.source = this.dataset.source;
    this.slideLayout = this.dataset.layout;

    this.mainSlider = null;
    this.thumbnailSlider = null;
    this.mediaQuery = window.matchMedia('(max-width: 992px)');

    this.mediaGridVideos();
    this.initializeGallery();
    this.handleResize();

    window.addEventListener('resize', this.handleResize.bind(this));

    const observer = new ResizeObserver((entries) => {
      for (let entry of entries) {
        this.style.setProperty('--thumbnail-height', `${entry.contentRect.height}px`);
      }
    });
    observer.observe(this.mainMediaContainer);
  }

  initializeGallery() {
    this.mediaGridVideos();
    if (this.layout === 'media-grid' && !this.mediaQuery.matches) {
      return;
    }

    const thumbnail_next_arrow = this.thumbnailMediaContainer.querySelector('[data-product-thumbnails-swiper-next]');
    const thumbnail_prev_arrow = this.thumbnailMediaContainer.querySelector('[data-product-thumbnails-swiper-prev]');

    if (!this.thumbnailSlider) {
      const sliderOptions = {
        loop: true,
        speed: 800,
        slidesPerView: 4,
        spaceBetween: 5,
        freeMode: false,
        direction: 'horizontal',
        breakpoints: {
          992: {
            direction: this.thumbnailsStyle === 'vertical' ? 'vertical' : 'horizontal',
          },
        },
      };
      if (this.slideLayout == 'split_view' && thumbnail_next_arrow && thumbnail_prev_arrow) {
        sliderOptions.navigation = {
          nextEl: thumbnail_next_arrow,
          prevEl: thumbnail_prev_arrow,
        };
      }
      // else if (this.slideLayout == 'split_view' && this.mediaCount && this.mediaCount == 2) {
      //   // sliderOptions.slidesPerView = 2;
      //   // sliderOptions.loopedSlides = 2;
      // }
      this.thumbnailSlider = new Swiper(this.thumbnailMediaContainer, sliderOptions);
    }

    const checkQuickView = this.dataset.source;
    // const checkQuickView = this.mainMediaContainer.closest('quick-view-drawer');

    let next_arrow = this.querySelector('[data-product-swiper-next]');
    let prev_arrow = this.querySelector('[data-product-swiper-prev]');

    // if (this.slideLayout == 'split_view' && thumbnail_next_arrow && thumbnail_prev_arrow) {
    //   next_arrow = thumbnail_next_arrow;
    //   prev_arrow = thumbnail_prev_arrow;
    // }

    if (!this.mainSlider) {
      if (checkQuickView == 'quick-view') {
        this.mainSlider = new Swiper(this.mainMediaContainer, {
          loop: true,
          speed: 800,
          centeredSlides: false,
          slidesPerView: 'auto',
          spaceBetween: 10,
          navigation: {
            nextEl: next_arrow,
            prevEl: prev_arrow,
          },
          thumbs: {
            swiper: this.thumbnailSlider,
          },
        });
      } else {
        const mainSliderOptions = {
          loop: true,
          speed: 800,
          slidesPerView: 'auto',
          spaceBetween: 10,
          centeredSlides: false,
          navigation: {
            nextEl: next_arrow,
            prevEl: prev_arrow,
          },
          thumbs: {
            swiper: this.thumbnailSlider,
          },
        };

        if (this.slideLayout == 'split_view') {
          mainSliderOptions.slidesPerView = 'auto';
          mainSliderOptions.spaceBetween = 10;

          if (this.thumbnailsStyle == 'none') {
            mainSliderOptions.breakpoints = {
              992: {
                slidesPerView: 'auto',
                spaceBetween: 10,
              },
            };
          } else {
            mainSliderOptions.breakpoints = {
              992: {
                slidesPerView: 'auto',
                spaceBetween: 10,
                navigation: {
                  nextEl: thumbnail_next_arrow,
                  prevEl: thumbnail_prev_arrow,
                },
              },
            };
          }
          if (this.mediaCount && this.mediaCount == 2) {
            mainSliderOptions.breakpoints = {
              992: {
                slidesPerView: 'auto',
                spaceBetween: 10,
              },
            };
          }
        }

        this.mainSlider = new Swiper(this.mainMediaContainer, mainSliderOptions);

        // this.mainSlider = new Swiper(this.mainMediaContainer, {
        //   loop: true,
        //   speed: 800,
        //   slidesPerView: 1,
        //   navigation: {
        //     nextEl: next_arrow,
        //     prevEl: prev_arrow,
        //   },
        //   thumbs: {
        //     swiper: this.thumbnailSlider,
        //   },
        // });
      }

      this.bindCustomEvents();
    }
  }

  mediaGridVideos() {
    const externalVideos = this.querySelectorAll('.external-video');
    const youtubeElements = this.querySelectorAll(".youtube_video,.youtube-video, iframe[src*='www.youtube.com']");
    const vimeoElements = this.querySelectorAll(".vimeo_video,.vimeo-video, iframe[src*='player.vimeo.com']");
    const mp4Elements = this.querySelectorAll('video');

    const options = {
      root: null,
      rootMargin: '0px',
      threshold: 0.7,
    };

    const observer = new IntersectionObserver((entries) => {
      console.log(entries);
      entries.forEach((entry) => {
        const el_video = entry.target;
        if (entry.isIntersecting) {
          if (el_video.tagName.toLowerCase() === 'video') {
            if (el_video.autoplay === true) {
              setTimeout(() => {
                el_video.play();
              }, 300);
            }
          }
          if (el_video.classList.contains('vimeo-video')) {
            const checkVimeoClosest = el_video.closest('.external-video');
            if (checkVimeoClosest) {
              const checkVimeoAutoplay = checkVimeoClosest.dataset.autoplay;
              if (checkVimeoAutoplay === 'true') {
                setTimeout(() => {
                  el_video.contentWindow.postMessage('{"method":"play"}', '*');
                }, 500);
              }
            }
          } else if (el_video.classList.contains('youtube-video')) {
            const checkyoutubeClosest = el_video.closest('.external-video');
            if (checkyoutubeClosest) {
              const checkYoutubeAutoplay = checkyoutubeClosest.dataset.autoplay;
              if (checkYoutubeAutoplay === 'true') {
                setTimeout(() => {
                  el_video.contentWindow.postMessage('{"event":"command","func":"playVideo","args":""}', '*');
                }, 500);
              }
            }
          }
        } else {
          if (el_video.tagName.toLowerCase() === 'video') {
            if (el_video.autoplay === true) {
              setTimeout(() => {
                el_video.pause();
              }, 300);
            }
          }
          if (el_video.classList.contains('vimeo-video')) {
            this.pauseVimeo(el_video);
          } else if (el_video.classList.contains('youtube-video')) {
            this.pauseYouTube(el_video);
          } else {
            this.pause(el_video);
          }
        }
      });
    }, options);

    vimeoElements.forEach((el) => {
      observer.observe(el);
    });
    youtubeElements.forEach((el) => {
      observer.observe(el);
    });

    // externalVideos.forEach((el) => {
    //   observer.observe(el);
    // });
    mp4Elements.forEach((el) => {
      observer.observe(el);
    });

    // Load YouTube API and set up YouTube players
    this.loadYouTubeAPI()
      .then(() => {
        youtubeElements.forEach((element) => {
          this.setupYouTubePlayer(element);
          observer.observe(element);
        });
      })
      .catch((error) => {
        console.warn('Failed to load YouTube API:', error);
      });

    // Load Vimeo API and set up Vimeo players
    this.loadVimeoAPI()
      .then(() => {
        vimeoElements.forEach((element) => {
          this.setupVimeoPlayer(element);
          observer.observe(element);
        });
      })
      .catch((error) => {
        console.warn('Failed to load Vimeo API:', error);
      });

    // Pause all media when another starts playing
    mp4Elements.forEach((video) => {
      video.addEventListener('play', () => this.pauseOthers(video));
    });
  }
  loadVimeoAPI() {
    return new Promise((resolve, reject) => {
      if (window.Vimeo && Vimeo.Player) {
        resolve();
        return;
      }

      this.loadScript('https://player.vimeo.com/api/player.js')
        .then(() => {
          const checkVimeoReady = setInterval(() => {
            if (window.Vimeo && Vimeo.Player) {
              clearInterval(checkVimeoReady);
              resolve();
            }
          }, 100);
        })
        .catch((error) => {
          console.error('Failed to load Vimeo API:', error);
          reject(error);
        });
    });
  }

  loadYouTubeAPI() {
    return new Promise((resolve, reject) => {
      if (window.YT && YT.Player) {
        this.isYouTubeAPIReady = true;
        resolve();
        return;
      }

      if (this.isYouTubeAPIInProgress) {
        const checkAPIReady = setInterval(() => {
          if (window.YT && YT.Player) {
            this.isYouTubeAPIReady = true;
            clearInterval(checkAPIReady);
            resolve();
          }
        }, 100);
        return;
      }

      this.isYouTubeAPIInProgress = true;

      this.loadScript('https://www.youtube.com/iframe_api')
        .then(() => {
          window.onYouTubeIframeAPIReady = () => {
            this.isYouTubeAPIReady = true;
            resolve();
          };
        })
        .catch(reject);
    });
  }
  loadScript(src) {
    return new Promise((resolve, reject) => {
      const existingScript = document.querySelector(`script[src="${src}"]`);
      if (existingScript) {
        existingScript.onload ? resolve() : existingScript.addEventListener('load', resolve);
        return;
      }

      const script = document.createElement('script');
      script.src = src;
      script.onload = resolve;
      script.onerror = () => reject(new Error(`Failed to load script: ${src}`));
      document.head.appendChild(script);
    });
  }
  setupYouTubePlayer(element) {
    if (!this.isYouTubeAPIReady) {
      console.warn('YouTube API not ready. Retrying...');
      const retryInterval = setInterval(() => {
        if (this.isYouTubeAPIReady) {
          clearInterval(retryInterval);
          this.initializeYouTubePlayer(element);
        }
      }, 100);
      return;
    }
    this.initializeYouTubePlayer(element);
  }
  initializeYouTubePlayer(element) {
    const player = new YT.Player(element, {
      events: {
        onStateChange: (event) => {
          switch (event.data) {
            case YT.PlayerState.PLAYING:
              console.log('YouTube video is playing.');
              this.pauseOthers(element);
              break;
            case YT.PlayerState.PAUSED:
              console.log('YouTube video is paused.');
              break;
            case YT.PlayerState.ENDED:
              console.log('YouTube video has ended.');
              break;
            default:
              console.log('YouTube video state changed to:', event.data);
              break;
          }
        },
      },
    });
  }
  setupVimeoPlayer(element) {
    const player = new Vimeo.Player(element);

    player.on('play', () => {
      console.log('Vimeo video is playing.');
      this.pauseOthers(element);
    });

    player.on('pause', () => {
      console.log('Vimeo video is paused.');
    });

    player.on('ended', () => {
      console.log('Vimeo video has ended.');
    });
  }

  pause(video) {
    video.pause();
  }

  pauseYouTube(video) {
    try {
      const iframe = video.tagName === 'IFRAME' ? video : video.querySelector('iframe');
      if (iframe && iframe.contentWindow) {
        iframe.contentWindow.postMessage('{"event":"command","func":"pauseVideo","args":""}', '*');
      } else {
        // Fallback: wait for iframe to load
        iframe?.addEventListener('load', () => {
          iframe.contentWindow.postMessage('{"event":"command","func":"pauseVideo","args":""}', '*');
        });
      }
    } catch (err) {
      console.warn('pauseYouTube failed:', err);
    }
    // video.contentWindow.postMessage('{"event":"command","func":"pauseVideo","args":""}', '*');
  }
  pauseVimeo(video) {
    if (typeof Vimeo === 'undefined' || !Vimeo.Player) return;
    const vimeoPlayer = new Vimeo.Player(video);
    vimeoPlayer.pause();
  }
  pauseOthers(currentVideo) {
    // Pause YouTube videos
    this.querySelectorAll(".youtube_video,.youtube-video, iframe[src*='www.youtube.com']").forEach((video) => {
      if (currentVideo !== video) {
        video.contentWindow.postMessage('{"event":"command","func":"pauseVideo","args":""}', '*');
      }
    });

    // Pause Vimeo videos
    this.querySelectorAll(".vimeo_video,.vimeo-video, iframe[src*='player.vimeo.com']").forEach((video) => {
      if (currentVideo !== video) {
        if (typeof Vimeo === 'undefined' || !Vimeo.Player) return;
        const vimeoPlayer = new Vimeo.Player(video);
        vimeoPlayer.pause();
      }
    });

    // Pause MP4 videos
    this.querySelectorAll('video').forEach((video) => {
      if (currentVideo !== video) {
        video.pause();
      }
    });

    // Pause 3D models
    const modelItems = this.querySelectorAll('product-model');
    if (modelItems.length > 0) {
      modelItems.forEach((modelItem) => {
        if (currentVideo !== modelItem) {
          modelItem.pauseModel();
        }
      });
      // modelItems.forEach((modelItem) => modelItem.pauseModel());
    }
  }

  destroySliders() {
    if (this.mainSlider) {
      this.mainSlider.destroy(true, true);
      this.mainSlider = null;
    }
    if (this.thumbnailSlider) {
      this.thumbnailSlider.destroy(true, true);
      this.thumbnailSlider = null;
    }
  }

  handleResize() {
    if (this.layout === 'media-grid' && !this.mediaQuery.matches) {
      this.destroySliders();
    } else {
      if (!this.mainSlider || !this.thumbnailSlider) {
        this.initializeGallery();
      }
    }
  }

  selectSlideByIndex(index) {
    if (this.mainSlider && this.thumbnailSlider) {
      this.mainSlider.slideToLoop(index);
      this.thumbnailSlider.slideToLoop(index);
    }
  }

  _draggable(status) {
    if (this.mainSlider && this.thumbnailSlider) {
      this.mainSlider.allowTouchMove = status;
      this.thumbnailSlider.allowTouchMove = status;
    }
  }

  bindCustomEvents() {
    const get_height = this.mainMediaContainer.offsetHeight;
    this.style.setProperty('--thumbnail-height', `${get_height}px`);

    this.mainSlider.on('slideChange', (event) => {
      const previousSlide = this.mainSlider.slides[event.previousIndex];
      const activeSlide = this.mainSlider.slides[event.activeIndex];
      this.pauseOthers(activeSlide);
      console.log(activeSlide);

      const activeMediaExtrnalvideo = activeSlide.querySelector('.external-video');
      const activeMediaVideo = activeSlide.querySelector('video');
      if (activeMediaVideo) {
        console.log(activeMediaVideo);
        if (activeMediaVideo.autoplay === true) {
          setTimeout(() => {
            activeMediaVideo.play();
          }, 100);
        }
      } else if (activeMediaExtrnalvideo) {
        const checkExtrnalvideoAutoplay = activeMediaExtrnalvideo.dataset.autoplay;
        if (checkExtrnalvideoAutoplay === 'true') {
          const getYoutubeVideo = activeMediaExtrnalvideo.querySelector('.youtube-video');
          if (getYoutubeVideo) {
            getYoutubeVideo.contentWindow.postMessage('{"event":"command","func":"playVideo","args":""}', '*');
          }
          const getVimeoVideo = activeMediaExtrnalvideo.querySelector('.vimeo-video');
          if (getVimeoVideo) {
            getVimeoVideo.contentWindow.postMessage('{"method":"play"}', '*');
          }
        }
      }

      // if (previousSlide) {
      //   this.pauseMediaInSlide(previousSlide);
      // }
      // if (activeSlide && this.hasActiveModel(activeSlide)) {
      //   this.pauseModelInSlide(activeSlide); 
      // }
    });
  }

  pauseMediaInSlide(slide) {
    slide.querySelectorAll('video').forEach((video) => video.pause());
    slide.querySelectorAll('.youtube-video').forEach((youtubeVideo) => {
      youtubeVideo.contentWindow.postMessage('{"event":"command","func":"pauseVideo","args":""}', '*');
    });
    slide.querySelectorAll('.vimeo-video').forEach((vimeoVideo) => {
      vimeoVideo.contentWindow.postMessage('{"method":"pause"}', '*');
    });
    const modelViewer = slide.querySelector('product-model');
    if (modelViewer && !modelViewer.classList.contains('shopify-model-viewer-ui__disabled')) {
      modelViewer.pauseModel();
    }
  }

  // hasActiveModel(slide) {
  //   const modelViewer = slide.querySelector('product-model');
  //   return modelViewer && !modelViewer.classList.contains('shopify-model-viewer-ui__disabled');
  // }

  pauseModelInSlide(slide) {
    const modelViewer = slide.querySelector('product-model');
    if (modelViewer) {
      modelViewer.pauseModel();
    }
  }
}

customElements.define('product-media-gallery', ProductMediaGallery);

class CartQuantityWrapper extends HTMLElement {
  constructor() {
    super();
    this.icon = this.querySelector('[cart-quantity-popover-info-icon]');
    this.content = this.querySelector('[cart-quantity-popover-info-content]');

    this.handleIconClick = this.handleIconClick.bind(this);
    this.handleOutsideClick = this.handleOutsideClick.bind(this);
  }

  connectedCallback() {
    if (this.icon && this.content) {
      this.icon.addEventListener('click', this.handleIconClick);
      document.addEventListener('click', this.handleOutsideClick);
    } else {
      console.warn('CartQuantityWrapper: icon or content not found');
    }
  }

  disconnectedCallback() {
    if (this.icon) this.icon.removeEventListener('click', this.handleIconClick);
    document.removeEventListener('click', this.handleOutsideClick);
  }

  handleIconClick(event) {
    event.stopPropagation();
    this.content.classList.toggle('active');
  }

  handleOutsideClick(event) {
    if (!this.contains(event.target)) {
      this.content.classList.remove('active');
    }
  }
}

customElements.define('quantity-wrapper', CartQuantityWrapper);

class SwatchesDrag extends HTMLDivElement {
  constructor() {
    super();
    this.section = this.closest('section');
    this.productCard = this.closest('[data-product-card]');
    this.init();
  }

  init() {
    if (this.productCard) this.bindVariantImageEvents();
  }

  bindVariantImageEvents() {
    const variantItems = this.productCard.querySelectorAll('[data-variant-id]');
    const variantSwatches = this.productCard.querySelectorAll('[data-variant-swatches]');
    const variantImages = this.productCard.querySelectorAll('[data-variant-image]');
    const featuredImage = this.productCard.querySelector('[data-featured-image] img');
    variantItems.forEach((item) => {
      item.addEventListener('click', () => {
        variantSwatches.forEach((swatch) => swatch.classList.remove('active'));
        item.closest('[data-variant-swatches]').classList.add('active');
        // Remove 'active' class from all variant images
        variantImages.forEach((image) => image.classList.remove('active'));
        // Add 'active' class to the selected variant image or fallback to the featured image
        const selectedImage = this.productCard.querySelector(`[data-variant-image="${item.dataset.variantId}"]`);
        if (selectedImage) {
          selectedImage.classList.add('active');
          featuredImage.classList.remove('active');
        } else {
          featuredImage.classList.add('active');
        }
        // (selectedImage || featuredImage)?.classList.add('active');
      });
    });
  }
}
customElements.define('swatches-drag', SwatchesDrag, { extends: 'div' });

class VariantSelects extends HTMLElement {
  constructor() {
    super();
  }

  connectedCallback() {
    this.addEventListener('change', (event) => {
      const target = this.getInputForEventTarget(event.target);
      this.updateSelectionMetadata(event);

      publish(PUB_SUB_EVENTS.optionValueSelectionChange, {
        data: {
          event,
          target,
          selectedOptionValues: this.selectedOptionValues,
        },
      });
    });
  }

  updateSelectionMetadata({ target }) {
    const { value, tagName } = target;
    if (tagName === 'SELECT' && target.selectedOptions.length) {
      Array.from(target.options)
        .find((option) => option.getAttribute('selected'))
        .removeAttribute('selected');
      target.selectedOptions[0].setAttribute('selected', 'selected');

      const swatchValue = target.selectedOptions[0].dataset.optionSwatchValue;
      const selectedDropdownSwatchValue = target
        .closest('.product-variant-group')
        .querySelector('[data-selected-value] > .swatch');
      if (!selectedDropdownSwatchValue) return;
      if (swatchValue) {
        selectedDropdownSwatchValue.style.setProperty('--swatch--background', swatchValue);
        selectedDropdownSwatchValue.classList.remove('swatch--unavailable');
      } else {
        selectedDropdownSwatchValue.style.setProperty('--swatch--background', 'unset');
        selectedDropdownSwatchValue.classList.add('swatch--unavailable');
      }

      selectedDropdownSwatchValue.style.setProperty(
        '--swatch-focal-point',
        target.selectedOptions[0].dataset.optionSwatchFocalPoint || 'unset'
      );
    } else if (tagName === 'INPUT' && target.type === 'radio') {
      const selectedSwatchValue = target.closest(`.product-variant-group`).querySelector('[data-selected-value]');
      if (selectedSwatchValue) selectedSwatchValue.innerHTML = value;
    }
  }

  getInputForEventTarget(target) {
    return target.tagName === 'SELECT' ? target.selectedOptions[0] : target;
  }

  get selectedOptionValues() {
    return Array.from(this.querySelectorAll('select option[selected], fieldset input:checked')).map(
      ({ dataset }) => dataset.optionValueId
    );
  }
}

customElements.define('variant-selects', VariantSelects);

class BestCategories extends HTMLElement {
  constructor() {
    super();
    this.leftSlideContainer = this.querySelector('[data-categories-left]');
    this.rightSlideContainer = this.querySelector('[data-categories-right]');
    this.mainVerticalSlideContainer = this.querySelector('[data-main-vertical]');
    this.setionID = this.mainVerticalSlideContainer.dataset.sectionId;
    this.sliders = {
      left: null,
      right: null,
      main: null,
    };

    this.initializeSliders();
  }

  initializeSliders() {
    this.sliders.main = this.createSlider(
      this.mainVerticalSlideContainer,
      {
        loop: false,
        speed: 800,
        direction: 'horizontal',
        centeredSlides: false,
        spaceBetween: 15,
        focusOnSelect: true,
        slidesPerView: 1.4,
        freeMode: false,
        navigation: {
          enabled: true,
          nextEl: `.swiper-button-next-${this.setionID}`,
          prevEl: `.swiper-button-prev-${this.setionID}`,
        },
        breakpoints: {
          768: {
            centeredSlides: true,
            verticalSwiping: true,
            direction: 'vertical',
            initialSlide: 1,
            slidesPerView: 3,
          },
        },
      },
      () => this.syncSliders('main')
    );

    this.sliders.left = this.createSlider(
      this.leftSlideContainer,
      {
        effect: 'cards',
        loop: false,
        grabCursor: true,
        thumbs: {
          swiper: this.sliders.main,
        },
        breakpoints: {
          768: {
            initialSlide: 1,
          },
        },
      },
      () => this.syncSliders('left')
    );

    this.sliders.right = this.createSlider(
      this.rightSlideContainer,
      {
        effect: 'cards',
        loop: false,
        grabCursor: true,
        breakpoints: {
          768: {
            initialSlide: 1,
          },
        },
      },
      () => this.syncSliders('right')
    );
  }

  createSlider(container, options, onSlideChange) {
    if (!container) return null;

    const slider = new Swiper(container, options);
    if (onSlideChange) {
      slider.on('slideChange', onSlideChange);
    }
    return slider;
  }

  syncSliders(source) {
    const activeIndex = this.sliders[source]?.activeIndex;
    if (activeIndex === undefined) return;

    for (const [key, slider] of Object.entries(this.sliders)) {
      if (key !== source && slider && slider.activeIndex !== activeIndex) {
        slider.slideTo(activeIndex);
      }
    }
  }

  disconnectedCallback() {
    Object.values(this.sliders).forEach((slider) => {
      if (slider) {
        slider.destroy(true, true);
      }
    });
    this.sliders = { left: null, right: null, main: null };
  }
}
customElements.define('best-categories', BestCategories);

class HTMLUpdateUtility {
  static viewTransition(oldNode, newContent, preProcessCallbacks = [], postProcessCallbacks = []) {
    preProcessCallbacks?.forEach((callback) => callback(newContent));

    const newNodeWrapper = document.createElement('div');
    HTMLUpdateUtility.setInnerHTML(newNodeWrapper, newContent.outerHTML);
    const newNode = newNodeWrapper.firstChild;

    const uniqueKey = Date.now();
    oldNode.querySelectorAll('[id], [form]').forEach((element) => {
      element.id && (element.id = `${element.id}-${uniqueKey}`);
      element.form && element.setAttribute('form', `${element.form.getAttribute('id')}-${uniqueKey}`);
    });

    oldNode.parentNode.insertBefore(newNode, oldNode);
    oldNode.style.display = 'none';

    postProcessCallbacks?.forEach((callback) => callback(newNode));

    setTimeout(() => oldNode.remove(), 500);
  }

  static setInnerHTML(element, html) {
    element.innerHTML = html;
    element.querySelectorAll('script').forEach((oldScriptTag) => {
      const newScriptTag = document.createElement('script');
      Array.from(oldScriptTag.attributes).forEach((attribute) => {
        newScriptTag.setAttribute(attribute.name, attribute.value);
      });
      newScriptTag.appendChild(document.createTextNode(oldScriptTag.innerHTML));
      oldScriptTag.parentNode.replaceChild(newScriptTag, oldScriptTag);
    });
  }
}

if (!customElements.get('product-info')) {
  customElements.define(
    'product-info',
    class ProductInfo extends HTMLElement {
      quantityInput = undefined;
      quantityForm = undefined;
      onVariantChangeUnsubscriber = undefined;
      cartUpdateUnsubscriber = undefined;
      abortController = undefined;
      pendingRequestUrl = null;
      preProcessHtmlCallbacks = [];
      postProcessHtmlCallbacks = [];

      constructor() {
        super();
        this.quantityInput = this.querySelector('.quantity-input');
      }

      connectedCallback() {
        this.initializeProductSwapUtility();

        this.onVariantChangeUnsubscriber = subscribe(
          PUB_SUB_EVENTS.optionValueSelectionChange,
          this.handleOptionValueChange.bind(this)
        );
        this.initQuantityHandlers();
        this.dispatchEvent(new CustomEvent('product-info:loaded', { bubbles: true }));
      }

      addPreProcessCallback(callback) {
        this.preProcessHtmlCallbacks.push(callback);
      }

      initQuantityHandlers() {
        if (!this.quantityInput) return;

        this.quantityForm = this.querySelector('.product-quantity');
        if (!this.quantityForm) return;

        this.setQuantityBoundries();
        if (!this.dataset.originalSection) {
          this.cartUpdateUnsubscriber = subscribe(PUB_SUB_EVENTS.cartUpdate, this.fetchQuantityRules.bind(this));
        }
      }

      disconnectedCallback() {
        this.onVariantChangeUnsubscriber();
        this.cartUpdateUnsubscriber?.();
      }

      initializeProductSwapUtility() {
        this.preProcessHtmlCallbacks.push((html) =>
          html.querySelectorAll('.scroll-trigger').forEach((element) => element.classList.add('scroll-trigger--cancel'))
        );
        this.postProcessHtmlCallbacks.push((newNode) => {
          window?.Shopify?.PaymentButton?.init();
          window?.ProductModel?.loadShopifyXR();
        });
      }

      handleOptionValueChange({ data: { event, target, selectedOptionValues } }) {
        if (!this.contains(event.target)) return;
        this.resetProductFormState();
        const productUrl = target.dataset.productUrl || this.pendingRequestUrl || this.dataset.url;
        this.pendingRequestUrl = productUrl;
        const shouldSwapProduct = this.dataset.url !== productUrl;
        const shouldFetchFullPage = this.dataset.updateUrl === 'true' && shouldSwapProduct;

        this.renderProductInfo({
          requestUrl: this.buildRequestUrlWithParams(productUrl, selectedOptionValues, shouldFetchFullPage),
          targetId: target.id,
          callback: shouldSwapProduct
            ? this.handleSwapProduct(productUrl, shouldFetchFullPage)
            : this.handleUpdateProductInfo(productUrl),
        });
      }

      resetProductFormState() {
        const productForm = this.productForm;
        productForm?.toggleSubmitButton(true);
        productForm?.handleErrorMessage();
      }

      handleSwapProduct(productUrl, updateFullPage) {
        return (html) => {
          this.productModal?.remove();

          const isQuickView = this.closest('quick-view-drawer');
          const isFeaturedProduct = this.dataset.source === 'featured-product';
          const selector = updateFullPage ? "product-info[id^='main-product']" : 'product-info';

          const updatePageTitle = () => {
            const newTitle = html.querySelector('head title')?.innerHTML;
            if (newTitle) {
              document.querySelector('head title').innerHTML = newTitle;
            }
          };

          const performViewTransition = (targetSelector, sourceSelector) => {
            const targetElement = document.querySelector(targetSelector);
            const sourceElement = html.querySelector(sourceSelector);
            if (targetElement && sourceElement) {
              HTMLUpdateUtility.viewTransition(
                targetElement,
                sourceElement,
                this.preProcessHtmlCallbacks,
                this.postProcessHtmlCallbacks
              );
            }
          };

          if (!isQuickView && !isFeaturedProduct) {
            const variant = this.getSelectedVariant(html.querySelector(selector));
            this.updateURL(productUrl, variant?.id);

            if (updateFullPage) {
              updatePageTitle();
              performViewTransition('main', 'main');
            } else {
              performViewTransition(this, 'product-info');
            }
          } else if (isFeaturedProduct) {
            if (updateFullPage) {
              performViewTransition('[featured-product-wrapper]', '[featured-product-wrapper]');
            } else {
              performViewTransition(this, 'product-info');
            }
          } else {
            if (updateFullPage) {
              performViewTransition('[quickview-drawer-content]', '[quickview-drawer-content]');
            } else {
              performViewTransition(this, 'product-info');
            }
          }
        };
      }

      renderProductInfo({ requestUrl, targetId, callback }) {
        this.abortController?.abort();
        this.abortController = new AbortController();

        fetch(requestUrl, { signal: this.abortController.signal })
          .then((response) => response.text())
          .then((responseText) => {
            this.pendingRequestUrl = null;
            const html = new DOMParser().parseFromString(responseText, 'text/html');
            callback(html);
          })
          .then(() => {
            document.querySelector(`#${targetId}`)?.focus();
          })
          .catch((error) => {
            if (error.name === 'AbortError') {
              console.log('Fetch aborted by user');
            } else {
              console.error(error);
            }
          });
      }

      getSelectedVariant(productInfoNode) {
        const selectedVariant = productInfoNode.querySelector('variant-selects [data-selected-variant]')?.innerHTML;
        return !!selectedVariant ? JSON.parse(selectedVariant) : null;
      }

      buildRequestUrlWithParams(url, optionValues, shouldFetchFullPage = false) {
        const params = [];

        !shouldFetchFullPage && params.push(`section_id=${this.sectionId}`);

        if (optionValues.length) {
          params.push(`option_values=${optionValues.join(',')}`);
        }

        return `${url}?${params.join('&')}`;
      }

      updateOptionValues(html) {
        const variantSelects = html.querySelector('variant-selects');
        if (variantSelects) {
          HTMLUpdateUtility.viewTransition(this.variantSelectors, variantSelects, this.preProcessHtmlCallbacks);
        }
      }

      handleUpdateProductInfo(productUrl) {
        return (html) => {
          const variant = this.getSelectedVariant(html);
          // this.pickupAvailability?.update(variant, html.getElementById(`pickup-availability-wraper-${this.sectionId}`));
          this.updateOptionValues(html);
          if (!this.closest('quick-view-drawer') && this.dataset.source != 'featured-product') {
            this.updateURL(productUrl, variant?.id);
          }
          this.updateVariantInputs(variant?.id);

          if (!variant) {
            this.setUnavailable();
            return;
          }


          this.updateMedia(html, variant?.featured_media?.id);

          const updateSourceFromDestination = (id, shouldHide = (source) => false) => {
            const source = html.getElementById(`${id}-${this.sectionId}`);
            const destination = this.querySelector(`#${id}-${this.dataset.section}`);
            if (source && destination) {
              destination.innerHTML = source.innerHTML;
              destination.classList.toggle('hidden', shouldHide(source));
            }
          };

          updateSourceFromDestination('pickup-availability-wraper');
          updateSourceFromDestination('price');
          updateSourceFromDestination('back-in-stock-wrapper');
          updateSourceFromDestination('sku-wrapper', ({ classList }) => classList.contains('hidden'));
          updateSourceFromDestination('product-inventory-wrapper', ({ innerText }) => innerText === '');
          updateSourceFromDestination('Volume');
          updateSourceFromDestination('PricePerItem', ({ classList }) => classList.contains('hidden'));

          if (!variant.available) {
            const get_back_in_stock = this.querySelector(`#back-in-stock-wrapper-${this.dataset.section}`);
            if (get_back_in_stock) {
              get_back_in_stock.classList.remove('hidden');
            }
          } else {
            const get_back_in_stock = this.querySelector(`#back-in-stock-wrapper-${this.dataset.section}`);
            if (get_back_in_stock) {
              get_back_in_stock.classList.add('hidden');
            }
          }


          this.updateQuantityRules(this.sectionId, html);
          this.querySelector(`#QuantityRules-${this.dataset.section}`)?.classList.remove('hidden');
          this.querySelector(`#Volume-Note-${this.dataset.section}`)?.classList.remove('hidden');

          this.productForm?.toggleSubmitButton(
            html.getElementById(`product-submit-btn-${this.sectionId}`)?.hasAttribute('disabled') ?? true,
            window.variantStrings.soldOut,
            html.getElementById(`product-submit-btn-${this.sectionId}`)?.hasAttribute('data-pre-order') ?? true
          );

          publish(PUB_SUB_EVENTS.variantChange, {
            data: {
              sectionId: this.sectionId,
              html,
              variant,
            },
          });
        };
      }

      updateVariantInputs(variantId) {
        this.querySelectorAll(
          `#main-product-form-${this.dataset.section}, #product-form-installment-${this.dataset.section}`
        ).forEach((productForm) => {
          const input = productForm.querySelector('input[name="id"]');
          input.value = variantId ?? '';
          input.dispatchEvent(new Event('change', { bubbles: true }));
        });
      }

      updateURL(url, variantId) {
        this.querySelector('share-button')?.updateUrl(
          `${window.shopUrl}${url}${variantId ? `?variant=${variantId}` : ''}`
        );

        if (this.dataset.updateUrl === 'false') return;
        window.history.replaceState({}, '', `${url}${variantId ? `?variant=${variantId}` : ''}`);
      }

      setUnavailable() {
        this.productForm?.toggleSubmitButton(true, window.variantStrings.unavailable);

        const selectors = ['price', 'Inventory', 'Sku', 'Price-Per-Item', 'Volume-Note', 'Volume', 'Quantity-Rules', 'back-in-stock-wrapper']
          .map((id) => `#${id}-${this.dataset.section}`)
          .join(', ');
        document.querySelectorAll(selectors).forEach(({ classList }) => classList.add('hidden'));
      }

      updateMedia(html, variantFeaturedMediaId) {
        if (!variantFeaturedMediaId) return;
        this.sectionElement = this.closest('section');
        const productMediaGallery = this.sectionElement.querySelector('product-media-gallery');
        if (productMediaGallery) {
          const productMediaLayout = productMediaGallery.dataset.mediaGalleryStyle;
          const newMediaElement = productMediaGallery.querySelector(
            `[data-media-id="${this.dataset.section}-${variantFeaturedMediaId}"]`
          );
          const checkMediaQuery = window.matchMedia('(max-width: 991px)');
          if (newMediaElement) {
            if (productMediaLayout == 'media-grid' && !checkMediaQuery.matches) {
              const mainMediaContainer = productMediaGallery.querySelector('[data-main-media]');
              const mediaWrapper = mainMediaContainer.querySelector('.swiper-wrapper');
              const totalMediaItems = mediaWrapper.children.length;
              const firstMediaItem = mediaWrapper.firstChild;
              if (totalMediaItems > 1) {
                mediaWrapper.insertBefore(newMediaElement, firstMediaItem);
              }
            } else {
              const slideIndex = parseInt(newMediaElement.getAttribute('data-swiper-slide-index'));
              if (!isNaN(slideIndex)) {
                productMediaGallery.selectSlideByIndex(slideIndex);
              }
            }
          }
        }
      }

      setQuantityBoundries() {
        const data = {
          cartQuantity: this.quantityInput.dataset.cartQuantity ? parseInt(this.quantityInput.dataset.cartQuantity) : 0,
          min: this.quantityInput.dataset.min ? parseInt(this.quantityInput.dataset.min) : 1,
          max: this.quantityInput.dataset.max ? parseInt(this.quantityInput.dataset.max) : null,
          step: this.quantityInput.step ? parseInt(this.quantityInput.step) : 1,
        };

        let min = data.min;
        const max = data.max === null ? data.max : data.max - data.cartQuantity;
        if (max !== null) min = Math.min(min, max);
        if (data.cartQuantity >= data.min) min = Math.min(min, data.step);

        this.quantityInput.min = min;

        if (max) {
          this.quantityInput.max = max;
        } else {
          this.quantityInput.removeAttribute('max');
        }
        this.quantityInput.value = min;

        publish(PUB_SUB_EVENTS.quantityUpdate, undefined);
      }

      fetchQuantityRules() {
        const currentVariantId = this.productForm?.variantIdInput?.value;
        if (!currentVariantId) return;

        this.querySelector('.quantity__rules-cart .loading__spinner').classList.remove('hidden');
        fetch(`${this.dataset.url}?variant=${currentVariantId}&section_id=${this.dataset.section}`)
          .then((response) => response.text())
          .then((responseText) => {
            const html = new DOMParser().parseFromString(responseText, 'text/html');
            console.log('working html');
            this.updateQuantityRules(this.dataset.section, html);
          })
          .catch((e) => console.error(e))
          .finally(() => this.querySelector('.quantity__rules-cart .loading__spinner').classList.add('hidden'));
      }

      updateQuantityRules(sectionId, html) {
        if (!this.quantityInput) return;
        console.log('call function');
        this.setQuantityBoundries();
        const quantityFormUpdated = html.getElementById(`quantity-main-product-${sectionId}`);
        const selectors = ['.quantity-input', '.quantity__rules'];
        for (let selector of selectors) {
          const current = this.quantityForm.querySelector(selector);
          const updated = quantityFormUpdated.querySelector(selector);
          if (!current || !updated) continue;
          console.log(selector);
          if (selector === '.quantity-input') {
            const attributes = ['data-cart-quantity', 'data-min', 'min', 'max', 'data-max', 'step', 'value'];
            for (let attribute of attributes) {
              const valueUpdated = updated.getAttribute(attribute);
              if (attribute === 'value' && valueUpdated !== null) {
                current.value = valueUpdated;
                current.dispatchEvent(new Event('input', { bubbles: true }));
                current.dispatchEvent(new Event('change', { bubbles: true }));
              } else {
                if (valueUpdated !== null) {
                  current.setAttribute(attribute, valueUpdated);
                } else {
                  current.removeAttribute(attribute);
                }
              }
            }
          } else {
            current.innerHTML = updated.innerHTML;
          }
        }
      }

      get productForm() {
        return this.querySelector(`product-form`);
      }

      get productModal() {
        return document.querySelector(`#ProductModal-${this.dataset.section}`);
      }

      // get pickupAvailability() {
      //   return this.querySelector(`pickup-availability`);
      // }

      get variantSelectors() {
        return this.querySelector('variant-selects');
      }

      get relatedProducts() {
        const relatedProductsSectionId = SectionId.getIdForSection(
          SectionId.parseId(this.sectionId),
          'related-products'
        );
        return document.querySelector(`product-recommendations[data-section-id^="${relatedProductsSectionId}"]`);
      }

      get quickOrderList() {
        const quickOrderListSectionId = SectionId.getIdForSection(
          SectionId.parseId(this.sectionId),
          'quick_order_list'
        );
        return document.querySelector(`quick-order-list[data-id^="${quickOrderListSectionId}"]`);
      }

      get sectionId() {
        return this.dataset.originalSection || this.dataset.section;
      }
    }
  );
}

class RecipientForm extends HTMLElement {
  constructor() {
    super();

    // Query elements
    this.elementForms = this.querySelector('[data-recipient-form]');
    this.recipientFieldsLiveRegion = this.querySelector(`#Recipient-fields-live-region-${this.dataset.sectionId}`);
    this.checkboxInput = this.querySelector(`#Recipient-checkbox-${this.dataset.sectionId}`);
    this.hiddenControlField = this.querySelector(`#Recipient-control-${this.dataset.sectionId}`);
    this.emailInput = this.querySelector(`#Recipient-email-${this.dataset.sectionId}`);
    this.nameInput = this.querySelector(`#Recipient-name-${this.dataset.sectionId}`);
    this.messageInput = this.querySelector(`#Recipient-message-${this.dataset.sectionId}`);
    this.sendonInput = this.querySelector(`#Recipient-send-on-${this.dataset.sectionId}`);
    this.offsetProperty = this.querySelector(`#Recipient-timezone-offset-${this.dataset.sectionId}`);

    // Initialize default states
    if (this.checkboxInput) this.checkboxInput.disabled = false;
    if (this.hiddenControlField) this.hiddenControlField.disabled = true;
    if (this.offsetProperty) this.offsetProperty.value = new Date().getTimezoneOffset().toString();

    // Error message elements
    this.errorMessageWrapper = this.querySelector('[data-error-message]');
    this.errorMessageList = this.errorMessageWrapper?.querySelector('ul');
    this.errorMessage = this.errorMessageWrapper?.querySelector('[data-error-field]');
    this.defaultErrorHeader = this.errorMessage?.innerText;
    this.currentProductVariantId = this.dataset.productVariantId;

    // Bind methods
    this.handleCheckboxClick = this.handleCheckboxClick.bind(this);
    this.onChange = this.onChange.bind(this);

    // Add listeners
    this.addEventListener('change', this.onChange);
    this.handleCheckboxClick();
  }

  // Subscribers for events
  cartUpdateUnsubscriber = undefined;
  variantChangeUnsubscriber = undefined;
  cartErrorUnsubscriber = undefined;

  connectedCallback() {
    // Subscribe to cart updates
    this.cartUpdateUnsubscriber = subscribe(PUB_SUB_EVENTS.cartUpdate, (event) => {
      if (event.source === 'product-form' && event.productVariantId.toString() === this.currentProductVariantId) {
        this.resetRecipientForm();
      }
    });

    // Subscribe to variant changes
    this.variantChangeUnsubscriber = subscribe(PUB_SUB_EVENTS.variantChange, (event) => {
      if (event.data.sectionId === this.dataset.sectionId) {
        this.currentProductVariantId = event.data.variant.id.toString();
      }
    });

    // Subscribe to cart errors
    this.cartErrorUnsubscriber = subscribe(PUB_SUB_EVENTS.cartError, (event) => {
      if (event.source === 'product-form' && event.productVariantId.toString() === this.currentProductVariantId) {
        this.displayErrorMessage(event.message, event.errors);
      }
    });

    // Add checkbox listener
    this.checkboxInput?.addEventListener('click', this.handleCheckboxClick);
  }

  disconnectedCallback() {
    // Unsubscribe from all events
    this.cartUpdateUnsubscriber?.();
    this.variantChangeUnsubscriber?.();
    this.cartErrorUnsubscriber?.();
  }

  handleCheckboxClick() {
    if (this.checkboxInput?.checked) {
      DOMAnimations.slideDown(this.elementForms);
      this.classList.add('active');
    } else {
      DOMAnimations.slideUp(this.elementForms);
      this.classList.remove('active');
    }
  }

  onChange() {
    if (this.checkboxInput?.checked) {
      this.enableInputFields();
      this.recipientFieldsLiveRegion.innerText = window.accessibilityStrings.recipientFormExpanded;
      this.classList.add('active');
    } else {
      this.clearInputFields();
      this.disableInputFields();
      this.clearErrorMessage();
      this.recipientFieldsLiveRegion.innerText = window.accessibilityStrings.recipientFormCollapsed;
    }
  }

  // Get all input fields
  inputFields() {
    return [this.emailInput, this.nameInput, this.messageInput, this.sendonInput];
  }

  // Get all disableable fields
  disableableFields() {
    return [...this.inputFields(), this.offsetProperty];
  }

  clearInputFields() {
    this.inputFields().forEach((field) => {
      if (field) field.value = '';
    });
  }

  enableInputFields() {
    this.disableableFields().forEach((field) => {
      if (field) field.disabled = false;
    });
  }

  disableInputFields() {
    this.disableableFields().forEach((field) => {
      if (field) field.disabled = true;
    });
  }

  displayErrorMessage(title, body) {
    this.clearErrorMessage();
    if (!this.errorMessageWrapper) return;

    this.errorMessageWrapper.classList.remove('hidden');
    if (typeof body === 'object') {
      Object.entries(body).forEach(([key, value]) => {
        const errorMessageId = `RecipientForm-${key}-error-${this.dataset.sectionId}`;
        const fieldSelector = `#Recipient-${key}-${this.dataset.sectionId}`;
        const message = value.join(', ');

        const errorMessageElement = this.querySelector(`#${errorMessageId}`);
        const errorTextElement = errorMessageElement?.querySelector('.error-message');
        if (!errorTextElement) return;

        if (this.errorMessageList) {
          this.errorMessageList.appendChild(this.createErrorListItem(fieldSelector, message));
        }

        errorTextElement.innerText = message;
        errorMessageElement.classList.remove('hidden');

        const inputElement = this[`${key}Input`];
        if (inputElement) {
          inputElement.setAttribute('aria-invalid', true);
          inputElement.setAttribute('aria-describedby', errorMessageId);
        }
      });
    } else {
      this.errorMessage.innerText = body;
    }
  }

  createErrorListItem(target, message) {
    const li = document.createElement('li');
    const a = document.createElement('a');
    a.setAttribute('href', target);
    a.innerText = message;
    li.appendChild(a);
    li.className = 'error-message';
    return li;
  }

  clearErrorMessage() {
    if (!this.errorMessageWrapper) return;
    this.errorMessageWrapper.classList.add('hidden');
    if (this.errorMessageList) this.errorMessageList.innerHTML = '';

    this.querySelectorAll('.recipient-form--field .form__message').forEach((field) => {
      field.classList.add('hidden');
      const textField = field.querySelector('.error-message');
      if (textField) textField.innerText = '';
    });

    this.inputFields().forEach((input) => {
      if (input) {
        input.setAttribute('aria-invalid', false);
        input.removeAttribute('aria-describedby');
      }
    });
  }

  resetRecipientForm() {
    if (this.checkboxInput?.checked) {
      this.checkboxInput.checked = false;
      this.clearInputFields();
      this.clearErrorMessage();
      this.handleCheckboxClick();
    }
  }
}

customElements.define('recipient-form', RecipientForm);

class ProductForm extends HTMLElement {
  constructor() {
    super(), (this.form = this.querySelector('form'));
    this.form.querySelector('[name=id]').disabled = false;
    this.form.addEventListener('submit', this.onSubmitHandler.bind(this));
    this.cart = document.querySelector('cart-drawer');
    this.submitButton = this.querySelector('[type="submit"]');
    this.submitButtonText = this.submitButton.querySelector('span');
    if (document.querySelector('cart-drawer')) this.submitButton.setAttribute('aria-haspopup', 'dialog');
    this.hideErrors = this.dataset.hideErrors === 'true';
  }
  onSubmitHandler(event) {
    event.preventDefault();
    if (this.submitButton.getAttribute('aria-disabled') === 'true') return;
    this.handleErrorMessage();
    this.submitButton.setAttribute('aria-disabled', true);
    this.submitButton.classList.add('loading');
    if (this.cart) {
      this.cart.dataset.oncloseFocus = `product-form [data-button="${this.submitButton.dataset.button}"]`;
    }
    const config = fetchConfig('javascript');
    config.headers['X-Requested-With'] = 'XMLHttpRequest';
    delete config.headers['Content-Type'];

    const formData = new FormData(this.form);
    if (this.cart) {
      formData.append(
        'sections',
        this.cart.getSectionsToRender().map((section) => section.section)
      );
      formData.append('sections_url', window.location.pathname);
      this.cart.setActiveElement(document.activeElement);
    }
    config.body = formData;

    fetch(`${routes.cart_add_url}`, config)
      .then((response) => response.json())
      .then((response) => {
        if (response.status) {
          publish(PUB_SUB_EVENTS.cartError, {
            source: 'product-form',
            productVariantId: formData.get('id'),
            errors: response.errors || response.description,
            message: response.message,
          });
          this.handleErrorMessage(response.description);
          const soldOutMessage = this.submitButton.querySelector('.sold-out-message');
          if (!soldOutMessage) return;
          this.submitButton.setAttribute('aria-disabled', true);
          this.submitButtonText.classList.add('hidden');
          soldOutMessage.classList.remove('hidden');
          this.error = true;
          return;
        } else if (!this.cart) {
          window.location = window.routes.cart_url;
          return;
        }
        if (!this.error)
          publish(PUB_SUB_EVENTS.cartUpdate, {
            source: 'product-form',
            productVariantId: formData.get('id'),
            cartData: response,
          });
        this.error = false;
        const quickViewDrawer = this.closest('quick-view-drawer');
        if (quickViewDrawer) {
          // this.closest('[data-drawer="quick-view-drawer"]').querySelector('[data-drawer-close]').click();
          this.closest('[data-drawer="quick-view-drawer"]').classList.remove('open', 'shadow');
          document.body.classList.remove('overflow-hidden', 'body-overlay');
          setTimeout(() => {
            this.cart.renderContents(response);
            this.cart.querySelector('[data-drawer-close]').focus();
          }, 200);
        } else {
          this.cart.renderContents(response);
          this.cart.querySelector('[data-drawer-close]').focus();
        }
      })
      .catch((e) => {
        console.error(e);
      })
      .finally(() => {
        this.submitButton.classList.remove('loading');
        if (this.cart && this.cart.classList.contains('is-empty')) this.cart.classList.remove('is-empty');
        if (!this.error) this.submitButton.removeAttribute('aria-disabled');
      });
  }
  handleErrorMessage(errorMessage = false) {
    if (this.hideErrors) return;

    this.errorMessageWrapper = this.errorMessageWrapper || this.querySelector('[data-add-cart-error]');

    if (!this.errorMessageWrapper) return;

    if (typeof errorMessage === 'object' && !Array.isArray(errorMessage)) return;

    this.errorMessageWrapper.classList.toggle('hidden', !errorMessage);

    if (errorMessage) {
      this.errorMessageWrapper.textContent = errorMessage;
    }
  }
  toggleSubmitButton(disable = false, text, preorder = false, unavailable = false) {
    if (!this.submitButton) return;
    this.submitButton.removeAttribute('loading');
    this.submitButton.removeAttribute('unavailable');
    const submitButtonText = this.submitButton.querySelector('[data-atc-text]');
    const submitButtonTextChild = this.submitButton.querySelector('[data-atc-text] span');

    if (disable) {
      this.submitButton.setAttribute('disabled', '');
      if (unavailable) this.submitButton.setAttribute('unavailable', '');

      if (text) {
        (submitButtonTextChild || submitButtonText).textContent = text;
      } else {
        this.submitButton.setAttribute('loading', '');
      }
    } else {
      this.submitButton.removeAttribute('disabled');

      const defaultText = preorder == true ? window.variantStrings.preOrder : window.variantStrings.addToCart;
      (submitButtonTextChild || submitButtonText).textContent = defaultText;
    }
  }
}
customElements.define('product-form', ProductForm);

class MediaZoomButton extends HTMLElement {
  constructor() {
    super();
    this.section = this.closest('.shopify-section');
    this.imageId = this.dataset.image;
    this.sectionId = this.dataset.section;
    this.mediaContainer = this.section?.querySelector('[data-product-media-content]');

    if (!this.mediaContainer) return;

    this.template = this.mediaContainer.querySelector('template');
    if (!this.template) return;

    this.addEventListener('click', this.openMediaPopup.bind(this));
  }

  openMediaPopup() {
    const mediaContent = this.template.content.firstElementChild.cloneNode(true);
    document.body.appendChild(mediaContent);

    this.popup = document.querySelector(`#product-media-${this.sectionId}`);
    if (!this.popup) return;

    setTimeout(() => {
      const mediaElement = this.popup.querySelector(`[data-media-id="${this.imageId}"]`);
      if (mediaElement) {
        const slideIndex = parseInt(mediaElement.getAttribute('data-swiper-slide-index'), 10);
        this.popup.querySelector('swiper-slideshow')?._selectSlide(slideIndex);
      }

      setTimeout(() => {
        this.popup.classList.add('open');
        document.body.classList.add('overflow-hidden');
      }, 400);
    }, 200);
  }
}

customElements.define('media-zoom-button', MediaZoomButton);

class productVideoPopup extends HTMLElement {
  constructor() {
    super();
    this.close = this.querySelector('[data-close-popup]');
    if (this.close) {
      this.close.addEventListener('click', () => this.closepopup());
    }
  }
  closepopup() {
    this.remove();
  }
}
customElements.define('product-video-popup', productVideoPopup);

class ProductMediaPopupModal extends HTMLElement {
  constructor() {
    super();
  }
  connectedCallback() {
    this.closeOutsite = this.querySelector('[data-close-drawer]');
    this.closeBtn = this.querySelector('[data-drawer-close]');

    if (this.closeBtn) {
      this.closeBtn.addEventListener('click', () => this.closeMediaPopup());
    }
    if (this.closeOutsite) {
      this.closeOutsite.addEventListener('click', () => this.closeMediaPopup());
    }

    this.addEventListener('click', (e) => {
      if (e.target.closest('img') || e.target.closest('.slideshow-nav-btn') || e.target.closest('[data-drawer-close]')) return;
      this.closeMediaPopup();
    });
  }

  disconnectedCallback() {
    if (this.closeBtn) {
      this.closeBtn.removeEventListener('click', () => this.closeMediaPopup());
    }
    if (this.closeOutsite) {
      this.closeOutsite.removeEventListener('click', () => this.closeMediaPopup());
    }
  }

  closeMediaPopup() {
    setTimeout(() => {
      this.remove();
    }, 500);
  }
}

customElements.define('product-media-popup-modal', ProductMediaPopupModal);

class SizeChartTrigger extends HTMLElement {
  constructor() {
    super();
    this.sectionId = this.dataset.section;
    this.sizeChartContainer = this.querySelector('[data-size-chart-content]');

    if (!this.sizeChartContainer) return;

    this.template = this.sizeChartContainer.querySelector('template');
    if (!this.template) return;

    this.addEventListener('click', this.openSizeChartPopup.bind(this));
  }

  openSizeChartPopup() {
    const sizeChartContent = this.template.content.firstElementChild.cloneNode(true);
    document.body.appendChild(sizeChartContent);

    this.popup = document.querySelector(`#size-chart-${this.sectionId}`);
    if (!this.popup) return;

    setTimeout(() => {
      this.popup.classList.add('open');
      document.body.classList.add('overflow-hidden');
      setTimeout(() => {
        //   const closeButton = this.popup.querySelector('[data-drawer-close] button');
        // if (closeButton) {
        //     closeButton.focus();
        // }
        this.popup.querySelector('button').focus();
        trapFocus(this.popup);
      }, 400);
    }, 400);
  }
}
customElements.define('size-chart-trigger', SizeChartTrigger);

class SizeChartPopup extends HTMLElement {
  constructor() {
    super();
  }
  connectedCallback() {
    this.closeOutsite = this.querySelector('[data-close-drawer]');
    this.closeBtn = this.querySelector('[data-drawer-close]');

    if (this.closeBtn) {
      this.closeBtn.addEventListener('click', () => this.closeMediaPopup());
    }
    if (this.closeOutsite) {
      this.closeOutsite.addEventListener('click', () => this.closeMediaPopup());
    }
  }

  disconnectedCallback() {
    if (this.closeBtn) {
      this.closeBtn.removeEventListener('click', () => this.closeMediaPopup());
    }
    if (this.closeOutsite) {
      this.closeOutsite.removeEventListener('click', () => this.closeMediaPopup());
    }
  }

  closeMediaPopup() {
    setTimeout(() => {
      this.remove();
    }, 500);
  }
}

customElements.define('size-chart-popup', SizeChartPopup);

class queryform extends HTMLElement {
  constructor() {
    super();
    this.sectionId = this.dataset.section;

    this.queryFormContainer = this.querySelector('[data-query-form-content]');
    if (!this.queryFormContainer) return;

    this.template = this.queryFormContainer.querySelector('template');
    if (!this.template) return;

    this.addEventListener('click', this.handleClick.bind(this));
  }

  handleClick(event) {
    this.openDrawer();
  }

  openDrawer() {
    const queryFormContent = this.template.content.firstElementChild.cloneNode(true);
    document.body.appendChild(queryFormContent);

    this.popup = document.querySelector(`#queryForm-${this.sectionId}`);
    if (!this.popup) return;

    setTimeout(() => {
      this.popup.classList.add('open');
      this.popup.classList.add('shadow');
      document.body.classList.add('overflow-hidden');
      setTimeout(() => {
        //   const closeButton = this.popup.querySelector('[data-drawer-close] button');
        // if (closeButton) {
        //     closeButton.focus();
        // }
        this.popup.querySelector('button').focus();
        trapFocus(this.popup);
      }, 400);
    }, 400);
  }
}

customElements.define('query-form', queryform);

class QueryFormDrawer extends HTMLElement {
  constructor() {
    super();
  }
  connectedCallback() {
    this.closeOutsite = this.querySelector('[data-close-drawer]');
    this.closeBtn = this.querySelector('[data-drawer-close]');

    if (this.closeBtn) {
      this.closeBtn.addEventListener('click', () => this.closeMediaPopup());
    }
    if (this.closeOutsite) {
      this.closeOutsite.addEventListener('click', () => this.closeMediaPopup());
    }
  }

  disconnectedCallback() {
    if (this.closeBtn) {
      this.closeBtn.removeEventListener('click', () => this.closeMediaPopup());
    }
    if (this.closeOutsite) {
      this.closeOutsite.removeEventListener('click', () => this.closeMediaPopup());
    }
  }

  closeMediaPopup() {
    setTimeout(() => {
      const sectionId = this.dataset.sectionId;
      if (sectionId) {
        const getqueryTrigger = document.querySelector(`query-form[data-section="${sectionId}"]`);
        if (getqueryTrigger) {
          const button = getqueryTrigger.querySelector('button');
          if (button) {
            button.focus();
          }
        }
      }
      this.remove();
    }, 500);
  }
}

customElements.define('query-form-drawer', QueryFormDrawer);

class SlideThumbnailVideo extends HTMLElement {
  constructor() {
    super();
    this.drawerSelector = this.getAttribute('data-popup');
    this.videoSrc = this.getAttribute('data-video-url');
    this.drawerElement = document.querySelector('#' + this.drawerSelector);
    this.drawerCloseButton = this.drawerElement?.querySelector('[data-drawer-close]');
    this.contentElement = this.drawerElement?.querySelector('[data-popup-content]');
    this.collapseTrigger = this.querySelector('[data-collapse-trigger]');

    this.addEventListener('click', this.handleClick.bind(this));
    this.querySelector('video-move-effect').addEventListener(
      'keydown',
      (e) => {
        if (e.key === 'Enter') {
          this.handleClick(e);
        }
      },
      true
    );

    if (this.collapseTrigger) {
      this.collapseTrigger.addEventListener('click', (event) => {
        event.stopPropagation();
        this.classList.toggle('collapsed-video');
      });
      this.collapseTrigger.addEventListener('keydown', (event) => {
        if (event.key === 'Enter' || event.key === ' ') {
          event.stopPropagation(); // Prevents page from scrolling if Space is used
          this.classList.toggle('collapsed-video');
        }
      });
    }
  }

  handleClick(event) {
    event.preventDefault();
    this.openDrawer();
  }

  openDrawer() {
    if (!this.drawerElement || !this.videoSrc) return;
    this.setVideoContent();
    this.drawerElement.classList.add('open');
    document.body.classList.add('overflow-hidden');
    setTimeout(() => {
      this.drawerElement.querySelector('button').focus();
      trapFocus(this.drawerElement);
    }, 400);
  }

  setVideoContent() {
    if (this.contentElement) {
      this.contentElement.innerHTML = `
        <video 
          class="popup-video" 
          autoplay 
          muted 
          loop 
          playsinline 
          controls
          data-autoplay="true"
        >
          <source src="${this.videoSrc}" type="video/mp4">
        </video>
      `;
    }
  }
}

customElements.define('slide-thumbnail-video', SlideThumbnailVideo);

class PickupAvailability extends HTMLElement {
  constructor() {
    super();

    if (!this.hasAttribute('available')) return;
    const button = this.querySelector('button');
    if (button) {
      button.addEventListener('click', (evt) => {
        this.fetchAvailability(this.dataset.variantId);
      });
      button.addEventListener('touchend', () => {
        this.fetchAvailability(this.dataset.variantId);
      });
    }
  }

  fetchAvailability(variant_id) {
    const PickupSectionId = this.id;
    let rootUrl = this.dataset.rootUrl;
    if (!rootUrl.endsWith('/')) {
      rootUrl = rootUrl + '/';
    }
    const variantSectionUrl = `${rootUrl}variants/${variant_id}/?section_id=pickup-availability`;
    fetch(variantSectionUrl)
      .then((response) => response.text())
      .then((text) => {
        const sectionInnerHTML = new DOMParser().parseFromString(text, 'text/html').querySelector('.shopify-section');
        const drawer = sectionInnerHTML?.querySelector('pickup-availability-drawer');
        if (drawer) {
          drawer.setAttribute('data-onclose-focus', PickupSectionId);
        }
        this.renderPreview(sectionInnerHTML);
      })
      .catch((e) => { });
  }
  renderPreview(sectionInnerHTML) {
    const drawer = document.querySelector('pickup-availability-drawer');
    if (drawer) drawer.remove();
    document.body.appendChild(sectionInnerHTML.querySelector('pickup-availability-drawer'));
    const pickupDrawer = document.querySelector('pickup-availability-drawer');
    if (pickupDrawer) {
      pickupDrawer.classList.add('open');
      document.body.classList.add('overflow-hidden');
      pickupDrawer.classList.add('shadow');
      setTimeout(() => {
        pickupDrawer.querySelector('button').focus();
        trapFocus(pickupDrawer);
      }, 400);
    }
  }
}
customElements.define('pickup-availability', PickupAvailability);

class ScrollUp extends HTMLElement {
  constructor() {
    super();
    this.currentScrollTop = 0;
    this.scrollButton = this.querySelector('[back-to-top-button]');

    this.headerSection = document.querySelector('[data-header-section]');
    this.mainContent = document.querySelector('.main-content-wrapper');

    this.scrollElement = window;

    this.onScroll = this.onScroll.bind(this);
    this.onClick = this.onClick.bind(this);
    this.handleResize = this.handleResize.bind(this);

    this.setScrollTarget();
    window.addEventListener('resize', this.handleResize);
    this.scrollButton?.addEventListener('click', this.onClick);
  }

  setScrollTarget() {
    (this.scrollElement || window).removeEventListener('scroll', this.onScroll);
    const isSideReveal = this.headerSection?.classList.contains('header-style-side-reveal-menu');
    const isWideScreen = window.innerWidth > 1024;
    this.scrollElement = isSideReveal && isWideScreen ? this.mainContent : window;
    this.scrollElement.addEventListener('scroll', this.onScroll);
  }

  handleResize() {
    this.setScrollTarget();
  }

  onScroll() {
    const scrollTop =
      this.scrollElement === window
        ? window.pageYOffset || document.documentElement.scrollTop
        : this.scrollElement.scrollTop;

    if (scrollTop > 1000) {
      if (scrollTop > this.currentScrollTop) {
        this.scrollButton.classList.add('show');
      }
    } else {
      this.scrollButton.classList.remove('show');
    }

    this.currentScrollTop = scrollTop;
  }

  onClick() {
    this.smoothScrollToTop();
  }

  smoothScrollToTop() {
    const duration = 700;
    const start = this.scrollElement === window ? window.pageYOffset : this.scrollElement.scrollTop;
    const startTime = performance.now();

    const scrollStep = (currentTime) => {
      const timeElapsed = currentTime - startTime;
      const progress = Math.min(timeElapsed / duration, 1);
      const easing = this.easeInOutQuad(progress);
      const newScroll = start - start * easing;

      if (this.scrollElement === window) {
        window.scrollTo(0, newScroll);
      } else {
        this.scrollElement.scrollTop = newScroll;
      }

      if (timeElapsed < duration) {
        requestAnimationFrame(scrollStep);
      }
    };

    requestAnimationFrame(scrollStep);
  }

  easeInOutQuad(t) {
    return t < 0.5 ? 2 * t * t : -1 + (4 - 2 * t) * t;
  }
}

customElements.define('scroll-up', ScrollUp);

class sidebarOfferLink extends HTMLElement {
  constructor() {
    super();
    this.currentScrollTop = 0;
    this.visibility = this.dataset.visibility;

    this.headerSection = document.querySelector('[data-header-section]');
    this.mainContent = document.querySelector('.main-content-wrapper');

    this.scrollElement = window;

    this.onScroll = this.onScroll.bind(this);
    this.handleResize = this.handleResize.bind(this);

    if (this.visibility === 'onscroll') {
      this.setScrollTarget();
      window.addEventListener('resize', this.handleResize);
    }
  }

  setScrollTarget() {
    (this.scrollElement || window).removeEventListener('scroll', this.onScroll);
    const isSideReveal = this.headerSection?.classList.contains('header-style-side-reveal-menu');
    const isWideScreen = window.innerWidth > 1024;

    this.scrollElement = isSideReveal && isWideScreen ? this.mainContent : window;
    this.scrollElement.addEventListener('scroll', this.onScroll);
  }

  handleResize() {
    this.setScrollTarget();
  }

  onScroll() {
    const scrollTop =
      this.scrollElement === window
        ? window.pageYOffset || document.documentElement.scrollTop
        : this.scrollElement.scrollTop;
    if (scrollTop > 1000) {
      if (scrollTop > this.currentScrollTop) {
        this.classList.add('show');
      }
    } else {
      this.classList.remove('show');
    }

    this.currentScrollTop = scrollTop;
  }
}

customElements.define('sidebar-offer-link', sidebarOfferLink);

class CloseDrawer extends HTMLElement {
  constructor() {
    super();
    this.closebutton = this.querySelector('button');
    const closeDrawer = document.querySelectorAll('[data-close-drawer]');
    this.closebutton.addEventListener('click', this.onCloseButtonClick);
    this.closest('[data-drawer]').addEventListener(
      'keyup',
      (evt) => evt.code === 'Escape' && this.onCloseButtonClick(evt)
    );
    closeDrawer.forEach((drawer) => drawer.addEventListener('click', this.onCloseButtonClick));
  }
  onCloseButtonClick(e) {
    e.preventDefault();
    const closestDrawer = this.closest('[data-drawer]');
    const drawerType = closestDrawer?.dataset.drawer;
    // Handle focus restoration based on drawer type
    switch (drawerType) {
      case 'newsletter-drawer': {
        closestDrawer.querySelector('close-drawer button').setAttribute('tabindex', '-1');
        document.querySelector('a.skip-to-content-link').focus();
        break;
      }

      case 'search-drawer': {
        const searchLink = document.querySelector('[data-source="search-drawer"] a');
        if (searchLink) searchLink.focus();
        break;
      }

      case 'cart-drawer': {
      }

      case 'quick-view-drawer': {
        const selector = `${drawerType}[data-onclose-focus]`;
        const oncloseFocus = document.querySelector(selector);
        const section_id = oncloseFocus.dataset.sectionId;
        const focusTargetSelector = oncloseFocus?.dataset.oncloseFocus?.trim();
        if (focusTargetSelector) {
          const target = document.querySelector(focusTargetSelector);
          if (target) target.focus();
        }
        if (
          this.closest('cart-drawer') &&
          this.closest('cart-drawer').querySelector('[data-cart-note-wrapper].active')
        ) {
          this.closest('cart-drawer').querySelector('[data-cart-note-wrapper].active [data-cart-remove]').click();
        }
        break;
      }

      case 'video-popup': {
        const section = this.closest('.shopify-section');
        const swiper = section?.querySelector('swiper-slideshow');
        const fallback = section?.querySelector('.section-wrapper [data-video-play-button]');
        const focusBtn = swiper ? swiper.querySelector('.swiper-slide-active [data-video-play-button]') : fallback;
        focusBtn?.focus();
        break;
      }

      case 'pickup-availability-drawer': {
        const quickViewDrawer = document.querySelector('quick-view-drawer');
        if (quickViewDrawer && quickViewDrawer.classList.contains('open')) {
          const pickupButton = quickViewDrawer.querySelector('pickup-availability button');
          if (pickupButton) pickupButton.focus();
        } else {
          const drawerId = document.querySelector(`${drawerType}[data-onclose-focus]`);
          if (drawerId) {
            const targetId = drawerId.getAttribute('data-onclose-focus');
            if (targetId) {
              const focusTarget = document.getElementById(targetId);
              const pickupButton = focusTarget?.querySelector('button');
              if (pickupButton) {
                pickupButton.focus();
              }
            }
          }
        }
        break;
      }

      case 'mobile-menu-drawer': {
        document.querySelector('[data-mobile-toggler]').focus();
      }
    }

    // Close behavior for drawers
    if (drawerType === 'search-drawer') {
      closestDrawer?.classList.remove('shadow');
      setTimeout(() => {
        closestDrawer?.classList.remove('open');
        document.querySelector('predictive-search')?.classList.remove('open-search');
        document.body.classList.remove('overflow-hidden', 'body-overlay');
      }, 600);
    } else {
      closestDrawer?.classList.remove('open', 'shadow');
      document.body.classList.remove('overflow-hidden', 'body-overlay', 'active-inner-drawer');
      document.querySelector('predictive-search')?.classList.remove('open-search');
      // if (drawerType === 'cart-drawer') {
      //   setTimeout(() => {
      //     if (closestDrawer) {
      //       closestDrawer.style.display = 'none';
      //     }
      //   }, 400);
      // }
    }

    // Handle focus after size chart popup
    if (this.closest('size-chart-popup')) {
      document.querySelector('size-chart-trigger button')?.focus();
    }
  }

  // onCloseButtonClick(e) {
  //   e.preventDefault();
  //   const closestElement = this.closest('[data-drawer]');
  //   if (this.closest('[data-drawer="search-drawer"]')) {
  //     if (document.querySelector('[data-source="search-drawer"] a')) {
  //       document.querySelector('[data-source="search-drawer"] a').focus();
  //     }
  //   }
  //   if (this.closest('[data-drawer="cart-drawer"]')) {
  //     const oncloseFocus = document.querySelector('cart-drawer[data-onclose-focus]');
  //     // console.log(oncloseFocus);
  //     if (oncloseFocus.dataset.oncloseFocus && oncloseFocus.dataset.oncloseFocus.trim() !== '') {
  //       document.querySelector(`${oncloseFocus.dataset.oncloseFocus}`).focus();
  //     }
  //   }
  //   if (this.closest('[data-drawer="quick-view-drawer"]')) {
  //     const oncloseFocus = document.querySelector('quick-view-drawer[data-onclose-focus]');
  //     if (oncloseFocus.dataset.oncloseFocus && oncloseFocus.dataset.oncloseFocus.trim() !== '') {
  //       document.querySelector(`${oncloseFocus.dataset.oncloseFocus}`).focus();
  //     }
  //   }
  //   if (this.closest('[data-drawer="search-drawer"]')) {
  //     closestElement.classList.remove('shadow');
  //     setTimeout(() => {
  //       closestElement.classList.remove('open');
  //       document.querySelector('predictive-search').classList.remove('open-search');
  //       document.body.classList.remove('overflow-hidden', 'body-overlay');
  //     }, 600);
  //   } else {
  //     closestElement.classList.remove('open', 'shadow');
  //     document.body.classList.remove('overflow-hidden', 'body-overlay', 'active-inner-drawer');
  //     document.querySelector('predictive-search').classList.remove('open-search');
  //   }
  //   // closestElement.style.display = 'none';
  //   if (this.closest('size-chart-popup')) {
  //     document.querySelector('size-chart-trigger button').focus();
  //   }
  //   if (this.closest('[data-drawer="video-popup"]')) {
  //     if (this.closest('.shopify-section').querySelector('swiper-slideshow')) {
  //       console.log('video popup close');
  //       this.closest('.shopify-section').querySelector('swiper-slideshow .swiper-slide-active [data-video-play-button]').focus();
  //     } else {
  //       this.closest('.shopify-section').querySelector('.section-wrapper [data-video-play-button]').focus();
  //     }
  //   }
  // }
}
customElements.define('close-drawer', CloseDrawer);

class MovingCursorArea extends HTMLDivElement {
  constructor() {
    super();

    this.addEventListener('mouseenter', (event) => {
      if (window.innerWidth > 1021) {
        const newpos = this.getMousePos(event);
        const positionX = newpos.x;
        const positionY = newpos.y;

        const cursorElement = this.querySelector('[data-moving-cursor]');
        if (cursorElement) {
          cursorElement.style.setProperty('--x', `${positionX}px`);
          cursorElement.style.setProperty('--y', `${positionY}px`);
        }
      }
    });

    this.addEventListener('mousemove', (event) => {
      if (window.innerWidth > 1021) {
        let newpos = this.getMousePos(event);
        let positionX = newpos.x;
        let positionY = newpos.y;

        let cursorElement = this.querySelector('[data-moving-cursor]');
        if (cursorElement) {
          cursorElement.style.setProperty('--x', `${positionX}px`);
          cursorElement.style.setProperty('--y', `${positionY}px`);
          // cursorElement.style.transform = `translate(${positionX}px, ${positionY}px)`;
        }
      }
    });
  }

  getMousePos(e) {
    var pos = this.getBoundingClientRect();
    return {
      x: e.clientX - pos.left,
      y: e.clientY - pos.top,
    };
  }
}

customElements.define('data-moving-cursor-area', MovingCursorArea, { extends: 'div' });

class QuantityInput extends HTMLElement {
  constructor() {
    super();
    this.input = this.querySelector('input');
    this.changeEvent = new Event('change', { bubbles: true });
    this.input.addEventListener('change', this.inputChangeHandler.bind(this));
    this.querySelector('[name="increase"]').addEventListener('click', this.onClickPlus.bind(this));
    this.querySelector('[name="decrease"]').addEventListener('click', this.onClickMinus.bind(this));
  }

  inputChangeHandler(event) {
    this.validateQtyRules();
  }

  onClickPlus(event) {
    event.preventDefault();
    const previousValue = this.input.value;
    this.input.stepUp();
    if (previousValue !== this.input.value) this.input.dispatchEvent(this.changeEvent);
  }

  onClickMinus(event) {
    event.preventDefault();
    const previousValue = this.input.value;
    this.input.stepDown();
    if (previousValue !== this.input.value) this.input.dispatchEvent(this.changeEvent);
  }

  validateQtyRules() {
    const value = parseInt(this.input.value);
    if (this.input.min) {
      const min = parseInt(this.input.min);
      const buttonDecrease = this.querySelector('[name="decrease"]');
      buttonDecrease.classList.toggle('disabled', value <= min);
    }
    if (this.input.max) {
      const max = parseInt(this.input.max);
      const buttonIncrease = this.querySelector('[name="increase"]');
      buttonIncrease.classList.toggle('disabled', value >= max);
    }
  }
}

customElements.define('quantity-input', QuantityInput);

class CartDrawer extends HTMLElement {
  constructor() {
    super();
    this.addEventListener('keyup', (evt) => evt.code === 'Escape' && this.close());
    this.setUpCartButtonListeners();
    document.body.addEventListener(
      'click',
      function (e) {
        let outside_status = true;
        if (e.target == this || e.target.closest('cart-drawer')) {
          outside_status = false;
        }
        if (
          e.target == document.querySelector('list-set[data-source="cart-drawer"]') ||
          e.target.closest('list-set[data-source="cart-drawer"]')
        ) {
          outside_status = false;
        }
        if (outside_status && this.classList.contains('show')) {
          this.querySelector('[data-drawer-close]').click();
        }
      }.bind(this)
    );
  }

  setUpCartButtonListeners() {
    const cartButtons = document.querySelectorAll('[data-cart-toggle]');
    cartButtons.forEach((cartButton) => {
      cartButton.addEventListener('click', (event) => {
        event.preventDefault();
        this.toggleWrapper(event);
      });
    });

    const cartRemoveButtons = document.querySelectorAll('[data-cart-remove]');
    cartRemoveButtons.forEach((removeButton) => {
      removeButton.addEventListener('click', (event) => {
        removeButton.parentElement.classList.toggle('active');
        event.preventDefault();
        this.toggleWrapper(event);
        trapFocus(this);
      });
    });
  }

  toggleWrapper(event) {
    const id = event.currentTarget.getAttribute('data-toggle-id');
    const noteWrapper = document.querySelector(`[data-cart-note-wrapper="${id}"]`);
    trapFocus(document.querySelector(`[data-cart-note-wrapper="${id}"]`));
    noteWrapper.classList.toggle('active');
  }

  close() {
    this.classList.remove('active');
    document.body.classList.remove('overflow-hidden');
  }

  renderContents(parsedState) {
    this.querySelector('[data-cart-drawer-body]').classList.remove('is-empty');

    this.productId = parsedState.id;
    this.getSectionsToRender().forEach((section) => {
      const elementToReplace =
        document.getElementById(section.id).querySelector(section.selector) || document.getElementById(section.id);
      elementToReplace.innerHTML = this.getSectionInnerHTML(parsedState.sections[section.section], section.selector);
      const cartHtml = this.getSectionInnerHTML(parsedState.sections[section.section], section.selector);
      const html = new DOMParser().parseFromString(cartHtml, 'text/html');
      const cartCount = html.querySelector('[data-cart-items]');
      if (cartCount) {
        const cartItems = cartCount.dataset.cartItems;
        if (cartItems == 0 || cartItems == '0' || cartItems == '') {
          document.querySelector('[data-cart-count]').classList.add('hidden');
          document.querySelector('[data-cart-count]').textContent = '';
        } else if (parseInt(cartItems) > 99) {
          document.querySelector('[data-cart-count]').classList.remove('hidden');
          document.querySelector('[data-cart-count]').classList.add('large-items');
          document.querySelector('[data-cart-count]').textContent = cartItems;
        } else {
          document.querySelector('[data-cart-count]').classList.remove('hidden', 'large-items');
          document.querySelector('[data-cart-count]').textContent = cartItems;
        }
      }
      this.setUpCartButtonListeners();
    });

    setTimeout(() => {
      // document.querySelector(`[cart-drawer-section]`).style.display = 'flex';
      document.querySelector(`[cart-drawer-section]`).classList.add('open');
      document.querySelector(`[cart-drawer-section]`).classList.add('shadow');
      document.body.classList.add('overflow-hidden');
      setTimeout(() => {
        document.querySelector(`[cart-drawer-section]`).querySelector('[data-drawer-close] button').focus();
      }, 700);
      trapFocus(document.querySelector(`[cart-drawer-section]`));
    }, 800);
  }

  getSectionInnerHTML(html, selector = '.shopify-section') {
    return new DOMParser().parseFromString(html, 'text/html').querySelector(selector).innerHTML;
  }

  getSectionsToRender() {
    return [
      {
        id: 'CartDrawer',
        section: document.querySelector('[cart-drawer-section]').dataset.id,
        selector: '.drawer-wrapper',
      },
    ];
  }

  setActiveElement(element) {
    this.activeElement = element;
  }
}
customElements.define('cart-drawer', CartDrawer);

class CartNote extends HTMLElement {
  constructor() {
    super(),
      this.addEventListener(
        'input',
        debounce((event) => {
          const body = JSON.stringify({ note: event.target.value });
          fetch(`${routes.cart_update_url}`, { ...fetchConfig(), ...{ body } });
        }, 300)
      );
  }
}
customElements.define('cart-note', CartNote);

class CartRemoveButton extends HTMLElement {
  constructor() {
    super();
    this.addEventListener('click', (event) => {
      event.preventDefault();
      const cartItems = this.closest('cart-items') || this.closest('cart-drawer-items');
      this.closest(`[id="cart-product-item-${this.dataset.index}"]`).classList.add('zoom');
      cartItems.updateQuantity(this.dataset.index, 0);
    });
  }
}

customElements.define('cart-remove-button', CartRemoveButton);

class CartDrawerItems extends HTMLElement {
  constructor() {
    super();
    const debouncedOnChange = debounce((event) => {
      this.onChange(event);
    }, 400);
    this.addEventListener('change', debouncedOnChange.bind(this));
  }

  onChange(event) {
    this.updateQuantity(
      event.target.dataset.index,
      event.target.value,
      document.activeElement.getAttribute('name'),
      event.target.dataset.quantityVariantId
    );
  }

  getSectionsToRender() {
    return [
      {
        id: 'CartDrawer',
        section: document.querySelector('[cart-drawer-section]').dataset.id,
        selector: '.drawer-wrapper',
      },
    ];
  }

  updateQuantity(line, quantity, name, variantId) {
    const body = JSON.stringify({
      line,
      quantity,
      sections: this.getSectionsToRender().map((section) => section.section),
      sections_url: window.location.pathname,
    });
    fetch(`${routes.cart_change_url}`, { ...fetchConfig(), ...{ body } })
      .then((response) => {
        return response.text();
      })
      .then((state) => {
        const parsedState = JSON.parse(state);

        if (parsedState.errors) {
          if (this.querySelector(`[data-cart-error-${line}]`)) {
            this.querySelector(`[data-cart-error-${line}]`).classList.remove('hidden');
            this.querySelector(`[data-cart-error-${line}]`).textContent = parsedState.errors;
            const lineQty = this.querySelector(`.quantity-input[data-index="${line}"]`);
            if (lineQty) {
              lineQty.value = lineQty.dataset.previousValue;
            }
          }
        }

        this.classList.toggle('is-empty', parsedState.item_count === 0);

        const cartDrawerWrapper = document.querySelector('cart-drawer');
        const cartFooter = document.getElementById('cart-drawer-footer');

        if (cartFooter) cartFooter.classList.toggle('is-empty', parsedState.item_count === 0);
        if (cartDrawerWrapper) cartDrawerWrapper.classList.toggle('is-empty', parsedState.item_count === 0);

        this.getSectionsToRender().forEach((section) => {
          const elementToReplace =
            document.getElementById(section.id).querySelector(section.selector) || document.getElementById(section.id);
          const cartHtml = this.getSectionInnerHTML(parsedState.sections[section.section], section.selector);
          const html = new DOMParser().parseFromString(cartHtml, 'text/html');

          const drawerbodyD = elementToReplace.querySelector('[data-cart-drawer-body]');
          const drawerbodyS = html.querySelector('[data-cart-drawer-body]');

          if (drawerbodyS && drawerbodyD) {
            drawerbodyD.innerHTML = '';
            drawerbodyD.innerHTML = drawerbodyS.innerHTML;
          }

          const drawerheaderD = elementToReplace.querySelector('[data-cart-drawer-header]');
          const drawerheaderS = html.querySelector('[data-cart-drawer-header]');

          if (drawerheaderS && drawerheaderD) {
            drawerheaderD.innerHTML = '';
            drawerheaderD.innerHTML = drawerheaderS.innerHTML;
          }

          const drawerContentD = elementToReplace.querySelector('[data-cart-drawer-footer-content]');
          const drawerContentS = html.querySelector('[data-cart-drawer-footer-content]');
          if (drawerContentS == null) {
            elementToReplace.innerHTML = this.getSectionInnerHTML(
              parsedState.sections[section.section],
              section.selector
            );
            document.querySelector('[data-cart-count]').classList.add('hidden');
            document.querySelector('[data-cart-count]').textContent = '';
          } else {
            drawerContentD.innerHTML = '';
            drawerContentD.innerHTML = drawerContentS.innerHTML;
            const cartCount = html.querySelector('[data-cart-items]');
            if (cartCount) {
              const cartItems = cartCount.dataset.cartItems;
              if (cartItems == 0 || cartItems == '0' || cartItems == '') {
                document.querySelector('[data-cart-count]').classList.add('hidden');
                document.querySelector('[data-cart-count]').textContent = '';
              } else if (parseInt(cartItems) > 99) {
                document.querySelector('[data-cart-count]').classList.remove('hidden');
                document.querySelector('[data-cart-count]').classList.add('large-items');
                document.querySelector('[data-cart-count]').textContent = cartItems;
              } else {
                document.querySelector('[data-cart-count]').classList.remove('hidden', 'large-items');
                document.querySelector('[data-cart-count]').textContent = cartItems;
              }
              this.querySelector(`[data-index="${line}"]`).setAttribute(
                'data-previous-value',
                this.querySelector(`[data-index="${line}"]`).value
              );
            }
            //code updated on 17 april
            const lineItem = document.getElementById(`cart-product-item-${line}`);
            if (lineItem && lineItem.querySelector(`[name="${name}"]`)) {
              lineItem.querySelector(`[name="${name}"]`).focus();
            } else if (parsedState.item_count === 0 && cartDrawerWrapper) {
              cartDrawerWrapper.querySelector('a').focus();
            }
          }
          if (cartDrawerWrapper) {
            trapFocus(cartDrawerWrapper);
          }
        });
      })
      .catch(() => { })
      .finally(() => { });
  }

  getSectionInnerHTML(html, selector) {
    return new DOMParser().parseFromString(html, 'text/html').querySelector(selector).innerHTML;
  }
}
customElements.define('cart-drawer-items', CartDrawerItems);

class ShippingCalculator extends HTMLElement {
  constructor() {
    super(), this._setupCountries();
    this.submitButton = this.querySelector('[type="submit"]');
    this.resultsElement = this.querySelector('[data-shipping-result]');
    if (this.submitButton) {
      this.submitButton.addEventListener('click', this.handleFormSubmit.bind(this));
    }
  }
  handleFormSubmit(event) {
    event.preventDefault();
    const zip = this.querySelector('[name="address[zip]"]').value;
    const country = this.querySelector('[name="address[country]"]').value;
    const province = this.querySelector('[name="address[province]"]').value;
    const body = JSON.stringify({
      shipping_address: {
        zip,
        country,
        province,
      },
    });

    let sectionUrl = `${routes.cart_url}/shipping_rates.json`;
    sectionUrl = sectionUrl.replace('//', '/');

    fetch(sectionUrl, {
      ...fetchConfig(),
      ...{ body },
    })
      .then((response) => response.json())
      .then((parsedState) => {
        parsedState.shipping_rates
          ? this.formatShippingRates(parsedState.shipping_rates)
          : this.formatError(parsedState);
      })
      .catch((e) => {
        console.error(e);
      })
      .finally(() => {
        (this.resultsElement.hidden = !1), this.submitButton.removeAttribute('aria-busy');
      });
  }

  formatShippingRates(shippingRates) {
    const shippingRatesList = shippingRates.map((rate) => {
      const { presentment_name, currency, price } = rate;
      return `<p class="form-message success">${presentment_name}: ${currency} ${price}</p>`;
    });

    this.resultsElement.innerHTML = `${shippingRatesList.join('')}`;
    this.resultsElement.classList.remove('hidden');
  }

  formatError(errors) {
    const errorMessages = Object.values(errors)
      .map((error) => `<p class="form-message error">${error}</p>`)
      .join('');
    this.resultsElement.innerHTML = `${errorMessages}`;
    this.resultsElement.classList.remove('hidden');
  }

  _setupCountries() {
    if (Shopify && Shopify.CountryProvinceSelector) {
      new Shopify.CountryProvinceSelector('[shippingCountry]', '[shippingProvince]', {
        hideElement: '[shippingProvince]',
      });
    }
  }
}
customElements.define('shipping-calculator', ShippingCalculator);

class PredictiveSearch extends HTMLElement {
  constructor() {
    super();
    this.dataSource = this.getAttribute('data-source');
    this.input = this.querySelector('input[type="search"]');
    this.clearInput = this.querySelector('[data-input-clear]');

    // this.setupEventListeners();
    if (this.input) {
      this.input.addEventListener(
        'input',
        this.debounce((event) => {
          this.onChange(event);
        }, 300).bind(this)
      );
      if (this.clearInput) {
        this.clearInput.addEventListener('click', this.clearSearch.bind(this));
      }
      // this.input.addEventListener('click', function (e) {
      this.input.addEventListener('click', (e) => {
        setTimeout(() => {
          // if (this.dataSource === 'header-search-bar') {
          //   this.querySelector('search-drawer').classList.add('open');
          //   document.body.classList.add('overflow-hidden');
          //   this.classList.add('open-search');
          // }

          this.closeSearchElement = this.querySelector('[data-clear-input]');
          if (this.closeSearchElement && this.closeSearchElement.classList.contains('hidden')) {
            this.closeSearchElement.classList.remove('hidden');

            this.closeSearchElement.addEventListener('click', (e) => {
              // if (this.dataSource === 'header-search-bar') {
              //   document.querySelector('[data-drawer="search-bar"]').classList.remove('shadow');
              // } else {
              document.querySelector('[data-drawer="search-drawer"]').classList.remove('shadow');
              // }

              setTimeout(() => {
                // if (this.dataSource === 'header-search-bar') {
                //   document.querySelector('[data-drawer="search-bar"]').classList.remove('open');
                // } else {
                document.querySelector('[data-drawer="search-drawer"]').classList.remove('open');
                // }

                this.classList.remove('open-search');
                const element = this.querySelector('[data-clear-input]');
                if (element) {
                  element.classList.add('hidden');
                }
                document.body.classList.remove('overflow-hidden', 'body-overlay');
              }, 600);
            });
          } else {
            console.log('class not found');
          }
        }, 100);
      });
    }
  }

  debounce(fn, delay) {
    var timer = null;
    return function () {
      var context = this,
        args = arguments;
      clearTimeout(timer);
      timer = setTimeout(function () {
        fn.apply(context, args);
      }, delay);
    };
  }

  getSearchResults(searchTerm) {
    const queryKey = searchTerm.replace(' ', '-').toLowerCase();
    fetch(
      `${routes.predictive_search_url}?q=${encodeURIComponent(searchTerm)}&section_id=${this.dataSource
      }&resources[type]=article,collection,page,product,query&resources[options][fields]=title,product_type,author,variants.sku,tag,vendor`
    )
      .then((response) => {
        if (!response.ok) {
          console.log('error');
        }
        return response.text();
      })
      .then((text) => {
        const resultsMarkup = new DOMParser()
          .parseFromString(text, 'text/html')
          .querySelector('[data-search-results]').innerHTML;
        let resultsWrapper = document.querySelector('[data-drawer="search-drawer"]');
        // if (this.dataSource === 'header-search-bar') {
        //   resultsWrapper = document.querySelector('[data-drawer="search-bar"]')
        // }
        resultsWrapper.querySelector('[data-search-results]').innerHTML = resultsMarkup;
        if (resultsWrapper.querySelector('[data-search-terms]')) {
          resultsWrapper.querySelector('[data-search-terms]').classList.add('hidden');
        }
      })
      .catch((error) => {
        if (error?.code === 20) {
          return;
        }
        throw error;
      });
  }

  clearSearch() {
    this.classList.remove('predictive-content-added');
    this.input.value = '';

    let searchDrawerWrapper = document.querySelector('[data-drawer="search-drawer"]');
    // if (this.dataSource === 'header-search-bar') {
    //   searchDrawerWrapper = document.querySelector('[data-drawer="search-bar"]')
    // }

    searchDrawerWrapper.querySelector('[data-search-results]').innerHTML = '';
    if (searchDrawerWrapper.querySelector('[data-search-terms]')) {
      searchDrawerWrapper.querySelector('[data-search-terms]').classList.remove('hidden');
      if (this.clearInput) {
        this.clearInput.classList.add('hidden');
      }
    }
  }

  getQuery() {
    return this.input.value.trim();
  }

  onChange() {
    const newSearchTerm = this.getQuery();
    if (newSearchTerm == '') {
      this.clearSearch();
      if (this.clearInput) {
        this.clearInput.classList.add('hidden');
      }
    } else {
      if (this.clearInput) {
        this.clearInput.classList.remove('hidden');
      }
      this.classList.add('predictive-content-added');
      let resultsWrapper = document.querySelector('[data-drawer="search-drawer"]');
      // if (this.dataSource === 'header-search-bar') {
      //   resultsWrapper = document.querySelector('[data-drawer="search-bar"]')
      // }
      resultsWrapper.querySelector('[data-search-results]').innerHTML = `<div class="search-loader text-center"> <svg
        width="40"
        height="40"
        style="shape-rendering: auto; animation-play-state: running; animation-delay: 0s; background: none;"
        viewBox="0 0 100 100"
        preserveAspectRatio="xMidYMid"
      >
        <circle cx="50" cy="50" fill="none" stroke="#d9e2ed" stroke-width="6" r="35"
            stroke-dasharray="164.93361431346415 56.97787143782138"
            style="animation-play-state: running; animation-delay: 0s;"
            transform="rotate(115.597 50 50)">
            <animateTransform attributeName="transform" type="rotate" calcMode="linear"
                values="0 50 50;360 50 50" keyTimes="0;1" dur="1s" begin="0s"
                repeatCount="indefinite">
            </animateTransform>
        </circle>
      </svg></div>`;
      this.searchTerm = newSearchTerm;
      this.getSearchResults(this.searchTerm);
    }
  }
}

customElements.define('predictive-search', PredictiveSearch);

function getFocusableElements(container) {
  return Array.from(
    container.querySelectorAll('a[href], button, textarea, input, select, [tabindex]:not([tabindex="-1"])')
  ).filter((el) => {
    // Filter out elements inside inactive submenus
    return el.offsetParent !== null && !el.closest('.hamburger-menu-submenu');
  });
}

function trapFocus(container) {
  // const focusableElements = 'button, [href], input:not([type="hidden"]), select, textarea, a, li';
  const focusableElements = 'button, [href], input:not([type="hidden"]), select, textarea, a';
  let lastFocusable2 = '';
  if (container.hasAttribute('data-custom-select-summary')) {
    if (
      container.querySelector('[data-tab-id="language_selector"]') &&
      container.querySelector('[data-tab-id="language_selector"]').classList.contains('active')
    ) {
      const language_list = container.querySelector('[data-language-list').querySelector('ul');
      lastFocusableElement = language_list.querySelector('li:last-of-type').querySelector('button');
      firstFocusable = container.querySelector('[data-tab-id="language_selector"]');
    } else if (
      container.querySelector('[data-tab-id="country_selector"]') &&
      container.querySelector('[data-tab-id="country_selector"]').classList.contains('active')
    ) {
      const country_list = container.querySelector('[data-country-list]').querySelector('ul');
      lastFocusableElement = country_list.querySelector('li:last-of-type').querySelector('button');
      firstFocusable = container.querySelector('[data-tab-id="country_selector"]');
    }
  } else {
    firstFocusable = container.querySelector(focusableElements);
    const lastFocusable = container.querySelectorAll(focusableElements);
    lastFocusableElement = lastFocusable[lastFocusable.length - 1];
    if (container.classList.contains('side-reveal-menu-wrapper')) {
      // lastFocusable2 =
      const submenuFocusable = getFocusableElements(container);
      lastFocusable2 = submenuFocusable[submenuFocusable.length - 1];
    }
  }
  // if (!Shopify.designMode) {
  //   container.addEventListener('keydown', (e) => {
  //     console.log('container', container);
  //     console.log('active element', document.activeElement);
  //     setTimeout(() => {
  //       if (container.classList.contains('open') && !container.contains(document.activeElement)) {
  //         console.log('out focus');
  //         firstFocusable.focus();
  //       }
  //     }, 10);
  //   });
  // }

  document.addEventListener('keydown', (e) => {
    // console.log(document.activeElement);
    if (e.key === 'Tab') {
      if (e.shiftKey) {
        if (document.activeElement === firstFocusable) {
          e.preventDefault();
          lastFocusableElement.focus();
        }
      } else {
        if (document.activeElement === lastFocusableElement) {
          e.preventDefault();
          firstFocusable.focus();
        } else if (document.activeElement === lastFocusable2 && !lastFocusable2.classList.contains('active')) {
          e.preventDefault();
          firstFocusable.focus();
        }
      }
      if (!Shopify.designMode) {
        setTimeout(() => {
          if (
            (container.classList.contains('open') || container.classList.contains('show')) &&
            !container.contains(document.activeElement)
          ) {
            firstFocusable.focus();
          }
        }, 10);
      }
    }
  });
}

class EyeIcon extends HTMLElement {
  constructor() {
    super();
    this.openEye = this.querySelector('[data-opened-eye]');
    this.closeEye = this.querySelector('[data-closed-eye]');
    this.passwordInput = document.querySelector('[data-password-input]');
    this.passwordField = document.querySelector('#password-field');
    this.closeEye.addEventListener('click', this.onClickCloseEye.bind(this));
    this.openEye.addEventListener('click', this.onClickOpenEye.bind(this));
  }

  onClickCloseEye(e) {
    this.closeEye.classList.add('hidden');
    this.openEye.classList.remove('hidden');
    this.passwordInput.type = 'text';
  }

  onClickOpenEye(e) {
    this.openEye.classList.add('hidden');
    this.closeEye.classList.remove('hidden');
    this.passwordInput.type = 'password';
  }
}

customElements.define('eye-icon', EyeIcon);

class ShowcaseTabItems extends HTMLElement {
  constructor() {
    super();
    this.mainSection = this.closest('.shopify-section');
    this.content = this.querySelector('[showcase-tabs-content]');
    this.closeTabs = this.querySelector('[data-close-tabs]');
    this.images = [...this.mainSection.querySelectorAll('[data-showcase-tabs-image]')];
    this.hoverTimeout = null;
    this.leaveTimeout = null;
    this.tabImage = this.dataset.tabImage;

    this.handleMouseEnter = this.handleMouseEnter.bind(this);
    this.handleMouseLeave = this.handleMouseLeave.bind(this);
    this.handleClick = this.handleClick.bind(this);
    this.handleOutsideClick = this.handleOutsideClick.bind(this);

    this.setOpenTabsType();
    this.initEvents();

    if (this.closeTabs) {
      this.closeTabs.addEventListener('click', (e) => this.handleMouseLeave(e));
      this.closeTabs.addEventListener('keydown', (e) => {
        if (e.key === 'Enter') {
          this.handleMouseLeave(e);
        }
      });
    }

    window.addEventListener('resize', () => {
      this.setOpenTabsType();
      this.initEvents();
    });

    // this.addEventListener('keydown', (e) => {
    //   if (e.key === 'Enter') {
    //     this.handleMouseEnter(e);
    //   }
    // });
  }

  setOpenTabsType() {
    this.open_tabs_on = window.innerWidth <= 1024 ? 'click' : this.dataset.openTabs;
  }

  initEvents() {
    this.removeExistingEvents();

    if (this.open_tabs_on === 'hover') {
      this.init_hover_events();
    } else {
      this.init_click_events();
    }
  }

  removeExistingEvents() {
    this.removeEventListener('mouseenter', this.handleMouseEnter);
    this.removeEventListener('mouseleave', this.handleMouseLeave);
    this.removeEventListener('click', this.handleClick);
    document.removeEventListener('click', this.handleOutsideClick);
  }

  init_click_events() {
    this.addEventListener('click', this.handleClick);
    this.addEventListener('keydown', (e) => {
      if (e.key === 'Enter') {
        this.handleClick(e);
      }
    });
    // this.addEventListener('focusout', this.handleClick);
    this.addEventListener('focusout', this.handleMouseLeave);
  }

  init_hover_events() {
    this.addEventListener('focusin', this.handleMouseEnter);
    this.addEventListener('focusout', this.handleMouseLeave);
    this.addEventListener('mouseenter', this.handleMouseEnter);
    this.addEventListener('mouseleave', this.handleMouseLeave);
  }

  handleClick(e) {
    e.stopPropagation();
    this.showContent();
    document.addEventListener('click', this.handleOutsideClick);
  }

  handleMouseEnter(e) {
    if (this.leaveTimeout) {
      clearTimeout(this.leaveTimeout);
      this.leaveTimeout = null;
    }
    this.hoverTimeout = setTimeout(() => {
      this.showContent(e);
    }, 100);
  }

  handleMouseLeave(e) {
    if (this.closeTabs.dataset.closeTabs === 'close') {
      e.preventDefault();
      e.stopPropagation();
    }
    if (this.hoverTimeout) {
      clearTimeout(this.hoverTimeout);
      this.hoverTimeout = null;
    }
    this.content.classList.remove('show-content');
    this.classList.remove('hovered');
    this.closeTabs.dataset.closeTabs = 'open';
    document.removeEventListener('click', this.handleOutsideClick);
  }

  handleOutsideClick(e) {
    if (!this.contains(e.target)) {
      this.handleMouseLeave(e);
    }
  }

  showContent(e) {
    // if (this.classList.contains('hovered') && this.open_tabs_on === 'click') {
    if (this.classList.contains('hovered')) {
      this.handleMouseLeave(e || new Event('mouseleave'));
    } else {
      this.classList.add('hovered');
      this.content.classList.add('show-content');
      this.closeTabs.dataset.closeTabs = 'close';
      if (this.tabImage) {
        const matchingImage = this.images.find((image) => image.dataset.showcaseTabsImage === this.tabImage);
        this.images.forEach((image) => image.classList.remove('active'));
        if (matchingImage) {
          matchingImage.classList.add('active');
        }
      }
    }
  }
}

customElements.define('showcase-tabs-items', ShowcaseTabItems);

class creativeFooterShapes extends HTMLElement {
  constructor() {
    super();
    this.observer = null;
  }

  connectedCallback() {
    this.initIntersectionObserver();
  }

  initIntersectionObserver() {
    const callback = (entries) => {
      entries.forEach((entry) => {
        if (entry.isIntersecting) {
          this.classList.add('in-view-shapes');

          this.observer.unobserve(this);
        }
      });
    };

    this.observer = new IntersectionObserver(callback, {
      root: null,
      rootMargin: '0px',
      threshold: 0.1,
    });

    this.observer.observe(this);
  }
}

customElements.define('creative-footer-shapes', creativeFooterShapes);

class fallingStar extends HTMLElement {
  constructor() {
    super();
    this.observer = null;
    this.wrapper = this.querySelector('[data-stars-wrapper]');
    this.trigger = this.dataset.trigger // once , everytime
    this.templates = Array.from(
      this.querySelectorAll(
        'template[data-template-start1], template[data-template-start2], template[data-template-start3], template[data-template-start4], template[data-template-start5]'
      )
    );
    this.colors = ['#AE95C6', '#8CCDA6', '#FFF060', '#F48A9C'];
  }

  connectedCallback() {
    this.initIntersectionObserver();
  }

  init() {
    let count = 0;
    const totalStars = 50;
    const delayBetweenStars = 1;

    const interval = setInterval(() => {
      if (count >= totalStars) {
        clearInterval(interval);
        return;
      }

      const star = document.createElement('div');
      star.className = 'star';

      star.style.left = Math.random() * window.innerWidth + 'px';

      const size = 10 + Math.random() * 20;
      const duration = 2 + Math.random() * 3;

      star.style.fontSize = `${size}px`;
      star.style.animationDuration = `${duration}s`;

      const color = this.colors[Math.floor(Math.random() * this.colors.length)];
      star.style.setProperty('--star-color', color);

      if (this.templates.length > 0) {
        const randomTemplate = this.templates[Math.floor(Math.random() * this.templates.length)];
        const clone = randomTemplate.content.cloneNode(true);
        star.appendChild(clone);
      }

      this.wrapper.appendChild(star);

      star.addEventListener('animationend', () => {
        star.remove();
      });

      count++;
    }, delayBetweenStars);
  }

  /*initIntersectionObserver() {
    const callback = (entries) => {
      entries.forEach((entry) => {
        if (entry.isIntersecting) {
          this.init();
          this.observer.unobserve(this);
        }
      });
    };
    const offset = window.innerHeight * 0.4;
    this.observer = new IntersectionObserver(callback, {
      root: null,
      rootMargin: `0px 0px -${offset}px 0px`,
      threshold: 0,
    });

    this.observer.observe(this);
  }*/

  initIntersectionObserver() {
    const callback = (entries) => {
      entries.forEach((entry) => {
        if (entry.isIntersecting) {
          this.init();
          if (this.trigger !== 'everytime') {
            this.observer.unobserve(this);
          }
        }
      });
    };

    const offset = window.innerHeight * 0.4;

    this.observer = new IntersectionObserver(callback, {
      root: null,
      rootMargin: `0px 0px -${offset}px 0px`,
      threshold: 0,
    });

    this.observer.observe(this);
  }

}

customElements.define('falling-star', fallingStar);

class rainbowWithStar extends HTMLElement {
  constructor() {
    super();
    this.observer = null;
    this.leftWrapper = this.querySelector('[data-left-content-wrapper]');
    this.rightWrapper = this.querySelector('[data-right-content-wrapper]');
    this.leftTemplates = this.querySelector('[data-left-svg-item]');
    this.rightTemplates = this.querySelector('[data-right-svg-item]');
  }
  connectedCallback() {
    this.initIntersectionObserver();
  }
  init() {
    if (this.leftWrapper && this.leftWrapper.children.length === 0) {
      this.leftWrapper.appendChild(this.leftTemplates.content.cloneNode(true));
    }

    if (this.rightWrapper && this.rightWrapper.children.length === 0) {
      this.rightWrapper.appendChild(this.rightTemplates.content.cloneNode(true));
    }
    this.classList.add('animate-rainbow');
  }
  initIntersectionObserver() {
    const callback = (entries) => {
      entries.forEach((entry) => {
        if (entry.isIntersecting) {
          this.init();
          this.observer.unobserve(this);
        }
      });
    };
    const offset = window.innerHeight * 0.4;
    this.observer = new IntersectionObserver(callback, {
      root: null,
      rootMargin: `0px 0px -${offset}px 0px`,
      threshold: 0,
    });

    this.observer.observe(this);
  }
}
customElements.define('rainbow-with-star', rainbowWithStar);

// function inviewSection() {
//   // const options = {
//   //   root: null,
//   //   rootMargin: "-30% 0px -70% 0px",
//   //   threshold: 0
//   // };

//   const options = {
//     root: null,
//     rootMargin: "0px", // No margin, triggers as soon as it enters
//     threshold: 0
//   };

//   const observerCallback = (entries) => {
//     entries.forEach(entry => {
//       if (entry.isIntersecting) {
//         console.log('in view');
//         entry.target.classList.add("in-view");
//       } else {
//         // entry.target.classList.remove("in-view");
//       }
//     });
//   };
//   const observer = new IntersectionObserver(observerCallback, options);
//   document.querySelectorAll("section").forEach(section => {
//     observer.observe(section);
//   });
// }

document.addEventListener('DOMContentLoaded', () => {
  let imageElement = document.querySelectorAll('video img');
  imageElement.forEach(function (videoImage) {
    if (videoImage) {
      videoImage.setAttribute('alt', 'Preview image of the video');
      videoImage.setAttribute('loading', 'lazy');
    }
  });

  document.querySelectorAll('details').forEach((el) => {
    const accordion = new Accordion(el);
    el._accordionInstance = accordion;
  });

  document.querySelectorAll('.slideshow-nav-btn').forEach((btn) => {
    btn.addEventListener('keydown', (e) => {
      if (e.key === 'Enter' || e.key === ' ') {
        e.preventDefault();
        btn.click(); // Trigger the same as mouse click
      }
    });
  });
});

class RevealMenuToggler extends HTMLElement {
  constructor() {
    super();
    this.togglerButton = null;
    this.drawerContainer = null;
    this.template = null;
    this.menuDrawer = null;
    this.closeButton = null;
  }

  connectedCallback() {
    this.headerSection = document.querySelector('[data-header-section]');
    this.announcementbarHeight =
      document.querySelector('.announcement-section')?.getBoundingClientRect().height.toFixed(2) || 0;
    this.togglerButton = this.querySelector('[data-side-reveal-menu-toggler]');
    this.drawerContainer = this.querySelector('[data-side-reveal-drawer-content]');

    const header_height = this.headerSection?.getBoundingClientRect().height.toFixed(2);

    document.body.style.setProperty('--dynamic-header-height', `${header_height}px`);
    document.body.style.setProperty('--dynamic-announcement-height', `${this.announcementbarHeight}px`);

    if (!this.drawerContainer) return;

    this.template = this.drawerContainer.querySelector('template');
    if (!this.template || !this.togglerButton) return;

    this.appendDrawer();
    this.togglerButton.addEventListener('click', this.toggleDrawer.bind(this));
  }

  disconnectedCallback() {
    const drawer = document.querySelector('side-reveal-menu');
    if (drawer) {
      drawer.remove();
      document.body.classList.remove('overflow-hidden', 'side-menu-active');
    }

    if (this.togglerButton) {
      this.togglerButton.removeEventListener('click', this.toggleDrawer.bind(this));
    }
  }

  appendDrawer() {
    this.menuDrawer = document.querySelector('side-reveal-menu');
    if (!this.menuDrawer) {
      const menuDrawerContent = this.template.content.firstElementChild.cloneNode(true);
      document.body.appendChild(menuDrawerContent);
    }
  }

  toggleDrawer() {
    this.menuDrawer = document.querySelector('side-reveal-menu');

    if (!this.menuDrawer) {
      const menuDrawerContent = this.template.content.firstElementChild.cloneNode(true);
      document.body.appendChild(menuDrawerContent);
      this.menuDrawer = document.querySelector('side-reveal-menu');
    }

    if (!this.menuDrawer) return;

    this.closeButton = this.menuDrawer.querySelector('[data-side-reveal-menu-close]');

    setTimeout(() => {
      this.menuDrawer.style.display = 'block';
      this.closeButton?.classList.add('active');
      this.togglerButton.classList.add('active');

      document.body.classList.add('overflow-hidden', 'side-menu-active');

      setTimeout(() => {
        this.menuDrawer.classList.add('open');
        const firstFocusable = this.menuDrawer.querySelector('button');
        if (firstFocusable) {
          firstFocusable.focus();
          trapFocus(this.menuDrawer);
        }
      }, 500);
    }, 400);
  }
}

customElements.define('reveal-menu-toggler', RevealMenuToggler);

class SideRevealMenu extends HTMLElement {
  constructor() {
    super();
    this.toggler = document.querySelector('reveal-menu-toggler');
    this.drawerToggler = this.toggler?.querySelector('[data-side-reveal-menu-toggler]');
    this.close = this.querySelector('[data-side-reveal-menu-close]');
    this.headerSection = document.querySelector('[data-header-section]');
    this.mainContent = document.querySelector('.main-content-wrapper');
    this.addEventListener('keyup', (event) => {
      if (event.code.toUpperCase() === 'ESCAPE') this.closeDrawer();
    });
    if (this.close) {
      this.close.addEventListener('click', this.closeDrawer.bind(this));
    }

    if (this.mainContent && this.headerSection && window.innerWidth > 1024) {
      this.mainContent.addEventListener('scroll', this.handleScroll.bind(this));
    }

    window.addEventListener('resize', this.handleResize.bind(this));
  }
  handleScroll() {
    if (this.mainContent.scrollTop > 50) {
      document.querySelector('body').classList.add('content-scrolled');
      this.headerSection.classList.add('is-sticky');
      const header_height = this.headerSection?.getBoundingClientRect().height.toFixed(2);
      document.body.style.setProperty('--dynamic-header-height', `${header_height}px`);
      document.body.style.setProperty('--dynamic-announcement-height', `0px`);
    } else {
      document.querySelector('body').classList.remove('content-scrolled');
      this.headerSection.classList.remove('is-sticky');
      this.announcementbarHeight =
        document.querySelector('.announcement-section')?.getBoundingClientRect().height.toFixed(2) || 0;
      document.body.style.setProperty('--dynamic-announcement-height', `${this.announcementbarHeight}px`);
      const header_height = this.headerSection?.getBoundingClientRect().height.toFixed(2);
      document.body.style.setProperty('--dynamic-header-height', `${header_height}px`);
    }
  }

  handleResize() {
    if (window.innerWidth > 1024) {
      if (!this.mainContent.hasScrollListener) {
        this.mainContent.addEventListener('scroll', this.handleScroll.bind(this));
        this.mainContent.hasScrollListener = true;
      }
    } else {
      this.mainContent.removeEventListener('scroll', this.handleScroll.bind(this));
      this.mainContent.hasScrollListener = false;
      // document.body.classList.remove('side-menu-active', 'overflow-hidden');
      this.closeDrawer();
    }
  }

  closeDrawer() {
    document.body.classList.remove('side-menu-active', 'overflow-hidden');
    this.drawerToggler?.classList.remove('active');
    this.close?.classList.remove('active');
    setTimeout(() => {
      this.classList.remove('open');
      setTimeout(() => {
        this.style.display = 'none';
      }, 200);
      setTimeout(() => {
        this.drawerToggler?.focus();
      }, 100);
    }, 400);
  }
}
customElements.define('side-reveal-menu', SideRevealMenu);

class AnimateMotionList extends HTMLElement {
  constructor() {
    super();
    if (typeof Motion === 'undefined') return;
    this.unload();
    Motion.inView(this, this.load.bind(this));
  }

  get allItems() {
    return this.querySelectorAll('[data-motion-list]');
  }

  get hiddenItems() {
    return this.querySelectorAll('[data-motion-list]:not([style])');
  }

  unload() {
    Motion.animate(this.allItems, { y: 100, opacity: 0, visibility: 'hidden' }, { duration: 0 });
  }

  animateItems(items) {
    Motion.animate(
      items,
      { y: [100, 0], opacity: [0, 1], visibility: ['hidden', 'visible'] },
      {
        duration: 0.5,
        delay: theme?.config?.motionReduced ? 0 : Motion.stagger(0.1),
      }
    );
  }

  load() {
    this.animateItems(this.allItems);
  }

  reload() {
    this.animateItems(this.hiddenItems);
  }
}

customElements.define('animate-motion-list', AnimateMotionList);

class AnimateElement extends HTMLElement {
  constructor() {
    super();
  }

  connectedCallback() {
    // if (theme.config.motionReduced) return;

    this.beforeInit();

    Motion.inView(this, async () => {
      // if (!this.immediate && this.media) await theme.utils.imageLoaded(this.media);
      this.init();
    });
  }

  get immediate() {
    return this.hasAttribute('data-immediate');
  }

  get media() {
    return Array.from(this.querySelectorAll('img, iframe, svg, g-map'));
  }

  get type() {
    return this.dataset.animate || 'fade-up';
  }

  get delay() {
    return parseInt(this.dataset.animateDelay || 0) / 1000;
  }

  get paused() {
    return this.hasAttribute('paused');
  }

  beforeInit() {
    if (this.paused) return;
    switch (this.type) {
      case 'fade-in':
        Motion.animate(this, { opacity: 0 }, { duration: 0 });
        break;

      case 'fade-right':
        Motion.animate(this, { transform: 'translateX(-50px)', opacity: 0 }, { duration: 0 });
        break;

      case 'fade-up':
        Motion.animate(this, { transform: 'translateY(min(2rem, 90%))', opacity: 0 }, { duration: 0 });
        break;

      case 'fade-up-large':
        Motion.animate(this, { transform: 'translateY(90%)', opacity: 0 }, { duration: 0 });
        break;

      case 'zoom-out':
        Motion.animate(this, { transform: 'scale(1.3)' }, { duration: 0 });
        break;
    }
  }

  async init() {
    if (this.paused) return;

    switch (this.type) {
      case 'fade-in':
        await Motion.animate(this, { opacity: 1 }, { duration: 1.5, delay: this.delay, easing: [0.25, 0.1, 0.25, 1] })
          .finished;
        break;

      case 'fade-right':
        await Motion.animate(
          this,
          { transform: 'translateX(0)', opacity: 1 },
          { duration: 1.5, delay: this.delay, easing: [0.16, 1, 0.3, 1] }
        ).finished;
        break;

      case 'fade-up':
        await Motion.animate(
          this,
          { transform: 'translateY(0)', opacity: 1 },
          { duration: 1.5, delay: this.delay, easing: [0.16, 1, 0.3, 1] }
        ).finished;
        break;

      case 'fade-up-large':
        await Motion.animate(
          this,
          { transform: 'translateY(0)', opacity: 1 },
          { duration: 0.8, delay: this.delay, easing: [0.16, 1, 0.3, 1] }
        ).finished;
        break;

      case 'zoom-out':
        await Motion.animate(
          this,
          { transform: 'scale(1)' },
          { duration: 1.3, delay: this.delay, easing: [0.16, 1, 0.3, 1] }
        ).finished;
        break;
    }

    this.classList.add('animate');
  }

  async reset(duration) {
    switch (this.type) {
      case 'fade-in':
        await Motion.animate(
          this,
          { opacity: 0 },
          { duration: duration ? duration : 1.5, delay: this.delay, easing: duration ? 'none' : [0.16, 1, 0.3, 1] }
        ).finished;
        break;

      case 'fade-right':
        Motion.animate(
          this,
          { transform: 'translateX(-50px)', opacity: 0 },
          { duration: duration ? duration : 1.5, delay: this.delay, easing: duration ? 'none' : [0.16, 1, 0.3, 1] }
        );
        break;

      case 'fade-up':
        await Motion.animate(
          this,
          { transform: 'translateY(max(-2rem, -90%))', opacity: 0 },
          { duration: duration ? duration : 1.5, delay: this.delay, easing: duration ? 'none' : [0.16, 1, 0.3, 1] }
        ).finished;
        break;

      case 'fade-up-large':
        await Motion.animate(
          this,
          { transform: 'translateY(-90%)', opacity: 0 },
          { duration: duration ? duration : 1, delay: this.delay, easing: duration ? 'none' : [0.16, 1, 0.3, 1] }
        ).finished;
        break;

      case 'zoom-out':
        await Motion.animate(
          this,
          { transform: 'scale(0)' },
          { duration: duration ? duration : 1.3, delay: this.delay, easing: duration ? 'none' : [0.16, 1, 0.3, 1] }
        ).finished;
        break;
    }

    this.classList.remove('animate');
  }

  refresh() {
    this.removeAttribute('paused');
    this.beforeInit();
    this.init();
  }
}
customElements.define('animate-element', AnimateElement);

class AnimatedTextComponent extends HTMLElement {
  constructor() {
    super();
    this.section = this.closest('.shopify-section');
    if (!this.section.hasAttribute('data-observed')) {
      this.initIntersectionObserver();
    }
  }

  initIntersectionObserver() {
    if (!this.section || this.section.hasAttribute('data-observed')) return;
    // Create an Intersection Observer
    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            if (!this.section.hasAttribute('data-observed')) {
              const template = this.querySelector('template');
              if (template) {
                const clone = template.content.cloneNode(true);
                this.appendChild(clone);
                this.section.setAttribute('data-observed', '');
                if (this.classList.contains('animated-text-default') || this.classList.contains('animated-text-marker_based')) {
                  this.animateText();
                }
              }
            }
          }
        });
      },
      {
        root: null, // Observe the viewport
        threshold: 0.1, // Trigger when 10% of the element is visible
      }
    );
    // Start observing the current element
    observer.observe(this.section);
  }
  // connectedCallback() {
  //   if (typeof Motion === "undefined") return;
  //   this.textSpans = [...this.querySelectorAll('[data-text-span]')];
  //   this.animateText();
  // }
  animateText() {
    if (typeof Motion === 'undefined') return;
    this.textSpans = [...this.querySelectorAll('[data-text-span]')];
    this.textSpans.forEach((span, index) => {
      Motion.inView(
        span,
        () => {
          setTimeout(() => {
            span.classList.add('animated-color');
          }, index * 5);
        },
        { once: true }
      );
    });
  }
}

customElements.define('animated-text', AnimatedTextComponent);

class AnimateIcon extends HTMLElement {
  constructor() {
    super();
    this.observer = null;
    this.shapeIcons = [];
  }

  connectedCallback() {
    this.initIntersectionObserver();
    if (typeof Motion === 'undefined') return;
    this.shapeIcons = [...this.querySelectorAll('[data-shape-icon]')];
    Motion.inView(this, this.animateIcons.bind(this));
  }

  animateIcons() {
    this.shapeIcons.forEach((icon) => {
      Motion.animate(icon, { scale: [0.4, 1] }, { ease: 'circInOut', duration: 1, ease: 'linear' });
    });
  }
  init() {
    this.shapeIcons = [...this.querySelectorAll('[data-shape-icon]')];
    this.shapeIcons.forEach((trigger) => {
      const template = trigger.querySelector('template');
      if (template) {
        const content = template.content.cloneNode(true);
        trigger.appendChild(content);
      }
    });
  }
  initIntersectionObserver() {
    const callback = (entries) => {
      entries.forEach((entry) => {
        if (entry.isIntersecting) {
          this.init();
          this.observer.unobserve(this);
        }
      });
    };
    this.observer = new IntersectionObserver(callback, {
      root: null,
      rootMargin: '0px',
      threshold: 0,
    });

    this.observer.observe(this);
  }
}

customElements.define('shape-icons', AnimateIcon);

class ageVerifier extends HTMLElement {
  constructor() {
    super();
    this.decline_btn = this.querySelector('[data-decline-age]');
    this.submit_btn = this.querySelector('[data-submit-age]');
    this.submit_incorrect = this.querySelector('[data-submit-incorrect]');
    this.cookietime = this.dataset.cookieDate;
    this.decline_btn.addEventListener('click', this.ageDeclined.bind(this));
    this.submit_btn.addEventListener('click', this.ageSubmitted.bind(this));
    this.submit_incorrect.addEventListener('click', this.ageSubmittedIncorrect.bind(this));
  }

  ageDeclined() {
    this.querySelector('[data-age-verifier]').classList.add('hidden');
    this.querySelector('[data-age-declined]').classList.remove('hidden');
  }

  ageSubmittedIncorrect() {
    this.querySelector('[data-age-verifier]').classList.remove('hidden');
    this.querySelector('[data-age-declined]').classList.add('hidden');
    this.querySelector('[data-age-verifier] button').focus();
  }

  ageSubmitted() {
    this.classList.remove('open');
    document.body.classList.remove('overflow-hidden', 'body-overlay');
    var date = new Date();
    date.setTime(date.getTime() + parseInt(this.cookietime) * 24 * 60 * 60 * 1000);
    Cookies.set('is_age_verified', 'age_verified', { expires: date, path: '/' });
    if (
      document.querySelector('newsletter-popup') &&
      document.querySelector('newsletter-popup').classList.contains('open')
    ) {
      document.querySelector('newsletter-popup button').focus();
      trapFocus(document.querySelector('newsletter-popup'));
    }
  }
}
customElements.define('age-verification-drawer', ageVerifier);

class ProductSpecificationCollapsible extends HTMLElement {
  constructor() {
    super();
    this.handleClick = this.handleClick.bind(this);
  }

  connectedCallback() {
    this.sectionId = this.dataset.section;
    if (!this.sectionId) return;

    this.specificationDrawerContainer = this.querySelector('[product-specification-drawer-content]');
    if (!this.specificationDrawerContainer) return;

    const template = this.specificationDrawerContainer.querySelector('template');
    if (!template) return;

    const existingPopup = document.querySelector(`#product-specification-${this.sectionId}`);
    if (!existingPopup) {
      const content = template.content.firstElementChild?.cloneNode(true);
      if (content) {
        document.body.appendChild(content);
      }
    }

    this.popup = document.querySelector(`#product-specification-${this.sectionId}`);
    if (!this.popup) return;

    this.tabs = this.popup.querySelector('tabs-header');

    this.querySelectorAll('[data-collapsible-item]').forEach((trigger) => {
      trigger.addEventListener('click', this.handleClick);
    });
  }

  handleClick(event) {
    const trigger = event.currentTarget;
    const triggerId = trigger.getAttribute('data-trigger-id');
    if (!triggerId || !this.popup || !this.tabs) return;

    const targetTab = this.tabs.querySelector(`[data-tab-id="${triggerId}"]`);
    if (targetTab) {
      targetTab.scrollIntoView({ behavior: 'smooth', inline: 'center' });
      targetTab.click();
    }

    this.openDrawer();
  }

  openDrawer() {
    if (!this.popup) return;

    setTimeout(() => {
      this.popup.classList.add('open', 'shadow');
      document.body.classList.add('overflow-hidden');

      setTimeout(() => {
        const focusable = this.popup.querySelector('button');
        focusable?.focus();

        if (typeof trapFocus === 'function') {
          trapFocus(this.popup);
        }
      }, 400);
    }, 400);
  }

  disconnectedCallback() {
    if (this.popup && this.popup.parentElement === document.body) {
      document.body.removeChild(this.popup);
    }
  }
}

customElements.define('product-specification-collapsible', ProductSpecificationCollapsible);

class productCollapsibleTiles extends HTMLElement {
  constructor() {
    super();
    this.handleClick = this.handleClick.bind(this);
  }

  connectedCallback() {
    this.sectionId = this.dataset.section;
    if (!this.sectionId) return;

    this.collapsibleTilesDrawerContainer = this.querySelector('[product-collapsible-tiles-content]');
    if (!this.collapsibleTilesDrawerContainer) return;

    const template = this.collapsibleTilesDrawerContainer.querySelector('template');
    if (!template) return;

    const existingPopup = document.querySelector(`#product-collapsible-tiles-${this.sectionId}`);
    if (!existingPopup) {
      const content = template.content.firstElementChild?.cloneNode(true);
      if (content) {
        document.body.appendChild(content);
      }
    }

    this.popup = document.querySelector(`#product-collapsible-tiles-${this.sectionId}`);
    if (!this.popup) return;

    this.tabs = this.popup.querySelector('tabs-header');

    this.querySelectorAll('[data-collapsible-item]').forEach((trigger) => {
      trigger.addEventListener('click', this.handleClick);
    });
  }

  handleClick(event) {
    const trigger = event.currentTarget;
    const triggerId = trigger.getAttribute('data-trigger-id');
    if (!triggerId || !this.popup || !this.tabs) return;

    const targetTab = this.tabs.querySelector(`[data-tab-id="${triggerId}"]`);
    if (targetTab) {
      targetTab.scrollIntoView({ behavior: 'smooth', inline: 'center' });
      targetTab.click();
    }

    this.openDrawer();
  }

  openDrawer() {
    if (!this.popup) return;

    setTimeout(() => {
      this.popup.classList.add('open', 'shadow');
      document.body.classList.add('overflow-hidden');

      setTimeout(() => {
        const focusable = this.popup.querySelector('button');
        focusable?.focus();

        if (typeof trapFocus === 'function') {
          trapFocus(this.popup);
        }
      }, 400);
    }, 400);
  }

  disconnectedCallback() {
    if (this.popup && this.popup.parentElement === document.body) {
      document.body.removeChild(this.popup);
    }
  }
}
customElements.define('product-collapsible-tiles', productCollapsibleTiles);

class GalleryRainbow extends HTMLElement {
  constructor() {
    super();
    this.handleScroll = this.handleScroll.bind(this);
    this.handleResize = this.handleResize.bind(this);

    this.hasStarted = false;
    this.progress = 0;

    this.headerSection = document.querySelector('[data-header-section]');
    this.mainContent = document.querySelector('.main-content-wrapper');

  }

  connectedCallback() {
    this.svg = this.querySelector('svg');
    this.paths = this.svg.querySelectorAll('path');
    this.maxDash = 400;

    const delayStep = 0.1;
    this.startPoints = Array.from(this.paths).map((_, i) => i * delayStep);

    this.paths.forEach(path => {
      path.style.strokeDasharray = `0, ${this.maxDash}`;
    });


    const options = {
      root: null,
      rootMargin: '0px',
      threshold: 0.1
    };

    this.observer = new IntersectionObserver(this.handleIntersection.bind(this), options);
    this.observer.observe(this);

    window.addEventListener('resize', this.handleResize);

  }

  disconnectedCallback() {
    if (this.observer) {
      this.observer.unobserve(this);
    }
    window.removeEventListener('scroll', this.handleScroll);
    if (this.mainContent) {
      this.mainContent.removeEventListener('scroll', this.handleScroll);
    }
    window.removeEventListener('resize', this.handleResize);

  }

  handleResize() {
    this.setScrollTarget();
  }

  setScrollTarget() {
    if (
      this.mainContent &&
      this.headerSection?.classList.contains('header-style-side-reveal-menu') &&
      window.innerWidth > 1024
    ) {
      this.mainContent.addEventListener('scroll', this.handleScroll, { passive: true });
      window.removeEventListener('scroll', this.handleScroll);
    } else {
      window.addEventListener('scroll', this.handleScroll, { passive: true });
      if (this.mainContent) {
        this.mainContent.removeEventListener('scroll', this.handleScroll);
      }
    }
  }


  handleIntersection(entries, observer) {
    entries.forEach(entry => {
      if (entry.isIntersecting && !this.hasStarted) {

        this.hasStarted = true;
        this.setScrollTarget();
        // window.addEventListener('scroll', this.handleScroll, { passive: true });
        this.handleScroll();
      }
    });
  }

  handleScroll() {
    const rect = this.getBoundingClientRect();
    const windowH = window.innerHeight;

    const start = windowH;
    const end = windowH * 0.5;

    const totalScroll = start - end;
    const current = start - rect.top;

    let progress = current / totalScroll;
    progress = Math.max(0, Math.min(progress, 1));

    this.updateAnimation(progress);

    if (current <= 0) {
      this.updateAnimation(0);
    }
  }

  updateAnimation(progress) {
    this.paths.forEach((path, i) => {
      let startP = this.startPoints[i];
      let fillProgress = (progress - startP) / (1 - startP);
      fillProgress = Math.max(0, Math.min(fillProgress, 1));

      let dash = fillProgress * this.maxDash;
      path.style.strokeDasharray = `${dash}, ${this.maxDash}`;
    });
  }
}

customElements.define('gallery-rainbow', GalleryRainbow);

class galleryRainbowTop extends HTMLElement {
  constructor() {
    super();
    this.handleScroll = this.handleScroll.bind(this);
    this.handleResize = this.handleResize.bind(this);

    this.hasStarted = false;
    this.progress = 0;

    this.headerSection = document.querySelector('[data-header-section]');
    this.mainContent = document.querySelector('.main-content-wrapper');
  }

  connectedCallback() {
    this.svg = this.querySelector('svg');
    this.paths = this.svg.querySelectorAll('path');
    this.maxDash = 400;

    const delayStep = 0.1;
    this.startPoints = Array.from(this.paths).map((_, i) => i * delayStep);

    this.paths.forEach(path => {
      path.style.strokeDasharray = `0, ${this.maxDash}`;
    });

    const options = {
      root: null,
      rootMargin: '0px 0px -40% 0px',
      threshold: 0
    };

    this.observer = new IntersectionObserver(this.handleIntersection.bind(this), options);
    this.observer.observe(this);

    window.addEventListener('resize', this.handleResize);
  }

  disconnectedCallback() {
    if (this.observer) {
      this.observer.unobserve(this);
    }
    window.removeEventListener('scroll', this.handleScroll);
    if (this.mainContent) {
      this.mainContent.removeEventListener('scroll', this.handleScroll);
    }
    window.removeEventListener('resize', this.handleResize);
  }

  handleResize() {
    this.setScrollTarget();
  }

  setScrollTarget() {
    if (
      this.mainContent &&
      this.headerSection?.classList.contains('header-style-side-reveal-menu') &&
      window.innerWidth > 1024
    ) {
      this.mainContent.addEventListener('scroll', this.handleScroll, { passive: true });
      window.removeEventListener('scroll', this.handleScroll);
    } else {
      window.addEventListener('scroll', this.handleScroll, { passive: true });
      if (this.mainContent) {
        this.mainContent.removeEventListener('scroll', this.handleScroll);
      }
    }
  }

  handleIntersection(entries) {
    entries.forEach(entry => {
      if (entry.isIntersecting && !this.hasStarted) {
        this.hasStarted = true;
        this.setScrollTarget();
      }
    });
  }

  handleScroll() {
    const rect = this.getBoundingClientRect();
    const windowH = window.innerHeight;

    const scrollStart = windowH * 0.8;
    const scrollDistance = windowH * 0.5;

    const scrolled = scrollStart - rect.top;
    let progress = scrolled / scrollDistance;

    progress = Math.max(0, Math.min(progress, 1));

    this.updateAnimation(progress);
  }

  updateAnimation(progress) {
    this.paths.forEach((path, i) => {
      let startP = this.startPoints[i];
      let fillProgress = (progress - startP) / (1 - startP);
      fillProgress = Math.max(0, Math.min(fillProgress, 1));

      let dash = fillProgress * this.maxDash;
      path.style.strokeDasharray = `${dash}, ${this.maxDash}`;
    });
  }
}

customElements.define('gallery-rainbow-top', galleryRainbowTop);

class GiftWrapping extends HTMLElement {
  constructor() {
    super();
    this.giftWrapId = this.dataset.giftWrapId;
    this.giftWrapsInCart = parseInt(this.getAttribute('gift-wraps-in-cart'));
    this.itemInCart = parseInt(this.getAttribute('item-in-cart'));
    (this.cartItemsSize = parseInt(this.getAttribute('cart-items-size'))),
      (this.itemsInCart = parseInt(this.getAttribute('items-in-cart')));

    if (this.cartItemsSize == 1 && this.giftWrapsInCart > 0) return this.removeGiftWrap();

    const debouncedOnChange = debounce(this.onChange.bind(this), 10);
    this.addEventListener('change', debouncedOnChange);

    if (this.giftWrapsInCart === 1) {
      this.hideGiftWrappingSection();
    }
  }

  onChange(event) {
    if (event.target.checked) {
      this.setAttribute('gift-wraps-in-cart', '1');
      this.addGiftWrap();
    }
  }

  addGiftWrap() {
    const body = JSON.stringify({
      updates: {
        [this.giftWrapId]: this.itemInCart,
      },
      sections:
        this.getAttribute('gift-template') === 'cart'
          ? this.getcartSectionsToRender().map((section) => section.section)
          : this.getSectionsToRender().map((section) => section.section),
      sections_url: window.location.pathname,
    });

    this.fetchGiftWrap(body);
    if (this.giftWrapsInCart === 1) {
      this.hideGiftWrappingSection();
    }
  }
  removeGiftWrap() {
    const body = JSON.stringify({
      updates: {
        [this.giftWrapId]: 0,
      },
      sections:
        this.getAttribute('gift-template') === 'cart'
          ? this.getcartSectionsToRender().map((section) => section.section)
          : this.getSectionsToRender().map((section) => section.section),
      sections_url: window.location.pathname,
    });
    this.fetchGiftWrap(body);
  }

  fetchGiftWrap(body) {
    fetch(`${routes.cart_update_url}`, { ...fetchConfig(), ...{ body } })
      .then((response) => response.text())
      .then((state) => {
        const parsedState = JSON.parse(state);

        const sectionsToRender =
          this.getAttribute('gift-template') === 'cart' ? this.getcartSectionsToRender() : this.getSectionsToRender();

        if (this.getAttribute('gift-template') === 'cart') {
          sectionsToRender.forEach((section) => {
            const elementToReplace =
              document.getElementById(section.id).querySelector(section.selector) ||
              document.getElementById(section.id);
            elementToReplace.innerHTML = this.getSectionInnerHTML(
              parsedState.sections[section.section],
              section.selector
            );
            const cartHtml = this.getSectionInnerHTML(parsedState.sections[section.section], section.selector);
            const chtml = new DOMParser().parseFromString(cartHtml, 'text/html');
            const cartCount = chtml.querySelector('cart-remove-button');
            if (cartCount) {
              const cartItems = cartCount.dataset.count;
              if (cartItems == 0 || cartItems == '0' || cartItems == '') {
                document.querySelector('[data-cart-count]').classList.add('hidden');
                document.querySelector('[data-cart-count]').textContent = '';
              } else if (parseInt(cartItems) > 99) {
                document.querySelector('[data-cart-count]').classList.remove('hidden');
                document.querySelector('[data-cart-count]').classList.add('large-items');
                document.querySelector('[data-cart-count]').textContent = cartItems;
              } else {
                document.querySelector('[data-cart-count]').classList.remove('hidden', 'large-items');
                document.querySelector('[data-cart-count]').textContent = cartItems;
              }
            } else {
              document.querySelector('[data-cart-count]').classList.add('hidden');
              document.querySelector('[data-cart-count]').textContent = '';
            }
          });
        } else {
          this.getSectionsToRender().forEach((section) => {
            const elementToReplace =
              document.getElementById(section.id).querySelector(section.selector) ||
              document.getElementById(section.id);
            const cartHtml = this.getSectionInnerHTML(parsedState.sections[section.section], section.selector);
            const html = new DOMParser().parseFromString(cartHtml, 'text/html');
            const drawerContentD = elementToReplace.querySelector('[data-cart-drawer-body]');
            const drawerContentS = html.querySelector('[data-cart-drawer-body]');

            if (drawerContentS && drawerContentD) {
              drawerContentD.innerHTML = '';
              drawerContentD.innerHTML = drawerContentS.innerHTML;
            }

            const drawerbodyD = elementToReplace.querySelector('[data-cart-drawer-body]');
            const drawerbodyS = html.querySelector('[data-cart-drawer-body]');

            if (drawerbodyS && drawerbodyD) {
              drawerbodyD.innerHTML = '';
              drawerbodyD.innerHTML = drawerbodyS.innerHTML;
            }

            const drawerheaderD = elementToReplace.querySelector('[data-cart-drawer-header]');
            const drawerheaderS = html.querySelector('[data-cart-drawer-header]');

            if (drawerheaderS && drawerheaderD) {
              drawerheaderD.innerHTML = '';
              drawerheaderD.innerHTML = drawerheaderS.innerHTML;
            }


            const drawerFooterContentD = elementToReplace.querySelector('[data-cart-drawer-footer-content]');
            const drawerFooterContentS = html.querySelector('[data-cart-drawer-footer-content]');
            if (drawerFooterContentS == null) {
              elementToReplace.innerHTML = this.getSectionInnerHTML(
                parsedState.sections[section.section],
                section.selector
              );
              document.querySelector('[data-cart-count]').classList.add('hidden');
              document.querySelector('[data-cart-count]').textContent = '';
            } else {
              drawerFooterContentD.innerHTML = '';
              drawerFooterContentD.innerHTML = drawerFooterContentS.innerHTML;
              const cartCount = html.querySelector('[data-cart-items]');
              if (cartCount) {
                const cartItems = cartCount.dataset.cartItems;
                if (cartItems == 0 || cartItems == '0' || cartItems == '') {
                  document.querySelector('[data-cart-count]').classList.add('hidden');
                  document.querySelector('[data-cart-count]').textContent = '';
                } else if (parseInt(cartItems) > 99) {
                  document.querySelector('[data-cart-count]').classList.remove('hidden');
                  document.querySelector('[data-cart-count]').classList.add('large-items');
                  document.querySelector('[data-cart-count]').textContent = cartItems;
                } else {
                  document.querySelector('[data-cart-count]').classList.remove('hidden', 'large-items');
                  document.querySelector('[data-cart-count]').textContent = cartItems;
                }
              }
            }
          });
        }

        this.hideGiftWrappingSection();
      })
      .catch((error) => {
        console.log(error);
      });
  }

  hideGiftWrappingSection() {
    document.querySelector('[gift-wrapping-section]').style.display = 'none';
  }

  getSectionsToRender() {
    return [
      {
        id: 'CartDrawer',
        section: document.querySelector('[cart-drawer-section]').dataset.id,
        selector: '.drawer-wrapper',
      },
    ];
  }

  getcartSectionsToRender() {
    return [
      {
        id: 'main-cart',
        section: document.querySelector('[data-cart-wrapper]').dataset.id,
        selector: '.main-cart-render',
      }
    ];
  }

  getSectionInnerHTML(html, selector) {
    return new DOMParser().parseFromString(html, 'text/html').querySelector(selector).innerHTML;
  }
}

customElements.define('gift-wrapping', GiftWrapping);

class showcaseGallerySection extends HTMLDivElement {
  constructor() {
    super();
    this.unload();
    // Motion.inView(this, this.load.bind(this));
  }

  connectedCallback() {
    const options = {
      root: null,
      rootMargin: '0px 0px -60% 0px', // top, right, bottom, left
      threshold: 0
    };

    this.observer = new IntersectionObserver(this.handleIntersection.bind(this), options);
    this.observer.observe(this);
  }

  disconnectedCallback() {
    if (this.observer) {
      this.observer.unobserve(this);
    }
  }

  unload() {
    Motion.animate(this.allItems, { y: 100, opacity: 0, visibility: 'hidden' }, { duration: 0 });
  }
  animateItems(items) {
    Motion.animate(
      items,
      { y: [100, 0], opacity: [0, 1], visibility: ['hidden', 'visible'] },
      {
        duration: 0.5,
        delay: theme?.config?.motionReduced ? 0 : Motion.stagger(0.2),
      }
    );
  }
  load() {
    this.animateItems(this.allItems);
  }
  handleIntersection(entries) {
    entries.forEach(entry => {
      if (entry.isIntersecting) {
        this.load();
      } else {
        this.unload();
      }
    });
  }
  get allItems() {
    return this.querySelectorAll('.showcase-gallery-image');
  }
}

customElements.define('showcase-gallery-section', showcaseGallerySection, { extends: 'div' });

/*
class PeekaBoo extends HTMLElement {
  constructor() {
    super();
    this.handleHover = this.handleHover.bind(this);
    this.lastSide = null;
    this.lastRotation = '0deg';
    this.show = false;
  }

  connectedCallback() {
    const template = this.querySelector('template');
    this.iconWrapper = this.querySelector('[data-peek-a-boo-icon]');
    if (template && this.iconWrapper) {
      const icon = template.content.firstElementChild.cloneNode(true);
      this.iconWrapper.innerHTML = '';
      this.iconWrapper.appendChild(icon);
    }

    if (this.iconWrapper) {
      this.iconWrapper.style.position = 'fixed';
      this.iconWrapper.style.transition = 'transform 0.4s cubic-bezier(0.68, -0.55, 0.27, 1.55)';
      this.iconWrapper.addEventListener('mouseenter', this.handleHover);
      this.handleHover();
    }
  }

  disconnectedCallback() {
    if (this.iconWrapper) {
      this.iconWrapper.removeEventListener('mouseenter', this.handleHover);
    }
  }

  handleHover() {
    const viewportWidth = window.innerWidth;
    const viewportHeight = window.innerHeight;
    const rect = this.iconWrapper.getBoundingClientRect();
    const iconWidth = rect.width;
    const iconHeight = rect.height;

    const sides = ['left', 'right', 'top', 'bottom'];
    let newSide = this.lastSide;
    while (newSide === this.lastSide) {
      newSide = sides[Math.floor(Math.random() * sides.length)];
    }

    // determine rotation for new side
    let newRotation = '0deg';
    if (newSide === 'left') newRotation = '180deg';
    else if (newSide === 'top') newRotation = '-90deg';
    else if (newSide === 'bottom') newRotation = '90deg';

    // Step 1: slide out from current side, keep current rotation
    if (this.lastSide) {
      this.iconWrapper.style.transform = this.getSlideOutTransform(this.lastSide, this.lastRotation);
    }

    setTimeout(() => {
      if (this.show == false) {
        this.classList.remove('hidden');
        this.show = true;
      }
      // remove transition & reset transform
      this.iconWrapper.style.transition = 'none';
      this.iconWrapper.style.transform = 'none';

      // reset positions
      this.iconWrapper.style.left = '';
      this.iconWrapper.style.right = '';
      this.iconWrapper.style.top = '';
      this.iconWrapper.style.bottom = '';

      // place on new side, start offscreen with new rotation
      if (newSide === 'left') {
        this.iconWrapper.style.left = '-10px';
        const maxTop = viewportHeight - iconHeight;
        const randomTop = Math.floor(Math.random() * maxTop);
        this.iconWrapper.style.top = `${randomTop}px`;
        this.iconWrapper.style.transform = `translateX(-100%) rotate(${newRotation})`;
      } else if (newSide === 'right') {
        this.iconWrapper.style.right = '-10px';
        const maxTop = viewportHeight - iconHeight;
        const randomTop = Math.floor(Math.random() * maxTop);
        this.iconWrapper.style.top = `${randomTop}px`;
        this.iconWrapper.style.transform = `translateX(100%) rotate(${newRotation})`;
      } else if (newSide === 'top') {
        this.iconWrapper.style.top = '-10px';
        const maxLeft = viewportWidth - iconWidth;
        const randomLeft = Math.floor(Math.random() * maxLeft);
        this.iconWrapper.style.left = `${randomLeft}px`;
        this.iconWrapper.style.transform = `translateY(-100%) rotate(${newRotation})`;
      } else if (newSide === 'bottom') {
        this.iconWrapper.style.bottom = '-10px';
        const maxLeft = viewportWidth - iconWidth;
        const randomLeft = Math.floor(Math.random() * maxLeft);
        this.iconWrapper.style.left = `${randomLeft}px`;
        this.iconWrapper.style.transform = `translateY(100%) rotate(${newRotation})`;
      }

      // force reflow
      void this.iconWrapper.offsetWidth;

      // re-enable transition & slide in
      this.iconWrapper.style.transition = 'transform 0.4s cubic-bezier(0.68, -0.55, 0.27, 1.55)';
      this.iconWrapper.style.transform = `translate(0, 0) rotate(${newRotation})`;

      // save last side & rotation
      this.lastSide = newSide;
      this.lastRotation = newRotation;
    }, 400);
  }

  getSlideOutTransform(side, rotation) {
    switch (side) {
      case 'left': return `translateX(-100%) rotate(${rotation})`;
      case 'right': return `translateX(100%) rotate(${rotation})`;
      case 'top': return `translateY(-100%) rotate(${rotation})`;
      case 'bottom': return `translateY(100%) rotate(${rotation})`;
      default: return `rotate(${rotation})`;
    }
  }
}

customElements.define('peeka-boo', PeekaBoo);
*/

class PeekaBoo extends HTMLElement {
  constructor() {
    super();
    this.handleHover = this.handleHover.bind(this);
    this.handleScroll = this.handleScroll.bind(this);
    this.lastSide = null;
    this.lastRotation = '0deg';
    this.show = false;
    this.scrollIdleTimer = null;
  }

  connectedCallback() {
    const template = this.querySelector('template');
    this.iconWrapper = this.querySelector('[data-peek-a-boo-icon]');
    if (template && this.iconWrapper) {
      const icon = template.content.firstElementChild.cloneNode(true);
      this.iconWrapper.innerHTML = '';
      this.iconWrapper.appendChild(icon);
    }

    if (this.iconWrapper) {
      this.iconWrapper.style.position = 'fixed';
      this.iconWrapper.style.transition = 'transform 0.4s cubic-bezier(0.68, -0.55, 0.27, 1.55)';
      this.iconWrapper.addEventListener('mouseenter', this.handleHover);
      this.handleHover();
    }

    window.addEventListener('scroll', this.handleScroll);
  }

  disconnectedCallback() {
    if (this.iconWrapper) {
      this.iconWrapper.removeEventListener('mouseenter', this.handleHover);
    }
    window.removeEventListener('scroll', this.handleScroll);
    clearTimeout(this.scrollIdleTimer);
  }

  handleScroll() {
    const scrollTop = window.scrollY || document.documentElement.scrollTop;
    if (scrollTop > 100 && this.show) {
      this.hideIcon();
    }

    // Reset idle timer on scroll
    clearTimeout(this.scrollIdleTimer);
    this.scrollIdleTimer = setTimeout(() => {
      if (!this.show) {
        this.handleHover(); // trigger reappearance using hover logic
      }
    }, 30000); // 30 seconds
  }

  hideIcon() {
    if (!this.iconWrapper || !this.lastSide) return;

    this.iconWrapper.style.transform = this.getSlideOutTransform(this.lastSide, this.lastRotation);
    this.show = false;
  }

  handleHover() {
    const viewportWidth = window.innerWidth;
    const viewportHeight = window.innerHeight;
    const rect = this.iconWrapper.getBoundingClientRect();
    const iconWidth = rect.width;
    const iconHeight = rect.height;

    const sides = ['left', 'right', 'top', 'bottom'];
    let newSide = this.lastSide;
    while (newSide === this.lastSide) {
      newSide = sides[Math.floor(Math.random() * sides.length)];
    }

    let newRotation = '0deg';
    if (newSide === 'left') newRotation = '180deg';
    else if (newSide === 'top') newRotation = '-90deg';
    else if (newSide === 'bottom') newRotation = '90deg';

    // Slide out current icon
    if (this.lastSide && this.show) {
      this.iconWrapper.style.transform = this.getSlideOutTransform(this.lastSide, this.lastRotation);
    }

    setTimeout(() => {
      // Show wrapper if hidden
      if (this.show === false) {
        this.classList.remove('hidden');
        this.show = true;
      }

      // Reset styles
      this.iconWrapper.style.transition = 'none';
      this.iconWrapper.style.transform = 'none';
      this.iconWrapper.style.left = '';
      this.iconWrapper.style.right = '';
      this.iconWrapper.style.top = '';
      this.iconWrapper.style.bottom = '';

      // Position on new side
      if (newSide === 'left') {
        this.iconWrapper.style.left = '-10px';
        const maxTop = viewportHeight - iconHeight;
        const randomTop = Math.floor(Math.random() * maxTop);
        this.iconWrapper.style.top = `${randomTop}px`;
        this.iconWrapper.style.transform = `translateX(-100%) rotate(${newRotation})`;
      } else if (newSide === 'right') {
        this.iconWrapper.style.right = '-10px';
        const maxTop = viewportHeight - iconHeight;
        const randomTop = Math.floor(Math.random() * maxTop);
        this.iconWrapper.style.top = `${randomTop}px`;
        this.iconWrapper.style.transform = `translateX(100%) rotate(${newRotation})`;
      } else if (newSide === 'top') {
        this.iconWrapper.style.top = '-10px';
        const maxLeft = viewportWidth - iconWidth;
        const randomLeft = Math.floor(Math.random() * maxLeft);
        this.iconWrapper.style.left = `${randomLeft}px`;
        this.iconWrapper.style.transform = `translateY(-100%) rotate(${newRotation})`;
      } else if (newSide === 'bottom') {
        this.iconWrapper.style.bottom = '-10px';
        const maxLeft = viewportWidth - iconWidth;
        const randomLeft = Math.floor(Math.random() * maxLeft);
        this.iconWrapper.style.left = `${randomLeft}px`;
        this.iconWrapper.style.transform = `translateY(100%) rotate(${newRotation})`;
      }

      // Force reflow
      void this.iconWrapper.offsetWidth;

      // Animate in
      this.iconWrapper.style.transition = 'transform 0.4s cubic-bezier(0.68, -0.55, 0.27, 1.55)';
      this.iconWrapper.style.transform = `translate(0, 0) rotate(${newRotation})`;

      // Save state
      this.lastSide = newSide;
      this.lastRotation = newRotation;
    }, 400);
  }

  getSlideOutTransform(side, rotation) {
    switch (side) {
      case 'left': return `translateX(-100%) rotate(${rotation})`;
      case 'right': return `translateX(100%) rotate(${rotation})`;
      case 'top': return `translateY(-100%) rotate(${rotation})`;
      case 'bottom': return `translateY(100%) rotate(${rotation})`;
      default: return `rotate(${rotation})`;
    }
  }
}

customElements.define('peeka-boo', PeekaBoo);


class ScrollObserver {
  constructor() {
    this.handleScroll = this.handleScroll.bind(this);
    this.handleResize = this.handleResize.bind(this);

    this.headerSection = document.querySelector('[data-header-section]');
    this.mainContent = document.querySelector('.main-content-wrapper');

    this.setScrollTarget();

    window.addEventListener('resize', this.handleResize);

    if (window.Motion) {
      this.animate = window.Motion.animate;
    }

    this.targetY = 0;
    this.currentY = 0;
    this.currentScrollTop = 0;

    this.handleScroll();
  }

  setScrollTarget() {
    if (
      this.mainContent &&
      this.headerSection?.classList.contains('header-style-side-reveal-menu') &&
      window.innerWidth > 1024
    ) {
      this.mainContent.addEventListener('scroll', this.handleScroll);
      window.removeEventListener('scroll', this.handleScroll);
    } else {
      window.addEventListener('scroll', this.handleScroll);
      if (this.mainContent) {
        this.mainContent.removeEventListener('scroll', this.handleScroll);
      }
    }
  }

  handleResize() {
    this.setScrollTarget();
  }

  handleScroll() {
    document.querySelectorAll('section').forEach((section) => {
      if (isOnScreen(section)) {
        setTimeout(() => {
          section.querySelectorAll('video').forEach(function (video) {
            if (video.hasAttribute('autoplay') && !video.classList.contains('product-media-video')) {
              video.play();
            }
          });
        }, 500);
      } else {
        section.querySelectorAll('video').forEach(function (video) {
          if (!video.classList.contains('product-video-popup') && !video.classList.contains('product-media-video')) {
            video.pause();
          }
        });
        section.querySelectorAll('.youtube-video').forEach((video) => {
          video.contentWindow.postMessage('{"event":"command","func":"pauseVideo","args":""}', '*');
        });
        section.querySelectorAll('.youtube_video').forEach((video) => {
          video.contentWindow.postMessage('{"event":"command","func":"pauseVideo","args":""}', '*');
        });
        section.querySelectorAll('.vimeo_video').forEach((video) => {
          video.contentWindow.postMessage('{"method":"pause"}', '*');
        });
        section.querySelectorAll('.vimeo-video').forEach((video) => {
          video.contentWindow.postMessage('{"method":"pause"}', '*');
        });
      }
    });
  }
}

let scrollObserver = new ScrollObserver();

function scroll_sections_on_editor(section) {
  if (!section || window.innerWidth <= 1024) return;

  const headerSection = document.querySelector('[data-header-section]');
  const mainContent = document.querySelector('.main-content-wrapper');
  const topOffset = 200;

  const isSideReveal = headerSection?.classList.contains('header-style-side-reveal-menu');
  if (mainContent && isSideReveal) {
    const sectionTop = section.offsetTop - mainContent.offsetTop - topOffset;

    mainContent.scrollTo({
      top: sectionTop,
      behavior: 'smooth',
    });

    // section.scrollIntoView({ behavior: 'smooth', block: 'start' });
  }
}

document.addEventListener('shopify:section:load', (event) => {
  let _target = event.target;
  scrollObserver.handleScroll(_target);

  scroll_sections_on_editor(_target);

  document.querySelectorAll('details').forEach((el) => {
    const accordion = new Accordion(el);
    el._accordionInstance = accordion;
  });

  if (_target.querySelector('quick-view-drawer')) {
    _target.querySelector('quick-view-drawer').classList.add('open');
    document.body.classList.add('overflow-hidden');
  }

  if (_target.querySelector('age-verification-drawer')) {
    _target.querySelector('age-verification-drawer').classList.add('open');
    document.body.classList.add('overflow-hidden', 'body-overlay');
  }

  if (_target.querySelector('newsletter-popup')) {
    _target.querySelector('newsletter-popup').classList.add('open');
    document.body.classList.add('overflow-hidden');
  }

  if (_target.querySelector('.showcase-gallery-holder')) {
    _target.querySelector('.showcase-gallery-holder').classList.add('grid-view-selected');
  }
  // inviewSection();
});

document.addEventListener('shopify:section:select', (event) => {
  let _target = event.target;
  scroll_sections_on_editor(_target);
  if (_target.querySelector('quick-view-drawer')) {
    _target.querySelector('quick-view-drawer').classList.add('open');
    document.body.classList.add('overflow-hidden');
  }

  if (_target.querySelector('age-verification-drawer')) {
    _target.querySelector('age-verification-drawer').classList.add('open');
    document.body.classList.add('overflow-hidden', 'body-overlay');
  }

  if (_target.querySelector('newsletter-popup')) {
    _target.querySelector('newsletter-popup').classList.add('open');
    document.body.classList.add('overflow-hidden');
  }

  if (_target.querySelector('.showcase-gallery-holder')) {
    _target.querySelector('.showcase-gallery-holder').classList.add('grid-view-selected');
  }
});

document.addEventListener('shopify:section:deselect', (event) => {
  let _target = event.target;
  if (_target.querySelector('quick-view-drawer')) {
    _target.querySelector('quick-view-drawer').classList.remove('open');
    document.body.classList.remove('overflow-hidden', 'body-overlay');
  }

  if (_target.querySelector('age-verification-drawer')) {
    _target.querySelector('age-verification-drawer').classList.remove('open');
    document.body.classList.remove('overflow-hidden', 'body-overlay');
  }

  if (_target.querySelector('newsletter-popup')) {
    _target.querySelector('newsletter-popup').classList.remove('open');
    document.body.classList.remove('overflow-hidden', 'body-overlay');
  }

  if (_target.querySelector('.showcase-gallery-holder')) {
    _target.querySelector('.showcase-gallery-holder').classList.remove('grid-view-selected');
  }
});

document.addEventListener('shopify:section:unload', (event) => {
  let _target = event.target;
  if (_target.querySelector('quick-view-drawer')) {
    _target.querySelector('quick-view-drawer').classList.remove('open');
    document.body.classList.remove('overflow-hidden', 'body-overlay');
  }

  if (_target.querySelector('age-verification-drawer')) {
    _target.querySelector('age-verification-drawer').classList.remove('open');
    document.body.classList.remove('overflow-hidden', 'body-overlay');
  }

  if (_target.querySelector('newsletter-popup')) {
    _target.querySelector('newsletter-popup').classList.remove('open');
    document.body.classList.remove('overflow-hidden', 'body-overlay');
  }
});

document.addEventListener('shopify:block:select', (event) => {
  let _target = event.target;
  // scroll_sections_on_editor(_target);
  setTimeout(() => {
    if (_target.classList.contains('swiper-slide')) {
      let slideIndex = _target.dataset.swiperSlideIndex;
      // if (slideIndex != undefined) {
      //   _target.closest('swiper-slideshow')._selectSlide(slideIndex);
      // }
      let swiperContainer = _target.closest('swiper-slideshow') || _target.closest('swiper-slider');
      if (swiperContainer && typeof swiperContainer._selectSlide === 'function') {
        swiperContainer._selectSlide(slideIndex);
      }
    }
  }, 50);
});
