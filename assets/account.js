class EditAddress extends HTMLElement {
    constructor() {
        super();
        this.drawerSelector = '[data-drawer="address-drawer"]';
        this.drawerElement = document.querySelector(this.drawerSelector);
        this.edit = this.querySelector('[data-customer-addresses]');
        if (this.edit) {
            this.edit.addEventListener('click', this.handleClick.bind(this));
        }
        this.removeAddress = this.querySelector('[data-remove-address]');
        if (this.removeAddress) {
            this.removeAddress.addEventListener('click', this.removeAddrss.bind(this));
        }
        this.addressId = this.edit ? this.edit.dataset.addressId : null;
    }
    removeAddrss(e) {
        if (confirm(e.currentTarget.dataset.confirmMessage)) {
            Shopify.postLink(e.currentTarget.dataset.target, {
                parameters: { _method: 'delete' },
            });
        }
    }
    handleClick(event) {
        event.preventDefault();
        this.openDrawer();
    }

    openDrawer() {
        if (this.drawerElement && this.addressId) {
            const allDrawerAddresses = this.drawerElement.querySelectorAll('.drawer-address');
            allDrawerAddresses.forEach(address => {
                address.classList.add('hidden');
            });
            setTimeout(() => {
                this.drawerElement.classList.add('open');
                document.body.classList.add('overflow-hidden', 'active-inner-drawer');
                const specificAddress = this.drawerElement.querySelector(`#address-${this.addressId}`);
                if (specificAddress) {
                    specificAddress.classList.remove('hidden');
                }
            }, 200);
        }
    }
}

customElements.define('edit-address', EditAddress);
