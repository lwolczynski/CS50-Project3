document.addEventListener('DOMContentLoaded', () => {
    getOrder();
});

//Get order detals from server
function getOrder() {
    $('.collapse').on('show.bs.collapse', function () {
        const orderNo = this.dataset.order;
        const loaded = this.dataset.loaded;
        if (!loaded) {
            this.dataset.loaded = true;
            const cardBody = this.querySelector('#card'+orderNo)
            $.ajax({
                url: '/ajax/get_order',
                data: {
                    'order': orderNo
                },
                dataType: 'json',
                success: function(data) {
                    printOrderTable(cardBody, data.order);
                }
            });
        }
    });
}

//Build order detail table
function printOrderTable(elem, json) {
    $(elem).html(`<table class="table table-sm"><thead><tr><th scope="col" style="width: 60%">Item</th><th scope="col" class="text-center" style="width: 20%">Size</th><th scope="col" class="text-center" style="width: 20%">Price</th></tr></thead><tbody></tbody></table>`);
    var total = 0;
    jQuery.each(json, function(i, sub) {
        $(elem).find('tbody').append($(`<tr>`).append($(`<td id="name">`)).append($(`<td id="size" class="text-center">`)).append($(`<td id="price" class="text-center">`)));
        jQuery.each(sub, function(j, val) {
            $(elem).find('tr:last').find('#name').append(val.name+'<br>')
            $(elem).find('tr:last').find('#size').text(val.size)
            if (val.price == 0) {
                var price = '';
            } else {
                total += parseFloat(val.price);
                var price = val.price;
            }
            $(elem).find('tr:last').find('#price').append(price+'<br>')
        });
    });
    $(elem).find('tbody').append($(`<tr>`).append($(`<td>`)).append($(`<td class="text-center">`)).append($(`<td class="text-center font-weight-bold">`).text(total.toFixed(2))));
}