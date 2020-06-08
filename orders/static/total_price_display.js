if (localStorage.getItem("total_price") === null) {
    getTotal();
} else {
    setTotalPriceSpan();
}

//Get total price from server
function getTotal() {
    $.ajax({
        url: '/ajax/get_cart_total',
        data: {},
        success: function(data) {
            localStorage.setItem("total_price", data.total);
            setTotalPriceSpan();
        }
    });
}

//Remove total price from local storage
function removeTotalFromLS() {
    localStorage.removeItem("total_price");
}

//Edit span value to show total cart price
function setTotalPriceSpan() {
    let span = document.querySelector('#total_price_span');
    if (span != null) {
        span.innerHTML = "("+localStorage.getItem("total_price")+")";
    } else {
        document.addEventListener('DOMContentLoaded', () => {
            document.querySelector('#total_price_span').innerHTML = "("+localStorage.getItem("total_price")+")";
        });
    }
}