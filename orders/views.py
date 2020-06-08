from django.contrib import messages
from django.contrib.auth import login, authenticate, logout
from django.contrib.auth.decorators import login_required
from django.contrib.auth.forms import AuthenticationForm
from django.shortcuts import render, redirect
from django.http import JsonResponse
from .forms import SignUpForm
from .models import *

#Homepage view
def index(request):
    data = {'regular': [r.as_dict() for r in RegularPizza.objects.all()],
            'sicilian': [s.as_dict() for s in SicilianPizza.objects.all()],
            'toppings': [t.as_dict() for t in Topping.objects.all()],
            'subs': [s.as_dict() for s in Sub.objects.all()],
            'extras': [e.as_dict() for e in SubExtra.objects.all()],
            'pasta': [p.as_dict() for p in Pasta.objects.all()],
            'salads': [s.as_dict() for s in Salad.objects.all()],
            'platters': [d.as_dict() for d in DinnerPlatter.objects.all()],
            'sizes': [s.as_dict() for s in Size.objects.all()],
            'prices': [s.as_dict() for s in SellableItem.objects.all()]}
    return render(request = request,
                  context = {'data': data},
                  template_name = "index.html")

#Register view
def register(request):
    if request.user.is_authenticated:
        return redirect('index')
    if request.method == 'POST':
        form = SignUpForm(request.POST)
        if form.is_valid():
            form.save()
            username = form.cleaned_data.get('username')
            password = form.cleaned_data.get('password1')
            user = authenticate(username=username, password=password)
            login(request, user)
            messages.success(request, "Registered and logged in succesfully.")
            return redirect('index')
    else:
        form = SignUpForm
    return render(request, 'register.html', {'form': form})

#Login view
def login_request(request):
    if request.user.is_authenticated:
        return redirect('index')
    if request.method == 'POST':
        form = AuthenticationForm(request=request, data=request.POST)
        if form.is_valid():
            username = form.cleaned_data.get('username')
            password = form.cleaned_data.get('password')
            user = authenticate(username=username, password=password)
            if user is not None:
                login(request, user)
                messages.success(request, "Logged in succesfully.")
                return redirect('index')
            else:
                messages.warning(request, "Invalid username or password.")
        else:
            messages.warning(request, "Invalid username or password.")
    form = AuthenticationForm()
    return render(request, 'login.html', {'form': form})

#Logout view
@login_required
def logout_request(request):
    logout(request)
    messages.success(request, "Logged out succesfully.")
    return redirect('index')

#Cart view
@login_required
def cart(request):
    user = request.user
    user_cart = CurrentCart.objects.filter(user=user)
    cart = {}
    for cart_pos in user_cart:
        items = []
        for item in cart_pos.items.all():
            items.append(item.id)
        cart[cart_pos.id] = items
    data = {'cart': cart,
            'menu': [i.as_dict_for_cart() for i in MenuItem.objects.all()],
            'sizes': [s.as_dict() for s in Size.objects.all()],
            'prices': [s.as_dict() for s in SellableItem.objects.all()]}
    return render(request = request,
                  context = {'data': data},
                  template_name = "cart.html")    

#Orders view
@login_required
def orders(request):
    user = request.user
    data = {'orders': [o.as_dict() for o in Order.objects.filter(user=user).order_by('-id')]}
    return render(request = request,
                  context = {'data': data},
                  template_name = "orders.html")    

#View to get subs with allowed extras
def get_subs(request):
    data = {
        'subs': [s.as_dict_with_extras() for s in Sub.objects.all()]
    }
    return JsonResponse(data)

#View to add meal to cart
def add_to_cart(request):
    request_items = request.GET.get('items', None)
    user = request.user
    items = eval(request_items)
    cart_object = CurrentCart.objects.create(user=user)
    cart_object.items.set(items)
    item_name = SellableItem.objects.get(id=items[0]).get_full_name()
    return JsonResponse({'added': item_name}, safe=False)

#View to remove meal from cart
def delete_from_cart(request):
    request_items = request.GET.get('items', None)
    user = request.user
    items = eval(request_items)
    user_cart_items = CurrentCart.objects.filter(user=user)
    for cart_item in user_cart_items:
        if cart_item.id in items:
            cart_item.delete()
    return JsonResponse("ok", safe=False)

#View to place order
def place_order(request):
    request_items = request.GET.get('items', None)
    user = request.user
    items = eval(request_items)
    cart_items = set(CurrentCart.objects.values_list('id', flat=True).filter(user=user))
    if set(items).issubset(cart_items):
        order = Order.objects.create(user=user)
        for item in items:
            cart_pos = CurrentCart.objects.get(id=item)
            meal = OrderedMeal.objects.create()
            meal.items.set(cart_pos.get_items())
            cart_pos.delete()
            order.ordered_meals.add(meal)
    return JsonResponse({'url': 'orders'})

#View to get order from db
def get_order(request):
    user = request.user
    order_no = request.GET.get('order', None)
    order = Order.objects.get(id=order_no)
    data = {}
    if order.user == user:
        i=0
        j=0
        for meal in order.ordered_meals.all():
            data[i] = {}
            for item in meal.items.all():
                data[i][j] = {'name': item.item.get_class_name()+": "+item.item.name, 'size': item.size.name, 'price': item.price}
                j+=1
            i+=1
    return JsonResponse({'order': data})

#View to calculate cart total
def get_cart_total(request):
    user = request.user
    total_price = 0
    user_cart = CurrentCart.objects.filter(user=user)
    for cart_pos in user_cart:
        for item in cart_pos.items.all():
            total_price += item.price
    return JsonResponse({'total': "{:.2f}".format(total_price)}, safe=False)