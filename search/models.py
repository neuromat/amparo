from __future__ import unicode_literals

from django.db import models


class PalavraChave(models.Model):
    palavra = models.CharField(max_length=100)

    def __str__(self):
        return self.palavra
