if (!customElements.get('product-model')) {
    customElements.define(
        'product-model',
        class ProductModel extends HTMLElement {
            constructor() {
                super();
                this.modelmain = this;
                this.model = this.querySelector('model-viewer');
                this.closeButton = this.querySelector('.close-product-model');
                this.modelViewerUI;
                this.slider = this.closest(
                    'product-media-gallery, swiper-content'
                );
                this.loadContent();
            }

            loadContent() {
                Shopify.loadFeatures([
                    {
                        name: 'model-viewer-ui',
                        version: '1.0',
                        onLoad: function () {
                            this.modelViewerUI = new Shopify.ModelViewerUI(this.model);
                            this.model.addEventListener(
                                'shopify_model_viewer_ui_toggle_play',
                                function (evt) {
                                    this.closeButton.classList.remove('hidden');
                                    if (this.slider) {
                                        this.slider.pauseOthers(this.modelmain);
                                        this.slider._draggable(false);
                                    }
                                }.bind(this)
                            );

                            this.model.addEventListener(
                                'shopify_model_viewer_ui_toggle_pause',
                                function (evt) {
                                    this.closeButton.classList.add('hidden');
                                    if (this.slider) {
                                        this.slider._draggable(true);
                                    }
                                }.bind(this)
                            );

                            this.closeButton.addEventListener(
                                'click',
                                function () {
                                    if (this.model) {
                                        this.pauseModel();
                                    }
                                }.bind(this)
                            );
                        }.bind(this),
                    },
                ]);
            }
            pauseModel() {
                if (this.modelViewerUI) {
                    this.modelViewerUI.pause();
                }
            }
        }
    );
}

window.ProductModel = {
    loadShopifyXR() {
        Shopify.loadFeatures([
            {
                name: 'shopify-xr',
                version: '1.0',
                onLoad: this.setupShopifyXR.bind(this),
            },
        ]);
    },

    setupShopifyXR(errors) {
        if (errors) return;

        if (!window.ShopifyXR) {
            document.addEventListener('shopify_xr_initialized', () => this.setupShopifyXR());
            return;
        }

        document.querySelectorAll('[id^="ProductJSON-"]').forEach((modelJSON) => {
            window.ShopifyXR.addModels(JSON.parse(modelJSON.textContent));
            modelJSON.remove();
        });
        window.ShopifyXR.setupXRElements();
    },
};

window.addEventListener('DOMContentLoaded', () => {
    if (window.ProductModel) window.ProductModel.loadShopifyXR();
});
