from django.contrib.auth.password_validation import validate_password
from django_countries.serializer_fields import CountryField
from rest_framework import serializers
from rest_framework.validators import UniqueValidator
from django.utils.translation import gettext_lazy as _

from users.models import User, UserPersonal
from version.models import Version


class UserPersonalSerializer(serializers.ModelSerializer):
    id = serializers.IntegerField(read_only=True)
    country_id = CountryField()

    class Meta:
        model = UserPersonal
        fields = ["id", "last_name", "first_name", "father_name", "date_birthsday", "country_id",
                  "region", "city", "phone", "license"]


class UserCreateSerializer(serializers.Serializer):
    email = serializers.EmailField()
    password = serializers.CharField();
    password2 = serializers.CharField()

    personal = serializers.PrimaryKeyRelatedField(queryset=UserPersonal.objects.all())
    p_version = serializers.PrimaryKeyRelatedField(queryset=Version.objects.all())

    class Meta:
        model = User
        fields = ['email', 'password', 'password2', "personal", "p_version"]

    # Метод для сохранения нового пользователя
    def save(self, *args, **kwargs):
        password = self.validated_data['password']
        password2 = self.validated_data['password2']

        if password != password2:
            raise serializers.ValidationError({password: _("The password doesn't match")})

        print(self.validated_data['p_version'].groups.all().values_list('id', flat=True))
        user = User(
            email=self.validated_data['email'],
            personal=self.validated_data['personal'],
            p_version=self.validated_data['p_version'],
            is_active=False,
        )
        # Сохраняем пароль
        user.set_password(password)
        user.save()
        user.groups.set(self.validated_data['p_version'].groups.all())
        user.user_permissions.set(self.validated_data['p_version'].permissions.all())
        return user