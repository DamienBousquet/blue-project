FROM php:8.2-fpm

RUN apt-get update && apt-get install -y \
    git unzip libpq-dev cron procps supervisor \
    && docker-php-ext-install pdo pdo_pgsql bcmath

COPY --from=composer:2 /usr/bin/composer /usr/bin/composer
COPY docker/php-entrypoint.sh /usr/local/bin/docker-entrypoint.sh
COPY docker/supervisor.conf /etc/supervisor/conf.d/supervisor.conf
RUN chmod +x /usr/local/bin/docker-entrypoint.sh

WORKDIR /var/www/html

ENTRYPOINT ["docker-entrypoint.sh"]
CMD ["php-fpm"]