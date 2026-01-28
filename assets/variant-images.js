/**
 * Variant Images Filter
 * Filters product images based on image URL containing color name
 */

(function() {
  'use strict';

  let slideData = [];
  let gallery = null;
  let lastColor = null;

  document.addEventListener('DOMContentLoaded', function() {
    initVariantImageFilter();
  });

  function initVariantImageFilter() {
    // Find the product gallery
    gallery = document.querySelector('product-media-gallery');
    if (!gallery) return;

    // Find variant selects
    const variantSelects = document.querySelector('variant-selects');
    if (!variantSelects) return;

    // Store all original slides
    const mainWrapper = gallery.querySelector('.swiper-wrapper');
    if (!mainWrapper) return;

    // Filter out Swiper duplicate slides (created for loop mode)
    const allSlides = Array.from(mainWrapper.querySelectorAll('.swiper-slide:not(.swiper-slide-duplicate)'));

    // Store slide data - use image URL for filtering (deep copy the HTML)
    slideData = allSlides.map(slide => {
      const img = slide.querySelector('img');
      const src = img ? (img.src || '').toLowerCase() : '';
      const alt = img ? (img.alt || '').toLowerCase() : '';
      // Clone the slide to preserve original HTML
      const clone = slide.cloneNode(true);
      // Remove any Swiper-added classes
      clone.classList.remove('swiper-slide-active', 'swiper-slide-next', 'swiper-slide-prev', 'swiper-slide-duplicate');
      clone.removeAttribute('data-swiper-slide-index');
      return {
        html: clone.outerHTML,
        src: src,
        alt: alt
      };
    });

    console.log('Variant Images: Found', slideData.length, 'slides');

    // Find color option - look for data-option-slug containing color
    const colorNames = ['color', 'colour', 'farbe', 'couleur'];
    let colorFieldsetSelector = null;

    variantSelects.querySelectorAll('fieldset[data-option-slug]').forEach(fieldset => {
      const slug = (fieldset.dataset.optionSlug || '').toLowerCase();
      if (colorNames.some(c => slug.includes(c))) {
        colorFieldsetSelector = `fieldset[data-option-slug="${fieldset.dataset.optionSlug}"]`;
      }
    });

    if (!colorFieldsetSelector) {
      console.log('Variant Images: No color option found');
      return;
    }

    console.log('Variant Images: Color fieldset selector:', colorFieldsetSelector);

    // Get initial color and filter
    const colorFieldset = document.querySelector(colorFieldsetSelector);
    const initialColor = getSelectedColor(colorFieldset);
    if (initialColor) {
      console.log('Variant Images: Initial color:', initialColor);
      lastColor = initialColor;
      filterImages(initialColor);
    }

    // Use event delegation on document for robustness
    document.addEventListener('change', function(e) {
      // Check if the change is from a color input
      const fieldset = e.target.closest(colorFieldsetSelector);
      if (fieldset) {
        const color = e.target.value;
        if (color && color !== lastColor) {
          console.log('Variant Images: Color changed to:', color);
          lastColor = color;
          filterImages(color);
        }
      }
    });

    // Also listen for click events on color swatches (radio buttons)
    document.addEventListener('click', function(e) {
      const input = e.target.closest(`${colorFieldsetSelector} input[type="radio"]`);
      if (input) {
        setTimeout(function() {
          const color = input.value;
          if (color && color !== lastColor) {
            console.log('Variant Images: Color clicked:', color);
            lastColor = color;
            filterImages(color);
          }
        }, 10);
      }
    });
  }

  function getSelectedColor(fieldset) {
    if (!fieldset) return null;
    const checked = fieldset.querySelector('input:checked');
    if (checked) return checked.value;
    const select = fieldset.querySelector('select');
    if (select) return select.value;
    return null;
  }

  function filterImages(colorValue) {
    if (!gallery || slideData.length === 0) {
      console.log('Variant Images: No gallery or slideData');
      return;
    }

    const mainWrapper = gallery.querySelector('.swiper-wrapper');
    if (!mainWrapper) {
      console.log('Variant Images: No mainWrapper found');
      return;
    }

    const colorLower = colorValue.toLowerCase().trim();
    // Handle multi-word colors (e.g., "rosy berry" -> "rosy-berry" in URL)
    const colorHyphenated = colorLower.replace(/\s+/g, '-');
    console.log('Filtering for color:', colorLower, '/', colorHyphenated);

    // Filter slides where image URL contains color name
    const matching = slideData.filter(s => {
      return s.src.includes(colorLower) || s.src.includes(colorHyphenated);
    });
    console.log('Matching slides:', matching.length, 'of', slideData.length);

    // If no matches, show all
    const toShow = matching.length > 0 ? matching : slideData;

    // Destroy swiper first before modifying DOM
    destroySwiper();

    // Rebuild slider with clean HTML
    mainWrapper.innerHTML = toShow.map((s, i) => {
      let html = s.html;
      // Set first slide as active
      if (i === 0) {
        html = html.replace('class="swiper-slide', 'class="swiper-slide swiper-slide-active');
      }
      return html;
    }).join('');

    // Also filter thumbnails
    filterThumbnails(colorLower, colorHyphenated);

    // Filter popup/lightbox template
    filterPopupTemplate(colorLower, colorHyphenated);

    // Update specification image
    updateSpecificationImage(toShow);

    // Reinit swiper
    reinitSwiper();
  }

  function updateSpecificationImage(visibleSlides) {
    const specImageWrapper = document.querySelector('[data-specification-image]');
    if (!specImageWrapper || visibleSlides.length === 0) return;

    // Get the first visible slide's image URL
    const firstSlide = visibleSlides[0];
    const tempDiv = document.createElement('div');
    tempDiv.innerHTML = firstSlide.html;
    const sourceImg = tempDiv.querySelector('img');

    if (!sourceImg) return;

    const targetImg = specImageWrapper.querySelector('img');
    if (targetImg) {
      targetImg.src = sourceImg.src;
      targetImg.srcset = sourceImg.srcset || '';
      targetImg.alt = sourceImg.alt || '';
      console.log('Specification image updated');
    }
  }

  function filterThumbnails(colorLower, colorHyphenated) {
    if (!gallery) return;
    const thumbWrapper = gallery.querySelector('[data-thumbnails-media] .swiper-wrapper');
    if (!thumbWrapper) return;

    const thumbSlides = Array.from(thumbWrapper.querySelectorAll('.swiper-slide:not(.swiper-slide-duplicate)'));

    thumbSlides.forEach(thumb => {
      const img = thumb.querySelector('img');
      const src = img ? (img.src || '').toLowerCase() : '';

      if (src.includes(colorLower) || src.includes(colorHyphenated)) {
        thumb.style.display = '';
      } else {
        thumb.style.display = 'none';
      }
    });
  }

  function filterPopupTemplate(colorLower, colorHyphenated) {
    // Store current color for popup filtering
    window._variantImageColor = { colorLower, colorHyphenated };

    // Find the popup template
    const mediaContainer = document.querySelector('[data-product-media-content]');
    if (!mediaContainer) return;

    const template = mediaContainer.querySelector('template');
    if (!template) return;

    // Get the template content and remove non-matching slides
    const templateContent = template.content;
    const popupWrapper = templateContent.querySelector('.swiper-wrapper');
    if (!popupWrapper) return;

    const popupSlides = Array.from(popupWrapper.querySelectorAll('.swiper-slide'));

    popupSlides.forEach(slide => {
      const img = slide.querySelector('img');
      const src = img ? (img.src || '').toLowerCase() : '';

      if (src.includes(colorLower) || src.includes(colorHyphenated)) {
        slide.style.display = '';
        slide.classList.remove('variant-hidden');
      } else {
        slide.style.display = 'none';
        slide.classList.add('variant-hidden');
      }
    });

    console.log('Popup template filtered');
  }

  // Watch for popup being added to DOM and filter it
  const popupObserver = new MutationObserver(function(mutations) {
    mutations.forEach(function(mutation) {
      mutation.addedNodes.forEach(function(node) {
        if (node.nodeType === 1 && node.tagName === 'PRODUCT-MEDIA-POPUP-MODAL') {
          filterOpenedPopup(node);
        }
      });
    });
  });

  popupObserver.observe(document.body, { childList: true });

  function filterOpenedPopup(popup) {
    const colorData = window._variantImageColor;
    if (!colorData) return;

    const { colorLower, colorHyphenated } = colorData;
    const popupWrapper = popup.querySelector('.swiper-wrapper');
    if (!popupWrapper) return;

    const popupSlides = Array.from(popupWrapper.querySelectorAll('.swiper-slide'));
    let firstVisibleIndex = 0;
    let foundFirst = false;

    popupSlides.forEach((slide, index) => {
      const img = slide.querySelector('img');
      const src = img ? (img.src || '').toLowerCase() : '';

      if (src.includes(colorLower) || src.includes(colorHyphenated)) {
        slide.style.display = '';
        if (!foundFirst) {
          firstVisibleIndex = index;
          foundFirst = true;
        }
      } else {
        slide.style.display = 'none';
      }
    });

    // Reinitialize the popup swiper after filtering
    setTimeout(function() {
      const swiperEl = popup.querySelector('swiper-slideshow');
      if (swiperEl && swiperEl.swiper) {
        swiperEl.swiper.update();
        swiperEl.swiper.slideTo(0, 0);
      }
    }, 100);

    console.log('Opened popup filtered');
  }

  function destroySwiper() {
    if (!gallery) return;
    if (gallery.mainSlider) {
      try { gallery.mainSlider.destroy(true, true); } catch(e) {}
      gallery.mainSlider = null;
    }
    if (gallery.thumbnailSlider) {
      try { gallery.thumbnailSlider.destroy(true, true); } catch(e) {}
      gallery.thumbnailSlider = null;
    }
  }

  function reinitSwiper() {
    if (!gallery) return;
    setTimeout(function() {
      if (typeof gallery.initializeGallery === 'function') {
        gallery.initializeGallery();
        console.log('Swiper reinitialized');
      }
    }, 50);
  }
})();
