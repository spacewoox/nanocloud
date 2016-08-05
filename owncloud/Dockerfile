FROM owncloud:9
MAINTAINER Romain Soufflet <romain.soufflet@nanocloud.com>

RUN sed -i 's/80/8082/g' /etc/apache2/ports.conf && \
    sed -i 's/80/8082/g' /etc/apache2/sites-enabled/000-default.conf

COPY ./config.php /var/www/html/config/config.php

EXPOSE 8082
