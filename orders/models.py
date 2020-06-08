from django.db import models
from django.contrib.auth.models import User
from polymorphic.models import PolymorphicModel

#Class for item sizes
class Size(models.Model):
    name = models.CharField(max_length=30)
    
    def __str__(self):
        return self.name
    
    def as_dict(self):
        return {
            "id": self.id,
            "name": self.name
        }

#'Abstract' class for menu items
class MenuItem(PolymorphicModel):
    name = models.CharField(max_length=30)

    def __str__(self):
        return self.name

    def as_dict_for_cart(self):
        return {
            "id": self.id,
            "name": self.get_class_name()+": "+self.name
        }

#Class linking item with size and price
class SellableItem(models.Model):
    item =  models.ForeignKey(MenuItem, on_delete = models.CASCADE)
    size = models.ForeignKey(Size, on_delete = models.CASCADE)
    price = models.DecimalField(max_digits=6, decimal_places=2)

    def __str__(self):
        return self.item.get_class_name()+": "+self.item.name+" ("+self.size.name+")"

    def get_full_name(self):
        return self.item.get_class_name()+": "+self.item.name+" ("+self.size.name+")"
    
    def as_dict(self):
        return {
            "id": self.id,
            "item": self.item_id,
            "size": self.size_id,
            "price": str(self.price) 
        }

#Regular pizza class
class RegularPizza(MenuItem):
    toppings_no = models.SmallIntegerField()

    def get_class_name(self):
        return "Regular Pizza"

    def as_dict(self):
        return {
            "id": self.id,
            "name": self.name,
            "toppings_no": self.toppings_no
        }

#Sicilian pizza class
class SicilianPizza(MenuItem):
    toppings_no = models.SmallIntegerField()

    def get_class_name(self):
        return "Sicilian Pizza"

    def as_dict(self):
        return {
            "id": self.id,
            "name": self.name,
            "toppings_no": self.toppings_no
        }

#Topping class
class Topping(MenuItem):
    def get_class_name(self):
        return "Topping"

    def as_dict(self):
        return {
            "id": self.id,
            "name": self.name
        }

#Sub extra class
class SubExtra(MenuItem):
    def get_class_name(self):
        return "Extra"

    def as_dict(self):
        return {
            "id": self.id,
            "name": self.name
        }

#Sub class
class Sub(MenuItem):
    extras_allowed = models.ManyToManyField(SubExtra, blank=True, related_name='extras')

    def get_class_name(self):
        return "Sub"

    def extras_allowed_to_list(self):
        return ([e.id for e in self.extras_allowed.all()])

    def as_dict(self):
        return {
            "id": self.id,
            "name": self.name
        }

    def as_dict_with_extras(self):
        return {
            "id": self.id,
            "name": self.name,
            "extras_allowed": ([e.id for e in self.extras_allowed.all()])
        }        

#Pasta class
class Pasta(MenuItem):
    def get_class_name(self):
        return "Pasta"

    def as_dict(self):
        return {
            "id": self.id,
            "name": self.name
        }

#Salad class
class Salad(MenuItem):
    def get_class_name(self):
        return "Salad"

    def as_dict(self):
        return {
            "id": self.id,
            "name": self.name
        }

#Dinner platter class
class DinnerPlatter(MenuItem):
    def get_class_name(self):
        return "Dinner Platter"

    def as_dict(self):
        return {
            "id": self.id,
            "name": self.name
        }

#Class for meals currently saved in cart for any user
class CurrentCart(models.Model):
    items = models.ManyToManyField(SellableItem, blank=False)
    user =  models.ForeignKey(User, on_delete = models.CASCADE)

    def get_class_name(self):
        return "Current Cart"

    def get_items(self):
        return ([i.id for i in self.items.all()]) 

    def __str__(self):
        return self.get_class_name()+": index "+str(self.id)

#Class for meals ordered
class OrderedMeal(models.Model):
    items = models.ManyToManyField(SellableItem, blank=False)

    def get_class_name(self):
        return "Ordered Meal"

    def __str__(self):
        return self.get_class_name()+": index "+str(self.id)

#Order class
class Order(models.Model):
    ordered_meals = models.ManyToManyField(OrderedMeal, blank=False)
    user =  models.ForeignKey(User, on_delete = models.CASCADE)
    placed_at = models.DateTimeField(auto_now_add=True)
    finished = models.BooleanField(default=False)

    def get_class_name(self):
        return "Order"

    def as_dict(self):
        return {
            "id": self.id,
            "placed_at": self.placed_at,
            "finished": self.finished
        }

    def __str__(self):
        return self.get_class_name()+": index "+str(self.id)