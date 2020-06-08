document.addEventListener('DOMContentLoaded', () => {
    const sizes = JSON.parse(document.querySelector('#sizes_json').firstChild.data);
    const prices = JSON.parse(document.querySelector('#prices_json').firstChild.data);
    loadPrices(sizes, prices);
    addPlainListeners('pasta-i');
    addPlainListeners('salad-i');
    addPlainListeners('platter-i');
    addPizzaListeners(sizes, prices);
    $.ajax({
        url: '/ajax/get_subs',
        success: function(data) {
            const subs = data.subs;
            addSubsListeners(subs, sizes, prices);
        }
    });
});

//Add listeners to pizza order buttons
function addPizzaListeners(sizes, prices) {
    const toppings = JSON.parse(document.querySelector('#toppings_json').firstChild.data);
    const pizzaIs = document.querySelectorAll('.pizza-i');

    pizzaIs.forEach(i => i.addEventListener('click', function () {
        const toppingsNo = i.parentNode.dataset.toppings_no;

        if (toppingsNo == 0) {
            addToCart([parseInt(i.dataset.meal_id)]);
        } else {
            const id = i.parentNode.id;
            const size = i.parentNode.dataset.size;

            let toppingFields = "";

            for (let j=0; j<toppings.length; j++) {
                const sizeInt = toSizeInt(sizes, size)[0].id;
                var priceObj = getSellableItem(prices, toppings[j].id, sizeInt)[0];
                toppingFields += `<input type="checkbox" class="topping-list" value=`+priceObj.id+`> `+toppings[j].name+`<br>`;
            }

            var htmlString = `<form><fieldset>`+toppingFields+`</fieldset></form>`

            $('#order_modal_title').text("Pick toppings (limit: "+toppingsNo+")");
            $('#order_modal_body').html(htmlString);
            $('#order_modal').modal('show');
            document.querySelector('#add_button').onclick = function() {
                let order = [parseInt(i.dataset.meal_id)];
                const picked = document.querySelectorAll('.topping-list:checked');
                for (var pick of picked) {
                    order.push(parseInt(pick.value));
                }
                addToCart(order);
            };
        }

        const toppingList = document.querySelectorAll('.topping-list');

        toppingList.forEach(i => i.addEventListener('click', function () {
            let checkboxes = document.querySelectorAll('.topping-list');  
            let numberOfCheckedItems = 0;
            for (let k=0; k<checkboxes.length; k++) {  
                if (checkboxes[k].checked)  
                    numberOfCheckedItems++;  
            }  
            if (numberOfCheckedItems == toppingsNo) {  
                for (let k=0; k<checkboxes.length; k++) {  
                    if(!checkboxes[k].checked)  
                        checkboxes[k].disabled = true; 
                } 
            } else {
                for (let k=0; k<checkboxes.length; k++) {  
                    checkboxes[k].disabled = false; 
                }
            }
        }));

    }));
}

//Add listeners to sub order buttons
function addSubsListeners(subs, sizes, prices) {
    const extras = JSON.parse(document.querySelector('#extras_json').firstChild.data);
    const subIs = document.querySelectorAll('.sub-i');

    subIs.forEach(i => i.addEventListener('click', function () {
        const id = i.parentNode.id;
        const size = i.parentNode.dataset.size;
        
        for (let j=0; j<subs.length; j++) {
            if (subs[j].id == id) {
                var subs_id = j;
                break;
            }
        }

        if (subs[subs_id].extras_allowed.length != 0) {
            let extraFields = "";

            for (let j=0; j<subs[subs_id].extras_allowed.length; j++) {
                for (let k=0; k<extras.length; k++) {
                    if (extras[k].id == subs[subs_id].extras_allowed[j]) {
                        const sizeInt = toSizeInt(sizes, size)[0].id;
                        var priceObj = getSellableItem(prices, subs[subs_id].extras_allowed[j], sizeInt)[0];
                        var extras_id = k;
                        break;
                    }
                }
                extraFields += `<input type="checkbox" class="extra-list" value=`+priceObj.id+`"> `+extras[extras_id].name+` (+`+priceObj.price+`)<br>`;
            }

            var htmlString = `<form><fieldset>`+extraFields+`</fieldset></form>`

            $('#order_modal_title').text("Pick extras");
            $('#order_modal_body').html(htmlString);
            $('#order_modal').modal('show');
            document.querySelector('#add_button').onclick = function() {
                let order = [parseInt(i.dataset.meal_id)];
                const picked = document.querySelectorAll('.extra-list:checked');
                for (var pick of picked) {
                    order.push(parseInt(pick.value));
                }
                addToCart(order);
            };
        }

    }));
}

//Add listeners to non pizza or sub order buttons
function addPlainListeners(iName) {
    const plainIs = document.querySelectorAll('.'+iName);

    plainIs.forEach(i => i.addEventListener('click', function () {
        addToCart([parseInt(i.dataset.meal_id)]);
    }));
}

//Load prices from JSON
function loadPrices(sizes, prices) {
    const priceFields = document.querySelectorAll('.price_field');

    priceFields.forEach(function(field) {
        const itemNo = field.id;
        const size = toSizeInt(sizes, field.dataset.size)[0];
        const item = getSellableItem(prices, itemNo, size.id)[0];
        if (item) {
            if (user_is_authenticated) {
                let iClass = field.dataset.meal+"-i";
                $(field).html(item.price+" <i class='fa fa-plus-circle "+iClass+" clickable' data-meal_id="+item.id+"></i>");
            } else {
                $(field).html(item.price);
            }
        }
    });
}

//Select the size item from JSON by name
function toSizeInt(sizes, size) {
    return sizes.filter(
        function(sizes) { return sizes.name == size }
    );
}

//Select the menu item from JSON by size and id
function getSellableItem(prices, itemNo, sizeInt) {
    return prices.filter(
        function(prices) { return (prices.item == itemNo) & (prices.size == sizeInt) }
    );
}

//Add meal to cart
function addToCart(itemIdArr) {
    $.ajax({
        url: '/ajax/add_to_cart',
        data: {
            'items': JSON.stringify(itemIdArr)
        },
        dataType: 'json',
        success: function(data) {
            showNewToast(data.added);
            getTotal();
        }
    });
}

//Display toast notification
function showNewToast(itemName) {
    const toast = document.querySelector('#div_toasts');
    const toastId = "toast"+Math.round((new Date()).getTime());

    const toastDiv = document.createElement('div');
    toastDiv.className = "toast";
    toastDiv.setAttribute("data-delay", "4000");

    const toastDivHeader = document.createElement('div');
    toastDivHeader.className = "toast-header";
    toastDivHeader.innerHTML = "Item added to the cart!";

    const toastDivBody = document.createElement('div');
    toastDivBody.className = "toast-body";
    toastDivBody.innerHTML = itemName;

    toastDiv.appendChild(toastDivHeader);
    toastDiv.appendChild(toastDivBody);
    
    toast.appendChild(toastDiv);
    $(toastDiv).toast("show");
}