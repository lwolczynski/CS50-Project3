//Get total price from server when cart page visited
getTotal();

document.addEventListener('DOMContentLoaded', () => {
    const menu = JSON.parse(document.querySelector('#menu_json').firstChild.data);
    const sizes = JSON.parse(document.querySelector('#sizes_json').firstChild.data);
    const prices = JSON.parse(document.querySelector('#prices_json').firstChild.data);
    loadNames(menu, prices);
    loadPrices(prices);
    loadSizes(sizes, prices);
});

//Load names of items in cart
function loadNames(menu, prices) {
    const nameSpans = document.querySelectorAll('.span-item-name');

    nameSpans.forEach(function(span) {
        const itemNo = span.dataset.item_no;
        const menuItemNo = getSellableItem(prices, itemNo)[0].item;
        const menuItemName = getMenuItem(menu, menuItemNo)[0].name;
        span.innerHTML = menuItemName;
    });
}

//Load prices of items in cart and calculate total
function loadPrices(prices) {
    const priceSpans = document.querySelectorAll('.span-item-price');
    let total = 0;

    priceSpans.forEach(function(span) {
        const itemNo = span.dataset.item_no;
        const price = getSellableItem(prices, itemNo)[0].price;
        total += parseFloat(price);
        if (price != 0) {
            span.innerHTML = getSellableItem(prices, itemNo)[0].price;
        }
    });

    if (total) {
        const totalSpan = document.querySelector('#span-total-price');
        totalSpan.innerHTML = total.toFixed(2);
    }
}

//Load sizes of items in cart
function loadSizes(sizes, prices) {
    const sizeSpans = document.querySelectorAll('.span-item-size');

    sizeSpans.forEach(function(span) {
        const itemNo = span.dataset.item_no;
        const sizeNo = getSellableItem(prices, itemNo)[0].size;
        const getSizeItem = getMenuItem(sizes, sizeNo)[0].name;
        span.innerHTML = getSizeItem;
    });
}

//Select the price item from JSON by id
function getSellableItem(prices, item) {
    return prices.filter(
        function(prices) { return (prices.id == item) }
    );
}

//Select the menu item from JSON by id
function getMenuItem(menu, item) {
    return menu.filter(
        function(menu) { return (menu.id == item) }
    );
}

//Select the size item from JSON by id
function getSizeItem(sizes, number) {
    return sizes.filter(
        function(sizes) { return (sizes.id == number) }
    );
}

//Check/uncheck all delete boxes
function selectAllBoxes() {
    const state = document.querySelector('#select-all-checkbox').checked;
    const deletionCheckboxes = document.querySelectorAll('.deletion-list-checkbox');

    deletionCheckboxes.forEach(function(box) {
        box.checked = state;
    });
}

//Place order
function placeOrder() {
    const checked = document.querySelectorAll('.deletion-list-checkbox');

    let toOrder = [];
    checked.forEach(function(box) {
        toOrder.push(parseInt(box.value));
    });

    $.ajax({
        url: '/ajax/place_order',
        data: {
            'items': JSON.stringify(toOrder)
        },
        dataType: 'json',
        beforeSend: function() {
            $('#loader').modal('show');
        },
        success: function(data) {
            getTotal();
            window.location.href = data.url;
        }
    });

}

//Delete items from cart
function deleteCurrentCartItems() {
    const checked = document.querySelectorAll('.deletion-list-checkbox:checked');

    let toDelete = [];
    checked.forEach(function(box) {
        toDelete.push(parseInt(box.value));
    });

    if (toDelete.length) {
        $.ajax({
            url: '/ajax/delete_from_cart',
            data: {
                'items': JSON.stringify(toDelete)
            },
            dataType: 'json',
            beforeSend: function() {
                $('#loader').modal('show');
            },
            success: function(data) {
                getTotal();
                location.reload();
            }
        });
    }
}