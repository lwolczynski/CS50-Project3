from django.urls import path
from . import views

urlpatterns = [
    path("", views.index, name="index"),
    path("register", views.register, name="register"),
    path("login", views.login_request, name="login"),
    path("logout", views.logout_request, name="logout"),
    path("cart", views.cart, name="cart"),
    path("orders", views.orders, name="orders"),
    path("ajax/get_subs", views.get_subs, name='get_subs'),
    path("ajax/add_to_cart", views.add_to_cart, name='add_to_cart'),
    path("ajax/delete_from_cart", views.delete_from_cart, name='delete_from_cart'),
    path("ajax/get_cart_total", views.get_cart_total, name='get_cart_total'),
    path("ajax/get_order", views.get_order, name='get_order'),
    path("ajax/place_order", views.place_order, name='place_order'),
]
