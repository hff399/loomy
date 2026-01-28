function debounce(fn, wait) {
  let t;
  return (...args) => {
    clearTimeout(t);
    t = setTimeout(() => fn.apply(this, args), wait);
  };
}

class FilterForm extends HTMLElement {
  constructor() {
    super();
    this.onActiveFilterClick = this.onActiveFilterClick.bind(this);
    this.debouncedOnSubmit = debounce((event) => {
      this.onSubmitHandler(event);
    }, 500);

    const facetForm = this.querySelector('form');
    facetForm.addEventListener('input', this.debouncedOnSubmit.bind(this));

    facetForm.querySelectorAll('input').forEach((input) => {
      input.addEventListener('keydown', (event) => {
        if (event.key === 'Enter') {
          event.preventDefault();
          input.checked = !input.checked;
          input.dispatchEvent(new Event('change', { bubbles: true }));
          this.onSubmitHandler(input);
        }
      });
    });

    facetForm.querySelectorAll('li').forEach(liElem => {
      liElem.addEventListener('keydown', (event) => {
        if (event.key === 'Enter') {
          event.preventDefault();
          const inputElem = liElem.querySelector('label');
          if (inputElem) {
            inputElem.focus();
            inputElem.dispatchEvent(new MouseEvent('click', { bubbles: true, cancelable: true }));
          }
        }
      });
    });

    const filterToggles = this.querySelectorAll('[data-mobile-filter-toggle]');
    if (filterToggles.length) {
      filterToggles.forEach(toggle => {
        toggle.addEventListener('click', this.closeMobilePopover.bind(this));
      });
    }
  }

  closeMobilePopover() {
    const mobilePopover = this.closest('[data-filters-sidebar]').classList.remove('active');
    this.mainCollectionWrapper = this.closest('[data-collection-wrapper]');
    this.productsWrapper = this.mainCollectionWrapper?.querySelector('[data-products-wrapper]');

    if (this.productsWrapper) {
      this.triggerToggle = this.mainCollectionWrapper.querySelector('filter-toggler');

      if (this.triggerToggle) {
        const filtersNav = this.triggerToggle.querySelector('[data-filters-nav]');
        if (filtersNav) {
          filtersNav.classList.remove('active');

          const span = filtersNav.querySelector('[data-filter-text]');
          if (span) {
            span.innerText = showFilters;
          }
        }
      }

      this.productsWrapper.classList.remove('open-filter', 'mobile-drawer-filter');
      document.body.classList.remove('overflow-hidden', 'active-inner-drawer');
    }
  }

  createSearchParams(form) {
    return new URLSearchParams(new FormData(form)).toString();
  }

  // onSubmitHandler(event) {
  //   event.preventDefault();
  //   console.log('on subit');
  //   const sortingFilterForms = document.querySelectorAll('filter-faced-form form');
  //   let forms = [];
  //   sortingFilterForms.forEach((sortingFilterForm) => {
  //     forms.push(this.createSearchParams(sortingFilterForm));
  //   });
  //   forms = forms.filter(function (el) {
  //     return el;
  //   });
  //   this.onSubmitForm(forms.join('&'), event);
  // }

  onSubmitHandler(eventOrInput) {
    if (eventOrInput instanceof Event) {
      eventOrInput.preventDefault();
      console.log('Submit triggered by event:', eventOrInput);
    } else {
      console.log('Submit triggered by input element:', eventOrInput);
    }
    const sortingFilterForms = document.querySelectorAll('filter-faced-form form');
    let forms = [];
    sortingFilterForms.forEach((sortingFilterForm) => {
      forms.push(this.createSearchParams(sortingFilterForm));
    });
    forms = forms.filter(el => el); // Remove empty values
    this.onSubmitForm(forms.join('&'), eventOrInput);
  }

  onSubmitForm(searchParams, event) {
    const query = document.querySelector('[search-page-input]');
    if (query) {
      const queryValue = query.value;
      searchParams = `${searchParams}&type=product&q=${queryValue}`;
    }
    FilterForm.renderPage(searchParams, event);
  }

  onActiveFilterClick(event) {
    event.preventDefault();
    const url =
      event.currentTarget.href.indexOf('?') == -1
        ? ''
        : event.currentTarget.href.slice(event.currentTarget.href.indexOf('?') + 1);
    FilterForm.renderPage(url);
  }

  static updateURLHash(searchParams) {
    history.pushState({ searchParams }, '', `${window.location.pathname}${searchParams && '?'.concat(searchParams)}`);
  }

  static getSections() {
    const collectioSection = document.getElementById('collection--list-grid');
    const searchSection = document.getElementById('search--list-grid');
    if (collectioSection) {
      return [
        {
          section: document.getElementById('collection--list-grid').dataset.id,
        },
      ];
    }
    if (searchSection) {
      return [
        {
          section: document.getElementById('search--list-grid').dataset.id,
        },
      ];
    }
  }

  static renderPage(searchParams, event, updateURLHash = true) {
    let currentId = '';
    if (typeof event !== 'undefined') {
      currentId = event.id;
    }
    FilterForm.searchParamsPrev = searchParams;
    const sections = FilterForm.getSections();
    sections.forEach((section) => {
      const query = document.querySelector('[search-page-input]');
      if (query) {
        const queryValue = query.value;
        const url = `${window.location.pathname}?section_id=${section.section}&q=${queryValue}&${searchParams}`;
        FilterForm.renderSectionFromFetch(url, event, currentId);
      } else {
        const url = `${window.location.pathname}?section_id=${section.section}&${searchParams}`;
        FilterForm.renderSectionFromFetch(url, event, currentId);
      }
    });
    if (updateURLHash) {
      FilterForm.updateURLHash(searchParams);
    }
  }

  static renderSectionFromFetch(url, event, currentId) {
    fetch(url)
      .then((response) => response.text())
      .then((responseText) => {
        const html = responseText;
        FilterForm.renderFiltersBar(html, event);
        FilterForm.renderProductGrid(html);
        if (currentId != '') {
          document.getElementById(currentId).focus();
        }
      });
  }
  static renderProductGrid(html) {
    // const searchGrid = document.querySelector('.search--result-body');
    const resultData = new DOMParser().parseFromString(html, 'text/html');
    if (document.querySelector('[data-collections-grid]') && resultData.querySelector('[data-collections-grid]')) {
      document.querySelector('[data-collections-grid]').innerHTML =
        resultData.querySelector('[data-collections-grid]').innerHTML;
    }
    if (
      document.querySelector('[main-search-products-count]') &&
      resultData.querySelector('[main-search-products-count]')
    ) {
      document.querySelector('[main-search-products-count]').innerHTML =
        resultData.querySelector('[main-search-products-count]').innerHTML;
    }
  }
  static renderFiltersBar(html, event) {
    const resultData = new DOMParser().parseFromString(html, 'text/html');
    if (document.querySelector('[data-filters-sidebar]') && resultData.querySelector('[data-filters-sidebar]')) {
      document.querySelector('[data-filters-sidebar]').innerHTML = resultData.querySelector('[data-filters-sidebar]').innerHTML;
    }
    // if (document.querySelector('[data-filter-selector]') && resultData.querySelector('[data-filter-selector]')) {
    //   document.querySelector('[data-filter-selector]').innerHTML = resultData.querySelector('[data-filter-selector]').innerHTML;
    // }
    if (document.querySelector('[data-sorting]') && resultData.querySelector('[data-sorting]')) {
      document.querySelector('[data-sorting]').innerHTML = resultData.querySelector('[data-sorting]').innerHTML;
    }
    if (document.querySelector('[data-product-count]') && resultData.querySelector('[data-product-count]')) {
      document.querySelector('[data-product-count]').innerHTML = resultData.querySelector('[data-product-count]').innerHTML;
    }

  }
}
customElements.define('filter-faced-form', FilterForm);

class ClearAllFilters extends HTMLElement {
  constructor() {
    super();
    const removeLink = this.querySelector('a');
    removeLink.setAttribute('role', 'button');
    removeLink.addEventListener('click', this.clearFilter.bind(this));
    removeLink.addEventListener('keyup', (event) => {
      event.preventDefault();
      if (event.code.toUpperCase() === 'SPACE') this.clearFilter(event);
    });
  }

  clearFilter(event) {
    event.preventDefault();
    const form = this.closest('filter-faced-form') || document.querySelector('filter-faced-form') || document.querySelector('[data-filter-faced-form]');
    const forms = document.querySelector('[data-filter-faced-form]');
    if (forms) {
      forms.onActiveFilterClick(event);
    }
    form.onActiveFilterClick(event);
  }
}
customElements.define('filter-remove', ClearAllFilters);

class FilterToggler extends HTMLElement {
  constructor() {
    super();
    this.filterStyle = this.dataset.filterStyle;
    this.section = this.closest('section');
    this.filterNav = this.querySelector('[data-filters-nav]');
    this.productsWrapper = this.closest('[data-collection-wrapper]').querySelector('[data-products-wrapper]');
    this.filtersSidebar = this.section.querySelector('[data-filters-sidebar]');
    // this.mobileFilterButton = this.querySelector('[data-filters-mobile]');
    this.filterNav?.addEventListener('click', this.toggleFilterSidebar.bind(this));
    // this.mobileFilterButton?.addEventListener('click', this.showMobileFilters.bind(this));

    this.handleResize = this.checkMobile.bind(this);
    window.addEventListener('resize', this.handleResize);
    window.addEventListener('load', this.handleResize);
  }

  toggleFilterSidebar(event) {
    event.preventDefault();
    const isOpened = this.filterNav.classList.toggle('active');
    this.productsWrapper.classList.toggle('open-filter', isOpened);
    this.productsWrapper.classList.toggle('mobile-drawer-filter', isOpened);
    if ((this.filterStyle == 'drawer') || (window.innerWidth <= 768)) {
      document.body.classList.toggle('overflow-hidden', isOpened);
      document.body.classList.toggle('active-inner-drawer', isOpened);
      setTimeout(() => {
        this.filtersSidebar.querySelector('button').focus();
        trapFocus(this.filtersSidebar);
      }, 150);
    }
    // this.filtersSidebar.classList.toggle('active', isOpened);
    this.filterNav.querySelector('[data-filter-text]').innerText = isOpened ? hideFilters : showFilters;
  }

  checkMobile() {
    if (window.innerWidth <= 768) {
      this.filterNav.classList.remove('active');
      this.filterNav.querySelector('[data-filter-text]').innerText = showFilters;
      this.productsWrapper.classList.remove('open-filter', 'mobile-drawer-filter');
      document.body.classList.remove('overflow-hidden', 'active-inner-drawer');
    }
  }

  // showMobileFilters(event) {
  //   event.preventDefault();
  //   this.filtersSidebar.classList.add('active');
  // }
}
customElements.define('filter-toggler', FilterToggler);


class FilterClose extends HTMLElement {
  constructor() {
    super();
    this.addEventListener('click', this.toggleFilterSidebar.bind(this));
  }

  toggleFilterSidebar(event) {
    event.preventDefault();
    this.mainCollectionWrapper = this.closest('[data-collection-wrapper]');
    this.productsWrapper = this.mainCollectionWrapper?.querySelector('[data-products-wrapper]');

    if (this.productsWrapper) {
      this.triggerToggle = this.mainCollectionWrapper.querySelector('filter-toggler');

      if (this.triggerToggle) {
        const filtersNav = this.triggerToggle.querySelector('[data-filters-nav]');
        if (filtersNav) {
          filtersNav.classList.remove('active');

          const span = filtersNav.querySelector('[data-filter-text]');
          if (span) {
            span.innerText = window.showFilters || 'Show Filters';
          }
        }
      }
      this.productsWrapper.classList.remove('open-filter', 'mobile-drawer-filter');
      document.body.classList.remove('overflow-hidden', 'active-inner-drawer');
    }
  }
}

customElements.define('filter-close', FilterClose);
