FROM php:7.4-apache
RUN a2enmod rewrite
WORKDIR /var/www/html
COPY . /var/www/html/
RUN docker-php-ext-install pdo pdo_mysql
EXPOSE 3000
CMD ["apache2-foreground"]
