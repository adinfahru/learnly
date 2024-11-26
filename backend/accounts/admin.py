from django.contrib import admin
from django.contrib.auth.admin import UserAdmin
from .models import CustomUser
from .forms import CustomUserCreationForm, CustomUserChangeForm

# Register the custom user model with the appropriate forms
@admin.register(CustomUser)
class CustomAdminUser(UserAdmin):
    # Use the custom forms for adding and changing users
    add_form = CustomUserCreationForm
    form = CustomUserChangeForm

    model = CustomUser

    # Define the fields to display in the admin list
    list_display = ('email', 'username', 'role', 'is_staff', 'is_active')
    list_filter = ('is_staff', 'is_active', 'role')
    search_fields = ('email', 'username')
    ordering = ('email',)

    # Define how the fields are displayed in the change form
    fieldsets = (
        (None, {'fields': ('email', 'password')}),
        ('Personal info', {'fields': ('username', 'first_name', 'last_name', 'role')}),
        ('Permissions', {'fields': ('is_active', 'is_staff', 'is_superuser')}),
        ('Important dates', {'fields': ('last_login',)}),
    )

    # Define the fields for the user creation form
    add_fieldsets = (
        (None, {
            'classes': ('wide',),
            'fields': ('email', 'username', 'password1', 'password2', 'role', 'is_active', 'is_staff')}
        ),
    )
