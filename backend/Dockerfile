FROM php:8.3-cli

WORKDIR /var/www/html

RUN apt-get update \
    && apt-get install -y --no-install-recommends \
        git \
        unzip \
        libpq-dev \
        libzip-dev \
        netcat-openbsd \
    && docker-php-ext-install \
        pdo_pgsql \
        pgsql \
        zip \
    && apt-get clean \
    && rm -rf /var/lib/apt/lists/*

COPY --from=composer:2 /usr/bin/composer /usr/bin/composer

COPY composer.json composer.lock ./
RUN composer install --no-interaction --prefer-dist --optimize-autoloader

COPY . .
COPY docker/entrypoint.sh /usr/local/bin/backend-entrypoint
RUN chmod +x /usr/local/bin/backend-entrypoint

EXPOSE 8000

ENTRYPOINT ["backend-entrypoint"]
CMD ["php", "artisan", "serve", "--host=0.0.0.0", "--port=8000"]
