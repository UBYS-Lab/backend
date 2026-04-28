FROM php:8.3-cli

RUN apt-get update && apt-get install -y \
    git \
    libzip-dev \
    unzip \
    zip \
 && docker-php-ext-install zip \
 && pecl install mongodb \
 && docker-php-ext-enable mongodb \
 && rm -rf /var/lib/apt/lists/*

COPY --from=composer:2 /usr/bin/composer /usr/bin/composer

WORKDIR /var/www/html
