/**
 * AppModal
 * Reusable DOM-based modal wrapper around Bootstrap's modal
 * Usage:
 *   AppModal.open({
 *     title: 'Add Task',
 *     body: '<input ...>',
 *     size: 'md',
 *     submitLabel: 'Save',
 *     cancelLabel: 'Cancel',
 *     onSubmit: () => { ... },
 *     onOpen: () => { ... },
 *     onClose: () => { ... }
 *   });
 */
const AppModal = (() => {
    const modalEl = document.getElementById('appModal');
    const $modal = $('#appModal'); // Bootstrap 4 jQuery plugin
    const titleEl = document.getElementById('appModalTitle');
    const bodyEl = document.getElementById('appModalBody');
    const footerEl = document.getElementById('appModalFooter');
    const formEl = document.getElementById('appModalForm');
    const dialogEl = document.getElementById('appModalDialog');

    let currentConfig = null;
    let submitHandler = null;

    function setSize(size) {
        // size: 'sm' | 'md' | 'lg' | 'xl'
        dialogEl.className = 'modal-dialog modal-dialog-centered';
        if (size === 'sm') dialogEl.classList.add('modal-sm');
        if (size === 'lg') dialogEl.classList.add('modal-lg');
        if (size === 'xl') dialogEl.classList.add('modal-xl');
    }

    function buildFooter(config) {
        footerEl.innerHTML = '';

        if (config.showCancel !== false) {
            const cancelBtn = document.createElement('button');
            cancelBtn.type = 'button';
            cancelBtn.className = 'btn btn-light';
            cancelBtn.textContent = config.cancelLabel || 'Cancel';
            cancelBtn.addEventListener('click', () => close());
            footerEl.appendChild(cancelBtn);
        }

        if (config.submitLabel) {
            const submitBtn = document.createElement('button');
            submitBtn.type = 'submit';
            submitBtn.className = 'btn btn-primary';
            submitBtn.textContent = config.submitLabel;
            footerEl.appendChild(submitBtn);
        }
    }

    function open(config) {
        currentConfig = config;

        titleEl.textContent = config.title || '';
        bodyEl.innerHTML = config.body || '';
        setSize(config.size || 'md');
        buildFooter(config);

        // Clear previous submit handler
        submitHandler = config.onSubmit || null;

        // Form submit
        formEl.onsubmit = (e) => {
            e.preventDefault();
            if (submitHandler) {
                const result = submitHandler();
                // If handler returns false, keep modal open
                if (result === false) {
                    return;
                }
            }
            close();
        };

        // Open callback
        if (typeof config.onOpen === 'function') {
            config.onOpen();
        }

        $modal.modal('show');
    }

    function close() {
        $modal.modal('hide');
    }

    // Bootstrap hidden event
    $modal.on('hidden.bs.modal', () => {
        bodyEl.innerHTML = '';
        footerEl.innerHTML = '';
        formEl.onsubmit = null;

        if (currentConfig && typeof currentConfig.onClose === 'function') {
            currentConfig.onClose();
        }
        currentConfig = null;
        submitHandler = null;
    });

    return {
        open,
        close
    };
})();
