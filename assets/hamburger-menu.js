if (!customElements.get('hamburger-menu')) {
    class HamburgerMenu extends HTMLElement {
        constructor() {
            super();
            this.initElements();
            this.initEventListeners();
            this.addEventListener('keyup', this.onEscapeKey.bind(this));
        }

        initElements() {
            this.menuItems = this.querySelectorAll('li[data-hamburger-item]');
            this.menuLinks = this.querySelectorAll('li[data-hamburger-menu] [data-menu-link]');
            this.subMenus = this.querySelectorAll('[hamburger-menu-submenu]');
            this.subMenuLinks = this.querySelectorAll('[hamburger-menu-submenu] [data-submenu-link]');
            this.header = this.closest('header');
            this.toggler = this.header.querySelector('[data-hamburger-toggler]');
            this.closeBtn = this.querySelector('[data-hamburger-close]');
            this.closeOverlay = this.querySelector('[data-hamburger-close-overlay]');

        }

        initEventListeners() {
            this.subMenus.forEach((submenu) => {
                submenu.addEventListener('mouseenter', () => this.handleSubmenuActivation(submenu));
            });

            this.subMenuLinks.forEach((submenuLink) => {
                submenuLink.addEventListener('focus', () => this.handleSubmenuActivation(submenuLink.closest('[hamburger-menu-submenu]')));
            });

            this.menuItems.forEach((menu) => {
                const MenuLink = menu.querySelector('[data-menu-link]');
                if (MenuLink) {
                    MenuLink.addEventListener('click', (event) => {
                        event.preventDefault();
                        this.handleMenuActivation(menu);
                    });
                }
            });

            this.menuLinks.forEach((menuLink) => {
                menuLink.addEventListener('focus', () => this.handleMenuActivation(menuLink.closest('[data-hamburger-menu]')));
            });

            if (this.toggler) {
                this.toggler.addEventListener('click', () => this.toggleHamburger());
            }

            if (this.closeBtn) {
                this.closeBtn.addEventListener('click', () => this.closeHamburger());
            }
            if (this.closeOverlay) {
                this.closeOverlay.addEventListener('click', () => this.closeHamburger());
            }
            window.addEventListener('resize', this.handleResize.bind(this));
        }
        handleResize() {
            if (window.innerWidth < 1025 && this.classList.contains('active')) {
                this.closeHamburger();
            }
        }

        onEscapeKey(event) {
            if (event.code.toUpperCase() !== 'ESCAPE') return;
            this.closeHamburger();
        }

        handleSubmenuActivation(submenu) {
            if (!submenu || submenu.classList.contains('active')) return;
            let data_category_menu = false;
            const currentActiveMenu = this.querySelector('[hamburger-menu-submenu].active');
            if (currentActiveMenu) {
                currentActiveMenu.classList.remove('active');
                var data_category_menus = currentActiveMenu.closest('.category-mega-menu-enable')?.querySelector('[data-category-mega-menu]');
                if (data_category_menus) {
                    data_category_menu = true;
                    data_category_menus.classList.remove('category-active');
                }
            }
            submenu.classList.add('active');
            if (data_category_menu) {
                setTimeout(() => {
                    data_category_menus.classList.add('category-active');
                }, 300);
            }
        }

        handleMenuActivation(menu) {
            if (!menu || menu.classList.contains('active')) return;
            const currentActive = this.querySelector('[data-hamburger-menu].active');
            if (currentActive) {
                currentActive.classList.remove('active');
            }
            menu.classList.add('active');
        }

        toggleHamburger() {
            this.toggler.classList.contains('active') ? this.closeHamburger() : this.openHamburger();
        }

        openHamburger() {
            this.toggler.classList.add('active');
            this.style.display = 'flex';
            setTimeout(() => {
                this.classList.add('active');
                document.body.classList.add('hamburger-menu-open', 'overflow-hidden', 'body-overlay');
                this.animateMenuItems();
                this.closeBtn.querySelector('button').focus();
                trapFocus(document.querySelector('hamburger-menu'));
            }, 150);
        }

        closeHamburger() {
            this.classList.remove('active');
            setTimeout(() => {
                document.body.classList.remove('hamburger-menu-open', 'overflow-hidden', 'body-overlay');
                this.clearMenuItemAnimations();
                this.style.display = 'none';
                this.toggler.classList.remove('active');
                this.toggler.focus();
            }, 100);
        }

        animateMenuItems() {
            this.querySelectorAll('[data-hamburger-menu]').forEach((item, index) => {
                setTimeout(() => item.classList.add('animate'), index * 100);
            });
        }

        clearMenuItemAnimations() {
            this.querySelectorAll('[data-hamburger-menu]').forEach((item) => item.classList.remove('animate', 'active'));
            this.subMenus.forEach((item) => item.classList.remove('active'));
        }
    }
    customElements.define('hamburger-menu', HamburgerMenu);
}