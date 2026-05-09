FROM php:8.3-fpm

RUN apt-get update && apt-get install -y \
    git \
    libssl-dev \
    libcurl4-openssl-dev \
    pkg-config \
    libzip-dev \
    unzip \
    zip \
 && docker-php-ext-install zip opcache \
 && pecl install mongodb \
 && docker-php-ext-enable mongodb \
 && rm -rf /var/lib/apt/lists/*

COPY docker/php/opcache.ini /usr/local/etc/php/conf.d/opcache.ini
COPY docker/php/www.conf /usr/local/etc/php-fpm.d/www.conf
COPY --from=composer:2 /usr/bin/composer /usr/bin/composer

WORKDIR /var/www/html
