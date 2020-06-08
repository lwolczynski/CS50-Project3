from django.contrib import admin
from .models import *

class SellableItemAdmin(admin.TabularInline):
    model = SellableItem

class RegularPizzaAdmin(admin.ModelAdmin):
   inlines = [SellableItemAdmin,]
   
class SicilianPizzaAdmin(admin.ModelAdmin):
   inlines = [SellableItemAdmin,]

class ToppingAdmin(admin.ModelAdmin):
   inlines = [SellableItemAdmin,]

class SubExtraAdmin(admin.ModelAdmin):
   inlines = [SellableItemAdmin,]

class SubAdmin(admin.ModelAdmin):
   inlines = [SellableItemAdmin,]

class PastaAdmin(admin.ModelAdmin):
   inlines = [SellableItemAdmin,]

class SaladAdmin(admin.ModelAdmin):
   inlines = [SellableItemAdmin,]

class DinnerPlatterAdmin(admin.ModelAdmin):
   inlines = [SellableItemAdmin,]

# Register your models here.
admin.site.register(RegularPizza, RegularPizzaAdmin)
admin.site.register(SicilianPizza, SicilianPizzaAdmin)
admin.site.register(Topping, ToppingAdmin)
admin.site.register(SubExtra, SubExtraAdmin)
admin.site.register(Sub, SubAdmin)
admin.site.register(Pasta, PastaAdmin)
admin.site.register(Salad, SaladAdmin)
admin.site.register(DinnerPlatter, DinnerPlatterAdmin)
admin.site.register(CurrentCart)
admin.site.register(OrderedMeal)
admin.site.register(Order)
