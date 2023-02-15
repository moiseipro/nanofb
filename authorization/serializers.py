from django.contrib.auth.password_validation import validate_password
from django_countries.serializer_fields import CountryField
from rest_framework import serializers
from django.db import IntegrityError, transaction
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


class UserCreateSerializer(serializers.ModelSerializer):
    email = serializers.EmailField()
    password = serializers.CharField()

    personal = serializers.PrimaryKeyRelatedField(queryset=UserPersonal.objects.all())
    p_version = serializers.PrimaryKeyRelatedField(queryset=Version.objects.all())

    default_error_messages = {
        "cannot_create_user": _('Unable to create account.')
    }

    class Meta:
        model = User
        fields = ['email', 'password', "personal", "p_version"]

    def perform_create(self, validated_data):
        with transaction.atomic():
            print(validated_data)
            user = User.objects.create_user(**validated_data)
            user.is_active = False
            user.save(update_fields=["is_active"])

        return user

    def create(self, validated_data):
        try:
            user = self.perform_create(validated_data)
        except IntegrityError:
            self.fail("cannot_create_user")

        return user
